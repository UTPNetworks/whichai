-- whichai.cloud Seed Data
-- Realistic 2026-era AI product data

-- ============================================================
-- AI Products
-- ============================================================

INSERT INTO ai_products (id, name, slug, description, logo_url, category, provider, base_price_monthly, base_price_annual, student_discount_pct, free_tier, free_tier_limits, context_window, features, hidden_caps, website_url) VALUES

-- ChatGPT (GPT-5)
('a1000000-0000-0000-0000-000000000001', 'ChatGPT (GPT-5)', 'chatgpt-gpt5', 'OpenAI''s flagship conversational AI powered by GPT-5. Industry-leading reasoning, code generation, and multimodal capabilities.', NULL, 'chatbot', 'OpenAI', 20.00, 200.00, 20, true, 'GPT-4o mini, 10 GPT-5 messages/day, limited image gen', 512000, '{"voice": true, "vision": true, "image_gen": true, "code_interpreter": true, "max_output_tokens": 32768, "api_available": true, "plugins": true, "web_browsing": true, "file_upload": true, "canvas": true}', 'GPT-5 rate limits can kick in during peak hours. Team plan required for admin controls. Image gen limited to 50/day on Plus.', 'https://chat.openai.com'),

-- Claude 4.6
('a1000000-0000-0000-0000-000000000002', 'Claude 4.6', 'claude-4-6', 'Anthropic''s most capable model with 1M token context, exceptional reasoning, and Constitutional AI safety.', NULL, 'chatbot', 'Anthropic', 20.00, 216.00, 15, true, '30 messages/day with Claude 3.5 Sonnet, limited Claude 4.6 access', 1000000, '{"voice": false, "vision": true, "image_gen": false, "code_interpreter": true, "max_output_tokens": 65536, "api_available": true, "plugins": false, "web_browsing": false, "file_upload": true, "artifacts": true, "projects": true}', 'No native image generation. No real-time web browsing. Usage caps on Claude 4.6 Opus even on Pro — ~75 messages per 6 hours.', 'https://claude.ai'),

-- Gemini 2.5 Ultra
('a1000000-0000-0000-0000-000000000003', 'Gemini 2.5 Ultra', 'gemini-2-5-ultra', 'Google''s most advanced multimodal AI with native Search integration, 2M token context, and deep Google Workspace integration.', NULL, 'multimodal', 'Google', 19.99, 199.99, 25, true, 'Gemini 2.0 Flash, 15 Ultra queries/day, limited file analysis', 2000000, '{"voice": true, "vision": true, "image_gen": true, "code_interpreter": true, "max_output_tokens": 65536, "api_available": true, "plugins": true, "web_browsing": true, "file_upload": true, "google_workspace": true, "deep_research": true}', 'Ultra model has daily query limits even on paid plans. Image gen quality inconsistent. Deep Research limited to 5/day on standard plan.', 'https://gemini.google.com'),

-- Perplexity
('a1000000-0000-0000-0000-000000000004', 'Perplexity', 'perplexity', 'AI-powered answer engine combining real-time web search with LLM reasoning. Best for research and fact-checking.', NULL, 'chatbot', 'Perplexity AI', 20.00, 200.00, 0, true, '5 Pro searches/day, unlimited basic searches', 128000, '{"voice": false, "vision": true, "image_gen": false, "code_interpreter": false, "max_output_tokens": 16384, "api_available": true, "plugins": false, "web_browsing": true, "file_upload": true, "citations": true, "collections": true}', 'Pro Search count resets daily not rolling. API pricing is separate from subscription. Sources can be outdated despite "real-time" claim.', 'https://perplexity.ai'),

-- Midjourney
('a1000000-0000-0000-0000-000000000005', 'Midjourney', 'midjourney', 'Premier AI image generation platform known for stunning artistic quality and photorealistic outputs. V7 engine.', NULL, 'image', 'Midjourney', 10.00, 96.00, 0, false, NULL, NULL, '{"voice": false, "vision": true, "image_gen": true, "code_interpreter": false, "max_output_tokens": null, "api_available": true, "plugins": false, "web_browsing": false, "file_upload": true, "video_gen": true, "style_transfer": true, "upscaling": true}', 'Basic plan limited to 200 images/month. No free tier anymore. Commercial usage requires Standard+ plan. Queuing during peak times.', 'https://midjourney.com'),

