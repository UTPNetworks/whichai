"use client";

import { useState, useMemo, useEffect, Suspense } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft, Search, Star, MessageSquare, Image, Video, Music, Code,
  Sparkles, X, Check, ChevronRight, Layers, ExternalLink,
  Zap, DollarSign, Users, Building2, Tag, Info, GitCompare,
} from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import Navbar from "@/components/Navbar";

// ── Enriched Model Data ────────────────────────────────────────────────
const AI_MODELS = [
  {
    id: "gpt-4o",
    name: "GPT-4o",
    provider: "OpenAI",
    category: "LLM",
    capability: ["Chat", "Code", "Vision", "Reasoning"],
    pricing: "$$",
    rating: 4.8,
    description: "OpenAI's flagship multimodal model with text, vision, and audio capabilities.",
    badge: "Popular",
    contextWindow: "128K tokens",
    speed: "Fast",
    imageGen: false,
    bestFor: ["Complex reasoning", "Code generation", "Vision tasks", "API integration", "Research"],
    features: [
      "Multimodal: text, image & audio input",
      "128K context window",
      "Function calling & JSON mode",
      "Real-time streaming",
      "Vision (image understanding)",
      "Code interpreter",
      "Plugins & tools support",
    ],
    pricing_detail: {
      individual: [
        { plan: "ChatGPT Free", price: "$0/mo", includes: ["GPT-4o mini access", "Limited GPT-4o", "Basic features"] },
        { plan: "ChatGPT Plus", price: "$20/mo", includes: ["Full GPT-4o access", "DALL-E 3 image gen", "Advanced analysis", "GPT Store access"] },
        { plan: "ChatGPT Pro", price: "$200/mo", includes: ["Unlimited GPT-4o", "o1 Pro access", "Priority compute", "All features"] },
      ],
      business: [
        { plan: "Team", price: "$25/user/mo", includes: ["Higher limits", "Admin controls", "No training on data", "Shared workspace"] },
        { plan: "Enterprise", price: "Custom", includes: ["Unlimited usage", "SOC 2 compliance", "Custom data retention", "Dedicated support"] },
      ],
      api: { input: "$2.50/1M tokens", output: "$10.00/1M tokens", note: "GPT-4o API pricing" },
      discount: "Annual billing saves 20% on Plus/Team plans",
    },
  },
  {
    id: "gpt-4o-mini",
    name: "GPT-4o Mini",
    provider: "OpenAI",
    category: "LLM",
    capability: ["Chat", "Code"],
    pricing: "$",
    rating: 4.5,
    description: "Affordable, fast version of GPT-4o for everyday tasks.",
    badge: null,
    contextWindow: "128K tokens",
    speed: "Very Fast",
    imageGen: false,
    bestFor: ["High-volume tasks", "Simple chat", "Cost-sensitive apps", "Quick summaries"],
    features: [
      "128K context window",
      "Function calling support",
      "JSON mode",
      "Batch API support",
      "Vision capabilities",
    ],
    pricing_detail: {
      individual: [
        { plan: "Free", price: "$0/mo", includes: ["Limited access via ChatGPT", "Basic features"] },
      ],
      business: [],
      api: { input: "$0.15/1M tokens", output: "$0.60/1M tokens", note: "60× cheaper than GPT-4o" },
      discount: null,
    },
  },
  {
    id: "chatgpt-plus",
    name: "ChatGPT Plus",
    provider: "OpenAI",
    category: "LLM",
    capability: ["Chat", "Code", "Vision", "Reasoning", "Image Gen"],
    pricing: "$$",
    rating: 4.9,
    description: "Premium ChatGPT with GPT-4o, DALL-E 3, browsing, and plugins.",
    badge: "Top Rated",
    contextWindow: "128K tokens",
    speed: "Fast",
    imageGen: true,
    bestFor: ["Power users", "Image generation", "Research & browsing", "Code with execution", "All-in-one AI"],
    features: [
      "Full GPT-4o access",
      "DALL-E 3 image generation",
      "Browsing with Bing",
      "Code interpreter (Advanced Data Analysis)",
      "GPT Store & custom GPTs",
      "Voice mode",
      "File uploads & analysis",
    ],
    pricing_detail: {
      individual: [
        { plan: "Plus", price: "$20/mo", includes: ["Everything in Free", "Full GPT-4o access", "DALL-E 3", "Advanced analysis", "GPT Store"] },
      ],
      business: [
        { plan: "Team", price: "$25/user/mo", includes: ["All Plus features", "No training on data", "Admin console", "Higher message limits"] },
      ],
      api: { input: "N/A", output: "N/A", note: "Subscription product — not API" },
      discount: "Annual plan available",
    },
  },
  {
    id: "claude-opus-4",
    name: "Claude Opus 4",
    provider: "Anthropic",
    category: "LLM",
    capability: ["Chat", "Code", "Reasoning", "Vision"],
    pricing: "$$$",
    rating: 4.9,
    description: "Anthropic's most powerful model for complex analysis and coding.",
    badge: "Top Rated",
    contextWindow: "200K tokens",
    speed: "Medium",
    imageGen: false,
    bestFor: ["Complex research", "Long documents", "Advanced coding", "Nuanced writing", "Scientific analysis"],
    features: [
      "200K context window (longest available)",
      "Superior reasoning & analysis",
      "Vision (image understanding)",
      "Tool use & function calling",
      "Constitutional AI safety",
      "Artifacts (code, docs, diagrams)",
      "Projects with persistent memory",
    ],
    pricing_detail: {
      individual: [
        { plan: "Claude Free", price: "$0/mo", includes: ["Limited Claude access", "Basic features"] },
        { plan: "Claude Pro", price: "$20/mo", includes: ["5× more usage", "Priority access", "Claude Opus 4 access", "Projects feature", "Early features"] },
      ],
      business: [
        { plan: "Team", price: "$25/user/mo", includes: ["All Pro features", "Central billing", "Higher usage", "Admin dashboard"] },
        { plan: "Enterprise", price: "Custom", includes: ["Unlimited usage", "Custom integrations", "SSO", "Dedicated support", "SLA"] },
      ],
      api: { input: "$15.00/1M tokens", output: "$75.00/1M tokens", note: "Claude Opus 4 API" },
      discount: "Annual billing: 20% off Pro & Team",
    },
  },
  {
    id: "claude-sonnet-4",
    name: "Claude Sonnet 4",
    provider: "Anthropic",
    category: "LLM",
    capability: ["Chat", "Code", "Reasoning", "Vision"],
    pricing: "$$",
    rating: 4.7,
    description: "Balanced performance and speed for most tasks.",
    badge: "Popular",
    contextWindow: "200K tokens",
    speed: "Fast",
    imageGen: false,
    bestFor: ["Everyday AI tasks", "Coding assistance", "Content creation", "Customer support", "Data analysis"],
    features: [
      "200K context window",
      "Vision capabilities",
      "Tool use & function calling",
      "Artifacts support",
      "Strong coding abilities",
      "Fast response times",
    ],
    pricing_detail: {
      individual: [
        { plan: "Claude Pro", price: "$20/mo", includes: ["Full Sonnet 4 access", "Priority speed", "Projects", "Early access"] },
      ],
      business: [
        { plan: "Team", price: "$25/user/mo", includes: ["Higher limits", "Team features", "Admin control"] },
      ],
      api: { input: "$3.00/1M tokens", output: "$15.00/1M tokens", note: "Best value Anthropic model" },
      discount: "Annual billing: 20% off",
    },
  },
  {
    id: "claude-haiku-3-5",
    name: "Claude Haiku 3.5",
    provider: "Anthropic",
    category: "LLM",
    capability: ["Chat", "Code"],
    pricing: "$",
    rating: 4.3,
    description: "Lightning-fast responses at the lowest cost.",
    badge: null,
    contextWindow: "200K tokens",
    speed: "Very Fast",
    imageGen: false,
    bestFor: ["High-volume automation", "Simple Q&A", "Real-time applications", "Cost-sensitive projects"],
    features: [
      "200K context window",
      "Sub-second response times",
      "Tool use support",
      "Batch processing",
    ],
    pricing_detail: {
      individual: [],
      business: [],
      api: { input: "$0.80/1M tokens", output: "$4.00/1M tokens", note: "Fastest Anthropic model" },
      discount: null,
    },
  },
  {
    id: "gemini-2-5-pro",
    name: "Gemini 2.5 Pro",
    provider: "Google",
    category: "LLM",
    capability: ["Chat", "Code", "Vision", "Reasoning"],
    pricing: "$$",
    rating: 4.7,
    description: "Google's most capable model with 1M token context.",
    badge: "New",
    contextWindow: "1M tokens",
    speed: "Fast",
    imageGen: false,
    bestFor: ["Massive document analysis", "Research", "Video understanding", "Long-form coding", "Google Workspace"],
    features: [
      "1M token context window (industry-leading)",
      "Multimodal: text, image, audio, video",
      "Google Search integration",
      "Code execution",
      "Function calling",
      "Deep Think reasoning mode",
    ],
    pricing_detail: {
      individual: [
        { plan: "Gemini Free", price: "$0/mo", includes: ["Gemini 1.5 Flash access", "Basic features", "Google integration"] },
        { plan: "Gemini Advanced", price: "$19.99/mo", includes: ["Gemini 2.5 Pro", "1M context", "Google Workspace integration", "Priority access"] },
      ],
      business: [
        { plan: "Google One AI Premium", price: "$19.99/mo", includes: ["2TB storage + Gemini Advanced", "All Google apps AI features"] },
        { plan: "Workspace Business", price: "Custom", includes: ["Enterprise Gemini", "Admin controls", "Data security", "SLA"] },
      ],
      api: { input: "$1.25/1M tokens (≤200K)", output: "$5.00/1M tokens", note: "Via Google AI Studio" },
      discount: "Google One bundling available",
    },
  },
  {
    id: "gemini-2-0-flash",
    name: "Gemini 2.0 Flash",
    provider: "Google",
    category: "LLM",
    capability: ["Chat", "Code", "Vision"],
    pricing: "$",
    rating: 4.4,
    description: "Fast, efficient model for high-volume tasks.",
    badge: null,
    contextWindow: "1M tokens",
    speed: "Very Fast",
    imageGen: false,
    bestFor: ["High-throughput apps", "Real-time chat", "Cost-efficient projects", "Mobile apps"],
    features: [
      "1M context window",
      "Multimodal input",
      "Very low latency",
      "Function calling",
    ],
    pricing_detail: {
      individual: [],
      business: [],
      api: { input: "$0.10/1M tokens", output: "$0.40/1M tokens", note: "Free tier available in AI Studio" },
      discount: null,
    },
  },
  {
    id: "llama-3-1-405b",
    name: "Llama 3.1 405B",
    provider: "Meta",
    category: "LLM",
    capability: ["Chat", "Code", "Reasoning"],
    pricing: "Free",
    rating: 4.6,
    description: "Meta's largest open-source model, rivaling proprietary models.",
    badge: "Open Source",
    contextWindow: "128K tokens",
    speed: "Medium",
    imageGen: false,
    bestFor: ["Self-hosting", "Fine-tuning", "Privacy-first apps", "Research", "Cost-zero deployments"],
    features: [
      "Fully open-source (use commercially)",
      "128K context window",
      "Self-hostable on your infrastructure",
      "Fine-tunable for custom tasks",
      "Strong multilingual support",
      "Available via Groq, Together AI, etc.",
    ],
    pricing_detail: {
      individual: [
        { plan: "Self-hosted", price: "Free", includes: ["Full model weights", "Commercial license", "No API costs"] },
        { plan: "Via Groq", price: "~$0.50/1M tokens", includes: ["Ultra-fast inference", "No setup required"] },
      ],
      business: [
        { plan: "Meta Llama API (beta)", price: "TBA", includes: ["Managed hosting", "Enterprise SLA"] },
      ],
      api: { input: "Free (self-hosted)", output: "Free (self-hosted)", note: "Third-party hosting varies" },
      discount: "100% free — open source",
    },
  },
  {
    id: "llama-3-1-70b",
    name: "Llama 3.1 70B",
    provider: "Meta",
    category: "LLM",
    capability: ["Chat", "Code"],
    pricing: "Free",
    rating: 4.4,
    description: "Strong open-source model, great for self-hosting.",
    badge: "Open Source",
    contextWindow: "128K tokens",
    speed: "Fast",
    imageGen: false,
    bestFor: ["Self-hosting", "Lightweight fine-tuning", "Edge deployment", "Budget projects"],
    features: [
      "Open-source with commercial license",
      "Runs on consumer GPUs",
      "128K context window",
      "Fine-tunable",
    ],
    pricing_detail: {
      individual: [
        { plan: "Self-hosted", price: "Free", includes: ["Full weights", "Commercial use"] },
      ],
      business: [],
      api: { input: "Free (self-hosted)", output: "Free (self-hosted)", note: "~$0.08–$0.20/1M via cloud providers" },
      discount: "100% free — open source",
    },
  },
  {
    id: "mistral-large",
    name: "Mistral Large",
    provider: "Mistral",
    category: "LLM",
    capability: ["Chat", "Code", "Reasoning"],
    pricing: "$$",
    rating: 4.5,
    description: "Mistral's flagship model for complex tasks.",
    badge: null,
    contextWindow: "128K tokens",
    speed: "Fast",
    imageGen: false,
    bestFor: ["European data compliance", "Coding", "Complex reasoning", "Multilingual tasks"],
    features: [
      "128K context window",
      "Strong multilingual (French, German, Spanish, etc.)",
      "Function calling",
      "JSON mode",
      "GDPR-compliant (EU-hosted option)",
    ],
    pricing_detail: {
      individual: [
        { plan: "Le Chat Free", price: "$0/mo", includes: ["Mistral Large access", "Web interface"] },
        { plan: "Le Chat Pro", price: "$14.99/mo", includes: ["Priority access", "Higher limits", "Image upload"] },
      ],
      business: [
        { plan: "Enterprise", price: "Custom", includes: ["EU data residency", "Private deployment", "SLA"] },
      ],
      api: { input: "$2.00/1M tokens", output: "$6.00/1M tokens", note: "Mistral Large 2" },
      discount: null,
    },
  },
  {
    id: "deepseek-v3",
    name: "DeepSeek V3",
    provider: "DeepSeek",
    category: "LLM",
    capability: ["Chat", "Code", "Reasoning"],
    pricing: "$",
    rating: 4.5,
    description: "High-performance model with strong coding abilities.",
    badge: "New",
    contextWindow: "128K tokens",
    speed: "Fast",
    imageGen: false,
    bestFor: ["Code generation", "Math", "Cost-sensitive projects", "Chinese language tasks"],
    features: [
      "128K context window",
      "Mixture-of-Experts architecture",
      "Strong coding & math",
      "Function calling",
      "Open weights available",
    ],
    pricing_detail: {
      individual: [
        { plan: "DeepSeek Chat", price: "Free", includes: ["Web access", "Basic features"] },
      ],
      business: [],
      api: { input: "$0.27/1M tokens", output: "$1.10/1M tokens", note: "Extremely cost-efficient" },
      discount: "50% off during off-peak hours",
    },
  },
  {
    id: "deepseek-r1",
    name: "DeepSeek R1",
    provider: "DeepSeek",
    category: "LLM",
    capability: ["Reasoning", "Code", "Chat"],
    pricing: "$",
    rating: 4.6,
    description: "Reasoning-focused model competitive with OpenAI o1.",
    badge: "New",
    contextWindow: "128K tokens",
    speed: "Medium",
    imageGen: false,
    bestFor: ["Complex math", "Scientific reasoning", "Long chain-of-thought", "Research problems"],
    features: [
      "Chain-of-thought reasoning (shows thinking)",
      "128K context window",
      "Open weights (MIT license)",
      "Competitive with o1 on benchmarks",
      "Strong math & science",
    ],
    pricing_detail: {
      individual: [
        { plan: "DeepSeek Chat", price: "Free", includes: ["R1 access", "Reasoning mode"] },
      ],
      business: [],
      api: { input: "$0.55/1M tokens", output: "$2.19/1M tokens", note: "Open-source reasoning model" },
      discount: "50% off during off-peak hours",
    },
  },
  {
    id: "grok-3",
    name: "Grok 3",
    provider: "xAI",
    category: "LLM",
    capability: ["Chat", "Code", "Reasoning"],
    pricing: "$$",
    rating: 4.4,
    description: "xAI's conversational model with real-time X (Twitter) knowledge.",
    badge: "New",
    contextWindow: "128K tokens",
    speed: "Fast",
    imageGen: false,
    bestFor: ["Real-time news", "Social media analysis", "X/Twitter integration", "Unfiltered responses"],
    features: [
      "Real-time X (Twitter) data access",
      "128K context window",
      "Grok Think (reasoning mode)",
      "Image generation (Aurora)",
      "Less restricted outputs",
    ],
    pricing_detail: {
      individual: [
        { plan: "X Premium", price: "$8/mo", includes: ["Basic Grok access", "X blue checkmark"] },
        { plan: "X Premium+", price: "$16/mo", includes: ["Full Grok 3 access", "Priority access", "All Grok features"] },
        { plan: "SuperGrok", price: "$30/mo", includes: ["Highest Grok limits", "Grok Think", "Image gen", "All features"] },
      ],
      business: [
        { plan: "Enterprise", price: "Custom", includes: ["API access", "Business features"] },
      ],
      api: { input: "$3.00/1M tokens", output: "$15.00/1M tokens", note: "Via xAI API" },
      discount: "Annual X Premium saves ~15%",
    },
  },
  {
    id: "dall-e-3",
    name: "DALL-E 3",
    provider: "OpenAI",
    category: "Image",
    capability: ["Image Gen"],
    pricing: "$$",
    rating: 4.6,
    description: "Advanced text-to-image generation with high prompt accuracy.",
    badge: "Popular",
    contextWindow: "N/A",
    speed: "Medium",
    imageGen: true,
    bestFor: ["Marketing visuals", "Concept art", "Blog illustrations", "Product mockups"],
    features: [
      "Highest prompt accuracy of any image model",
      "Integrated into ChatGPT Plus",
      "1024×1024, 1024×1792, 1792×1024 outputs",
      "Natural language prompt refinement",
      "Content policy compliance",
      "No need for prompt engineering",
    ],
    pricing_detail: {
      individual: [
        { plan: "ChatGPT Plus", price: "$20/mo", includes: ["DALL-E 3 via ChatGPT", "Unlimited generations (soft limit)", "HD quality"] },
      ],
      business: [
        { plan: "ChatGPT Team", price: "$25/user/mo", includes: ["DALL-E 3 access", "Higher limits", "Team workspace"] },
      ],
      api: { input: "$0.040/image (standard)", output: "$0.080/image (HD)", note: "Per-image API pricing" },
      discount: null,
    },
  },
  {
    id: "midjourney-v6",
    name: "Midjourney v6",
    provider: "Midjourney",
    category: "Image",
    capability: ["Image Gen"],
    pricing: "$$",
    rating: 4.8,
    description: "Industry-leading aesthetic quality for image generation.",
    badge: "Top Rated",
    contextWindow: "N/A",
    speed: "Medium",
    imageGen: true,
    bestFor: ["Artistic imagery", "Concept art", "Fashion design", "Architecture visualization", "High-quality marketing"],
    features: [
      "Best aesthetic quality in the industry",
      "Coherent faces & hands",
      "Vary Region (inpainting)",
      "Style reference & character reference",
      "Pan & Zoom (outpainting)",
      "High resolution upscalers",
      "Niji mode (anime style)",
    ],
    pricing_detail: {
      individual: [
        { plan: "Basic", price: "$10/mo", includes: ["~200 images/mo", "3 concurrent jobs", "General commercial terms"] },
        { plan: "Standard", price: "$30/mo", includes: ["~900 fast images/mo", "Unlimited relaxed", "Stealth mode"] },
        { plan: "Pro", price: "$60/mo", includes: ["~1800 fast images/mo", "12 concurrent jobs", "Stealth mode"] },
        { plan: "Mega", price: "$120/mo", includes: ["~3600 fast images/mo", "Highest limits"] },
      ],
      business: [
        { plan: "Enterprise", price: "Custom ($120+/user/yr)", includes: ["Enterprise license", "Centralized billing", "Priority support"] },
      ],
      api: { input: "N/A", output: "N/A", note: "No public API — Discord or web UI only" },
      discount: "Annual billing: 20% discount on all plans",
    },
  },
  {
    id: "stable-diffusion-3",
    name: "Stable Diffusion 3",
    provider: "Stability AI",
    category: "Image",
    capability: ["Image Gen"],
    pricing: "Free",
    rating: 4.4,
    description: "Open-source image generation with fine-tuning support.",
    badge: "Open Source",
    contextWindow: "N/A",
    speed: "Variable",
    imageGen: true,
    bestFor: ["Self-hosting", "Fine-tuning on custom styles", "Unrestricted generation", "Research", "ComfyUI workflows"],
    features: [
      "Fully open-source (weights available)",
      "Run locally on consumer GPUs",
      "Unlimited generations when self-hosted",
      "Fine-tuning with LoRA / DreamBooth",
      "Huge community ecosystem",
      "ComfyUI / Automatic1111 compatible",
    ],
    pricing_detail: {
      individual: [
        { plan: "Self-hosted", price: "Free", includes: ["Full model weights", "Unlimited generations", "No restrictions"] },
        { plan: "Stability AI Platform", price: "$0.03–0.065/image", includes: ["Cloud API", "No GPU required"] },
      ],
      business: [
        { plan: "Membership", price: "$20/mo", includes: ["Stable Image API credits", "Premium models access"] },
        { plan: "Enterprise", price: "Custom", includes: ["Private deployment", "Custom fine-tuning", "SLA"] },
      ],
      api: { input: "$0.03/image", output: "N/A", note: "Stability AI Platform API" },
      discount: "100% free when self-hosted",
    },
  },
  {
    id: "sora",
    name: "Sora",
    provider: "OpenAI",
    category: "Video",
    capability: ["Video Gen"],
    pricing: "$$$",
    rating: 4.5,
    description: "Text-to-video generation with cinematic quality.",
    badge: "New",
    contextWindow: "N/A",
    speed: "Slow",
    imageGen: false,
    bestFor: ["Cinematic video generation", "Storyboarding", "Social media content", "Advertising"],
    features: [
      "Up to 1080p resolution video",
      "Up to 20 seconds per clip",
      "Text-to-video & image-to-video",
      "Storyboard mode",
      "Remix & blend videos",
      "Re-cut & loop tools",
    ],
    pricing_detail: {
      individual: [
        { plan: "ChatGPT Plus", price: "$20/mo", includes: ["Limited Sora access", "720p, up to 5 sec", "50 videos/mo"] },
        { plan: "ChatGPT Pro", price: "$200/mo", includes: ["Full Sora access", "1080p, up to 20 sec", "Unlimited videos", "No watermark"] },
      ],
      business: [
        { plan: "Enterprise", price: "Custom", includes: ["API access", "Higher limits", "Watermark removal"] },
      ],
      api: { input: "TBA", output: "TBA", note: "API in limited preview" },
      discount: null,
    },
  },
  {
    id: "whisper-v3",
    name: "Whisper v3",
    provider: "OpenAI",
    category: "Audio",
    capability: ["Speech-to-Text"],
    pricing: "$",
    rating: 4.7,
    description: "State-of-the-art speech recognition in 99 languages.",
    badge: "Popular",
    contextWindow: "N/A",
    speed: "Fast",
    imageGen: false,
    bestFor: ["Transcription", "Subtitles", "Voice commands", "Multilingual audio", "Podcast transcription"],
    features: [
      "99 language support",
      "Open-source model weights",
      "Transcription & translation",
      "Word-level timestamps",
      "Noise robustness",
      "Speaker diarization (via third-party)",
    ],
    pricing_detail: {
      individual: [
        { plan: "Self-hosted", price: "Free", includes: ["Open-source weights", "Unlimited use"] },
      ],
      business: [],
      api: { input: "$0.006/minute", output: "N/A", note: "OpenAI API — per audio minute" },
      discount: "Free when self-hosted",
    },
  },
  {
    id: "copilot",
    name: "GitHub Copilot",
    provider: "GitHub / OpenAI",
    category: "Code",
    capability: ["Code", "Chat"],
    pricing: "$$",
    rating: 4.7,
    description: "AI pair programmer integrated into your IDE.",
    badge: "Popular",
    contextWindow: "64K tokens",
    speed: "Very Fast",
    imageGen: false,
    bestFor: ["IDE coding", "Autocomplete", "Code review", "Test generation", "Documentation"],
    features: [
      "Real-time code autocomplete",
      "Copilot Chat in IDE",
      "Multi-file context",
      "Pull request summaries",
      "Test generation",
      "VS Code, JetBrains, Neovim, etc.",
      "CLI assistant",
    ],
    pricing_detail: {
      individual: [
        { plan: "Free", price: "$0/mo", includes: ["2000 completions/mo", "50 chat messages/mo", "VS Code & JetBrains"] },
        { plan: "Pro", price: "$10/mo", includes: ["Unlimited completions", "Unlimited chat", "Claude Sonnet & GPT-4o", "All IDEs"] },
        { plan: "Pro+", price: "$39/mo", includes: ["All Pro features", "OpenAI o1, o3, Claude Opus", "Higher rate limits"] },
      ],
      business: [
        { plan: "Business", price: "$19/user/mo", includes: ["Organization-wide policies", "Audit logs", "IP indemnity"] },
        { plan: "Enterprise", price: "$39/user/mo", includes: ["Custom fine-tuning", "GitHub.com integration", "Advanced security"] },
      ],
      api: { input: "N/A", output: "N/A", note: "IDE plugin subscription" },
      discount: "Free for verified students & open-source maintainers",
    },
  },
  {
    id: "claude-code",
    name: "Claude Code",
    provider: "Anthropic",
    category: "Code",
    capability: ["Code", "Chat", "Reasoning"],
    pricing: "$$",
    rating: 4.8,
    description: "Agentic coding tool that works directly in your terminal.",
    badge: "New",
    contextWindow: "200K tokens",
    speed: "Fast",
    imageGen: false,
    bestFor: ["Full codebase automation", "Complex refactoring", "Terminal-based workflows", "Agentic tasks"],
    features: [
      "Full codebase understanding",
      "Terminal-native (no IDE required)",
      "File creation, editing & deletion",
      "Git integration",
      "Shell command execution",
      "Multi-file refactoring",
      "Powered by Claude Sonnet/Opus",
    ],
    pricing_detail: {
      individual: [
        { plan: "Pay per use", price: "~$6–20/day active", includes: ["Claude Sonnet 4 by default", "Usage billed to Anthropic account"] },
      ],
      business: [
        { plan: "Enterprise", price: "Custom", includes: ["Volume pricing", "Claude Opus access", "Priority support"] },
      ],
      api: { input: "$3.00/1M tokens (Sonnet)", output: "$15.00/1M tokens", note: "Billed via Anthropic API" },
      discount: "Max plan subscribers get included usage",
    },
  },
  {
    id: "perplexity",
    name: "Perplexity",
    provider: "Perplexity AI",
    category: "LLM",
    capability: ["Chat", "Search", "Reasoning"],
    pricing: "$",
    rating: 4.5,
    description: "AI-powered search engine with cited, real-time answers.",
    badge: "Popular",
    contextWindow: "128K tokens",
    speed: "Fast",
    imageGen: false,
    bestFor: ["Research with citations", "Current events", "Fact-checking", "Academic research", "Quick answers"],
    features: [
      "Real-time web search with citations",
      "Multiple AI models (GPT-4o, Claude, Sonar)",
      "Spaces (collaborative research)",
      "File & image analysis",
      "Academic paper search",
      "Daily digest emails",
    ],
    pricing_detail: {
      individual: [
        { plan: "Free", price: "$0/mo", includes: ["Unlimited quick searches", "5 Pro searches/day", "GPT-4o mini"] },
        { plan: "Pro", price: "$20/mo", includes: ["600+ Pro searches/day", "GPT-4o, Claude Sonnet, etc.", "Image generation", "API credits"] },
      ],
      business: [
        { plan: "Enterprise Pro", price: "$40/user/mo", includes: ["Unlimited Pro searches", "SSO", "Admin controls", "Data privacy"] },
      ],
      api: { input: "$1.00/1M tokens (Sonar)", output: "$1.00/1M tokens", note: "Perplexity Sonar API" },
      discount: "Annual Pro billing saves ~17%",
    },
  },
];

