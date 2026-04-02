import { useState, useMemo } from "react";

// ═══════════════════════════════════════════════════════════════════
// WhichAi Learning Hub — "AI Academy" — Full Interactive Preview
// Every button clickable, every card expandable, every tab working.
// ═══════════════════════════════════════════════════════════════════

// ── MOCK DATA ────────────────────────────────────────────────────

const CATEGORIES = [
  { id: "all", label: "All Courses", emoji: "✨" },
  { id: "llms", label: "LLMs & GPT", emoji: "🧠" },
  { id: "prompts", label: "Prompt Engineering", emoji: "✍️" },
  { id: "agents", label: "AI Agents", emoji: "🤖" },
  { id: "cv", label: "Computer Vision", emoji: "👁️" },
  { id: "mlops", label: "MLOps", emoji: "⚙️" },
  { id: "data", label: "Data Science", emoji: "📊" },
  { id: "business", label: "AI for Business", emoji: "💼" },
  { id: "hardware", label: "AI Hardware", emoji: "🖥️" },
];

const INSTRUCTORS = {
  sarah_ml: { name: "Sarah Chen", avatar: "👩‍🔬", title: "ML Engineer @ Meta", rating: 4.9, students: 12400, courses: 5 },
  raj_ai: { name: "Raj Patel", avatar: "👨‍💻", title: "AI Researcher @ DeepMind", rating: 4.8, students: 8900, courses: 3 },
  lisa_code: { name: "Lisa Rodriguez", avatar: "👩‍💻", title: "Staff Engineer @ Anthropic", rating: 4.9, students: 15600, courses: 7 },
  mike_gpu: { name: "Mike Thompson", avatar: "🧑‍🔧", title: "Hardware Engineer @ NVIDIA", rating: 4.7, students: 5200, courses: 2 },
  emma_ds: { name: "Emma Wilson", avatar: "📊", title: "Data Scientist @ Netflix", rating: 4.8, students: 9800, courses: 4 },
  alex_biz: { name: "Alex Kim", avatar: "💼", title: "AI Strategy Consultant", rating: 4.6, students: 7300, courses: 3 },
};

