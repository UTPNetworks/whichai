// ── WhichAi Community — "The Signal" ────────────────────────────
// Complete mock data for spaces, threads, replies, users, XP, etc.

export interface CommunityUser {
  username: string;
  avatar: string;
  badge: string | null;
  xp: number;
  level: string;
  streak: number;
  joinedDate: string;
  bio: string;
}

export interface Reply {
  id: string;
  author: CommunityUser;
  content: string;
  upvotes: number;
  time: string;
  isAccepted?: boolean;
  reactions: Record<string, number>;
}

export interface Thread {
  id: string;
  spaceId: string;
  type: 'discussion' | 'question' | 'showcase' | 'poll' | 'ama' | 'news';
  title: string;
  content: string;
  author: CommunityUser;
  upvotes: number;
  replies: Reply[];
  replyCount: number;
  time: string;
  hot: boolean;
  pinned: boolean;
  answered?: boolean;
  pollOptions?: { text: string; votes: number }[];
  tags: string[];
  views: number;
  reactions: Record<string, number>;
}

export interface Space {
  id: string;
  name: string;
  emoji: string;
  color: string;
  members: number;
  description: string;
  category: string;
  hot: boolean;
  threadCount: number;
  online: number;
  rules: string[];
  moderators: string[];
  createdBy: string;
  bannerGradient: string;
}

// ── Users ──────────────────────────────────────────────────────
export const USERS: Record<string, CommunityUser> = {
  neural_ninja: { username: 'neural_ninja', avatar: '🧠', badge: 'Top Contributor', xp: 21200, level: 'Legend', streak: 38, joinedDate: 'Jan 2025', bio: 'ML engineer by day, prompt hacker by night. Building cool stuff with Claude + GPT.' },
  ship_it_sarah: { username: 'ship_it_sarah', avatar: '🚀', badge: 'Builder', xp: 18900, level: 'Expert', streak: 32, joinedDate: 'Feb 2025', bio: 'Serial AI builder. 4 SaaS products shipped. Currently building an AI customer support agent.' },
  prompt_wizard: { username: 'prompt_wizard', avatar: '✨', badge: 'Verified Seller', xp: 24500, level: 'Legend', streak: 45, joinedDate: 'Dec 2024', bio: 'Top prompt seller on WhichAi. 500+ prompts sold. I turn vague ideas into precise instructions.' },
  tech_pulse: { username: 'tech_pulse', avatar: '📡', badge: 'News Scout', xp: 15600, level: 'Expert', streak: 28, joinedDate: 'Mar 2025', bio: 'Breaking AI news, hot takes, and analysis. Former tech journalist turned AI enthusiast.' },
  silicon_sam: { username: 'silicon_sam', avatar: '⚡', badge: 'Hardware Expert', xp: 12300, level: 'Pro', streak: 21, joinedDate: 'Jan 2025', bio: 'GPU collector. 8x A100 home lab. Helping people build affordable AI rigs.' },
  ai_curious_dev: { username: 'ai_curious_dev', avatar: '🌱', badge: null, xp: 450, level: 'Newcomer', streak: 5, joinedDate: 'Mar 2026', bio: 'Software engineer learning AI/ML. Python + TypeScript. Ask me about React, teach me about transformers.' },
  contrarian_carl: { username: 'contrarian_carl', avatar: '🔥', badge: null, xp: 8700, level: 'Pro', streak: 15, joinedDate: 'Apr 2025', bio: 'Unpopular opinions about AI, delivered with receipts.' },
  design_ai_dan: { username: 'design_ai_dan', avatar: '🎨', badge: 'Builder', xp: 9200, level: 'Pro', streak: 18, joinedDate: 'May 2025', bio: 'UI/UX designer exploring AI-powered design tools. Building at the intersection of design and AI.' },
  code_sensei: { username: 'code_sensei', avatar: '🥷', badge: 'Top Contributor', xp: 19800, level: 'Expert', streak: 40, joinedDate: 'Jan 2025', bio: '15 years in software. Now teaching machines to code. Ironic, right?' },
  data_diana: { username: 'data_diana', avatar: '📊', badge: 'Expert', xp: 11000, level: 'Pro', streak: 22, joinedDate: 'Jun 2025', bio: 'Data scientist. Kaggle grandmaster. I make models do things they shouldn\'t be able to.' },
};