const CATEGORIES = ["All", "LLM", "Image", "Video", "Audio", "Code"];
const CAT_ICONS: Record<string, typeof MessageSquare> = {
  LLM: MessageSquare, Image: Image, Video: Video, Audio: Music, Code: Code
};
const PROVIDER_COLORS: Record<string, string> = {
  "OpenAI": "bg-emerald-100 text-emerald-700",
  "Anthropic": "bg-orange-100 text-orange-700",
  "Google": "bg-blue-100 text-blue-700",
  "Meta": "bg-indigo-100 text-indigo-700",
  "Mistral": "bg-amber-100 text-amber-700",
  "DeepSeek": "bg-cyan-100 text-cyan-700",
  "xAI": "bg-slate-100 text-slate-700",
  "Midjourney": "bg-purple-100 text-purple-700",
  "Stability AI": "bg-violet-100 text-violet-700",
  "GitHub / OpenAI": "bg-gray-100 text-gray-700",
  "Perplexity AI": "bg-blue-100 text-blue-700",
  "ElevenLabs": "bg-teal-100 text-teal-700",
};
const BADGE_COLORS: Record<string, string> = {
  "Popular": "bg-violet-100 text-violet-700",
  "Top Rated": "bg-amber-100 text-amber-700",
  "New": "bg-cyan-100 text-cyan-700",
  "Open Source": "bg-emerald-100 text-emerald-700",
};