const COURSES = [
  {
    id: "c1", title: "Mastering Prompt Engineering", subtitle: "From Zero to Prompt Pro in 30 Days",
    instructor: INSTRUCTORS.lisa_code, category: "prompts", difficulty: "Beginner",
    price: 0, originalPrice: 49.99, rating: 4.9, reviews: 2341, enrolled: 15600,
    duration: "12 hours", lessons: 48, projects: 5, certificate: true,
    thumbnail: "🎯", color: "#8b5cf6",
    tags: ["ChatGPT", "Claude", "Gemini", "System Prompts"],
    description: "The most comprehensive prompt engineering course on the internet. Learn to craft prompts that get exactly the output you need — every time. From basic techniques to advanced chain-of-thought, few-shot learning, and system prompt architecture.",
    whatYouLearn: [
      "Write effective prompts for ChatGPT, Claude, and Gemini",
      "Master chain-of-thought and few-shot techniques",
      "Build reusable system prompt templates",
      "Debug and iterate on failing prompts",
      "Create prompt libraries for your team or business",
    ],
    chapters: [
      { title: "Introduction to Prompt Engineering", lessons: 6, duration: "1.5 hr", free: true },
      { title: "Understanding How LLMs Think", lessons: 5, duration: "1.2 hr", free: true },
      { title: "Basic Prompting Patterns", lessons: 8, duration: "2 hr", free: false },
      { title: "Advanced: Chain-of-Thought", lessons: 6, duration: "1.5 hr", free: false },
      { title: "Advanced: Few-Shot Learning", lessons: 5, duration: "1.3 hr", free: false },
      { title: "System Prompts Deep Dive", lessons: 7, duration: "1.8 hr", free: false },
      { title: "Real-World Projects", lessons: 5, duration: "1.5 hr", free: false },
      { title: "Building a Prompt Library", lessons: 6, duration: "1.2 hr", free: false },
    ],
    reviewsList: [
      { user: "DevMike", avatar: "🧑‍💻", rating: 5, text: "This course completely changed how I work with AI. The system prompt chapter alone is worth 10x the price. I went from getting mediocre outputs to consistently great results.", time: "2 weeks ago" },
      { user: "AINewbie", avatar: "🌱", rating: 5, text: "Perfect for beginners! Lisa explains everything clearly without assuming prior knowledge. The hands-on projects are incredibly practical.", time: "1 month ago" },
      { user: "PromptPro", avatar: "✨", rating: 4, text: "Even as someone who's been prompting for a year, I picked up at least 5 new techniques. The few-shot learning chapter was eye-opening. Only 4 stars because I wanted more on multimodal prompts.", time: "3 weeks ago" },
    ],
    badge: "Bestseller",
  },
  {
    id: "c2", title: "Build AI Agents from Scratch", subtitle: "LangChain, CrewAI, and Custom Agent Architectures",
    instructor: INSTRUCTORS.sarah_ml, category: "agents", difficulty: "Intermediate",
    price: 79.99, originalPrice: 149.99, rating: 4.8, reviews: 1890, enrolled: 8900,
    duration: "18 hours", lessons: 62, projects: 8, certificate: true,
    thumbnail: "🤖", color: "#ec4899",
    tags: ["LangChain", "CrewAI", "Python", "RAG", "Tool Use"],
    description: "Build production-ready AI agents that can browse the web, write code, analyze data, and work together. From single-agent systems to multi-agent orchestration with real-world deployment.",
    whatYouLearn: [
      "Build single-agent systems with LangChain",
      "Create multi-agent teams with CrewAI",
      "Implement RAG pipelines for knowledge retrieval",
      "Add tool use (web browsing, code execution, APIs)",
      "Deploy agents to production with monitoring",
    ],
    chapters: [
      { title: "What Are AI Agents?", lessons: 4, duration: "1 hr", free: true },
      { title: "Your First Agent with LangChain", lessons: 7, duration: "2 hr", free: true },
      { title: "Tool Use & Function Calling", lessons: 8, duration: "2.5 hr", free: false },
      { title: "RAG: Retrieval Augmented Generation", lessons: 9, duration: "3 hr", free: false },
      { title: "Multi-Agent Systems with CrewAI", lessons: 8, duration: "2.5 hr", free: false },
      { title: "Custom Agent Architectures", lessons: 7, duration: "2 hr", free: false },
      { title: "Production Deployment", lessons: 10, duration: "3 hr", free: false },
      { title: "Capstone: Build Your Own Agent", lessons: 9, duration: "2 hr", free: false },
    ],
    reviewsList: [
      { user: "AgentBuilder", avatar: "🤖", rating: 5, text: "Finally a course that goes beyond toy examples. The production deployment chapter saved me weeks of trial and error. My agent handles 300+ queries per day in production.", time: "1 week ago" },
      { user: "PythonDev", avatar: "🐍", rating: 5, text: "Sarah's teaching style is phenomenal. She explains complex agent architectures with simple diagrams and then shows you exactly how to implement them. The CrewAI section is gold.", time: "2 weeks ago" },
    ],
    badge: "Hot",
  },
  {
    id: "c3", title: "LLMs: Architecture to Application", subtitle: "Understand Transformers, Fine-tuning, and Deployment",
    instructor: INSTRUCTORS.raj_ai, category: "llms", difficulty: "Advanced",
    price: 99.99, originalPrice: 199.99, rating: 4.8, reviews: 1234, enrolled: 6200,
    duration: "24 hours", lessons: 78, projects: 6, certificate: true,
    thumbnail: "🧠", color: "#06b6d4",
    tags: ["Transformers", "Fine-tuning", "LoRA", "Deployment", "PyTorch"],
    description: "The definitive deep dive into Large Language Models. From transformer architecture fundamentals to fine-tuning your own models with LoRA/QLoRA and deploying them at scale.",
    whatYouLearn: [
      "Understand transformer architecture at a mathematical level",
      "Fine-tune LLMs with LoRA, QLoRA, and full fine-tuning",
      "Implement RLHF and DPO alignment techniques",
      "Quantize and optimize models for inference",
      "Deploy models with vLLM, TGI, and Ollama",
    ],
    chapters: [
      { title: "Attention Is All You Need — Revisited", lessons: 8, duration: "3 hr", free: true },
      { title: "Modern LLM Architectures", lessons: 10, duration: "3.5 hr", free: false },
      { title: "Tokenization & Embeddings", lessons: 6, duration: "2 hr", free: false },
      { title: "Fine-Tuning with LoRA & QLoRA", lessons: 12, duration: "4 hr", free: false },
      { title: "RLHF & Alignment", lessons: 8, duration: "3 hr", free: false },
      { title: "Quantization & Optimization", lessons: 9, duration: "2.5 hr", free: false },
      { title: "Deployment at Scale", lessons: 10, duration: "3 hr", free: false },
      { title: "Capstone: Train Your Own LLM", lessons: 15, duration: "3 hr", free: false },
    ],
    reviewsList: [
      { user: "MLResearcher", avatar: "🔬", rating: 5, text: "This is grad-school quality content at a fraction of the price. Raj explains attention mechanisms better than any textbook I've read. The fine-tuning labs are incredibly hands-on.", time: "3 weeks ago" },
    ],
    badge: "Top Rated",
  },
  {
    id: "c4", title: "AI for Business Leaders", subtitle: "Strategy, ROI, and Implementation Without the Jargon",
    instructor: INSTRUCTORS.alex_biz, category: "business", difficulty: "Beginner",
    price: 0, originalPrice: 0, rating: 4.6, reviews: 3456, enrolled: 18200,
    duration: "6 hours", lessons: 24, projects: 3, certificate: true,
    thumbnail: "💼", color: "#f59e0b",
    tags: ["Strategy", "ROI", "No-Code", "Leadership", "Use Cases"],
    description: "Understand AI without the technical jargon. Learn what AI can and can't do for your business, how to calculate ROI, and how to lead AI adoption — even if you've never written a line of code.",
    whatYouLearn: [
      "Evaluate which business processes are ripe for AI",
      "Calculate AI project ROI with our framework",
      "Communicate AI strategy to your board/team",
      "Avoid common pitfalls (and expensive mistakes)",
      "Build a 90-day AI adoption roadmap",
    ],
    chapters: [
      { title: "AI Demystified: What It Actually Is", lessons: 4, duration: "1 hr", free: true },
      { title: "Where AI Creates Business Value", lessons: 5, duration: "1.5 hr", free: true },
      { title: "The ROI Framework", lessons: 4, duration: "1 hr", free: false },
      { title: "Building Your AI Team", lessons: 4, duration: "1 hr", free: false },
      { title: "Case Studies: Companies Doing It Right", lessons: 4, duration: "1 hr", free: false },
      { title: "Your 90-Day AI Roadmap", lessons: 3, duration: "0.5 hr", free: false },
    ],
    reviewsList: [
      { user: "CEO_Startup", avatar: "🚀", rating: 5, text: "As a non-technical CEO, this course gave me the vocabulary and framework to have real conversations with my engineering team about AI. The ROI framework alone saved us from a $200K mistake.", time: "1 month ago" },
      { user: "VP_Product", avatar: "📋", rating: 4, text: "Practical and no-nonsense. Alex cuts through the hype and tells you exactly what works. I used the 90-day roadmap template for our Q2 planning.", time: "2 months ago" },
    ],
    badge: "Popular",
  },
  {
    id: "c5", title: "Computer Vision with Python", subtitle: "Object Detection, Segmentation & Real-Time Processing",
    instructor: INSTRUCTORS.emma_ds, category: "cv", difficulty: "Intermediate",
    price: 59.99, originalPrice: 119.99, rating: 4.7, reviews: 987, enrolled: 5400,
    duration: "16 hours", lessons: 54, projects: 7, certificate: true,
    thumbnail: "👁️", color: "#10b981",
    tags: ["OpenCV", "YOLO", "PyTorch", "Segmentation", "Real-time"],
    description: "From image classification to real-time object detection. Build production CV systems using YOLO, SAM, and custom models — with 7 hands-on projects including a security camera AI.",
    whatYouLearn: [
      "Image classification with CNNs and Vision Transformers",
      "Object detection with YOLO v8",
      "Image segmentation with SAM (Segment Anything)",
      "Real-time video processing with OpenCV",
      "Deploy CV models to edge devices",
    ],
    chapters: [
      { title: "Introduction to Computer Vision", lessons: 5, duration: "1.5 hr", free: true },
      { title: "Image Classification Deep Dive", lessons: 8, duration: "2.5 hr", free: false },
      { title: "Object Detection with YOLO", lessons: 10, duration: "3 hr", free: false },
      { title: "Segmentation with SAM", lessons: 8, duration: "2.5 hr", free: false },
      { title: "Real-Time Processing", lessons: 8, duration: "2.5 hr", free: false },
      { title: "Edge Deployment", lessons: 7, duration: "2 hr", free: false },
      { title: "Capstone Projects", lessons: 8, duration: "2 hr", free: false },
    ],
    reviewsList: [
      { user: "VisionDev", avatar: "📸", rating: 5, text: "The YOLO section is the best tutorial I've found anywhere — including the official docs. The real-time processing chapter blew my mind.", time: "2 weeks ago" },
    ],
    badge: null,
  },
  {
    id: "c6", title: "MLOps: From Notebook to Production", subtitle: "CI/CD, Monitoring & Scaling ML Systems",
    instructor: INSTRUCTORS.sarah_ml, category: "mlops", difficulty: "Advanced",
    price: 89.99, originalPrice: 169.99, rating: 4.8, reviews: 756, enrolled: 4100,
    duration: "20 hours", lessons: 68, projects: 4, certificate: true,
    thumbnail: "⚙️", color: "#6366f1",
    tags: ["Docker", "Kubernetes", "MLflow", "CI/CD", "Monitoring"],
    description: "Bridge the gap between experimental notebooks and production ML systems. Learn MLOps best practices used at Meta, Google, and Anthropic — from experiment tracking to automated retraining pipelines.",
    whatYouLearn: [
      "Structure ML projects for production",
      "Build CI/CD pipelines for ML models",
      "Implement experiment tracking with MLflow",
      "Deploy with Docker and Kubernetes",
      "Monitor model performance and detect drift",
    ],
    chapters: [
      { title: "Why MLOps Matters", lessons: 4, duration: "1 hr", free: true },
      { title: "Project Structure & Best Practices", lessons: 8, duration: "2.5 hr", free: false },
      { title: "Experiment Tracking", lessons: 9, duration: "3 hr", free: false },
      { title: "CI/CD for ML", lessons: 10, duration: "3.5 hr", free: false },
      { title: "Containerization & Orchestration", lessons: 12, duration: "4 hr", free: false },
      { title: "Monitoring & Drift Detection", lessons: 10, duration: "3 hr", free: false },
      { title: "Scaling & Cost Optimization", lessons: 8, duration: "2 hr", free: false },
      { title: "Capstone: Full MLOps Pipeline", lessons: 7, duration: "1 hr", free: false },
    ],
    reviewsList: [],
    badge: "New",
  },
  {
    id: "c7", title: "Build Your Own AI Hardware Lab", subtitle: "GPUs, Servers, Networking & Cooling on a Budget",
    instructor: INSTRUCTORS.mike_gpu, category: "hardware", difficulty: "Intermediate",
    price: 39.99, originalPrice: 79.99, rating: 4.7, reviews: 543, enrolled: 3200,
    duration: "10 hours", lessons: 36, projects: 2, certificate: true,
    thumbnail: "🖥️", color: "#ef4444",
    tags: ["GPU", "Server Build", "Networking", "Cooling", "Budget"],
    description: "Build a home AI lab that punches above its weight. From choosing the right GPUs to networking multiple machines — with real cost breakdowns and benchmark comparisons at every price point.",
    whatYouLearn: [
      "Choose the right GPU for your AI workload",
      "Build cost-effective multi-GPU rigs",
      "Set up networking for distributed training",
      "Cooling solutions that actually work",
      "Benchmark your setup and optimize performance",
    ],
    chapters: [
      { title: "GPU Buyer's Guide 2026", lessons: 6, duration: "2 hr", free: true },
      { title: "Building Your First AI Rig", lessons: 8, duration: "2.5 hr", free: false },
      { title: "Multi-GPU Configurations", lessons: 6, duration: "1.5 hr", free: false },
      { title: "Networking & Distributed Training", lessons: 6, duration: "1.5 hr", free: false },
      { title: "Cooling & Power Management", lessons: 5, duration: "1 hr", free: false },
      { title: "Benchmarking & Optimization", lessons: 5, duration: "1.5 hr", free: false },
    ],
    reviewsList: [
      { user: "HomeLab_Hero", avatar: "🏠", rating: 5, text: "Mike saved me $3,000 with his GPU buying advice alone. The cooling chapter prevented me from making a rookie mistake that could have fried my 4090s.", time: "1 month ago" },
    ],
    badge: null,
  },
  {
    id: "c8", title: "Data Science with AI Tools", subtitle: "Pandas, SQL & AI-Assisted Analysis",
    instructor: INSTRUCTORS.emma_ds, category: "data", difficulty: "Beginner",
    price: 0, originalPrice: 0, rating: 4.8, reviews: 2100, enrolled: 11300,
    duration: "14 hours", lessons: 52, projects: 6, certificate: true,
    thumbnail: "📊", color: "#14b8a6",
    tags: ["Pandas", "SQL", "Python", "Visualization", "AI-Assisted"],
    description: "Modern data science powered by AI. Learn to analyze data 10x faster by combining traditional tools (Pandas, SQL) with AI assistants. The future of data work is human + AI — learn that workflow here.",
    whatYouLearn: [
      "Clean and transform data with Pandas + AI",
      "Write SQL queries with AI assistance",
      "Create beautiful visualizations automatically",
      "Build dashboards with Streamlit",
      "Automate repetitive analysis tasks with Claude/GPT",
    ],
    chapters: [
      { title: "The AI-Augmented Data Scientist", lessons: 4, duration: "1 hr", free: true },
      { title: "Pandas Fundamentals + AI Shortcuts", lessons: 8, duration: "2.5 hr", free: true },
      { title: "SQL Mastery with AI", lessons: 8, duration: "2 hr", free: false },
      { title: "Data Visualization", lessons: 10, duration: "3 hr", free: false },
      { title: "Building Dashboards", lessons: 8, duration: "2.5 hr", free: false },
      { title: "Automation & Pipelines", lessons: 7, duration: "1.5 hr", free: false },
      { title: "Capstone Projects", lessons: 7, duration: "1.5 hr", free: false },
    ],
    reviewsList: [
      { user: "DataNewbie", avatar: "🌱", rating: 5, text: "I went from zero Python knowledge to building a full analytics dashboard in 3 weeks. The AI-assisted approach makes learning 10x faster — you focus on the thinking, not the syntax.", time: "3 weeks ago" },
    ],
    badge: "Popular",
  },
];