// ── Spaces ─────────────────────────────────────────────────────
export const SPACES: Space[] = [
  { id: 'model-arena', name: 'Model Arena', emoji: '⚔️', color: '#8b5cf6', members: 12400, description: 'Debate, compare & roast AI models. GPT vs Claude vs Gemini — no holds barred.', category: 'Discussion', hot: true, threadCount: 847, online: 234, rules: ['Back claims with benchmarks or examples', 'No company shilling without disclosure', 'Respect all models — each has strengths', 'Tag your comparison posts with model names'], moderators: ['neural_ninja', 'code_sensei'], createdBy: 'neural_ninja', bannerGradient: 'linear-gradient(135deg, #7c3aed, #a855f7)' },
  { id: 'build-in-public', name: 'Build in Public', emoji: '🔨', color: '#f59e0b', members: 8200, description: 'Share your AI project journey. Wins, fails, lessons — all welcome.', category: 'Builders', hot: true, threadCount: 623, online: 189, rules: ['Share real numbers and progress', 'Be honest about failures too', 'Give constructive feedback', 'No pure promo — share the journey'], moderators: ['ship_it_sarah'], createdBy: 'ship_it_sarah', bannerGradient: 'linear-gradient(135deg, #d97706, #fbbf24)' },
  { id: 'prompt-lab', name: 'Prompt Lab', emoji: '🧪', color: '#ec4899', members: 15100, description: 'Experiment, share & refine prompts together. The community test kitchen.', category: 'Learning', hot: false, threadCount: 1240, online: 412, rules: ['Share full prompts, not teasers', 'Credit original creators', 'Tag the AI model used', 'Use code blocks for prompts'], moderators: ['prompt_wizard', 'neural_ninja'], createdBy: 'prompt_wizard', bannerGradient: 'linear-gradient(135deg, #db2777, #f472b6)' },
  { id: 'gpu-garage', name: 'GPU Garage', emoji: '🏎️', color: '#06b6d4', members: 5700, description: 'Hardware talk — GPUs, servers, rigs, benchmarks, deals & setups.', category: 'Hardware', hot: false, threadCount: 389, online: 87, rules: ['Include specs when asking for help', 'No scalper promotion', 'Verified deals only in #deals', 'Photos of your setup are encouraged!'], moderators: ['silicon_sam'], createdBy: 'silicon_sam', bannerGradient: 'linear-gradient(135deg, #0891b2, #22d3ee)' },
  { id: 'help-desk', name: 'Help Desk', emoji: '🆘', color: '#10b981', members: 9300, description: 'Stuck? Ask anything AI. No question is too basic here.', category: 'Q&A', hot: false, threadCount: 2100, online: 156, rules: ['No question is dumb — be kind', 'Include your setup/context', 'Mark answers as accepted', 'Search before posting'], moderators: ['code_sensei', 'ai_curious_dev'], createdBy: 'code_sensei', bannerGradient: 'linear-gradient(135deg, #059669, #34d399)' },
  { id: 'showcase', name: 'Showcase', emoji: '🏆', color: '#f97316', members: 6800, description: 'Ship something cool? Show it off. Get feedback, users, and clout.', category: 'Builders', hot: false, threadCount: 445, online: 98, rules: ['Include a demo link or screenshots', 'Describe the tech stack', 'Be open to constructive feedback', 'Upvote what inspires you'], moderators: ['design_ai_dan', 'ship_it_sarah'], createdBy: 'design_ai_dan', bannerGradient: 'linear-gradient(135deg, #ea580c, #fb923c)' },
  { id: 'ai-news', name: 'AI News & Takes', emoji: '📡', color: '#6366f1', members: 18900, description: 'Breaking AI news, hot takes, and "did you see this?" moments.', category: 'Discussion', hot: true, threadCount: 1890, online: 567, rules: ['Link to original source', 'Add your take — don\'t just share links', 'Flair: [News], [Rumor], [Opinion]', 'No clickbait titles'], moderators: ['tech_pulse'], createdBy: 'tech_pulse', bannerGradient: 'linear-gradient(135deg, #4f46e5, #818cf8)' },
  { id: 'career-corner', name: 'Career Corner', emoji: '💼', color: '#0ea5e9', members: 4100, description: 'AI job hunting, salary threads, interview prep, and career pivots.', category: 'Career', hot: false, threadCount: 312, online: 65, rules: ['Be specific about salary ranges and location', 'No recruiting spam', 'Share interview experiences', 'Encourage, don\'t gatekeep'], moderators: ['data_diana'], createdBy: 'data_diana', bannerGradient: 'linear-gradient(135deg, #0284c7, #38bdf8)' },
  { id: 'watercooler', name: 'Water Cooler', emoji: '🍻', color: '#a855f7', members: 7500, description: 'Off-topic banter. Memes, hot takes on tech Twitter, and vibes.', category: 'Chill', hot: false, threadCount: 980, online: 201, rules: ['Keep it fun and respectful', 'No politics — we have enough debates about AI', 'Memes must be at least slightly AI-related', 'Be excellent to each other'], moderators: ['contrarian_carl'], createdBy: 'contrarian_carl', bannerGradient: 'linear-gradient(135deg, #7c3aed, #c084fc)' },
  { id: 'research-papers', name: 'Paper Club', emoji: '📄', color: '#14b8a6', members: 3200, description: 'Weekly paper discussions. Break down the latest arXiv drops together.', category: 'Learning', hot: false, threadCount: 156, online: 42, rules: ['Include paper link (arXiv preferred)', 'Summarize key findings in your post', 'Explain like I\'m a smart non-researcher', 'Weekly featured paper on Mondays'], moderators: ['data_diana', 'neural_ninja'], createdBy: 'data_diana', bannerGradient: 'linear-gradient(135deg, #0d9488, #5eead4)' },
];

