import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

const RSS_FEEDS = [
  { url: 'https://techcrunch.com/category/artificial-intelligence/feed/', source: 'TechCrunch' },
  { url: 'https://www.theverge.com/rss/ai-artificial-intelligence/index.xml', source: 'The Verge' },
  { url: 'https://feeds.arstechnica.com/arstechnica/technology-lab', source: 'Ars Technica' },
  { url: 'https://venturebeat.com/category/ai/feed/', source: 'VentureBeat' },
];

// ── Minimal RSS/Atom parser (no external deps) ──────────────────────────────

function extractTag(xml: string, tag: string): string | null {
  const regex = new RegExp(`<${tag}[^>]*>(?:<!\\[CDATA\\[)?([\\s\\S]*?)(?:\\]\\]>)?<\\/${tag}>`, 'i');
  const match = xml.match(regex);
  return match ? match[1].trim() : null;
}

function extractAtomHref(block: string): string | null {
  const match = block.match(/<link[^>]+href=["']([^"']+)["'][^>]*\/?>/i);
  return match ? match[1] : null;
}

function decodeEntities(text: string): string {
  return text
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&#(\d+);/g, (_, n) => String.fromCharCode(Number(n)));
}

interface RawItem {
  title: string;
  url: string;
  publishedAt: Date;
}

function parseItems(xml: string, source: string): RawItem[] {
  const items: RawItem[] = [];
  // Match both RSS <item> and Atom <entry>
  const blockRegex = /<(?:item|entry)[\s>]([\s\S]*?)<\/(?:item|entry)>/gi;
  let match: RegExpExecArray | null;

  while ((match = blockRegex.exec(xml)) !== null) {
    const block = match[1];
    const rawTitle = extractTag(block, 'title') || '';
    const rawLink =
      extractAtomHref(block) ||
      extractTag(block, 'link') ||
      '';
    const rawDate =
      extractTag(block, 'pubDate') ||
      extractTag(block, 'published') ||
      extractTag(block, 'updated') ||
      '';

    const title = decodeEntities(rawTitle).replace(/<[^>]+>/g, '').trim();
    const url = decodeEntities(rawLink).trim();
    const publishedAt = rawDate ? new Date(rawDate) : new Date();

    if (title && url) {
      items.push({ title, url, publishedAt });
    }
  }

  return items;
}

// ── Route handlers ───────────────────────────────────────────────────────────

export async function POST(request: Request) {
  // Protect with optional secret (set CRON_SECRET env var)
  const authHeader = request.headers.get('authorization');
  const secret = process.env.CRON_SECRET;
  if (secret && authHeader !== `Bearer ${secret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const supabase = createClient(supabaseUrl, supabaseServiceKey);

  let totalInserted = 0;
  const errors: string[] = [];

  for (const feed of RSS_FEEDS) {
    try {
      const res = await fetch(feed.url, {
        headers: { 'User-Agent': 'whichai-news-bot/1.0' },
        next: { revalidate: 0 },
      });

      if (!res.ok) {
        errors.push(`${feed.source}: HTTP ${res.status}`);
        continue;
      }

      const xml = await res.text();
      const items = parseItems(xml, feed.source);

      if (items.length === 0) continue;

      const rows = items.map((item) => ({
        title: item.title.slice(0, 500),
        url: item.url,
        source: feed.source,
        summary: '',
        image_url: null,
        published_at: item.publishedAt.toISOString(),
      }));

      // Upsert on url — skip duplicates
      const { error, data } = await supabase
        .from('ai_news')
        .upsert(rows, { onConflict: 'url', ignoreDuplicates: true })
        .select('id');

      if (error) {
        errors.push(`${feed.source}: ${error.message}`);
      } else {
        totalInserted += data?.length ?? 0;
      }
    } catch (err) {
      errors.push(`${feed.source}: ${err instanceof Error ? err.message : String(err)}`);
    }
  }

  return NextResponse.json({
    success: true,
    inserted: totalInserted,
    errors: errors.length > 0 ? errors : undefined,
    next_refresh: new Date(Date.now() + 8 * 60 * 60 * 1000).toISOString(),
  });
}

export async function GET() {
  return NextResponse.json({
    status: 'ok',
    endpoint: '/api/refresh-news',
    method: 'POST',
    feeds: RSS_FEEDS.map((f) => f.source),
    description: 'Called by Vercel Cron every 8 hours to scrape AI news from RSS feeds',
  });
}