// ── LEARNING PATHS ────────────────────────────────────────────────
const LEARNING_PATHS = [
  {
    id: "lp1", title: "From Zero to AI Developer", description: "Complete beginner to building AI apps in 8 weeks.",
    courses: ["c1", "c8", "c2"], duration: "44 hours", difficulty: "Beginner → Intermediate",
    color: "#8b5cf6", emoji: "🚀", enrolled: 4200,
    milestones: ["Write your first prompt", "Build a data pipeline", "Deploy an AI agent"],
  },
  {
    id: "lp2", title: "Prompt Engineering Mastery", description: "Become the person everyone asks for prompt help.",
    courses: ["c1", "c4"], duration: "18 hours", difficulty: "Beginner → Advanced",
    color: "#ec4899", emoji: "✍️", enrolled: 6800,
    milestones: ["Master basic patterns", "Build a prompt library", "Teach others"],
  },
  {
    id: "lp3", title: "MLOps in Production", description: "Take models from notebooks to production at scale.",
    courses: ["c3", "c6"], duration: "44 hours", difficulty: "Advanced",
    color: "#06b6d4", emoji: "⚙️", enrolled: 2100,
    milestones: ["Understand LLM architecture", "Build CI/CD pipeline", "Deploy with monitoring"],
  },
];

// ── AI MODEL COMPARISON DATA ──────────────────────────────────────
const AI_MODELS = [
  { name: "Claude Opus 4", provider: "Anthropic", params: "~2T", context: "200K", pricing: "$15/$75 per 1M tokens", speed: "Fast", coding: 95, reasoning: 97, creative: 94, vision: 90, overall: 95, color: "#a855f7" },
  { name: "GPT-4 Turbo", provider: "OpenAI", params: "~1.8T", context: "128K", pricing: "$10/$30 per 1M tokens", speed: "Fast", coding: 91, reasoning: 93, creative: 90, vision: 92, overall: 92, color: "#10b981" },
  { name: "Gemini Ultra", provider: "Google", params: "~1.5T", context: "1M", pricing: "$7/$21 per 1M tokens", speed: "Medium", coding: 88, reasoning: 90, creative: 86, vision: 94, overall: 89, color: "#3b82f6" },
  { name: "LLaMA 3 70B", provider: "Meta", params: "70B", context: "128K", pricing: "Free (self-host)", speed: "Variable", coding: 82, reasoning: 84, creative: 78, vision: 0, overall: 81, color: "#f59e0b" },
  { name: "Mistral Large", provider: "Mistral", params: "~123B", context: "32K", pricing: "$8/$24 per 1M tokens", speed: "Fast", coding: 86, reasoning: 87, creative: 82, vision: 78, overall: 84, color: "#ef4444" },
  { name: "Claude Sonnet 4", provider: "Anthropic", params: "~800B", context: "200K", pricing: "$3/$15 per 1M tokens", speed: "Very Fast", coding: 89, reasoning: 91, creative: 88, vision: 85, overall: 89, color: "#7c3aed" },
];

// ── BADGE STYLES ──────────────────────────────────────────────────
const BADGE_MAP = {
  Bestseller: { bg: "#dcfce7", text: "#166534", border: "#22c55e" },
  Hot: { bg: "#fef2f2", text: "#991b1b", border: "#ef4444" },
  "Top Rated": { bg: "#fef3c7", text: "#92400e", border: "#f59e0b" },
  Popular: { bg: "#eff6ff", text: "#1e40af", border: "#3b82f6" },
  New: { bg: "#f5f3ff", text: "#5b21b6", border: "#8b5cf6" },
};

const DIFFICULTY_COLORS = {
  Beginner: { bg: "#dcfce7", text: "#166534" },
  Intermediate: { bg: "#fef3c7", text: "#92400e" },
  Advanced: { bg: "#fef2f2", text: "#991b1b" },
};

// ═══════════════════════════════════════════════════════════════════
// COMPONENTS
// ═══════════════════════════════════════════════════════════════════

function StarRating({ rating, size = 12 }) {
  return (
    <span style={{ display: "inline-flex", gap: 1 }}>
      {[1, 2, 3, 4, 5].map(i => (
        <span key={i} style={{ fontSize: size, color: i <= Math.round(rating) ? "#f59e0b" : "#e2e8f0" }}>★</span>
      ))}
    </span>
  );
}