// ── Threads ────────────────────────────────────────────────────
export const THREADS: Thread[] = [
  {
    id: 't1', spaceId: 'model-arena', type: 'discussion',
    title: 'Claude Opus 4 just dropped and it\'s INSANE — here\'s my benchmark results',
    content: 'I\'ve been running benchmarks all morning and the results are wild. On my custom coding eval (500 problems across Python, TypeScript, and Rust):\n\n**Claude Opus 4:** 94.2% pass rate\n**GPT-4 Turbo:** 87.1% pass rate\n**Gemini Ultra:** 85.8% pass rate\n\nBut here\'s what really blew my mind — the reasoning quality. Opus 4 doesn\'t just get the right answer, it *explains its thought process* in a way that actually teaches you something. I fed it a gnarly concurrency bug and it not only found it but explained the race condition with a diagram in ASCII art.\n\nThe context window handling is also significantly improved. I loaded a 180K token codebase and asked it to find a subtle type error buried in a utility function. Found it in 8 seconds.\n\nAnyone else running benchmarks? Drop your results below — I want to build a community benchmark dashboard.',
    author: USERS.neural_ninja, upvotes: 847, replyCount: 234, time: '2h ago', hot: true, pinned: false, tags: ['Claude', 'Benchmarks', 'Coding'],
    views: 4200,
    reactions: { '🔥': 156, '💡': 89, '👏': 67, '🤔': 23 },
    replies: [
      { id: 'r1', author: USERS.code_sensei, content: 'Just ran it on my eval suite too. The improvement on multi-file refactoring tasks is **massive**. It correctly identified cross-file dependencies that GPT-4 completely missed. This is a game changer for agentic coding workflows.', upvotes: 234, time: '1h ago', reactions: { '🔥': 45, '💡': 23 } },
      { id: 'r2', author: USERS.prompt_wizard, content: 'Can confirm the prompting is way more forgiving too. I tested my entire prompt library and prompts that needed careful phrasing for Opus 3 just... work naturally now. Less prompt engineering required = more accessible to everyone.', upvotes: 189, time: '1h ago', reactions: { '👏': 34, '💡': 18 } },
      { id: 'r3', author: USERS.ai_curious_dev, content: 'Noob question — how are you running these benchmarks? Is there a standard framework or are you writing custom evals? I want to start benchmarking but don\'t know where to begin.', upvotes: 67, time: '45m ago', reactions: { '❤️': 12 } },
      { id: 'r4', author: USERS.neural_ninja, content: '@ai_curious_dev Great question! I use a custom eval framework built on Python\'s `pytest`. Each eval is a function that takes a prompt, sends it to the API, and checks the output against expected results. I\'ll share the repo this weekend — watch this space!', upvotes: 123, time: '30m ago', reactions: { '🔥': 28, '❤️': 45 } },
      { id: 'r5', author: USERS.contrarian_carl, content: 'Hot take: benchmarks are increasingly meaningless. Real-world performance on YOUR specific use case is all that matters. I\'ve seen models score 95% on benchmarks and completely choke on basic domain-specific tasks.', upvotes: 156, time: '20m ago', reactions: { '🤔': 67, '🔥': 34 } },
    ],
  },
  {
    id: 't2', spaceId: 'build-in-public', type: 'showcase',
    title: 'Day 47: My AI agent now handles 90% of my customer support. Here\'s the full stack breakdown.',
    content: 'TLDR: Built an AI customer support agent that handles 90% of incoming tickets for my SaaS (B2B, ~2000 customers). Here\'s everything I learned.\n\n**Stack:**\n- Claude 3.5 Sonnet for classification + response generation\n- Supabase for conversation history + knowledge base\n- Vercel Edge Functions for the API layer\n- Slack integration for human escalation\n\n**Results after 30 days:**\n- 90% auto-resolution rate (up from 34% with basic chatbot)\n- Average response time: 4 seconds (was 2.4 hours with human agents)\n- CSAT score: 4.6/5 (was 4.2 with humans — ironic right?)\n- Cost: $340/month in API calls (was $8,500/month for 2 support agents)\n\n**What I learned:**\n1. The RAG pipeline is 80% of the work. Getting retrieval right is everything.\n2. Classification before response generation is crucial. Route complex stuff to humans.\n3. Customers don\'t care if it\'s AI — they care about speed and accuracy.\n4. You NEED a human escalation path. The 10% that needs humans really needs humans.\n\nHappy to answer any questions about the architecture or share code snippets!',
    author: USERS.ship_it_sarah, upvotes: 623, replyCount: 89, time: '4h ago', hot: true, pinned: false, tags: ['AI Agent', 'Customer Support', 'Build Log'],
    views: 3100,
    reactions: { '🔥': 201, '👏': 134, '💡': 89 },
    replies: [
      { id: 'r6', author: USERS.silicon_sam, content: 'What\'s your token usage looking like? $340/month for 2000 customers seems incredibly low. Are you doing aggressive caching or short context windows?', upvotes: 78, time: '3h ago', reactions: { '💡': 12 } },
      { id: 'r7', author: USERS.ship_it_sarah, content: '@silicon_sam Good catch — I\'m doing both. I cache common Q&A pairs in Supabase (hits ~60% of queries without an API call). And I keep context to last 4 messages + the relevant KB chunks. Rarely exceeds 3K tokens per turn.', upvotes: 134, time: '2h ago', reactions: { '🔥': 23, '💡': 45 } },
      { id: 'r8', author: USERS.design_ai_dan, content: 'This is exactly what I\'m trying to build for my client. Would you be open to a 30-min call? Happy to pay for your time or trade design work. DM me!', upvotes: 34, time: '1h ago', reactions: { '❤️': 8 } },
    ],
  },
  {
    id: 't3', spaceId: 'prompt-lab', type: 'discussion',
    title: '[FREE] I tested 200 system prompts for coding — these 5 patterns consistently outperform',
    content: 'After 3 months of A/B testing system prompts for coding tasks across Claude, GPT-4, and Gemini, here are the 5 patterns that consistently outperform:\n\n**Pattern 1: Role + Constraint + Example**\n"You are a senior TypeScript developer. Always use strict types, never use `any`. Here\'s an example of the code quality I expect: [example]"\n\n**Pattern 2: Chain of Thought Forcing**\n"Before writing any code, first outline your approach in 3-5 bullet points. Then implement step by step. After implementation, review your code for edge cases."\n\n**Pattern 3: Negative Examples**\n"Do NOT: use deprecated APIs, write comments that restate the code, use var instead of const/let. DO: handle errors explicitly, use early returns, write self-documenting names."\n\n**Pattern 4: Output Format Lock**\n"Return ONLY the code inside a single code block. No explanations before or after. If you need to explain something, use code comments."\n\n**Pattern 5: Domain Context Injection**\n"This codebase uses Next.js 14 App Router, Supabase for auth/db, and Tailwind for styling. All components are client components using \'use client\'. Follow the existing patterns in the codebase."\n\nFull spreadsheet with all 200 tests + results linked in the comments. AMA!',
    author: USERS.prompt_wizard, upvotes: 1203, replyCount: 312, time: '6h ago', hot: true, pinned: true, tags: ['System Prompts', 'Coding', 'Free', 'Research'],
    views: 8900,
    reactions: { '🔥': 345, '💡': 267, '👏': 189, '❤️': 123 },
    replies: [
      { id: 'r9', author: USERS.neural_ninja, content: 'Pattern 2 is a game changer for complex tasks. I\'ve been using a variant: "Think step by step. For each step, explain WHY before HOW." The reasoning quality jumps dramatically.', upvotes: 201, time: '5h ago', reactions: { '🔥': 56, '💡': 78 } },
      { id: 'r10', author: USERS.ai_curious_dev, content: 'This is incredible, thank you for sharing! I\'ve been struggling with getting consistent code quality from ChatGPT. Pattern 3 with negative examples is something I never thought of. Testing it now...', upvotes: 89, time: '4h ago', reactions: { '❤️': 23 } },
    ],
  },
  {
    id: 't4', spaceId: 'help-desk', type: 'question',
    title: 'How do I fine-tune LLaMA 3 on my own data? Complete noob, have RTX 4090',
    content: 'I\'m a web developer (React/Node) with zero ML experience. I have:\n- RTX 4090 (24GB VRAM)\n- 500MB of customer support conversations (cleaned, in JSON)\n- Ubuntu 22.04 machine\n\nI want to fine-tune LLaMA 3 8B to answer questions specifically about our product. Budget: free/cheap tools only.\n\nQuestions:\n1. Is RTX 4090 enough for LLaMA 3 8B fine-tuning?\n2. What tools should I use? (I keep hearing about LoRA, QLoRA, Unsloth...)\n3. How do I format my data?\n4. How long will training take?\n5. How do I actually use the fine-tuned model afterwards?\n\nI know these are basic questions but every tutorial assumes you have ML knowledge. Help a web dev out? 🙏',
    author: USERS.ai_curious_dev, upvotes: 89, replyCount: 45, time: '1h ago', hot: false, pinned: false, answered: true, tags: ['Fine-tuning', 'LLaMA', 'Beginner', 'RTX 4090'],
    views: 1200,
    reactions: { '❤️': 34, '💡': 12 },
    replies: [
      { id: 'r11', author: USERS.silicon_sam, content: 'Great questions! Yes, RTX 4090 is MORE than enough for LLaMA 3 8B with QLoRA.\n\nHere\'s your exact roadmap:\n\n1. **Install Unsloth** — it\'s the fastest fine-tuning library and works great on consumer GPUs\n2. **Format data** as instruction/response pairs: `{"instruction": "customer question", "output": "ideal response"}`\n3. **Use QLoRA** (4-bit quantization + LoRA adapters) — fits in ~12GB VRAM, leaving room for batch size\n4. **Training time**: ~2-4 hours for 500MB of data with 3 epochs\n5. **After training**: merge the LoRA adapter back, quantize to GGUF format, serve with Ollama locally\n\nI can share my exact Unsloth notebook if you want — DM me!', upvotes: 178, time: '45m ago', isAccepted: true, reactions: { '🔥': 45, '💡': 67, '❤️': 34 } },
      { id: 'r12', author: USERS.code_sensei, content: 'Adding to what @silicon_sam said — before fine-tuning, try RAG first (Retrieval Augmented Generation). Load your docs into a vector DB, and query them at runtime. It\'s faster to set up, doesn\'t require training, and for many use cases it works better than fine-tuning. Fine-tune only if RAG doesn\'t cut it.', upvotes: 134, time: '30m ago', reactions: { '💡': 56, '👏': 23 } },
    ],
  },
  {
    id: 't5', spaceId: 'ai-news', type: 'news',
    title: 'OpenAI just acquired a robotics company. Here\'s why this changes everything.',
    content: 'BREAKING: OpenAI has acquired [Robotics Company] for an undisclosed amount. This is huge and here\'s my analysis:\n\n**What happened:** OpenAI quietly acquired a robotics startup specializing in manipulation tasks (picking, placing, assembling). The team of 40 engineers joins OpenAI\'s "Physical AI" division.\n\n**Why it matters:**\n1. OpenAI is clearly moving beyond language. This is the strongest signal yet that AGI includes embodiment.\n2. The acquired team\'s specialty — manipulation — is the hardest problem in robotics. This isn\'t a toy.\n3. Combined with their work on world models (Sora), they now have vision + language + physical action.\n\n**My hot take:** Within 2 years, you\'ll be able to describe a physical task to a robot and it\'ll just... do it. This acquisition is the missing piece.\n\n**Bearish counter-argument:** Robotics is a hardware problem. Software alone won\'t solve manipulation in unstructured environments. Ask any robotics engineer — the sim-to-real gap is still enormous.\n\nWhat do you think? Is this the beginning of physical AGI or just another big tech acquisition that goes nowhere?',
    author: USERS.tech_pulse, upvotes: 567, replyCount: 178, time: '30m ago', hot: true, pinned: false, tags: ['OpenAI', 'Robotics', 'Breaking', 'Analysis'],
    views: 5600,
    reactions: { '🔥': 189, '🤔': 134, '💡': 78 },
    replies: [
      { id: 'r13', author: USERS.contrarian_carl, content: 'Counterpoint: Google has had a robotics division for over a decade. Boston Dynamics has been doing backflips since 2018. None of this has translated to consumer products. OpenAI buying a team doesn\'t change the fundamental physics and engineering challenges.', upvotes: 234, time: '20m ago', reactions: { '🤔': 89, '🔥': 34 } },
      { id: 'r14', author: USERS.neural_ninja, content: 'The difference now is the intelligence layer. Previous robotics was programmed behavior. With foundation models, the robot can *understand intent* and *adapt*. Google\'s RT-2 paper showed this. OpenAI is betting they can do it better.', upvotes: 189, time: '15m ago', reactions: { '💡': 67, '🔥': 45 } },
    ],
  },
  {
    id: 't6', spaceId: 'gpu-garage', type: 'poll',
    title: 'POLL: What\'s your daily driver GPU for AI inference? Results will surprise you.',
    content: 'Curious what the community is actually using day-to-day for running local models. Not your dream setup, your ACTUAL current hardware. Vote below!',
    author: USERS.silicon_sam, upvotes: 234, replyCount: 156, time: '8h ago', hot: false, pinned: false, tags: ['GPU', 'Poll', 'Hardware', 'Inference'],
    views: 2800,
    reactions: { '🤔': 45, '💡': 23 },
    pollOptions: [
      { text: 'RTX 4090 (24GB)', votes: 342 },
      { text: 'RTX 3090 / 3090 Ti (24GB)', votes: 287 },
      { text: 'RTX 4080 / 4070 Ti (16GB)', votes: 156 },
      { text: 'Apple M1/M2/M3 (Unified)', votes: 234 },
      { text: 'Cloud only (no local GPU)', votes: 189 },
      { text: 'AMD (RX 7900 XTX etc)', votes: 45 },
      { text: 'Other / Multi-GPU setup', votes: 67 },
    ],
    replies: [
      { id: 'r15', author: USERS.neural_ninja, content: 'M3 Max gang 🙋‍♂️ — 64GB unified memory means I can run 70B models quantized. The throughput isn\'t as fast as a 4090 but the VRAM (technically unified memory) can\'t be beat at this price point.', upvotes: 123, time: '7h ago', reactions: { '🔥': 34, '💡': 23 } },
    ],
  },
  {
    id: 't7', spaceId: 'showcase', type: 'showcase',
    title: 'I built an AI that generates Figma designs from wireframe sketches — try it free',
    content: '🎉 **Launching today: SketchToFigma AI**\n\nDraw a rough wireframe on paper (or any whiteboard tool), take a photo, and get a production-ready Figma design in 30 seconds.\n\n**How it works:**\n1. Upload a photo of your wireframe sketch\n2. AI detects components (buttons, inputs, cards, navbars, etc.)\n3. Generates a clean Figma design with proper spacing, typography, and a color palette\n4. Export as Figma file or React/Tailwind code\n\n**Tech stack:** Claude Vision for sketch understanding → custom layout engine → Figma API for design generation → CodeGen pipeline for React export.\n\n**Try it free:** [link] (10 free conversions, no credit card)\n\nWould love feedback from the community! Especially interested in:\n- Edge cases that break it\n- Component types I should support\n- Would you pay for this? What price point?\n\n[Screenshots and demo video attached]',
    author: USERS.design_ai_dan, upvotes: 445, replyCount: 67, time: '12h ago', hot: false, pinned: false, tags: ['Launch', 'Design', 'Figma', 'Claude Vision'],
    views: 3400,
    reactions: { '🔥': 134, '👏': 189, '💡': 67, '❤️': 45 },
    replies: [
      { id: 'r16', author: USERS.ship_it_sarah, content: 'Just tried it and WOW. The component detection is surprisingly accurate. It even figured out that my squiggly lines meant a text block and my circles meant avatars. One piece of feedback: the spacing between sections could be more consistent. Overall: 9/10, would absolutely pay $20/month for unlimited.', upvotes: 89, time: '10h ago', reactions: { '❤️': 23, '👏': 18 } },
    ],
  },
  {
    id: 't8', spaceId: 'watercooler', type: 'discussion',
    title: 'Unpopular opinion: AI will NOT replace developers. Here\'s my actual hot take.',
    content: 'Every week there\'s a new "AI will replace all developers by 2027" article. Here\'s my actual nuanced take after using AI coding tools daily for 2 years:\n\n**What AI WILL replace:**\n- Copy-paste Stack Overflow developers\n- People who write boilerplate all day without understanding it\n- Junior devs who can\'t debug their own code\n\n**What AI will NEVER replace:**\n- System design and architecture decisions\n- Understanding business requirements and translating them to technical specs\n- Debugging production issues at 3am (you still need someone who understands the system)\n- The judgment call of "should we build this at all?"\n\n**My actual prediction:** AI makes 10x developers into 100x developers. It makes mediocre developers dangerous (they ship faster but with more subtle bugs). And it makes the gap between great and average engineers even wider.\n\nThe job market will shrink but the best developers will be MORE valuable, not less. The demand for "people who can actually think about systems" is going up, not down.\n\nFight me in the comments. 👇',
    author: USERS.contrarian_carl, upvotes: 1567, replyCount: 489, time: '5h ago', hot: true, pinned: false, tags: ['Hot Take', 'Career', 'AI + Jobs'],
    views: 12300,
    reactions: { '🔥': 456, '🤔': 234, '👏': 178, '💡': 123 },
    replies: [
      { id: 'r17', author: USERS.code_sensei, content: 'Agreed on everything except one point. AI WILL eventually handle system design — not by replacing architects, but by being an incredible thinking partner. The architect who uses AI to evaluate 50 design options in an hour will outperform the one who evaluates 3 in a week.', upvotes: 345, time: '4h ago', reactions: { '💡': 123, '🔥': 67 } },
      { id: 'r18', author: USERS.ai_curious_dev, content: 'As someone who\'s learning to code WITH AI from day one, I have a different perspective. AI isn\'t replacing developers — it\'s changing what "being a developer" means. I can build things in weeks that would have taken months. But I still need to understand WHAT to build and WHY.', upvotes: 267, time: '3h ago', reactions: { '👏': 89, '❤️': 56, '💡': 45 } },
    ],
  },
];

