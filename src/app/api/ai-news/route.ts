import { NextResponse } from 'next/server';

export const revalidate = 3600; // Refresh every 1 hour (was 24h — too stale)

interface HNHit {
  objectID: string;
  title: string;
  url: string | null;
  points: number;
  created_at: string;
  author: string;
  num_comments: number;
  _tags: string[];
}

// Broadened keyword list so more AI stories match
const AI_KEYWORDS = [
  'artificial intelligence', 'machine learning', 'deep learning',
  'GPT', 'LLM', 'OpenAI', 'Anthropic', 'Gemini', 'Claude',
  'ChatGPT', 'neural network', 'AI model', 'AI agent',
  'transformer', 'diffusion', 'generative ai', 'gen ai',
  'copilot', 'midjourney', 'stable diffusion', 'dall-e',
  'hugging face', 'llama', 'mistral', 'deepseek',
  'fine-tun', 'prompt engineer', 'rag ', 'retrieval augmented',
  'langchain', 'vector database', 'embedding',
  'nvidia', 'gpu', 'tpu', 'compute',
  'grok', 'perplexity', 'cohere', 'ai startup',
  'ai safety', 'alignment', 'ai regulation', 'ai policy',
  'robotics', 'autonomous', 'self-driving',
  'computer vision', 'nlp', 'natural language',
  'reinforcement learning', 'foundation model',
  ' ai ', 'ai-', '-ai ', 'openai', 'deepmind',
];

// Assign a topic label from the title — maps to the 4 NeuralPulse tabs
function getCategory(title: string): string {
  const t = title.toLowerCase();
  // LLMs: foundation models, AI assistants, model releases
  if (
    t.includes('gpt') || t.includes('openai') || t.includes('chatgpt') ||
    t.includes('claude') || t.includes('anthropic') ||
    t.includes('gemini') || t.includes('google ai') || t.includes('deepmind') ||
    t.includes('llama') || t.includes('meta ai') ||
    t.includes('llm') || t.includes('language model') ||
    t.includes('mistral') || t.includes('hugging face') ||
    t.includes('open source model') || t.includes('fine-tun') ||
    t.includes('transformer') || t.includes('foundation model') ||
    t.includes('deepseek') || t.includes('grok') || t.includes('cohere') ||
    t.includes('perplexity') || t.includes('copilot')
  ) return 'LLMs';
  // Startups: funding, acquisitions, new companies
  if (
    t.includes('startup') || t.includes('funding') || t.includes('raises') ||
    t.includes('raised') || t.includes('series a') || t.includes('series b') ||
    t.includes('series c') || t.includes('seed round') || t.includes('ipo') ||
    t.includes('acqui') || t.includes('invest') || t.includes('valuation') ||
    t.includes('venture') || t.includes('y combinator') || t.includes(' vc ')
  ) return 'Startups';
  // Products: launches, tools, apps, APIs, hardware
  if (
    t.includes('launch') || t.includes('release') || t.includes('new feature') ||
    t.includes('plugin') || t.includes('api ') || t.includes(' api') ||
    t.includes('app ') || t.includes('tool') || t.includes('product') ||
    t.includes('image generation') || t.includes('diffusion') || t.includes('midjourney') ||
    t.includes('gpu') || t.includes('nvidia') || t.includes('hardware') ||
    t.includes('chip') || t.includes('update') || t.includes('version') ||
    t.includes('dall-e') || t.includes('stable diffusion') || t.includes('robotics')
  ) return 'Products';
  // Research: papers, benchmarks, breakthroughs, policy
  if (
    t.includes('research') || t.includes('paper') || t.includes('study') ||
    t.includes('arxiv') || t.includes('benchmark') || t.includes('breakthrough') ||
    t.includes('alignment') || t.includes('safety') || t.includes('bias') ||
    t.includes('regulation') || t.includes('law') || t.includes('policy') ||
    t.includes('science') || t.includes('experiment') || t.includes('finding')
  ) return 'Research';
  return 'General AI';
}

