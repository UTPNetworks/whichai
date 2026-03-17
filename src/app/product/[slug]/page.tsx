"use client";

import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  ExternalLink,
  Check,
  X,
  Crown,
  AlertTriangle,
  ArrowRight,
  GraduationCap,
  Loader2,
} from "lucide-react";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import NewsCard from "@/components/NewsCard";
import {
  getProductBySlug,
  getProductTiers,
  getAllProducts,
  getAllNews,
  formatPrice,
  formatContextWindow,
  type AIProduct,
  type PricingTier,
  type AINewsArticle,
} from "@/lib/data";

function FeatureBadge({
  label,
  value,
}: {
  label: string;
  value: boolean | number | string | null | undefined;
}) {
  const isBoolean = typeof value === "boolean";
  if (isBoolean) {
    return (
      <div
        className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm ${
          value
            ? "bg-emerald-50 text-emerald-600"
            : "bg-slate-50 text-slate-400"
        }`}
      >
        {value ? <Check className="w-4 h-4" /> : <X className="w-4 h-4" />}
        {label}
      </div>
    );
  }
  return (
    <div className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm bg-slate-50 text-slate-600">
      <span className="text-slate-400">{label}:</span>
      <span className="font-medium">{String(value)}</span>
    </div>
  );
}

function TierCard({ tier }: { tier: PricingTier }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      className={`bg-white rounded-2xl p-6 relative border shadow-sm ${
        tier.is_popular ? "ring-2 ring-purple-400 border-purple-200" : "border-gray-200"
      }`}
    >
      {tier.is_popular && (
        <span className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-purple-500 text-white flex items-center gap-1">
          <Crown className="w-3 h-3" />
          Most Popular
        </span>
      )}
      <h3 className="text-lg font-semibold text-slate-900 mb-1">{tier.tier_name}</h3>
      <div className="mb-4">
        {tier.price_monthly !== null ? (
          <div>
            <span className="text-3xl font-bold text-slate-900">
              ${tier.price_monthly.toFixed(2)}
            </span>
            <span className="text-slate-400 text-sm">/mo</span>
            {tier.price_annual !== null && tier.price_annual > 0 && (
              <p className="text-xs text-slate-400 mt-1">
                ${tier.price_annual.toFixed(2)}/yr (billed annually)
              </p>
            )}
          </div>
        ) : (
          <span className="text-2xl font-bold text-slate-900">Contact Sales</span>
        )}
      </div>
      <ul className="space-y-2">
        {Object.entries(tier.features).map(([key, val]) => (
          <li key={key} className="flex items-start gap-2 text-sm">
            <Check className="w-3.5 h-3.5 text-emerald-500 mt-0.5 shrink-0" />
            <span className="text-slate-600">
              <span className="text-slate-400 capitalize">
                {key.replace(/_/g, " ")}:
              </span>{" "}
              {typeof val === "boolean" ? (val ? "Yes" : "No") : String(val)}
            </span>
          </li>
        ))}
      </ul>
    </motion.div>
  );
}

const featureLabels: Record<string, string> = {
  voice: "Voice",
  vision: "Vision",
  image_gen: "Image Generation",
  code_interpreter: "Code Interpreter",
  max_output_tokens: "Max Output Tokens",
  api_available: "API Available",
  plugins: "Plugins",
  web_browsing: "Web Browsing",
  file_upload: "File Upload",
  canvas: "Canvas",
  artifacts: "Artifacts",
  projects: "Projects",
  google_workspace: "Google Workspace",
  deep_research: "Deep Research",
  citations: "Citations",
  collections: "Collections",
  video_gen: "Video Generation",
  style_transfer: "Style Transfer",
  upscaling: "Upscaling",
  multi_model: "Multi-Model",
  workspace_agent: "Workspace Agent",
  cli_support: "CLI Support",
  codebase_indexing: "Codebase Indexing",
  composer: "Composer",
  real_time_data: "Real-Time Data",
  x_integration: "X Integration",
  open_source: "Open Source",
  self_hosted: "Self-Hosted",
  fine_tunable: "Fine-Tunable",
  eu_hosted: "EU Hosted",
  multilingual: "Multilingual",
  le_chat: "Le Chat",
};

export default function ProductPage() {
  const params = useParams();
  const slug = params.slug as string;

  const [product, setProduct] = useState<AIProduct | null>(null);
  const [tiers, setTiers] = useState<PricingTier[]>([]);
  const [otherProducts, setOtherProducts] = useState<AIProduct[]>([]);
  const [relatedNews, setRelatedNews] = useState<AINewsArticle[]>([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    async function loadData() {
      const [prod, allProds, allNews] = await Promise.all([
        getProductBySlug(slug),
        getAllProducts(),
        getAllNews(),
      ]);
      if (!prod) {
        setNotFound(true);
        setLoading(false);
        return;
      }
      setProduct(prod);
      setOtherProducts(allProds.filter((p) => p.id !== prod.id).slice(0, 3));
      const tierData = await getProductTiers(prod.id);
      setTiers(tierData);
      // Filter news mentioning the product name or provider
      const keywords = [prod.name.toLowerCase(), prod.provider.toLowerCase()];
      const filtered = allNews
        .filter((a) => keywords.some((kw) => a.title.toLowerCase().includes(kw)))
        .slice(0, 5);
      setRelatedNews(filtered);
      setLoading(false);
    }
    loadData();
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="flex items-center justify-center py-32">
          <Loader2 className="w-8 h-8 animate-spin text-purple-500" />
        </div>
      </div>
    );
  }

  if (notFound || !product) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="flex flex-col items-center justify-center py-32 text-slate-400">
          <p className="text-xl">Product not found</p>
          <Link
            href="/"
            className="mt-4 text-purple-500 hover:text-purple-700 text-sm flex items-center gap-1"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative overflow-hidden bg-gray-50">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-32 right-1/4 w-96 h-96 bg-purple-100/50 rounded-full blur-[120px]" />
        <div className="absolute bottom-1/3 -left-32 w-80 h-80 bg-cyan-100/40 rounded-full blur-[120px]" />
      </div>

      <Navbar />

      <main className="relative z-10 px-6 md:px-12 pb-20 max-w-[1100px] mx-auto pt-6">
        {/* Back */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="mb-6"
        >
          <Link
            href="/"
            className="inline-flex items-center gap-1 text-sm text-slate-400 hover:text-slate-700 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Home
          </Link>
        </motion.div>

        {/* Hero */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl p-8 mb-8 border border-gray-200 shadow-sm"
        >
          <div className="flex flex-col md:flex-row md:items-center gap-6">
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-purple-100 to-cyan-100 flex items-center justify-center shrink-0">
              <span className="text-3xl font-bold text-slate-800">
                {product.name[0]}
              </span>
            </div>
            <div className="flex-1">
              <div className="flex flex-wrap items-center gap-3 mb-2">
                <h1 className="text-2xl md:text-3xl font-bold text-slate-900">
                  {product.name}
                </h1>
                <span className="text-xs px-2 py-0.5 rounded-full bg-slate-100 text-slate-500 uppercase tracking-wider">
                  {product.category}
                </span>
              </div>
              <p className="text-sm text-slate-400 mb-1">
                by {product.provider}
              </p>
              <p className="text-slate-600 leading-relaxed">
                {product.description}
              </p>
            </div>
            <div className="flex flex-col gap-2 shrink-0">
              <a
                href={product.website_url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-medium text-sm text-white bg-gradient-to-r from-cyan-500 via-purple-500 to-pink-500 hover:shadow-[0_0_20px_rgba(168,85,247,0.3)] transition-all"
              >
                Visit Website
                <ExternalLink className="w-4 h-4" />
              </a>
              <Link
                href={`/compare`}
                className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl font-medium text-sm text-slate-600 bg-white border border-gray-200 hover:bg-slate-50 hover:border-gray-300 transition-all"
              >
                Compare with...
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>

          {/* Quick stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6 pt-6 border-t border-gray-100">
            <div>
              <p className="text-xs text-slate-400 uppercase tracking-wider mb-1">
                Starting Price
              </p>
              <p className="text-lg font-bold text-slate-900">
                {formatPrice(product.base_price_monthly)}
              </p>
            </div>
            <div>
              <p className="text-xs text-slate-400 uppercase tracking-wider mb-1">
                Context Window
              </p>
              <p className="text-lg font-bold text-slate-900">
                {formatContextWindow(product.context_window)}
              </p>
            </div>
            <div>
              <p className="text-xs text-slate-400 uppercase tracking-wider mb-1">
                Free Tier
              </p>
              <p className="text-lg font-bold text-slate-900">
                {product.free_tier ? "Available" : "No"}
              </p>
            </div>
            <div>
              <p className="text-xs text-slate-400 uppercase tracking-wider mb-1 flex items-center gap-1">
                <GraduationCap className="w-3 h-3" />
                Student Discount
              </p>
              <p className="text-lg font-bold text-slate-900">
                {product.student_discount_pct > 0
                  ? `${product.student_discount_pct}%`
                  : "None"}
              </p>
            </div>
          </div>
        </motion.div>

        {/* Pricing Tiers */}
        {tiers.length > 0 && (
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mb-8"
          >
            <h2 className="text-xl font-bold text-slate-900 mb-4">Pricing Plans</h2>
            <div
              className={`grid gap-4 ${
                tiers.length === 1
                  ? "grid-cols-1 max-w-sm"
                  : tiers.length === 2
                  ? "grid-cols-1 md:grid-cols-2"
                  : tiers.length === 3
                  ? "grid-cols-1 md:grid-cols-3"
                  : "grid-cols-1 md:grid-cols-2 lg:grid-cols-4"
              }`}
            >
              {tiers.map((tier) => (
                <TierCard key={tier.id} tier={tier} />
              ))}
            </div>
          </motion.section>
        )}

        {/* Features */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-8"
        >
          <h2 className="text-xl font-bold text-slate-900 mb-4">Features</h2>
          <div className="flex flex-wrap gap-2">
            {Object.entries(product.features).map(([key, val]) => (
              <FeatureBadge
                key={key}
                label={featureLabels[key] || key.replace(/_/g, " ")}
                value={val}
              />
            ))}
          </div>
        </motion.section>

        {/* Free tier limits */}
        {product.free_tier && product.free_tier_limits && (
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
            className="mb-8"
          >
            <h2 className="text-xl font-bold text-slate-900 mb-4">
              Free Tier Details
            </h2>
            <div className="bg-white rounded-xl p-5 border border-gray-200 shadow-sm">
              <p className="text-sm text-slate-600 leading-relaxed">
                {product.free_tier_limits}
              </p>
            </div>
          </motion.section>
        )}

        {/* Hidden caps */}
        {product.hidden_caps && (
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="mb-8"
          >
            <h2 className="text-xl font-bold text-slate-900 mb-4 flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-amber-500" />
              Hidden Caps & Gotchas
            </h2>
            <div className="bg-white rounded-xl p-5 border border-amber-200 shadow-sm">
              <p className="text-sm text-slate-600 leading-relaxed">
                {product.hidden_caps}
              </p>
            </div>
          </motion.section>
        )}

        {/* Compare with */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
          className="mb-8"
        >
          <h2 className="text-xl font-bold text-slate-900 mb-4">
            Compare With Other Tools
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {otherProducts.map((p) => (
              <Link
                key={p.id}
                href={`/product/${p.slug}`}
                className="bg-white rounded-xl p-4 border border-gray-200 hover:border-purple-200 hover:shadow-sm transition-all group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-100 to-cyan-100 flex items-center justify-center shrink-0">
                    <span className="text-sm font-bold text-slate-700">
                      {p.name[0]}
                    </span>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-900 group-hover:text-purple-600 transition-colors">
                      {p.name}
                    </p>
                    <p className="text-xs text-slate-400">{p.provider}</p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </motion.section>

        {/* Recent News */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mb-8"
        >
          <h2 className="text-xl font-bold text-slate-900 mb-4">Recent News</h2>
          {relatedNews.length > 0 ? (
            <div className="flex flex-col gap-3">
              {relatedNews.map((article, i) => (
                <NewsCard key={article.id} article={article} index={i} />
              ))}
            </div>
          ) : (
            <div className="bg-white rounded-xl p-5 border border-gray-200 shadow-sm">
              <p className="text-sm text-slate-400 text-center">No recent news found for {product.name}.</p>
            </div>
          )}
        </motion.section>

        {/* CTA */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.45 }}
        >
          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-cyan-500 via-purple-500 to-pink-500 p-px">
            <div className="bg-white rounded-2xl px-8 py-10 text-center">
              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mb-2">
                Join Whichai — Explore the World&apos;s Biggest AI Marketplace
              </h2>
              <p className="text-slate-500 mb-6 text-sm md:text-base">
                Compare, discover, and unlock the best AI tools — all in one place.
              </p>
              <Link
                href="/auth/signup"
                className="inline-flex items-center gap-2 px-8 py-3 rounded-full font-semibold text-sm text-white bg-gradient-to-r from-cyan-500 via-purple-500 to-pink-500 bg-gradient-animate hover:shadow-[0_0_25px_rgba(168,85,247,0.4)] transition-all duration-300"
              >
                Join whichai.cloud
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </motion.section>
      </main>
    </div>
  );
}