// ── Categories ─────────────────────────────────────────────────
export const SPACE_CATEGORIES = ['All', 'Discussion', 'Builders', 'Learning', 'Hardware', 'Q&A', 'Career', 'Chill'];

// ── XP Config ──────────────────────────────────────────────────
export const XP_ACTIONS = [
  { action: 'Create a thread', xp: 10 },
  { action: 'Reply to a thread', xp: 5 },
  { action: 'Get an upvote', xp: 2 },
  { action: 'Answer accepted (Q&A)', xp: 25 },
  { action: 'Showcase featured', xp: 50 },
  { action: 'Daily login streak', xp: 3 },
  { action: 'Refer a member', xp: 100 },
  { action: 'Complete a marketplace sale', xp: 20 },
];

export const LEVELS = [
  { name: 'Newcomer', minXP: 0, color: '#94a3b8' },
  { name: 'Contributor', minXP: 100, color: '#3b82f6' },
  { name: 'Pro', minXP: 1000, color: '#06b6d4' },
  { name: 'Expert', minXP: 5000, color: '#8b5cf6' },
  { name: 'Legend', minXP: 15000, color: '#f59e0b' },
];

export const BADGE_STYLES: Record<string, { bg: string; text: string; border: string }> = {
  'Top Contributor': { bg: '#fef3c7', text: '#92400e', border: '#fbbf24' },
  'Builder': { bg: '#fdf2f8', text: '#9d174d', border: '#f472b6' },
  'Verified Seller': { bg: '#ecfdf5', text: '#065f46', border: '#34d399' },
  'News Scout': { bg: '#eff6ff', text: '#1e40af', border: '#60a5fa' },
  'Hardware Expert': { bg: '#ecfeff', text: '#155e75', border: '#22d3ee' },
  'Expert': { bg: '#f5f3ff', text: '#5b21b6', border: '#a78bfa' },
  'Legend': { bg: '#fefce8', text: '#854d0e', border: '#facc15' },
  'Pro': { bg: '#ecfeff', text: '#0e7490', border: '#06b6d4' },
  'Moderator': { bg: '#fef2f2', text: '#991b1b', border: '#f87171' },
};

export const TYPE_CONFIG: Record<string, { icon: string; label: string; color: string }> = {
  discussion: { icon: '💬', label: 'Discussion', color: '#6366f1' },
  question: { icon: '❓', label: 'Question', color: '#10b981' },
  showcase: { icon: '🏆', label: 'Showcase', color: '#f97316' },
  poll: { icon: '📊', label: 'Poll', color: '#8b5cf6' },
  ama: { icon: '🎙️', label: 'AMA', color: '#ec4899' },
  news: { icon: '📰', label: 'News', color: '#0ea5e9' },
};

// ── Helpers ─────────────────────────────────────────────────────
export function getSpaceById(id: string) {
  return SPACES.find((s) => s.id === id);
}

export function getThreadsBySpace(spaceId: string) {
  return THREADS.filter((t) => t.spaceId === spaceId);
}

export function getThreadById(id: string) {
  return THREADS.find((t) => t.id === id);
}

export function getLeaderboard() {
  return Object.values(USERS)
    .sort((a, b) => b.xp - a.xp)
    .slice(0, 10);
}
