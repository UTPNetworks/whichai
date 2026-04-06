/**
 * Supabase Edge Function: enrich-listing
 * ----------------------------------------
 * Triggered by a Supabase Database Webhook whenever a row is
 * inserted into `user_listings`.
 *
 * Flow:
 *   1. Receive the new listing row from the webhook payload
 *   2. Fetch the first photo URL from Supabase Storage
 *   3. Call Claude 3.5 Sonnet with multimodal vision
 *   4. Write enriched fields back to the same row, step by step
 *
 * Required secrets (set via `supabase secrets set`):
 *   ANTHROPIC_API_KEY   – your Claude API key
 *   SUPABASE_URL        – automatically injected by Supabase
 *   SUPABASE_SERVICE_ROLE_KEY – automatically injected by Supabase
 *
 * Deploy:
 *   supabase functions deploy enrich-listing --no-verify-jwt
 *
 * Webhook setup (Supabase Dashboard → Database → Webhooks):
 *   Table:   user_listings
 *   Event:   INSERT
 *   Method:  POST
 *   URL:     https://<project-ref>.supabase.co/functions/v1/enrich-listing
 */

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import Anthropic from 'https://esm.sh/@anthropic-ai/sdk@0.27.0';

// ── Types ─────────────────────────────────────────────────────────────────────

interface WebhookPayload {
  type: 'INSERT' | 'UPDATE' | 'DELETE';
  table: string;
  record: ListingRecord;
  old_record?: ListingRecord;
}

interface ListingRecord {
  id: string;
  user_id: string;
  title: string;
  description: string | null;
  photo_urls: string[];
  price: number;
  category: string | null;
  tags: string[] | null;
  enrichment_status?: string;
}

interface EnrichmentResult {
  refined_title: string;
  refined_description: string;
  technical_specs: Record<string, string>;
  ai_compatibility: string[];
  suggested_hashtags: string[];
  category: string;
}

// ── Helpers ───────────────────────────────────────────────────────────────────

async function setStep(
  supabaseAdmin: ReturnType<typeof createClient>,
  listingId: string,
  step: string
): Promise<void> {
  await supabaseAdmin
    .from('user_listings')
    .update({ enrichment_step: step, enrichment_status: 'processing', updated_at: new Date().toISOString() })
    .eq('id', listingId);
}

// ── Main handler ──────────────────────────────────────────────────────────────