-- GitHub Copilot
('a1000000-0000-0000-0000-000000000006', 'GitHub Copilot', 'github-copilot', 'AI pair programmer integrated into VS Code, JetBrains, and more. Powered by GPT-5 and Claude for code completion, chat, and workspace understanding.', NULL, 'code', 'GitHub / Microsoft', 10.00, 100.00, 100, true, 'Free for verified students, teachers, and popular open source maintainers. 2000 code completions/month on free tier.', 256000, '{"voice": true, "vision": false, "image_gen": false, "code_interpreter": true, "max_output_tokens": 16384, "api_available": false, "plugins": true, "web_browsing": false, "file_upload": false, "multi_model": true, "workspace_agent": true, "cli_support": true}', 'Free tier has strict monthly limits. Enterprise features (policy management, IP indemnity) only on Enterprise plan. Some language support better than others.', 'https://github.com/features/copilot'),

-- Cursor
('a1000000-0000-0000-0000-000000000007', 'Cursor', 'cursor', 'AI-first code editor built on VS Code. Deep codebase understanding with multi-file editing, intelligent autocomplete, and natural language coding.', NULL, 'code', 'Anysphere', 20.00, 192.00, 0, true, '2000 completions/month, 50 premium model requests/month', 256000, '{"voice": false, "vision": false, "image_gen": false, "code_interpreter": true, "max_output_tokens": 32768, "api_available": false, "plugins": true, "web_browsing": true, "file_upload": false, "multi_model": true, "codebase_indexing": true, "composer": true}', 'Premium model (GPT-5/Claude 4.6) requests limited on Pro. Unlimited plan is $40/mo. Heavy codebase indexing can be slow initially. Not all VS Code extensions compatible.', 'https://cursor.com'),

-- Grok 3
('a1000000-0000-0000-0000-000000000008', 'Grok 3', 'grok-3', 'xAI''s conversational AI with real-time X (Twitter) data access, unfiltered responses, and strong reasoning capabilities.', NULL, 'chatbot', 'xAI', 30.00, 288.00, 0, true, 'Basic Grok access with X Premium, limited to 10 queries/hour', 256000, '{"voice": false, "vision": true, "image_gen": true, "code_interpreter": true, "max_output_tokens": 32768, "api_available": true, "plugins": false, "web_browsing": true, "file_upload": true, "real_time_data": true, "x_integration": true}', 'Requires X Premium ($8/mo) for basic access. SuperGrok ($30/mo) for full capabilities. Real-time data only from X platform, not general web. Image gen can be controversial.', 'https://grok.x.ai'),

-- Llama 4 (Meta)
('a1000000-0000-0000-0000-000000000009', 'Llama 4 Maverick', 'llama-4-maverick', 'Meta''s open-source flagship model. Mixture-of-experts architecture with 400B parameters. Free to use, deploy anywhere.', NULL, 'chatbot', 'Meta', 0.00, 0.00, 0, true, 'Fully open source — free to download and deploy. Hosted options available via cloud providers.', 256000, '{"voice": false, "vision": true, "image_gen": false, "code_interpreter": false, "max_output_tokens": 16384, "api_available": true, "plugins": false, "web_browsing": false, "file_upload": false, "open_source": true, "self_hosted": true, "fine_tunable": true}', 'Requires significant compute to self-host (8x H100 recommended for full model). Smaller distilled versions available but less capable. No official hosted chat interface from Meta.', 'https://llama.meta.com'),

-- Mistral Large 3
('a1000000-0000-0000-0000-000000000010', 'Mistral Large 3', 'mistral-large-3', 'Mistral AI''s most capable model. EU-hosted, GDPR compliant, with strong multilingual and code capabilities.', NULL, 'chatbot', 'Mistral AI', 14.99, 149.99, 10, true, 'Free tier with Mistral Small, 20 Large 3 messages/day', 128000, '{"voice": false, "vision": true, "image_gen": false, "code_interpreter": true, "max_output_tokens": 32768, "api_available": true, "plugins": true, "web_browsing": true, "file_upload": true, "eu_hosted": true, "multilingual": true, "le_chat": true}', 'Free tier quite limited. API pricing competitive but context window smaller than competitors. Le Chat interface less polished than ChatGPT/Claude.', 'https://mistral.ai');