function ProgressBar({ value, max, color = "#8b5cf6", height = 6 }) {
  return (
    <div style={{ background: "#f1f5f9", borderRadius: 100, height, overflow: "hidden", width: "100%" }}>
      <div style={{ background: color, height: "100%", width: `${(value / max) * 100}%`, borderRadius: 100, transition: "width 0.5s ease" }} />
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════════
export default function LearningHubPreview() {
  const [mainTab, setMainTab] = useState("courses");
  const [activeCategory, setActiveCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [priceFilter, setPriceFilter] = useState("all");
  const [difficultyFilter, setDifficultyFilter] = useState("all");
  const [sortBy, setSortBy] = useState("popular");
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [courseTab, setCourseTab] = useState("overview");
  const [expandedChapter, setExpandedChapter] = useState(null);
  const [enrolledCourses, setEnrolledCourses] = useState({});
  const [compareModels, setCompareModels] = useState([0, 1]);
  const [compareMetric, setCompareMetric] = useState("overall");
  const [activePath, setActivePath] = useState(null);
  const [quizActive, setQuizActive] = useState(false);
  const [quizAnswers, setQuizAnswers] = useState({});
  const [quizSubmitted, setQuizSubmitted] = useState(false);
  const [bookmarked, setBookmarked] = useState({});
  const [reviewText, setReviewText] = useState("");
  const [reviewRating, setReviewRating] = useState(5);
  const [showInstructorModal, setShowInstructorModal] = useState(false);
  const [instructorForm, setInstructorForm] = useState({ name: "", expertise: "", bio: "" });
  const [showCertificate, setShowCertificate] = useState(false);

  // ── Filter courses ────────────────────────────────────────────
  const filteredCourses = useMemo(() => {
    let results = [...COURSES];
    if (activeCategory !== "all") results = results.filter(c => c.category === activeCategory);
    if (priceFilter === "free") results = results.filter(c => c.price === 0);
    if (priceFilter === "paid") results = results.filter(c => c.price > 0);
    if (difficultyFilter !== "all") results = results.filter(c => c.difficulty === difficultyFilter);
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      results = results.filter(c => c.title.toLowerCase().includes(q) || c.tags.some(t => t.toLowerCase().includes(q)) || c.instructor.name.toLowerCase().includes(q));
    }
    if (sortBy === "rating") results.sort((a, b) => b.rating - a.rating);
    else if (sortBy === "newest") results.reverse();
    else if (sortBy === "price-low") results.sort((a, b) => a.price - b.price);
    else results.sort((a, b) => b.enrolled - a.enrolled);
    return results;
  }, [activeCategory, priceFilter, difficultyFilter, searchQuery, sortBy]);

  // ── Quiz data ─────────────────────────────────────────────────
  const quizQuestions = [
    { q: "What technique asks an LLM to 'think step by step' before answering?", options: ["Few-shot learning", "Chain-of-thought prompting", "Zero-shot classification", "Embedding"], correct: 1 },
    { q: "Which model architecture is the foundation of all modern LLMs?", options: ["RNN", "CNN", "Transformer", "GAN"], correct: 2 },
    { q: "What does RAG stand for in AI?", options: ["Rapid AI Generation", "Retrieval Augmented Generation", "Recursive Agent Graph", "Random Answer Generator"], correct: 1 },
    { q: "Which fine-tuning technique uses low-rank adapter matrices?", options: ["Full fine-tuning", "Distillation", "LoRA", "Pruning"], correct: 2 },
    { q: "What metric measures how well a model's outputs match human preferences?", options: ["Perplexity", "BLEU score", "RLHF reward score", "F1 score"], correct: 2 },
  ];

  // ═══ COURSE DETAIL VIEW ═══════════════════════════════════════
  if (selectedCourse) {
    const course = COURSES.find(c => c.id === selectedCourse);
    if (!course) return null;
    const isEnrolled = enrolledCourses[course.id];
    const dc = DIFFICULTY_COLORS[course.difficulty] || {};

    return (
      <div style={{ fontFamily: "'Inter', -apple-system, sans-serif", background: "#fafafa", minHeight: "100vh" }}>
        {/* Navbar */}
        <div style={{ background: "white", borderBottom: "1px solid #e5e7eb", padding: "12px 24px", display: "flex", alignItems: "center", gap: 10, position: "sticky", top: 0, zIndex: 50 }}>
          <span style={{ fontSize: 18, fontWeight: 800, background: "linear-gradient(135deg, #06b6d4, #a855f7)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>W</span>
          <span style={{ fontWeight: 700, color: "#0f172a", fontSize: 14 }}>WhichAi</span>
          <span style={{ color: "#cbd5e1" }}>/</span>
          <button onClick={() => setSelectedCourse(null)} style={{ fontWeight: 600, color: "#64748b", fontSize: 13, background: "none", border: "none", cursor: "pointer" }}>Learning Hub</button>
          <span style={{ color: "#cbd5e1" }}>/</span>
          <span style={{ fontWeight: 600, color: "#7c3aed", fontSize: 13 }}>{course.title}</span>
        </div>

        {/* Hero */}
        <div style={{ background: `linear-gradient(135deg, ${course.color}22, ${course.color}08)`, borderBottom: "1px solid #e5e7eb", padding: "32px 24px" }}>
          <div style={{ maxWidth: 960, margin: "0 auto", display: "grid", gridTemplateColumns: "1fr 340px", gap: 32 }}>
            <div>
              <div style={{ display: "flex", gap: 8, marginBottom: 12, flexWrap: "wrap" }}>
                {course.badge && BADGE_MAP[course.badge] && (
                  <span style={{ fontSize: 10, fontWeight: 700, padding: "3px 10px", borderRadius: 6, background: BADGE_MAP[course.badge].bg, color: BADGE_MAP[course.badge].text, border: `1px solid ${BADGE_MAP[course.badge].border}` }}>{course.badge}</span>
                )}
                <span style={{ fontSize: 10, fontWeight: 600, padding: "3px 8px", borderRadius: 6, background: dc.bg, color: dc.text }}>{course.difficulty}</span>
              </div>
              <h1 style={{ fontSize: 28, fontWeight: 900, color: "#0f172a", marginBottom: 6, lineHeight: 1.2 }}>{course.title}</h1>
              <p style={{ fontSize: 14, color: "#64748b", marginBottom: 16 }}>{course.subtitle}</p>
              <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16, flexWrap: "wrap" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                  <StarRating rating={course.rating} />
                  <span style={{ fontSize: 13, fontWeight: 700, color: "#0f172a" }}>{course.rating}</span>
                  <span style={{ fontSize: 12, color: "#94a3b8" }}>({course.reviews.toLocaleString()} reviews)</span>
                </div>
                <span style={{ fontSize: 12, color: "#94a3b8" }}>•</span>
                <span style={{ fontSize: 12, color: "#64748b" }}>{course.enrolled.toLocaleString()} enrolled</span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                <span style={{ fontSize: 22 }}>{course.instructor.avatar}</span>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: "#0f172a" }}>{course.instructor.name}</div>
                  <div style={{ fontSize: 11, color: "#94a3b8" }}>{course.instructor.title}</div>
                </div>
              </div>
              <div style={{ display: "flex", gap: 12, fontSize: 12, color: "#64748b", marginTop: 12 }}>
                <span>⏱ {course.duration}</span>
                <span>📖 {course.lessons} lessons</span>
                <span>🛠 {course.projects} projects</span>
                {course.certificate && <span>🎓 Certificate</span>}
              </div>
            </div>

            {/* Video preview / CTA card */}
            <div style={{ background: "white", borderRadius: 16, border: "1px solid #e5e7eb", overflow: "hidden", boxShadow: "0 4px 20px rgba(0,0,0,0.06)" }}>
              <div style={{ background: `linear-gradient(135deg, ${course.color}, ${course.color}cc)`, height: 160, display: "flex", alignItems: "center", justifyContent: "center", position: "relative", cursor: "pointer" }}>
                <span style={{ fontSize: 48 }}>{course.thumbnail}</span>
                <div style={{ position: "absolute", width: 50, height: 50, borderRadius: "50%", background: "rgba(255,255,255,0.9)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <span style={{ fontSize: 20, marginLeft: 3 }}>▶</span>
                </div>
                <span style={{ position: "absolute", bottom: 8, right: 8, fontSize: 10, fontWeight: 600, color: "white", background: "rgba(0,0,0,0.5)", padding: "2px 8px", borderRadius: 4 }}>Preview</span>
              </div>
              <div style={{ padding: 20 }}>
                <div style={{ display: "flex", alignItems: "baseline", gap: 8, marginBottom: 12 }}>
                  {course.price === 0 ? (
                    <span style={{ fontSize: 28, fontWeight: 900, color: "#059669" }}>Free</span>
                  ) : (
                    <>
                      <span style={{ fontSize: 28, fontWeight: 900, color: "#0f172a" }}>${course.price}</span>
                      {course.originalPrice > course.price && <span style={{ fontSize: 14, color: "#94a3b8", textDecoration: "line-through" }}>${course.originalPrice}</span>}
                      {course.originalPrice > course.price && <span style={{ fontSize: 11, fontWeight: 700, color: "#dc2626", background: "#fef2f2", padding: "2px 6px", borderRadius: 4 }}>{Math.round((1 - course.price / course.originalPrice) * 100)}% OFF</span>}
                    </>
                  )}
                </div>
                <button
                  onClick={() => setEnrolledCourses({ ...enrolledCourses, [course.id]: !isEnrolled })}
                  style={{ width: "100%", padding: "12px 0", borderRadius: 12, fontWeight: 700, fontSize: 14, border: "none", cursor: "pointer", marginBottom: 8, background: isEnrolled ? "#f1f5f9" : `linear-gradient(135deg, ${course.color}, ${course.color}cc)`, color: isEnrolled ? "#64748b" : "white", transition: "all 0.2s" }}
                >
                  {isEnrolled ? "✅ Enrolled — Continue Learning" : course.price === 0 ? "Enroll for Free" : `Buy Now — $${course.price}`}
                </button>
                <button
                  onClick={() => setBookmarked({ ...bookmarked, [course.id]: !bookmarked[course.id] })}
                  style={{ width: "100%", padding: "10px 0", borderRadius: 12, fontWeight: 600, fontSize: 13, border: "1px solid #e5e7eb", background: bookmarked[course.id] ? "#fef2f2" : "white", color: bookmarked[course.id] ? "#dc2626" : "#64748b", cursor: "pointer" }}
                >
                  {bookmarked[course.id] ? "❤️ Saved to Wishlist" : "🤍 Add to Wishlist"}
                </button>
                <div style={{ marginTop: 12, fontSize: 11, color: "#94a3b8", textAlign: "center" }}>30-day money-back guarantee</div>
              </div>
            </div>
          </div>
        </div>

        {/* Course tabs */}
        <div style={{ background: "white", borderBottom: "1px solid #e5e7eb", padding: "0 24px", position: "sticky", top: 46, zIndex: 40 }}>
          <div style={{ maxWidth: 960, margin: "0 auto", display: "flex", gap: 0 }}>
            {["overview", "curriculum", "reviews", "quiz"].map(tab => (
              <button key={tab} onClick={() => setCourseTab(tab)} style={{ padding: "12px 18px", fontSize: 13, fontWeight: courseTab === tab ? 700 : 500, color: courseTab === tab ? "#7c3aed" : "#64748b", background: "transparent", border: "none", borderBottom: courseTab === tab ? "2px solid #7c3aed" : "2px solid transparent", cursor: "pointer", textTransform: "capitalize" }}>{tab}</button>
            ))}
          </div>
        </div>

        <div style={{ maxWidth: 960, margin: "0 auto", padding: 24 }}>

          {/* OVERVIEW TAB */}
          {courseTab === "overview" && (
            <div style={{ display: "grid", gridTemplateColumns: "1fr 300px", gap: 24 }}>
              <div>
                <h2 style={{ fontSize: 18, fontWeight: 800, color: "#0f172a", marginBottom: 12 }}>About This Course</h2>
                <p style={{ fontSize: 13, color: "#475569", lineHeight: 1.8, marginBottom: 24 }}>{course.description}</p>

                <h3 style={{ fontSize: 15, fontWeight: 700, color: "#0f172a", marginBottom: 10 }}>What You'll Learn</h3>
                <div style={{ display: "grid", gap: 8, marginBottom: 24 }}>
                  {course.whatYouLearn.map((item, i) => (
                    <div key={i} style={{ display: "flex", gap: 10, fontSize: 13, color: "#334155", background: "white", padding: "10px 14px", borderRadius: 10, border: "1px solid #e5e7eb" }}>
                      <span style={{ color: "#059669", fontWeight: 700 }}>✓</span>
                      {item}
                    </div>
                  ))}
                </div>

                <h3 style={{ fontSize: 15, fontWeight: 700, color: "#0f172a", marginBottom: 10 }}>Tags</h3>
                <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                  {course.tags.map(tag => (
                    <span key={tag} style={{ fontSize: 11, fontWeight: 600, padding: "4px 10px", borderRadius: 8, background: "#f1f5f9", color: "#475569" }}>{tag}</span>
                  ))}
                </div>
              </div>

              <div>
                <div style={{ background: "white", borderRadius: 14, border: "1px solid #e5e7eb", padding: 16, marginBottom: 16 }}>
                  <h3 style={{ fontSize: 13, fontWeight: 700, color: "#0f172a", marginBottom: 10 }}>Instructor</h3>
                  <div style={{ display: "flex", gap: 10, alignItems: "center", marginBottom: 8 }}>
                    <span style={{ fontSize: 28 }}>{course.instructor.avatar}</span>
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 700 }}>{course.instructor.name}</div>
                      <div style={{ fontSize: 11, color: "#94a3b8" }}>{course.instructor.title}</div>
                    </div>
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8, fontSize: 11 }}>
                    <div style={{ textAlign: "center", background: "#f8fafc", borderRadius: 8, padding: 8 }}>
                      <div style={{ fontWeight: 800, color: "#0f172a" }}>{course.instructor.rating}</div>
                      <div style={{ color: "#94a3b8" }}>Rating</div>
                    </div>
                    <div style={{ textAlign: "center", background: "#f8fafc", borderRadius: 8, padding: 8 }}>
                      <div style={{ fontWeight: 800, color: "#0f172a" }}>{(course.instructor.students / 1000).toFixed(1)}K</div>
                      <div style={{ color: "#94a3b8" }}>Students</div>
                    </div>
                    <div style={{ textAlign: "center", background: "#f8fafc", borderRadius: 8, padding: 8 }}>
                      <div style={{ fontWeight: 800, color: "#0f172a" }}>{course.instructor.courses}</div>
                      <div style={{ color: "#94a3b8" }}>Courses</div>
                    </div>
                  </div>
                </div>
                <div style={{ background: "white", borderRadius: 14, border: "1px solid #e5e7eb", padding: 16 }}>
                  <h3 style={{ fontSize: 13, fontWeight: 700, color: "#0f172a", marginBottom: 8 }}>This Course Includes</h3>
                  {[
                    `⏱ ${course.duration} of content`,
                    `📖 ${course.lessons} lessons`,
                    `🛠 ${course.projects} hands-on projects`,
                    "📱 Mobile & desktop access",
                    "♾️ Lifetime access",
                    course.certificate ? "🎓 Certificate of completion" : null,
                  ].filter(Boolean).map((item, i) => (
                    <div key={i} style={{ fontSize: 12, color: "#475569", padding: "6px 0", borderBottom: i < 5 ? "1px solid #f1f5f9" : "none" }}>{item}</div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* CURRICULUM TAB */}
          {courseTab === "curriculum" && (
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
                <h2 style={{ fontSize: 18, fontWeight: 800, color: "#0f172a" }}>Course Curriculum</h2>
                <span style={{ fontSize: 12, color: "#94a3b8" }}>{course.chapters.length} chapters · {course.lessons} lessons · {course.duration}</span>
              </div>
              {course.chapters.map((ch, i) => (
                <div key={i} style={{ marginBottom: 8 }}>
                  <button
                    onClick={() => setExpandedChapter(expandedChapter === i ? null : i)}
                    style={{ width: "100%", display: "flex", justifyContent: "space-between", alignItems: "center", padding: "14px 16px", background: expandedChapter === i ? "#f5f3ff" : "white", border: expandedChapter === i ? "1px solid #c4b5fd" : "1px solid #e5e7eb", borderRadius: expandedChapter === i ? "12px 12px 0 0" : 12, cursor: "pointer", transition: "all 0.2s" }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <span style={{ fontSize: 12, fontWeight: 800, color: "#7c3aed", background: "#f5f3ff", borderRadius: 6, width: 28, height: 28, display: "flex", alignItems: "center", justifyContent: "center" }}>{i + 1}</span>
                      <span style={{ fontSize: 13, fontWeight: 700, color: "#0f172a" }}>{ch.title}</span>
                      {ch.free && <span style={{ fontSize: 9, fontWeight: 700, padding: "2px 6px", borderRadius: 4, background: "#dcfce7", color: "#166534" }}>FREE PREVIEW</span>}
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <span style={{ fontSize: 11, color: "#94a3b8" }}>{ch.lessons} lessons · {ch.duration}</span>
                      <span style={{ fontSize: 14, color: "#94a3b8", transform: expandedChapter === i ? "rotate(180deg)" : "rotate(0)", transition: "transform 0.2s" }}>▼</span>
                    </div>
                  </button>
                  {expandedChapter === i && (
                    <div style={{ background: "white", border: "1px solid #c4b5fd", borderTop: "none", borderRadius: "0 0 12px 12px", padding: "12px 16px" }}>
                      {Array.from({ length: ch.lessons }, (_, j) => (
                        <div key={j} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "8px 0", borderBottom: j < ch.lessons - 1 ? "1px solid #f1f5f9" : "none" }}>
                          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                            <span style={{ width: 24, height: 24, borderRadius: "50%", border: "2px solid #e2e8f0", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, color: isEnrolled ? "#059669" : "#94a3b8" }}>{isEnrolled && j < 2 ? "✓" : ""}</span>
                            <span style={{ fontSize: 12, color: "#334155" }}>Lesson {j + 1}: {["Introduction", "Core Concepts", "Hands-on Demo", "Practice Exercise", "Deep Dive", "Advanced Techniques", "Case Study", "Summary"][j % 8]}</span>
                          </div>
                          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                            {ch.free && <span style={{ fontSize: 10, color: "#059669", fontWeight: 600 }}>Free</span>}
                            <span style={{ fontSize: 11, color: "#94a3b8" }}>{Math.floor(Math.random() * 15 + 5)} min</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* REVIEWS TAB */}
          {courseTab === "reviews" && (
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
                <h2 style={{ fontSize: 18, fontWeight: 800, color: "#0f172a" }}>Student Reviews</h2>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <StarRating rating={course.rating} size={16} />
                  <span style={{ fontSize: 18, fontWeight: 800, color: "#0f172a" }}>{course.rating}</span>
                  <span style={{ fontSize: 13, color: "#94a3b8" }}>({course.reviews.toLocaleString()} reviews)</span>
                </div>
              </div>

              {/* Rating breakdown */}
              <div style={{ background: "white", borderRadius: 14, border: "1px solid #e5e7eb", padding: 20, marginBottom: 20 }}>
                {[5, 4, 3, 2, 1].map(stars => {
                  const pct = stars === 5 ? 72 : stars === 4 ? 20 : stars === 3 ? 5 : stars === 2 ? 2 : 1;
                  return (
                    <div key={stars} style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
                      <span style={{ fontSize: 12, fontWeight: 600, color: "#475569", width: 15, textAlign: "right" }}>{stars}</span>
                      <StarRating rating={stars} />
                      <div style={{ flex: 1 }}><ProgressBar value={pct} max={100} color="#f59e0b" /></div>
                      <span style={{ fontSize: 11, color: "#94a3b8", width: 30, textAlign: "right" }}>{pct}%</span>
                    </div>
                  );
                })}
              </div>

              {/* Reviews */}
              {course.reviewsList.map((rev, i) => (
                <div key={i} style={{ background: "white", borderRadius: 14, border: "1px solid #e5e7eb", padding: 16, marginBottom: 10 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
                    <span style={{ fontSize: 22 }}>{rev.avatar}</span>
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 700, color: "#0f172a" }}>{rev.user}</div>
                      <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                        <StarRating rating={rev.rating} />
                        <span style={{ fontSize: 11, color: "#94a3b8" }}>{rev.time}</span>
                      </div>
                    </div>
                  </div>
                  <p style={{ fontSize: 13, color: "#475569", lineHeight: 1.7, margin: 0 }}>{rev.text}</p>
                </div>
              ))}

              {/* Write review */}
              <div style={{ background: "#f8fafc", borderRadius: 14, border: "1px solid #e5e7eb", padding: 20, marginTop: 20 }}>
                <h3 style={{ fontSize: 14, fontWeight: 700, color: "#0f172a", marginBottom: 10 }}>Write a Review</h3>
                <div style={{ display: "flex", gap: 4, marginBottom: 10 }}>
                  {[1, 2, 3, 4, 5].map(s => (
                    <button key={s} onClick={() => setReviewRating(s)} style={{ fontSize: 22, background: "none", border: "none", cursor: "pointer", color: s <= reviewRating ? "#f59e0b" : "#e2e8f0" }}>★</button>
                  ))}
                </div>
                <textarea value={reviewText} onChange={e => setReviewText(e.target.value)} placeholder="Share your experience with this course..." style={{ width: "100%", padding: 12, borderRadius: 10, border: "1px solid #e5e7eb", fontSize: 13, minHeight: 80, resize: "vertical", fontFamily: "inherit" }} />
                <button onClick={() => { setReviewText(""); alert("Review submitted! Thank you."); }} style={{ marginTop: 8, padding: "8px 20px", borderRadius: 10, fontWeight: 700, fontSize: 13, background: "#7c3aed", color: "white", border: "none", cursor: "pointer" }}>Submit Review</button>
              </div>
            </div>
          )}

          {/* QUIZ TAB */}
          {courseTab === "quiz" && (
            <div>
              <h2 style={{ fontSize: 18, fontWeight: 800, color: "#0f172a", marginBottom: 4 }}>📝 Chapter Quiz</h2>
              <p style={{ fontSize: 13, color: "#64748b", marginBottom: 20 }}>Test your knowledge. Score 80%+ to earn your certificate.</p>

              {!quizActive ? (
                <div style={{ textAlign: "center", padding: 40, background: "white", borderRadius: 16, border: "1px solid #e5e7eb" }}>
                  <span style={{ fontSize: 48, display: "block", marginBottom: 12 }}>🎯</span>
                  <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 8 }}>Ready to test yourself?</h3>
                  <p style={{ fontSize: 13, color: "#64748b", marginBottom: 16 }}>5 questions · Multiple choice · Instant results</p>
                  <button onClick={() => { setQuizActive(true); setQuizSubmitted(false); setQuizAnswers({}); }} style={{ padding: "12px 32px", borderRadius: 12, fontWeight: 700, fontSize: 14, background: "linear-gradient(135deg, #7c3aed, #a855f7)", color: "white", border: "none", cursor: "pointer" }}>Start Quiz</button>
                </div>
              ) : !quizSubmitted ? (
                <div>
                  {quizQuestions.map((qq, i) => (
                    <div key={i} style={{ background: "white", borderRadius: 14, border: "1px solid #e5e7eb", padding: 20, marginBottom: 12 }}>
                      <div style={{ fontSize: 12, fontWeight: 700, color: "#7c3aed", marginBottom: 6 }}>Question {i + 1} of {quizQuestions.length}</div>
                      <h3 style={{ fontSize: 14, fontWeight: 700, color: "#0f172a", marginBottom: 12 }}>{qq.q}</h3>
                      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                        {qq.options.map((opt, j) => (
                          <button key={j} onClick={() => setQuizAnswers({ ...quizAnswers, [i]: j })} style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 14px", borderRadius: 10, border: quizAnswers[i] === j ? "2px solid #7c3aed" : "1px solid #e5e7eb", background: quizAnswers[i] === j ? "#f5f3ff" : "white", fontSize: 13, color: "#334155", cursor: "pointer", textAlign: "left", fontFamily: "inherit" }}>
                            <span style={{ width: 20, height: 20, borderRadius: "50%", border: quizAnswers[i] === j ? "6px solid #7c3aed" : "2px solid #cbd5e1", flexShrink: 0 }} />
                            {opt}
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
                  <button onClick={() => setQuizSubmitted(true)} disabled={Object.keys(quizAnswers).length < quizQuestions.length} style={{ padding: "12px 32px", borderRadius: 12, fontWeight: 700, fontSize: 14, background: Object.keys(quizAnswers).length < quizQuestions.length ? "#e2e8f0" : "linear-gradient(135deg, #7c3aed, #a855f7)", color: Object.keys(quizAnswers).length < quizQuestions.length ? "#94a3b8" : "white", border: "none", cursor: "pointer" }}>Submit Answers</button>
                </div>
              ) : (
                <div>
                  {(() => {
                    const score = quizQuestions.filter((qq, i) => quizAnswers[i] === qq.correct).length;
                    const pct = Math.round((score / quizQuestions.length) * 100);
                    const passed = pct >= 80;
                    return (
                      <>
                        <div style={{ textAlign: "center", padding: 32, background: passed ? "#f0fdf4" : "#fef2f2", borderRadius: 16, border: `1px solid ${passed ? "#22c55e" : "#ef4444"}40`, marginBottom: 20 }}>
                          <span style={{ fontSize: 48, display: "block", marginBottom: 8 }}>{passed ? "🎉" : "😅"}</span>
                          <h3 style={{ fontSize: 20, fontWeight: 800, color: "#0f172a", marginBottom: 4 }}>{passed ? "Congratulations!" : "Keep Studying!"}</h3>
                          <p style={{ fontSize: 14, color: "#64748b" }}>You scored <b>{score}/{quizQuestions.length}</b> ({pct}%) {passed ? "— Certificate unlocked!" : "— You need 80% to pass."}</p>
                          {passed && (
                            <button onClick={() => setShowCertificate(true)} style={{ marginTop: 12, padding: "10px 24px", borderRadius: 10, fontWeight: 700, fontSize: 13, background: "#059669", color: "white", border: "none", cursor: "pointer" }}>🎓 View Certificate</button>
                          )}
                          {!passed && (
                            <button onClick={() => { setQuizActive(true); setQuizSubmitted(false); setQuizAnswers({}); }} style={{ marginTop: 12, padding: "10px 24px", borderRadius: 10, fontWeight: 700, fontSize: 13, background: "#7c3aed", color: "white", border: "none", cursor: "pointer" }}>Try Again</button>
                          )}
                        </div>
                        {quizQuestions.map((qq, i) => {
                          const isCorrect = quizAnswers[i] === qq.correct;
                          return (
                            <div key={i} style={{ background: "white", borderRadius: 14, border: `1px solid ${isCorrect ? "#22c55e" : "#ef4444"}40`, padding: 16, marginBottom: 10 }}>
                              <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 6 }}>
                                <span>{isCorrect ? "✅" : "❌"}</span>
                                <span style={{ fontSize: 13, fontWeight: 700, color: "#0f172a" }}>{qq.q}</span>
                              </div>
                              <div style={{ fontSize: 12, color: isCorrect ? "#059669" : "#dc2626" }}>
                                {isCorrect ? "Correct!" : `Wrong — correct answer: ${qq.options[qq.correct]}`}
                              </div>
                            </div>
                          );
                        })}
                      </>
                    );
                  })()}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Certificate Modal */}
        {showCertificate && (
          <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.6)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 100 }} onClick={() => setShowCertificate(false)}>
            <div onClick={e => e.stopPropagation()} style={{ background: "white", borderRadius: 20, padding: 40, maxWidth: 560, width: "90%", textAlign: "center", border: "3px solid #f59e0b" }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: "#f59e0b", marginBottom: 8, letterSpacing: 2 }}>CERTIFICATE OF COMPLETION</div>
              <div style={{ fontSize: 40, marginBottom: 8 }}>🎓</div>
              <h2 style={{ fontSize: 22, fontWeight: 900, color: "#0f172a", marginBottom: 4 }}>{course.title}</h2>
              <p style={{ fontSize: 14, color: "#64748b", marginBottom: 16 }}>This certifies that <b>Shyam</b> has successfully completed this course.</p>
              <div style={{ display: "flex", justifyContent: "center", gap: 24, marginBottom: 20, fontSize: 12, color: "#94a3b8" }}>
                <div>Instructor: <b style={{ color: "#0f172a" }}>{course.instructor.name}</b></div>
                <div>Date: <b style={{ color: "#0f172a" }}>April 2, 2026</b></div>
              </div>
              <div style={{ fontSize: 10, color: "#94a3b8", marginBottom: 16 }}>Certificate ID: WHAI-{course.id.toUpperCase()}-{Math.random().toString(36).substr(2, 8).toUpperCase()}</div>
              <div style={{ display: "flex", gap: 8, justifyContent: "center" }}>
                <button style={{ padding: "8px 20px", borderRadius: 10, fontWeight: 700, fontSize: 12, background: "#0077b5", color: "white", border: "none", cursor: "pointer" }}>Share on LinkedIn</button>
                <button style={{ padding: "8px 20px", borderRadius: 10, fontWeight: 700, fontSize: 12, background: "#7c3aed", color: "white", border: "none", cursor: "pointer" }}>Download PDF</button>
                <button onClick={() => setShowCertificate(false)} style={{ padding: "8px 20px", borderRadius: 10, fontWeight: 700, fontSize: 12, background: "white", color: "#64748b", border: "1px solid #e5e7eb", cursor: "pointer" }}>Close</button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // ═══════════════════════════════════════════════════════════════
  // MAIN CATALOG VIEW
  // ═══════════════════════════════════════════════════════════════
  return (
    <div style={{ fontFamily: "'Inter', -apple-system, sans-serif", background: "#fafafa", minHeight: "100vh" }}>
      {/* Navbar */}
      <div style={{ background: "white", borderBottom: "1px solid #e5e7eb", padding: "12px 24px", display: "flex", alignItems: "center", justifyContent: "space-between", position: "sticky", top: 0, zIndex: 50 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <span style={{ fontSize: 18, fontWeight: 800, background: "linear-gradient(135deg, #06b6d4, #a855f7)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>W</span>
          <span style={{ fontWeight: 700, color: "#0f172a", fontSize: 14 }}>WhichAi</span>
          <span style={{ color: "#cbd5e1" }}>/</span>
          <span style={{ fontWeight: 700, color: "#059669", fontSize: 14 }}>Learning Hub</span>
        </div>
        <button onClick={() => setShowInstructorModal(true)} style={{ background: "linear-gradient(135deg, #059669, #10b981)", color: "white", border: "none", borderRadius: 10, padding: "8px 16px", fontSize: 12, fontWeight: 700, cursor: "pointer" }}>🎓 Become an Instructor</button>
      </div>

      {/* Hero */}
      <div style={{ background: "linear-gradient(135deg, #064e3b 0%, #065f46 30%, #047857 60%, #059669 100%)", padding: "40px 24px 32px", position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", inset: 0, opacity: 0.1, backgroundImage: "radial-gradient(circle at 30% 50%, rgba(52,211,153,0.5) 0%, transparent 50%), radial-gradient(circle at 70% 50%, rgba(6,182,212,0.4) 0%, transparent 50%)" }} />
        <div style={{ position: "relative", maxWidth: 1100, margin: "0 auto", textAlign: "center" }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "rgba(255,255,255,0.1)", borderRadius: 20, padding: "6px 16px", marginBottom: 16, border: "1px solid rgba(255,255,255,0.15)" }}>
            <span style={{ fontSize: 14 }}>📚</span>
            <span style={{ fontSize: 12, fontWeight: 600, color: "rgba(255,255,255,0.9)" }}>AI Academy — Learn from the best minds in AI</span>
          </div>
          <h1 style={{ fontSize: 36, fontWeight: 900, color: "white", marginBottom: 8 }}>
            Learning <span style={{ background: "linear-gradient(135deg, #34d399, #22d3ee)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>Hub</span>
          </h1>
          <p style={{ color: "rgba(255,255,255,0.6)", fontSize: 14, maxWidth: 500, margin: "0 auto 20px" }}>Free and paid courses, AI model comparisons, learning paths, and certifications — all in one place.</p>

          <div style={{ maxWidth: 500, margin: "0 auto 20px", position: "relative" }}>
            <input value={searchQuery} onChange={e => setSearchQuery(e.target.value)} placeholder="Search courses, topics, instructors..." style={{ width: "100%", padding: "12px 16px 12px 40px", borderRadius: 14, border: "1px solid rgba(255,255,255,0.15)", background: "rgba(255,255,255,0.08)", color: "white", fontSize: 13, outline: "none" }} />
            <span style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", fontSize: 15, opacity: 0.5 }}>🔍</span>
          </div>

          <div style={{ display: "flex", justifyContent: "center", gap: 32 }}>
            {[{ val: "8", label: "Courses" }, { val: "50+", label: "Hours" }, { val: "400+", label: "Lessons" }, { val: "Free", label: "to Start" }].map(s => (
              <div key={s.label} style={{ textAlign: "center" }}>
                <div style={{ fontSize: 20, fontWeight: 800, color: "white" }}>{s.val}</div>
                <div style={{ fontSize: 11, color: "rgba(255,255,255,0.5)" }}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ background: "white", borderBottom: "1px solid #e5e7eb", padding: "0 24px" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto", display: "flex", gap: 0 }}>
          {[
            { id: "courses", label: "📚 Courses" },
            { id: "paths", label: "🗺️ Learning Paths" },
            { id: "compare", label: "⚔️ Model Comparison" },
          ].map(tab => (
            <button key={tab.id} onClick={() => setMainTab(tab.id)} style={{ padding: "14px 20px", fontSize: 13, fontWeight: mainTab === tab.id ? 700 : 500, color: mainTab === tab.id ? "#059669" : "#64748b", background: "transparent", border: "none", borderBottom: mainTab === tab.id ? "2px solid #059669" : "2px solid transparent", cursor: "pointer" }}>{tab.label}</button>
          ))}
        </div>
      </div>

      <div style={{ maxWidth: 1100, margin: "0 auto", padding: 24 }}>

        {/* ═══ COURSES TAB ═══ */}
        {mainTab === "courses" && (
          <>
            {/* Filters */}
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 16 }}>
              {CATEGORIES.map(cat => (
                <button key={cat.id} onClick={() => setActiveCategory(cat.id)} style={{ padding: "6px 14px", borderRadius: 8, fontSize: 12, fontWeight: 600, background: activeCategory === cat.id ? "#0f172a" : "white", color: activeCategory === cat.id ? "white" : "#64748b", border: activeCategory === cat.id ? "none" : "1px solid #e5e7eb", cursor: "pointer" }}>{cat.emoji} {cat.label}</button>
              ))}
            </div>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
              <div style={{ display: "flex", gap: 6 }}>
                {[{ id: "all", label: "All" }, { id: "free", label: "🆓 Free" }, { id: "paid", label: "💰 Paid" }].map(f => (
                  <button key={f.id} onClick={() => setPriceFilter(f.id)} style={{ padding: "5px 12px", borderRadius: 8, fontSize: 11, fontWeight: 600, background: priceFilter === f.id ? "#059669" : "white", color: priceFilter === f.id ? "white" : "#64748b", border: priceFilter === f.id ? "none" : "1px solid #e5e7eb", cursor: "pointer" }}>{f.label}</button>
                ))}
                {["Beginner", "Intermediate", "Advanced"].map(d => (
                  <button key={d} onClick={() => setDifficultyFilter(difficultyFilter === d ? "all" : d)} style={{ padding: "5px 12px", borderRadius: 8, fontSize: 11, fontWeight: 600, background: difficultyFilter === d ? (DIFFICULTY_COLORS[d]?.bg || "#f1f5f9") : "white", color: difficultyFilter === d ? (DIFFICULTY_COLORS[d]?.text || "#475569") : "#94a3b8", border: "1px solid #e5e7eb", cursor: "pointer" }}>{d}</button>
                ))}
              </div>
              <select value={sortBy} onChange={e => setSortBy(e.target.value)} style={{ padding: "5px 10px", borderRadius: 8, fontSize: 11, fontWeight: 600, border: "1px solid #e5e7eb", color: "#64748b", cursor: "pointer" }}>
                <option value="popular">Most Popular</option>
                <option value="rating">Top Rated</option>
                <option value="newest">Newest</option>
                <option value="price-low">Price: Low to High</option>
              </select>
            </div>

            <p style={{ fontSize: 12, color: "#94a3b8", marginBottom: 12 }}>Showing <b style={{ color: "#0f172a" }}>{filteredCourses.length}</b> courses</p>

            {/* Course grid */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 16 }}>
              {filteredCourses.map(course => {
                const dc = DIFFICULTY_COLORS[course.difficulty] || {};
                return (
                  <div key={course.id} onClick={() => { setSelectedCourse(course.id); setCourseTab("overview"); setExpandedChapter(null); }} style={{ background: "white", borderRadius: 16, border: "1px solid #e5e7eb", overflow: "hidden", cursor: "pointer", transition: "all 0.2s", boxShadow: "none" }} onMouseOver={e => e.currentTarget.style.boxShadow = `0 8px 30px ${course.color}15`} onMouseOut={e => e.currentTarget.style.boxShadow = "none"}>
                    {/* Thumbnail */}
                    <div style={{ background: `linear-gradient(135deg, ${course.color}20, ${course.color}08)`, height: 120, display: "flex", alignItems: "center", justifyContent: "center", position: "relative" }}>
                      <span style={{ fontSize: 40 }}>{course.thumbnail}</span>
                      {course.badge && BADGE_MAP[course.badge] && (
                        <span style={{ position: "absolute", top: 10, right: 10, fontSize: 9, fontWeight: 700, padding: "3px 8px", borderRadius: 6, background: BADGE_MAP[course.badge].bg, color: BADGE_MAP[course.badge].text, border: `1px solid ${BADGE_MAP[course.badge].border}` }}>{course.badge}</span>
                      )}
                      <span style={{ position: "absolute", top: 10, left: 10, fontSize: 9, fontWeight: 600, padding: "3px 8px", borderRadius: 6, background: dc.bg, color: dc.text }}>{course.difficulty}</span>
                    </div>
                    <div style={{ padding: 16 }}>
                      <h3 style={{ fontSize: 14, fontWeight: 700, color: "#0f172a", marginBottom: 4, lineHeight: 1.3 }}>{course.title}</h3>
                      <p style={{ fontSize: 11, color: "#94a3b8", marginBottom: 8 }}>{course.subtitle}</p>
                      <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 8 }}>
                        <span style={{ fontSize: 14 }}>{course.instructor.avatar}</span>
                        <span style={{ fontSize: 11, fontWeight: 600, color: "#475569" }}>{course.instructor.name}</span>
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 8 }}>
                        <StarRating rating={course.rating} />
                        <span style={{ fontSize: 11, fontWeight: 700, color: "#0f172a" }}>{course.rating}</span>
                        <span style={{ fontSize: 10, color: "#94a3b8" }}>({course.reviews.toLocaleString()})</span>
                      </div>
                      <div style={{ display: "flex", gap: 10, fontSize: 10, color: "#94a3b8", marginBottom: 10 }}>
                        <span>⏱ {course.duration}</span>
                        <span>📖 {course.lessons} lessons</span>
                        <span>🛠 {course.projects} projects</span>
                      </div>
                      <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between" }}>
                        {course.price === 0 ? (
                          <span style={{ fontSize: 16, fontWeight: 800, color: "#059669" }}>Free</span>
                        ) : (
                          <div style={{ display: "flex", alignItems: "baseline", gap: 6 }}>
                            <span style={{ fontSize: 16, fontWeight: 800, color: "#0f172a" }}>${course.price}</span>
                            {course.originalPrice > course.price && <span style={{ fontSize: 11, color: "#94a3b8", textDecoration: "line-through" }}>${course.originalPrice}</span>}
                          </div>
                        )}
                        <span style={{ fontSize: 10, color: "#94a3b8" }}>{course.enrolled.toLocaleString()} enrolled</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}

        {/* ═══ LEARNING PATHS TAB ═══ */}
        {mainTab === "paths" && (
          <div>
            <h2 style={{ fontSize: 20, fontWeight: 800, color: "#0f172a", marginBottom: 4 }}>🗺️ Learning Paths</h2>
            <p style={{ fontSize: 13, color: "#64748b", marginBottom: 20 }}>Curated course sequences to take you from beginner to expert. Complete a path to earn a certificate.</p>
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              {LEARNING_PATHS.map(path => {
                const pathCourses = path.courses.map(id => COURSES.find(c => c.id === id)).filter(Boolean);
                const expanded = activePath === path.id;
                return (
                  <div key={path.id} style={{ background: "white", borderRadius: 16, border: expanded ? `1px solid ${path.color}40` : "1px solid #e5e7eb", overflow: "hidden", transition: "all 0.2s" }}>
                    <div onClick={() => setActivePath(expanded ? null : path.id)} style={{ padding: 20, cursor: "pointer", display: "flex", gap: 16, alignItems: "center" }}>
                      <div style={{ width: 56, height: 56, borderRadius: 16, background: `${path.color}15`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 28, flexShrink: 0 }}>{path.emoji}</div>
                      <div style={{ flex: 1 }}>
                        <h3 style={{ fontSize: 16, fontWeight: 700, color: "#0f172a", marginBottom: 4 }}>{path.title}</h3>
                        <p style={{ fontSize: 12, color: "#64748b", marginBottom: 6 }}>{path.description}</p>
                        <div style={{ display: "flex", gap: 12, fontSize: 11, color: "#94a3b8" }}>
                          <span>📚 {pathCourses.length} courses</span>
                          <span>⏱ {path.duration}</span>
                          <span>📊 {path.difficulty}</span>
                          <span>👥 {path.enrolled.toLocaleString()} enrolled</span>
                        </div>
                      </div>
                      <span style={{ fontSize: 18, color: "#94a3b8", transform: expanded ? "rotate(180deg)" : "rotate(0)", transition: "transform 0.2s" }}>▼</span>
                    </div>
                    {expanded && (
                      <div style={{ padding: "0 20px 20px", borderTop: "1px solid #f1f5f9" }}>
                        <h4 style={{ fontSize: 13, fontWeight: 700, color: "#0f172a", margin: "16px 0 10px" }}>Milestones</h4>
                        <div style={{ display: "flex", gap: 12, marginBottom: 16 }}>
                          {path.milestones.map((m, i) => (
                            <div key={i} style={{ flex: 1, background: "#f8fafc", borderRadius: 10, padding: 12, textAlign: "center", border: "1px solid #e2e8f0" }}>
                              <div style={{ fontSize: 18, marginBottom: 4 }}>{["🌱", "🔥", "🏆"][i]}</div>
                              <div style={{ fontSize: 11, fontWeight: 600, color: "#475569" }}>{m}</div>
                            </div>
                          ))}
                        </div>
                        <h4 style={{ fontSize: 13, fontWeight: 700, color: "#0f172a", marginBottom: 10 }}>Courses in This Path</h4>
                        {pathCourses.map((c, i) => (
                          <div key={c.id} onClick={e => { e.stopPropagation(); setSelectedCourse(c.id); setCourseTab("overview"); }} style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 14px", background: "#f8fafc", borderRadius: 10, marginBottom: 6, cursor: "pointer", border: "1px solid #e2e8f0" }}>
                            <span style={{ fontSize: 12, fontWeight: 800, color: path.color, background: `${path.color}15`, borderRadius: 6, width: 28, height: 28, display: "flex", alignItems: "center", justifyContent: "center" }}>{i + 1}</span>
                            <span style={{ fontSize: 22 }}>{c.thumbnail}</span>
                            <div style={{ flex: 1 }}>
                              <div style={{ fontSize: 13, fontWeight: 700, color: "#0f172a" }}>{c.title}</div>
                              <div style={{ fontSize: 11, color: "#94a3b8" }}>{c.instructor.name} · {c.duration} · {c.lessons} lessons</div>
                            </div>
                            <div style={{ fontSize: 12, fontWeight: 700, color: c.price === 0 ? "#059669" : "#0f172a" }}>{c.price === 0 ? "Free" : `$${c.price}`}</div>
                          </div>
                        ))}
                        <button style={{ marginTop: 12, padding: "10px 24px", borderRadius: 10, fontWeight: 700, fontSize: 13, background: `linear-gradient(135deg, ${path.color}, ${path.color}cc)`, color: "white", border: "none", cursor: "pointer" }}>Start This Path</button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ═══ MODEL COMPARISON TAB ═══ */}
        {mainTab === "compare" && (
          <div>
            <h2 style={{ fontSize: 20, fontWeight: 800, color: "#0f172a", marginBottom: 4 }}>⚔️ AI Model Comparison Hub</h2>
            <p style={{ fontSize: 13, color: "#64748b", marginBottom: 20 }}>Compare AI models side by side. Specs, pricing, benchmarks, and best use cases.</p>

            {/* Model selector */}
            <div style={{ display: "flex", gap: 8, marginBottom: 16, flexWrap: "wrap" }}>
              {AI_MODELS.map((m, i) => (
                <button key={m.name} onClick={() => { const newCompare = [...compareModels]; if (newCompare.includes(i)) { if (newCompare.length > 1) setCompareModels(newCompare.filter(x => x !== i)); } else { if (newCompare.length >= 3) newCompare.shift(); newCompare.push(i); setCompareModels(newCompare); } }} style={{ padding: "6px 14px", borderRadius: 10, fontSize: 12, fontWeight: 600, background: compareModels.includes(i) ? `${m.color}15` : "white", color: compareModels.includes(i) ? m.color : "#64748b", border: compareModels.includes(i) ? `2px solid ${m.color}` : "1px solid #e5e7eb", cursor: "pointer" }}>{m.name}</button>
              ))}
            </div>
            <p style={{ fontSize: 11, color: "#94a3b8", marginBottom: 16 }}>Select 2-3 models to compare (click to toggle)</p>

            {/* Metric selector */}
            <div style={{ display: "flex", gap: 4, marginBottom: 20 }}>
              {["overall", "coding", "reasoning", "creative", "vision"].map(m => (
                <button key={m} onClick={() => setCompareMetric(m)} style={{ padding: "5px 12px", borderRadius: 8, fontSize: 11, fontWeight: 600, textTransform: "capitalize", background: compareMetric === m ? "#0f172a" : "white", color: compareMetric === m ? "white" : "#64748b", border: compareMetric === m ? "none" : "1px solid #e5e7eb", cursor: "pointer" }}>{m}</button>
              ))}
            </div>

            {/* Comparison cards */}
            <div style={{ display: "grid", gridTemplateColumns: `repeat(${compareModels.length}, 1fr)`, gap: 16, marginBottom: 24 }}>
              {compareModels.map(idx => {
                const m = AI_MODELS[idx];
                return (
                  <div key={m.name} style={{ background: "white", borderRadius: 16, border: `2px solid ${m.color}30`, overflow: "hidden" }}>
                    <div style={{ background: `linear-gradient(135deg, ${m.color}20, ${m.color}08)`, padding: "16px 20px", borderBottom: `1px solid ${m.color}20` }}>
                      <h3 style={{ fontSize: 16, fontWeight: 800, color: m.color, marginBottom: 2 }}>{m.name}</h3>
                      <p style={{ fontSize: 11, color: "#64748b" }}>{m.provider}</p>
                    </div>
                    <div style={{ padding: 20 }}>
                      {/* Score */}
                      <div style={{ textAlign: "center", marginBottom: 16 }}>
                        <div style={{ fontSize: 36, fontWeight: 900, color: m.color }}>{m[compareMetric]}</div>
                        <div style={{ fontSize: 11, color: "#94a3b8", textTransform: "capitalize" }}>{compareMetric} Score</div>
                      </div>
                      {/* All metrics */}
                      {["coding", "reasoning", "creative", "vision", "overall"].map(metric => (
                        <div key={metric} style={{ marginBottom: 8 }}>
                          <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, marginBottom: 3 }}>
                            <span style={{ color: "#64748b", textTransform: "capitalize", fontWeight: compareMetric === metric ? 700 : 400 }}>{metric}</span>
                            <span style={{ fontWeight: 700, color: compareMetric === metric ? m.color : "#0f172a" }}>{m[metric]}</span>
                          </div>
                          <ProgressBar value={m[metric]} max={100} color={compareMetric === metric ? m.color : "#cbd5e1"} height={4} />
                        </div>
                      ))}
                      {/* Specs */}
                      <div style={{ marginTop: 16, paddingTop: 12, borderTop: "1px solid #f1f5f9" }}>
                        {[
                          { label: "Parameters", val: m.params },
                          { label: "Context", val: m.context },
                          { label: "Pricing", val: m.pricing },
                          { label: "Speed", val: m.speed },
                        ].map(spec => (
                          <div key={spec.label} style={{ display: "flex", justifyContent: "space-between", fontSize: 11, padding: "4px 0", borderBottom: "1px solid #f8fafc" }}>
                            <span style={{ color: "#94a3b8" }}>{spec.label}</span>
                            <span style={{ fontWeight: 600, color: "#334155" }}>{spec.val}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Instructor Modal */}
      {showInstructorModal && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 100 }} onClick={() => setShowInstructorModal(false)}>
          <div onClick={e => e.stopPropagation()} style={{ background: "white", borderRadius: 20, padding: 32, maxWidth: 480, width: "90%" }}>
            <h2 style={{ fontSize: 18, fontWeight: 800, color: "#0f172a", marginBottom: 4 }}>🎓 Become an Instructor</h2>
            <p style={{ fontSize: 13, color: "#64748b", marginBottom: 20 }}>Share your AI expertise. You keep 70% of course revenue.</p>
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <div>
                <label style={{ fontSize: 12, fontWeight: 600, color: "#334155", display: "block", marginBottom: 4 }}>Full Name</label>
                <input value={instructorForm.name} onChange={e => setInstructorForm({ ...instructorForm, name: e.target.value })} placeholder="Your name" style={{ width: "100%", padding: "10px 14px", borderRadius: 10, border: "1px solid #e5e7eb", fontSize: 13, fontFamily: "inherit" }} />
              </div>
              <div>
                <label style={{ fontSize: 12, fontWeight: 600, color: "#334155", display: "block", marginBottom: 4 }}>Area of Expertise</label>
                <select value={instructorForm.expertise} onChange={e => setInstructorForm({ ...instructorForm, expertise: e.target.value })} style={{ width: "100%", padding: "10px 14px", borderRadius: 10, border: "1px solid #e5e7eb", fontSize: 13, fontFamily: "inherit" }}>
                  <option value="">Select your expertise</option>
                  {CATEGORIES.filter(c => c.id !== "all").map(c => <option key={c.id} value={c.id}>{c.emoji} {c.label}</option>)}
                </select>
              </div>
              <div>
                <label style={{ fontSize: 12, fontWeight: 600, color: "#334155", display: "block", marginBottom: 4 }}>Bio / Teaching Experience</label>
                <textarea value={instructorForm.bio} onChange={e => setInstructorForm({ ...instructorForm, bio: e.target.value })} placeholder="Tell us about your background and what you'd like to teach..." rows={4} style={{ width: "100%", padding: "10px 14px", borderRadius: 10, border: "1px solid #e5e7eb", fontSize: 13, fontFamily: "inherit", resize: "vertical" }} />
              </div>
            </div>
            <div style={{ display: "flex", gap: 8, marginTop: 16 }}>
              <button onClick={() => { setShowInstructorModal(false); alert("Application submitted! We'll review and get back to you within 48 hours."); setInstructorForm({ name: "", expertise: "", bio: "" }); }} style={{ flex: 1, padding: "10px 0", borderRadius: 10, fontWeight: 700, fontSize: 13, background: "linear-gradient(135deg, #059669, #10b981)", color: "white", border: "none", cursor: "pointer" }}>Submit Application</button>
              <button onClick={() => setShowInstructorModal(false)} style={{ padding: "10px 20px", borderRadius: 10, fontWeight: 600, fontSize: 13, background: "white", color: "#64748b", border: "1px solid #e5e7eb", cursor: "pointer" }}>Cancel</button>
            </div>
            <div style={{ marginTop: 16, background: "#f0fdf4", borderRadius: 10, padding: 12, border: "1px solid #bbf7d0" }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: "#166534", marginBottom: 4 }}>💰 Revenue Split</div>
              <div style={{ fontSize: 11, color: "#475569" }}>You keep <b>70%</b> of every course sale. WhichAi handles hosting, payments, and marketing. Average instructor earns $2,400/month.</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