Deno.serve(async (req: Request) => {
  // Supabase pings functions with OPTIONS — handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: { 'Access-Control-Allow-Origin': '*' } });
  }

  let payload: WebhookPayload;
  try {
    payload = await req.json() as WebhookPayload;
  } catch {
    return new Response('Invalid JSON', { status: 400 });
  }

  // Only act on INSERT events
  if (payload.type !== 'INSERT') {
    return new Response('Not an INSERT — skipping', { status: 200 });
  }

  const listing = payload.record;

  // Skip if already enriched or if no photos were uploaded
  if (listing.enrichment_status === 'complete' || !listing.photo_urls?.length) {
    return new Response('Skipping (already enriched or no photos)', { status: 200 });
  }

  const supabaseAdmin = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
  );

  const anthropic = new Anthropic({ apiKey: Deno.env.get('ANTHROPIC_API_KEY')! });

  try {
    // ── Step 1: Analysing image ──────────────────────────────────────────────
    await setStep(supabaseAdmin, listing.id, 'analyzing_image');

    const imageUrl = listing.photo_urls[0];

    // Fetch the image and convert to base64 so Claude can process it
    // regardless of whether the source domain allows direct URL access
    const imageResponse = await fetch(imageUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; WhichAiBot/1.0)',
        'Accept': 'image/*,*/*',
      },
    });

    if (!imageResponse.ok) {
      throw new Error(`Failed to fetch image: ${imageResponse.status} ${imageResponse.statusText}`);
    }

    const contentType = imageResponse.headers.get('content-type') || 'image/jpeg';
    const mediaType = contentType.split(';')[0].trim() as 'image/jpeg' | 'image/png' | 'image/gif' | 'image/webp';
    const imageBuffer = await imageResponse.arrayBuffer();
    const imageBase64 = btoa(String.fromCharCode(...new Uint8Array(imageBuffer)));

    // ── Step 2: Generating specs ─────────────────────────────────────────────
    await setStep(supabaseAdmin, listing.id, 'generating_specs');

    // ── Step 3: Writing description ──────────────────────────────────────────
    await setStep(supabaseAdmin, listing.id, 'writing_description');

    const systemPrompt = `You are the WhichAi Listing Optimizer. Your goal is to take raw, minimal input from a user (a one-line description and an image) and transform it into a professional, technical, and high-converting marketplace listing for whichai.cloud.

Required Task:
1. Visual Identification: Analyze the image to identify the specific brand (e.g., ASUS, Founders Edition), model, and physical condition.
2. Market Positioning: Write a professional title and a multi-paragraph description.
3. Technical Specification Extraction: Identify VRAM, Architecture (e.g., Ada Lovelace), and cooling type.
4. AI Utility Mapping: Explicitly state which local AI models this hardware is "Best For" (e.g., "Runs LLAMA 3 70B at 15 t/s").
5. Tagging: Generate a JSON array of 10 relevant hashtags.

Response Format (STRICT JSON ONLY — no markdown fences, no extra text):
{
  "refined_title": "string",
  "refined_description": "string (Markdown formatted)",
  "technical_specs": { "vram": "string", "architecture": "string", "interface": "string", "cooling": "string", "tflops": "string" },
  "ai_compatibility": ["string", ...],
  "suggested_hashtags": ["string", ...],
  "category": "Physical Hardware"
}

Tone: Professional, technical, and helpful. Focus on value to an AI Developer. No fluff — use data-driven performance estimates.`;

    const userContent: Anthropic.MessageParam['content'] = [
      {
        type: 'image',
        source: {
          type: 'base64',
          media_type: mediaType,
          data: imageBase64,
        },
      },
      {
        type: 'text',
        text: `User description: "${listing.title || 'GPU for sale'}"\nAsking price: $${listing.price || 'not specified'}\n\nPlease produce the JSON listing optimisation.`,
      },
    ];

    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 1500,
      system: systemPrompt,
      messages: [{ role: 'user', content: userContent }],
    });

    const rawText = (response.content[0] as { type: 'text'; text: string }).text.trim();

    // Strip any accidental markdown fences Claude might add
    const jsonText = rawText.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/i, '');
    const enriched: EnrichmentResult = JSON.parse(jsonText);

    // ── Step 4: Tagging ──────────────────────────────────────────────────────
    await setStep(supabaseAdmin, listing.id, 'tagging');

    // ── Final update ─────────────────────────────────────────────────────────
    const { error: updateError } = await supabaseAdmin
      .from('user_listings')
      .update({
        refined_title: enriched.refined_title,
        refined_description: enriched.refined_description,
        technical_specs: enriched.technical_specs,
        ai_compatibility: enriched.ai_compatibility,
        suggested_hashtags: enriched.suggested_hashtags,
        category: enriched.category,
        enrichment_status: 'complete',
        enrichment_step: null,
        ai_generated: true,
        updated_at: new Date().toISOString(),
      })
      .eq('id', listing.id);

    if (updateError) throw updateError;

    return new Response(JSON.stringify({ success: true, listing_id: listing.id }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err: unknown) {
    console.error('[enrich-listing] error:', err);

    // Mark as failed so the UI can surface an error state
    await supabaseAdmin
      .from('user_listings')
      .update({
        enrichment_status: 'failed',
        enrichment_step: null,
        updated_at: new Date().toISOString(),
      })
      .eq('id', listing.id);

    return new Response(JSON.stringify({ error: String(err) }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
});