-- ============================================================
-- Pricing Tiers
-- ============================================================

-- ChatGPT (GPT-5) Tiers
INSERT INTO ai_pricing_tiers (product_id, tier_name, price_monthly, price_annual, features, is_popular) VALUES
('a1000000-0000-0000-0000-000000000001', 'Free', 0.00, 0.00, '{"model": "GPT-4o mini", "messages": "Unlimited GPT-4o mini, 10 GPT-5/day", "image_gen": "5 images/day", "file_upload": true, "web_browsing": true}', false),
('a1000000-0000-0000-0000-000000000001', 'Plus', 20.00, 200.00, '{"model": "GPT-5", "messages": "Unlimited GPT-5", "image_gen": "50 images/day", "file_upload": true, "web_browsing": true, "voice": "Advanced Voice", "canvas": true}', true),
('a1000000-0000-0000-0000-000000000001', 'Pro', 200.00, 2400.00, '{"model": "GPT-5 + o3-pro", "messages": "Unlimited all models", "image_gen": "Unlimited", "file_upload": true, "web_browsing": true, "voice": "Advanced Voice", "canvas": true, "extended_thinking": true}', false),
('a1000000-0000-0000-0000-000000000001', 'Team', 30.00, 300.00, '{"model": "GPT-5", "messages": "Higher limits", "image_gen": "100 images/day/user", "admin_console": true, "data_excluded_from_training": true}', false);

-- Claude 4.6 Tiers
INSERT INTO ai_pricing_tiers (product_id, tier_name, price_monthly, price_annual, features, is_popular) VALUES
('a1000000-0000-0000-0000-000000000002', 'Free', 0.00, 0.00, '{"model": "Claude 3.5 Sonnet", "messages": "30/day", "projects": false, "artifacts": true}', false),
('a1000000-0000-0000-0000-000000000002', 'Pro', 20.00, 216.00, '{"model": "Claude 4.6 Opus", "messages": "75 per 6 hours", "projects": true, "artifacts": true, "priority_access": true}', true),
('a1000000-0000-0000-0000-000000000002', 'Team', 30.00, 300.00, '{"model": "Claude 4.6 Opus", "messages": "Higher limits", "admin_console": true, "sso": true}', false),
('a1000000-0000-0000-0000-000000000002', 'Enterprise', NULL, NULL, '{"model": "Claude 4.6 Opus", "messages": "Custom limits", "sso": true, "audit_logs": true, "custom_retention": true}', false);

-- Gemini 2.5 Ultra Tiers
INSERT INTO ai_pricing_tiers (product_id, tier_name, price_monthly, price_annual, features, is_popular) VALUES
('a1000000-0000-0000-0000-000000000003', 'Free', 0.00, 0.00, '{"model": "Gemini 2.0 Flash", "messages": "Unlimited Flash, 15 Ultra/day", "workspace": false}', false),
('a1000000-0000-0000-0000-000000000003', 'Advanced', 19.99, 199.99, '{"model": "Gemini 2.5 Ultra", "messages": "Unlimited", "workspace": true, "deep_research": "5/day", "2tb_storage": true}', true),
('a1000000-0000-0000-0000-000000000003', 'Business', 30.00, 300.00, '{"model": "Gemini 2.5 Ultra", "messages": "Unlimited", "workspace": true, "admin": true, "data_controls": true}', false);

-- Perplexity Tiers
INSERT INTO ai_pricing_tiers (product_id, tier_name, price_monthly, price_annual, features, is_popular) VALUES
('a1000000-0000-0000-0000-000000000004', 'Free', 0.00, 0.00, '{"pro_searches": "5/day", "basic_searches": "Unlimited", "file_upload": false}', false),
('a1000000-0000-0000-0000-000000000004', 'Pro', 20.00, 200.00, '{"pro_searches": "600/day", "basic_searches": "Unlimited", "file_upload": true, "api_credits": "$5/month"}', true);