type Model = typeof AI_MODELS[0];

// ── Model Detail Modal ────────────────────────────────────────────────
function ModelModal({ model, onClose, onAddToCompare, compareList }: {
  model: Model;
  onClose: () => void;
  onAddToCompare: (id: string) => void;
  compareList: string[];
}) {
  const isInCompare = compareList.includes(model.id);
  const CatIcon = CAT_ICONS[model.category] || Sparkles;

  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = ""; };
  }, []);

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4"
        onClick={onClose}
      >
        {/* Backdrop */}
        <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />

        {/* Modal */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ type: "spring", damping: 25, stiffness: 300 }}
          className="relative bg-white rounded-3xl shadow-2xl w-full max-w-2xl max-h-[88vh] overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="relative bg-gradient-to-br from-slate-900 to-slate-800 p-6 pb-5">
            <button
              onClick={onClose}
              className="absolute top-4 right-4 p-2 rounded-xl bg-white/10 hover:bg-white/20 transition-colors text-white/70 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex items-start gap-4">
              <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 ${PROVIDER_COLORS[model.provider] || "bg-slate-100 text-slate-600"}`}>
                <CatIcon className="w-7 h-7" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap mb-1">
                  <h2 className="text-xl font-black text-white">{model.name}</h2>
                  {model.badge && (
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${BADGE_COLORS[model.badge]}`}>{model.badge}</span>
                  )}
                  {model.imageGen && (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-pink-100 text-pink-700 flex items-center gap-1">
                      <Image className="w-3 h-3" /> Image Gen
                    </span>
                  )}
                </div>
                <div className="text-white/50 text-sm">{model.provider} · {model.category}</div>
                <div className="flex items-center gap-4 mt-2">
                  <span className="flex items-center gap-1 text-amber-400 text-sm">
                    <Star className="w-4 h-4 fill-amber-400" /> {model.rating}
                  </span>
                  <span className="text-white/40 text-sm">{model.contextWindow}</span>
                  <span className="flex items-center gap-1 text-white/40 text-sm">
                    <Zap className="w-3 h-3" /> {model.speed}
                  </span>
                </div>
              </div>
            </div>

            <p className="text-white/60 text-sm mt-4 leading-relaxed">{model.description}</p>

            {/* Action buttons */}
            <div className="flex gap-2 mt-4">
              <button
                onClick={() => onAddToCompare(model.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all ${
                  isInCompare
                    ? "bg-cyan-500 text-white"
                    : "bg-white/10 text-white/70 hover:bg-white/20 hover:text-white"
                }`}
              >
                <GitCompare className="w-4 h-4" />
                {isInCompare ? "Added to Compare" : "Add to Compare"}
              </button>
            </div>
          </div>

          {/* Scrollable content */}
          <div className="overflow-y-auto max-h-[calc(88vh-220px)]">

            {/* Best For */}
            <div className="p-6 border-b border-gray-100">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Best For</h3>
              <div className="flex flex-wrap gap-2">
                {model.bestFor.map((use) => (
                  <span key={use} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-50 border border-slate-100 text-xs font-medium text-slate-700">
                    <Check className="w-3 h-3 text-emerald-500" /> {use}
                  </span>
                ))}
              </div>
            </div>

            {/* Features */}
            <div className="p-6 border-b border-gray-100">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Key Features</h3>
              <div className="space-y-2">
                {model.features.map((feat) => (
                  <div key={feat} className="flex items-start gap-2.5 text-sm text-slate-700">
                    <div className="w-5 h-5 rounded-full bg-emerald-50 flex items-center justify-center shrink-0 mt-0.5">
                      <Check className="w-3 h-3 text-emerald-600" />
                    </div>
                    {feat}
                  </div>
                ))}
              </div>
            </div>

            {/* Pricing */}
            <div className="p-6">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">Pricing</h3>

              {/* API Pricing */}
              {model.pricing_detail.api.input !== "N/A" && (
                <div className="mb-5 p-4 rounded-xl bg-slate-50 border border-slate-100">
                  <div className="flex items-center gap-2 mb-2">
                    <Code className="w-4 h-4 text-slate-500" />
                    <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">API Pricing</span>
                  </div>
                  <div className="grid grid-cols-2 gap-3 mb-2">
                    <div>
                      <div className="text-xs text-slate-400">Input</div>
                      <div className="font-bold text-slate-900 text-sm">{model.pricing_detail.api.input}</div>
                    </div>
                    <div>
                      <div className="text-xs text-slate-400">Output</div>
                      <div className="font-bold text-slate-900 text-sm">{model.pricing_detail.api.output}</div>
                    </div>
                  </div>
                  <div className="text-xs text-slate-400 flex items-center gap-1"><Info className="w-3 h-3" />{model.pricing_detail.api.note}</div>
                </div>
              )}

              {/* Individual Plans */}
              {model.pricing_detail.individual.length > 0 && (
                <div className="mb-5">
                  <div className="flex items-center gap-2 mb-3">
                    <Users className="w-4 h-4 text-blue-500" />
                    <span className="text-sm font-bold text-slate-700">Individual Plans</span>
                  </div>
                  <div className="space-y-2">
                    {model.pricing_detail.individual.map((plan) => (
                      <div key={plan.plan} className="p-3 rounded-xl border border-gray-100 bg-white">
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-bold text-slate-900 text-sm">{plan.plan}</span>
                          <span className="font-black text-sm text-slate-700 bg-slate-50 px-2 py-0.5 rounded-lg">{plan.price}</span>
                        </div>
                        <div className="flex flex-wrap gap-1.5">
                          {plan.includes.map((item) => (
                            <span key={item} className="text-[11px] text-slate-500 flex items-center gap-1">
                              <ChevronRight className="w-2.5 h-2.5 text-slate-300" />{item}
                            </span>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Business Plans */}
              {model.pricing_detail.business.length > 0 && (
                <div className="mb-5">
                  <div className="flex items-center gap-2 mb-3">
                    <Building2 className="w-4 h-4 text-violet-500" />
                    <span className="text-sm font-bold text-slate-700">Business / Enterprise Plans</span>
                  </div>
                  <div className="space-y-2">
                    {model.pricing_detail.business.map((plan) => (
                      <div key={plan.plan} className="p-3 rounded-xl border border-violet-100 bg-violet-50/40">
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-bold text-slate-900 text-sm">{plan.plan}</span>
                          <span className="font-black text-sm text-violet-700 bg-violet-100 px-2 py-0.5 rounded-lg">{plan.price}</span>
                        </div>
                        <div className="flex flex-wrap gap-1.5">
                          {plan.includes.map((item) => (
                            <span key={item} className="text-[11px] text-slate-500 flex items-center gap-1">
                              <ChevronRight className="w-2.5 h-2.5 text-violet-300" />{item}
                            </span>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Discount */}
              {model.pricing_detail.discount && (
                <div className="flex items-center gap-2.5 p-3 rounded-xl bg-emerald-50 border border-emerald-100">
                  <Tag className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span className="text-sm text-emerald-700 font-medium">{model.pricing_detail.discount}</span>
                </div>
              )}
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

// ── Compare Bar ─────────────────────────────────────────────────────────
function CompareBar({ compareList, onRemove, onClear, onCompare }: {
  compareList: string[];
  onRemove: (id: string) => void;
  onClear: () => void;
  onCompare: () => void;
}) {
  const models = compareList.map(id => AI_MODELS.find(m => m.id === id)).filter(Boolean) as Model[];

  return (
    <AnimatePresence>
      {compareList.length > 0 && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          className="fixed bottom-0 left-0 right-0 z-40 p-4"
        >
          <div className="max-w-4xl mx-auto bg-slate-900 rounded-2xl shadow-2xl border border-white/10 p-4 flex items-center gap-4">
            <div className="flex items-center gap-2">
              <GitCompare className="w-5 h-5 text-cyan-400 shrink-0" />
              <span className="text-white text-sm font-bold">{compareList.length} selected</span>
            </div>
            <div className="flex-1 flex items-center gap-2 overflow-x-auto">
              {models.map((m) => (
                <div key={m.id} className="flex items-center gap-1.5 bg-white/10 rounded-lg px-3 py-1.5 text-sm text-white shrink-0">
                  <span>{m.name}</span>
                  <button onClick={() => onRemove(m.id)} className="text-white/40 hover:text-white transition-colors">
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <button onClick={onClear} className="text-xs text-white/40 hover:text-white/70 transition-colors font-medium">Clear</button>
              <button
                onClick={onCompare}
                disabled={compareList.length < 2}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold text-white bg-gradient-to-r from-cyan-500 to-blue-600 hover:shadow-[0_0_20px_rgba(6,182,212,0.4)] transition-all disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Compare <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// ── Main Page ───────────────────────────────────────────────────────────
function ModelsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const highlight = searchParams.get("highlight");

  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("All");
  const [selectedModel, setSelectedModel] = useState<Model | null>(null);
  const [compareList, setCompareList] = useState<string[]>([]);

  // Auto-open model if highlight param is set
  useEffect(() => {
    if (highlight) {
      const m = AI_MODELS.find(m => m.id === highlight);
      if (m) setSelectedModel(m);
    }
  }, [highlight]);

  const filtered = useMemo(() => {
    return AI_MODELS.filter((m) => {
      const matchesCat = category === "All" || m.category === category;
      if (!query.trim()) return matchesCat;
      const q = query.toLowerCase();
      return matchesCat && (
        m.name.toLowerCase().includes(q) ||
        m.provider.toLowerCase().includes(q) ||
        m.description.toLowerCase().includes(q) ||
        m.capability.some(c => c.toLowerCase().includes(q))
      );
    });
  }, [query, category]);

  const toggleCompare = (id: string) => {
    setCompareList(prev =>
      prev.includes(id)
        ? prev.filter(x => x !== id)
        : prev.length < 4 ? [...prev, id] : prev
    );
  };

  const handleCompare = () => {
    const params = compareList.join(",");
    router.push(`/know-your-ai/compare?models=${params}`);
  };

  return (
    <div className="min-h-screen bg-[#f4f0eb]">
      <div className="bg-[#f4f0eb] border-b border-gray-100 sticky top-0 z-40"><Navbar /></div>
      <main className="max-w-6xl mx-auto px-6 py-12 pb-32">
        <Link href="/know-your-ai" className="inline-flex items-center gap-2 text-sm text-slate-400 hover:text-slate-700 transition-colors mb-8">
          <ArrowLeft className="w-4 h-4" /> Back to Know Your AI
        </Link>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-3xl md:text-4xl font-black text-slate-900 mb-2">Model Explorer</h1>
          <p className="text-slate-500 mb-8">Click any model to see full details, pricing & features. Select up to 4 to compare.</p>
        </motion.div>

        {/* Search + Compare button + filters */}
        <div className="flex flex-col sm:flex-row gap-3 mb-8">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder="Search models, providers, capabilities..."
              className="w-full pl-12 pr-4 py-3.5 rounded-xl border border-gray-200 bg-white text-sm outline-none focus:border-cyan-400 focus:shadow-lg transition-all"
            />
          </div>
          {/* Compare Button */}
          <Link
            href="/know-your-ai/compare"
            className="flex items-center gap-2 px-5 py-3.5 rounded-xl border border-gray-200 bg-white text-sm font-bold text-slate-700 hover:border-cyan-400 hover:text-cyan-700 hover:bg-cyan-50 transition-all shrink-0"
          >
            <Layers className="w-4 h-4" />
            Compare Models
            <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
          </Link>
        </div>

        {/* Category filters */}
        <div className="flex gap-2 flex-wrap mb-8">
          {CATEGORIES.map(c => (
            <button
              key={c}
              onClick={() => setCategory(c)}
              className={`px-4 py-2 text-xs font-bold rounded-xl border transition-all cursor-pointer ${
                category === c
                  ? "bg-cyan-600 text-white border-cyan-600 shadow-md"
                  : "bg-white text-slate-500 border-gray-200 hover:border-cyan-300"
              }`}
            >
              {c}
            </button>
          ))}
        </div>

        {/* Compare info banner */}
        {compareList.length === 0 && (
          <div className="flex items-center gap-2 text-xs text-slate-400 mb-4 font-medium">
            <GitCompare className="w-3.5 h-3.5" />
            Tip: Click the compare icon on any card to add it to comparison (up to 4 models)
          </div>
        )}

        {/* Results count */}
        <div className="text-xs text-slate-400 mb-4 font-semibold">{filtered.length} models</div>

        {/* Model Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((m, i) => {
            const CatIcon = CAT_ICONS[m.category] || Sparkles;
            const inCompare = compareList.includes(m.id);
            return (
              <motion.div
                key={m.id}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.03 }}
                className={`relative p-5 rounded-2xl bg-white border transition-all group cursor-pointer ${
                  inCompare
                    ? "border-cyan-400 shadow-[0_0_0_3px_rgba(6,182,212,0.15)] shadow-lg"
                    : "border-gray-200 hover:border-cyan-300 hover:shadow-lg"
                }`}
                onClick={() => setSelectedModel(m)}
              >
                {/* Compare toggle */}
                <button
                  className={`absolute top-3 right-3 p-1.5 rounded-lg transition-all z-10 ${
                    inCompare
                      ? "bg-cyan-100 text-cyan-600"
                      : "bg-slate-50 text-slate-300 hover:bg-cyan-50 hover:text-cyan-500 opacity-0 group-hover:opacity-100"
                  }`}
                  onClick={(e) => { e.stopPropagation(); toggleCompare(m.id); }}
                  title={inCompare ? "Remove from compare" : "Add to compare"}
                >
                  <GitCompare className="w-3.5 h-3.5" />
                </button>

                <div className="flex items-start gap-3 mb-3">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${PROVIDER_COLORS[m.provider] || "bg-slate-100 text-slate-600"}`}>
                    <CatIcon className="w-5 h-5" />
                  </div>
                  <div className="flex-1 min-w-0 pr-6">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-bold text-slate-900 text-sm">{m.name}</span>
                      {m.badge && <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${BADGE_COLORS[m.badge]}`}>{m.badge}</span>}
                      {m.imageGen && <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-pink-50 text-pink-600">🖼 Image</span>}
                    </div>
                    <span className="text-xs text-slate-400">{m.provider}</span>
                  </div>
                </div>

                <p className="text-xs text-slate-500 mb-3 leading-relaxed">{m.description}</p>

                {/* Capabilities */}
                <div className="flex gap-1.5 flex-wrap mb-3">
                  {m.capability.slice(0, 3).map(c => (
                    <span key={c} className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-slate-100 text-slate-500">{c}</span>
                  ))}
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="flex items-center gap-0.5 text-xs text-amber-500">
                      <Star className="w-3 h-3 fill-amber-400 text-amber-400" />{m.rating}
                    </span>
                    <span className="text-xs text-slate-400">{m.contextWindow}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`text-xs font-bold ${m.pricing === "Free" ? "text-emerald-600" : m.pricing === "$" ? "text-slate-500" : m.pricing === "$$" ? "text-amber-600" : "text-rose-600"}`}>
                      {m.pricing === "Free" ? "Free" : m.pricing}
                    </span>
                    <span className="text-[10px] text-slate-400 bg-slate-50 px-2 py-0.5 rounded-full font-medium group-hover:bg-cyan-50 group-hover:text-cyan-600 transition-colors">
                      Details →
                    </span>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

        {filtered.length === 0 && (
          <div className="text-center py-16 text-slate-400">No models match your search.</div>
        )}
      </main>

      {/* Model Detail Modal */}
      {selectedModel && (
        <ModelModal
          model={selectedModel}
          onClose={() => setSelectedModel(null)}
          onAddToCompare={toggleCompare}
          compareList={compareList}
        />
      )}

      {/* Compare Bar */}
      <CompareBar
        compareList={compareList}
        onRemove={(id) => setCompareList(prev => prev.filter(x => x !== id))}
        onClear={() => setCompareList([])}
        onCompare={handleCompare}
      />
    </div>
  );
}

export default function ModelsPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#f4f0eb] flex items-center justify-center text-slate-400">Loading...</div>}>
      <ModelsContent />
    </Suspense>
  );
}