export async function GET() {
  try {
    // Fetch multiple queries in parallel for broader coverage
    const queries = [
      'AI artificial intelligence LLM',
      'GPT OpenAI Anthropic Claude',
      'machine learning deep learning neural',
      'AI startup generative',
    ];

    const fetches = queries.map((q) => {
      const encoded = encodeURIComponent(q);
      const url = `https://hn.algolia.com/api/v1/search?query=${encoded}&tags=story&hitsPerPage=30&numericFilters=points>3`;
      return fetch(url, { next: { revalidate: 3600 } }).then((r) =>
        r.ok ? r.json() : { hits: [] }
      ).catch(() => ({ hits: [] }));
    });

    const results = await Promise.all(fetches);
    const allHits: HNHit[] = results.flatMap((r) => r.hits || []);

    // Filter for AI-relevant articles and deduplicate
    const seen = new Set<string>();
    const items = allHits
      .filter((hit) => {
        if (!hit.title || !hit.url) return false;
        const titleLower = ` ${hit.title.toLowerCase()} `;
        return AI_KEYWORDS.some((kw) => titleLower.includes(kw.toLowerCase()));
      })
      .filter((hit) => {
        const key = hit.url || hit.objectID;
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
      })
      // Sort by points descending so we get the best stories
      .sort((a, b) => b.points - a.points)
      .slice(0, 24)
      .map((hit) => ({
        id: hit.objectID,
        title: hit.title,
        url: hit.url || `https://news.ycombinator.com/item?id=${hit.objectID}`,
        source: extractDomain(hit.url),
        category: getCategory(hit.title),
        points: hit.points,
        comments: hit.num_comments,
        time: formatTime(hit.created_at),
        rawTime: hit.created_at,
      }));

    // If we got results, return them; otherwise fall back
    if (items.length > 0) {
      return NextResponse.json(items, {
        headers: {
          'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=1800',
        },
      });
    }

    // Fallback
    return NextResponse.json(FALLBACK_NEWS, {
      headers: { 'Cache-Control': 'public, s-maxage=1800' },
    });
  } catch (err) {
    console.error('AI news fetch error:', err);
    return NextResponse.json(FALLBACK_NEWS, {
      headers: { 'Cache-Control': 'public, s-maxage=1800' },
    });
  }
}

function extractDomain(url: string | null): string {
  if (!url) return 'HN';
  try {
    const hostname = new URL(url).hostname.replace('www.', '');
    return hostname.split('.').slice(-2).join('.');
  } catch {
    return 'web';
  }
}

function formatTime(isoString: string): string {
  try {
    const date = new Date(isoString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffH = Math.floor(diffMs / 3600000);
    if (diffH < 1) return 'Just now';
    if (diffH < 24) return `${diffH}h ago`;
    const diffD = Math.floor(diffH / 24);
    if (diffD === 1) return 'Yesterday';
    if (diffD < 7) return `${diffD}d ago`;
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  } catch {
    return 'Recent';
  }
}

const FALLBACK_NEWS = [
  { id: '1', title: 'OpenAI releases new model with improved reasoning capabilities', url: 'https://openai.com', source: 'openai.com', category: 'LLMs', points: 450, comments: 312, time: '2h ago' },
  { id: '2', title: 'Google DeepMind achieves breakthrough in protein structure prediction', url: 'https://deepmind.google', source: 'deepmind.google', category: 'Research', points: 380, comments: 190, time: '4h ago' },
  { id: '3', title: 'Meta releases Llama 3 with 400B parameter version', url: 'https://ai.meta.com', source: 'ai.meta.com', category: 'LLMs', points: 520, comments: 405, time: '6h ago' },
  { id: '4', title: 'Anthropic Claude 3.5 Sonnet tops MMLU benchmark scores', url: 'https://anthropic.com', source: 'anthropic.com', category: 'LLMs', points: 290, comments: 175, time: '8h ago' },
  { id: '5', title: 'EU AI Act enforcement guidelines published — what it means for developers', url: 'https://europa.eu', source: 'europa.eu', category: 'Research', points: 310, comments: 220, time: '10h ago' },
  { id: '6', title: 'NVIDIA H200 availability increases, prices drop 12% in spot markets', url: 'https://nvidia.com', source: 'nvidia.com', category: 'Products', points: 260, comments: 145, time: '12h ago' },
  { id: '7', title: 'Mistral releases new open-source model beating GPT-3.5', url: 'https://mistral.ai', source: 'mistral.ai', category: 'LLMs', points: 430, comments: 360, time: '14h ago' },
  { id: '8', title: 'AI coding assistants now handle 40% of commits at major tech firms', url: 'https://github.com', source: 'github.com', category: 'Products', points: 198, comments: 142, time: '16h ago' },
];