-- Midjourney Tiers
INSERT INTO ai_pricing_tiers (product_id, tier_name, price_monthly, price_annual, features, is_popular) VALUES
('a1000000-0000-0000-0000-000000000005', 'Basic', 10.00, 96.00, '{"images": "200/month", "fast_gpu": "3.3 hrs/month", "commercial_use": false}', false),
('a1000000-0000-0000-0000-000000000005', 'Standard', 30.00, 288.00, '{"images": "Unlimited relaxed", "fast_gpu": "15 hrs/month", "commercial_use": true, "stealth_mode": false}', true),
('a1000000-0000-0000-0000-000000000005', 'Pro', 60.00, 576.00, '{"images": "Unlimited relaxed", "fast_gpu": "30 hrs/month", "commercial_use": true, "stealth_mode": true}', false);

-- GitHub Copilot Tiers
INSERT INTO ai_pricing_tiers (product_id, tier_name, price_monthly, price_annual, features, is_popular) VALUES
('a1000000-0000-0000-0000-000000000006', 'Free', 0.00, 0.00, '{"completions": "2000/month", "chat": "50/month", "models": "GPT-4o mini"}', false),
('a1000000-0000-0000-0000-000000000006', 'Individual', 10.00, 100.00, '{"completions": "Unlimited", "chat": "Unlimited", "models": "GPT-5 + Claude", "cli": true}', true),
('a1000000-0000-0000-0000-000000000006', 'Business', 19.00, 190.00, '{"completions": "Unlimited", "chat": "Unlimited", "models": "All", "policy_management": true, "ip_indemnity": true}', false),
('a1000000-0000-0000-0000-000000000006', 'Enterprise', 39.00, 390.00, '{"completions": "Unlimited", "chat": "Unlimited", "models": "All + fine-tuned", "security": "Advanced", "audit_logs": true}', false);

-- Cursor Tiers
INSERT INTO ai_pricing_tiers (product_id, tier_name, price_monthly, price_annual, features, is_popular) VALUES
('a1000000-0000-0000-0000-000000000007', 'Hobby', 0.00, 0.00, '{"completions": "2000/month", "premium_requests": "50/month", "models": "cursor-small"}', false),
('a1000000-0000-0000-0000-000000000007', 'Pro', 20.00, 192.00, '{"completions": "Unlimited", "premium_requests": "500/month", "models": "GPT-5 + Claude 4.6", "codebase_indexing": true}', true),
('a1000000-0000-0000-0000-000000000007', 'Ultra', 40.00, 384.00, '{"completions": "Unlimited", "premium_requests": "Unlimited", "models": "All", "priority_support": true}', false),
('a1000000-0000-0000-0000-000000000007', 'Business', 40.00, 384.00, '{"completions": "Unlimited", "premium_requests": "Unlimited", "models": "All", "admin": true, "sso": true, "usage_analytics": true}', false);

-- Grok 3 Tiers
INSERT INTO ai_pricing_tiers (product_id, tier_name, price_monthly, price_annual, features, is_popular) VALUES
('a1000000-0000-0000-0000-000000000008', 'Basic (X Premium)', 8.00, 84.00, '{"model": "Grok 2", "queries": "10/hour", "image_gen": false}', false),
('a1000000-0000-0000-0000-000000000008', 'SuperGrok', 30.00, 288.00, '{"model": "Grok 3", "queries": "Unlimited", "image_gen": true, "deep_search": true, "think_mode": true}', true);

-- Llama 4 Maverick Tiers
INSERT INTO ai_pricing_tiers (product_id, tier_name, price_monthly, price_annual, features, is_popular) VALUES
('a1000000-0000-0000-0000-000000000009', 'Open Source', 0.00, 0.00, '{"model": "Llama 4 Maverick 400B", "self_hosted": true, "license": "Llama 4 Community License", "fine_tuning": true}', true);

-- Mistral Large 3 Tiers
INSERT INTO ai_pricing_tiers (product_id, tier_name, price_monthly, price_annual, features, is_popular) VALUES
('a1000000-0000-0000-0000-000000000010', 'Free', 0.00, 0.00, '{"model": "Mistral Small", "large_queries": "20/day", "le_chat": true}', false),
('a1000000-0000-0000-0000-000000000010', 'Pro', 14.99, 149.99, '{"model": "Mistral Large 3", "queries": "Unlimited", "le_chat": true, "api_credits": "$10/month"}', true),
('a1000000-0000-0000-0000-000000000010', 'Enterprise', NULL, NULL, '{"model": "Mistral Large 3", "queries": "Custom", "sla": true, "dedicated_instance": true, "eu_hosting": true}', false);


-- ============================================================
-- AI News Articles
-- ============================================================

INSERT INTO ai_news (title, url, source, summary, image_url, published_at) VALUES

('OpenAI Launches GPT-5: "The Most Capable AI We''ve Ever Built"', 'https://www.theverge.com/2026/2/15/openai-gpt-5-launch', 'The Verge', 'OpenAI''s GPT-5 arrives with 512K context, native voice, and dramatically improved reasoning. Available now for ChatGPT Plus subscribers.', NULL, '2026-02-15T14:00:00Z'),

('Anthropic''s Claude 4.6 Sets New Benchmark Records Across the Board', 'https://techcrunch.com/2026/03/01/anthropic-claude-4-6-benchmarks', 'TechCrunch', 'Claude 4.6 Opus achieves state-of-the-art on MMLU, HumanEval, and MATH, with a 1M token context window that actually works.', NULL, '2026-03-01T10:30:00Z'),

('Google Gemini 2.5 Ultra Integrates Deep Research Into Workspace', 'https://arstechnica.com/ai/2026/03/google-gemini-2-5-ultra-workspace', 'Ars Technica', 'Google''s latest Gemini model brings AI-powered deep research directly into Gmail, Docs, and Sheets with 2M token context.', NULL, '2026-03-05T09:00:00Z'),

('Meta Releases Llama 4: Open Source AI Catches Up to Closed Models', 'https://www.wired.com/story/meta-llama-4-open-source-ai', 'WIRED', 'Llama 4 Maverick''s mixture-of-experts architecture delivers GPT-4.5-class performance while remaining fully open source.', NULL, '2026-02-20T16:00:00Z'),

('The AI Code Editor Wars: Cursor vs Copilot vs Windsurf in 2026', 'https://www.theverge.com/2026/03/10/ai-code-editor-comparison-2026', 'The Verge', 'A deep dive into how AI-powered code editors are reshaping software development, with Cursor leading the pack.', NULL, '2026-03-10T12:00:00Z'),

('Midjourney V7 Launches With Native Video Generation', 'https://techcrunch.com/2026/03/08/midjourney-v7-video-generation', 'TechCrunch', 'Midjourney''s V7 update adds 30-second video generation, real-time style transfer, and significantly improved photorealism.', NULL, '2026-03-08T11:00:00Z'),

('EU AI Act Enforcement Begins: What It Means for AI Companies', 'https://arstechnica.com/tech-policy/2026/03/eu-ai-act-enforcement', 'Ars Technica', 'The EU''s comprehensive AI regulation is now being enforced, with major implications for US AI companies operating in Europe.', NULL, '2026-03-12T08:00:00Z'),

('xAI''s Grok 3 Challenges ChatGPT With Real-Time X Integration', 'https://www.reuters.com/technology/xai-grok-3-launch-2026', 'Reuters', 'Elon Musk''s xAI launches Grok 3 with unprecedented access to real-time X platform data and improved reasoning.', NULL, '2026-02-28T15:30:00Z'),

('Perplexity Hits 100M Monthly Users, Valued at $18B', 'https://www.bloomberg.com/news/perplexity-100m-users-2026', 'Bloomberg', 'The AI search startup reaches a major milestone as it closes a $2B funding round, challenging Google''s search dominance.', NULL, '2026-03-13T13:00:00Z'),

('AI Spending Set to Hit $500B in 2026, Led by Enterprise Adoption', 'https://www.ft.com/content/ai-spending-2026-forecast', 'Financial Times', 'Global AI infrastructure and software spending is projected to reach $500 billion this year as enterprises move from experimentation to deployment.', NULL, '2026-03-14T07:00:00Z');
