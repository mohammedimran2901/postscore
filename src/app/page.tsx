"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Zap,
  Clipboard,
  TrendingUp,
  EyeOff,
  BarChart3,
  Clock,
  Check,
  X,
  ChevronDown,
  Copy,
} from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

// ==================== UI COMPONENTS ====================

function Navbar() {
  return (
    <nav className="sticky top-0 z-50 bg-[#0a0a0a]/80 backdrop-blur-md border-b border-[#2a2a2a]">
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
        <Link href="/" className="text-xl font-bold text-white">
          PostScore
        </Link>
        <div className="flex items-center gap-4">
          <Link
            href="/login"
            className="text-sm text-zinc-400 hover:text-white transition-colors"
          >
            Sign In
          </Link>
          <Link
            href="/signup"
            className="px-4 py-2 text-sm font-medium bg-[#6366f1] text-white rounded-lg hover:bg-[#5558e0] transition-colors"
          >
            Start Free
          </Link>
        </div>
      </div>
    </nav>
  );
}

function AnimatedScoreCard() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const scores = [
    { label: "Hook", score: 7.5, color: "bg-[#6366f1]" },
    { label: "Readability", score: 8.0, color: "bg-green-500" },
    { label: "Scroll-Stop", score: 6.5, color: "bg-amber-500" },
    { label: "Engagement", score: 7.0, color: "bg-[#6366f1]" },
    { label: "Format", score: 8.5, color: "bg-green-500" },
    { label: "CTA", score: 5.5, color: "bg-amber-500" },
  ];

  return (
    <div className="bg-[#111111] border border-[#2a2a2a] rounded-2xl p-6 max-w-md mx-auto shadow-2xl">
      <div className="flex items-center gap-4 mb-6">
        <div className="relative">
          <div className="text-5xl font-bold text-white">73</div>
          <div className="text-sm text-zinc-400">/ 100</div>
        </div>
        <div className="w-14 h-14 rounded-full bg-[#6366f1]/20 flex items-center justify-center border-2 border-[#6366f1]">
          <span className="text-2xl font-bold text-[#6366f1]">B</span>
        </div>
      </div>
      <div className="space-y-3">
        {scores.map((s, i) => (
          <div key={s.label} className="flex items-center gap-3">
            <span className="text-xs text-zinc-400 w-24">{s.label}</span>
            <div className="flex-1 h-2 bg-[#1a1a1a] rounded-full overflow-hidden">
              <motion.div
                className={cn("h-full rounded-full", s.color)}
                initial={{ width: 0 }}
                animate={mounted ? { width: `${(s.score / 10) * 100}%` } : {}}
                transition={{ delay: i * 0.15, duration: 0.8, ease: "easeOut" }}
              />
            </div>
            <span className="text-xs text-zinc-300 w-8 text-right">
              {s.score}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ==================== SECTIONS ====================

function HeroSection() {
  const scrollToDemo = () => {
    document.getElementById("demo")?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <section className="min-h-[calc(100vh-64px)] flex flex-col items-center justify-center px-4 py-20">
      <p className="text-[#6366f1] text-xs font-semibold uppercase tracking-[0.2em] mb-6">
        LinkedIn Post Grader
      </p>
      <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-white text-center leading-tight max-w-4xl mb-6">
        Most LinkedIn posts
        <br />
        get ignored.
        <br />
        Yours doesn't have to.
      </h1>
      <p className="text-zinc-400 text-center max-w-xl mb-10 text-base sm:text-lg leading-relaxed">
        Paste your post. Get an instant AI score across 6 performance
        dimensions. See exactly what's killing your reach — and how to fix
        it in 60 seconds.
      </p>
      <div className="flex flex-col sm:flex-row gap-4 mb-8">
        <Link
          href="/signup"
          className="px-8 py-4 bg-[#6366f1] text-white font-semibold rounded-full text-lg hover:bg-[#5558e0] transition-colors text-center"
        >
          Grade My Post Free →
        </Link>
        <button
          onClick={scrollToDemo}
          className="px-8 py-4 border border-[#2a2a2a] text-white font-semibold rounded-full text-lg hover:border-[#6366f1] hover:text-[#6366f1] transition-colors"
        >
          See a sample score
        </button>
      </div>
      <p className="text-zinc-500 text-sm mb-16">
        ✓ Free forever • ✓ No credit card required • ✓ 3 free grades per month
      </p>
      <AnimatedScoreCard />
    </section>
  );
}

function SocialProofBar() {
  return (
    <section className="bg-[#111111] border-y border-[#2a2a2a] py-10">
      <div className="max-w-4xl mx-auto px-4 text-center">
        <p className="text-zinc-300 mb-4">
          Join 1,200+ founders, marketers, and creators who've graded their
          posts
        </p>
        <div className="flex items-center justify-center gap-2">
          {["SK", "MT", "PS", "JO", "AL"].map((initials, i) => (
            <div
              key={initials}
              className={cn(
                "w-10 h-10 rounded-full flex items-center justify-center text-xs font-bold text-white",
                [
                  "bg-[#6366f1]",
                  "bg-[#4f46e5]",
                  "bg-[#4338ca]",
                  "bg-[#3730a3]",
                  "bg-[#312e81]",
                ][i]
              )}
            >
              {initials}
            </div>
          ))}
          <span className="ml-3 text-amber-400 text-sm">
            ★★★★★ 4.9/5 from early users
          </span>
        </div>
      </div>
    </section>
  );
}

function ProblemSection() {
  const problems = [
    {
      icon: <EyeOff className="w-6 h-6" />,
      title: "Your hook is invisible",
      body: "76% of LinkedIn posts are scrolled past within 0.3 seconds. If your first line doesn't create instant curiosity or stakes, the rest of your post doesn't exist.",
    },
    {
      icon: <BarChart3 className="w-6 h-6" />,
      title: "You're guessing at what works",
      body: "Most creators post, check their notifications, feel vaguely disappointed, and repeat. Without data, you have no idea if you're improving or just getting lucky.",
    },
    {
      icon: <Clock className="w-6 h-6" />,
      title: "Rewrites take hours, not minutes",
      body: "You know a post could be better. But staring at it for an extra 45 minutes and changing three words isn't a strategy. You need specific, instant feedback.",
    },
  ];

  return (
    <section className="py-24 px-4 max-w-6xl mx-auto">
      <h2 className="text-3xl sm:text-4xl font-bold text-white text-center mb-4">
        Your posts are losing before anyone reads them
      </h2>
      <p className="text-zinc-400 text-center max-w-2xl mx-auto mb-16">
        The algorithm doesn't care how hard you worked on it. It only cares
        if people engage — and most posts never give them a reason to.
      </p>
      <div className="grid md:grid-cols-3 gap-6 mb-16">
        {problems.map((p) => (
          <div
            key={p.title}
            className="bg-[#111111] border border-[#2a2a2a] rounded-xl p-6"
          >
            <div className="text-[#6366f1] mb-4">{p.icon}</div>
            <h3 className="text-lg font-semibold text-white mb-3">{p.title}</h3>
            <p className="text-zinc-400 text-sm leading-relaxed">{p.body}</p>
          </div>
        ))}
      </div>
      <blockquote className="border-l-4 border-[#6366f1] bg-[#111111] rounded-r-xl p-6 max-w-3xl mx-auto">
        <p className="text-zinc-300 italic mb-3">
          "I've been posting on LinkedIn for 2 years and never knew my
          hooks were the problem. PostScore told me in 30 seconds what my
          engagement data never could."
        </p>
        <cite className="text-zinc-500 text-sm">— Sarah K., SaaS Founder</cite>
      </blockquote>
    </section>
  );
}

function HowItWorksSection() {
  const steps = [
    {
      number: "01",
      icon: <Clipboard className="w-6 h-6" />,
      title: "Paste your post",
      body: "Copy your LinkedIn post — published or draft — and paste it into PostScore. Works with any length, any format.",
    },
    {
      number: "02",
      icon: <Zap className="w-6 h-6" />,
      title: "AI grades it instantly",
      body: "Our AI analyses your post across 6 performance dimensions. You get a score, a grade, and specific sentence-level feedback within seconds.",
    },
    {
      number: "03",
      icon: <TrendingUp className="w-6 h-6" />,
      title: "Fix it and grow",
      body: "See exactly what's dragging your score down. Pro users get an AI-rewritten version of their post, ready to copy and publish.",
    },
  ];

  return (
    <section className="py-24 px-4 bg-[#111111]">
      <div className="max-w-6xl mx-auto">
        <h2 className="text-3xl sm:text-4xl font-bold text-white text-center mb-16">
          From post to score in 60 seconds
        </h2>
        <div className="grid md:grid-cols-3 gap-8 relative">
          {steps.map((step, i) => (
            <div key={step.number} className="text-center relative">
              {i < steps.length - 1 && (
                <div className="hidden md:block absolute top-12 left-[60%] w-[80%] h-px bg-[#2a2a2a]" />
              )}
              <div className="text-4xl font-bold text-[#6366f1]/30 mb-4">
                {step.number}
              </div>
              <div className="w-14 h-14 rounded-xl bg-[#1a1a1a] border border-[#2a2a2a] flex items-center justify-center text-[#6366f1] mx-auto mb-5">
                {step.icon}
              </div>
              <h3 className="text-xl font-semibold text-white mb-3">
                {step.title}
              </h3>
              <p className="text-zinc-400 text-sm leading-relaxed max-w-xs mx-auto">
                {step.body}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function DemoSection() {
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState("");

  const handleGrade = async () => {
    if (content.length < 50) {
      setError("Post must be at least 50 characters");
      return;
    }
    setLoading(true);
    setError("");
    setResult(null);

    try {
      const res = await fetch("/api/grade/demo", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ post_content: content }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.message || data.error || "Failed to grade");
      } else {
        setResult(data);
      }
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section id="demo" className="py-24 px-4 max-w-3xl mx-auto">
      <h2 className="text-3xl sm:text-4xl font-bold text-white text-center mb-4">
        Try it right now — no account needed
      </h2>
      <p className="text-zinc-400 text-center mb-10">
        Paste any LinkedIn post below and see your score instantly. One free
        demo grade, no signup required.
      </p>
      <div className="relative">
        <textarea
          className="w-full h-48 bg-[#111111] border border-[#2a2a2a] rounded-xl p-4 text-white placeholder:text-zinc-600 resize-none focus:outline-none focus:border-[#6366f1] transition-colors"
          placeholder="Paste your LinkedIn post here (50–3,000 characters)..."
          value={content}
          onChange={(e) => setContent(e.target.value)}
          maxLength={3000}
        />
        <div className="absolute bottom-3 right-3 text-xs text-zinc-500">
          {content.length}/3000
        </div>
      </div>
      {error && <p className="text-red-400 text-sm mt-3">{error}</p>}
      <button
        onClick={handleGrade}
        disabled={loading}
        className="w-full mt-4 py-4 bg-[#6366f1] text-white font-semibold rounded-xl text-lg hover:bg-[#5558e0] transition-colors disabled:opacity-50"
      >
        {loading ? "Grading..." : "Grade This Post →"}
      </button>

      {loading && (
        <div className="mt-8 space-y-4">
          <div className="h-32 bg-[#111111] border border-[#2a2a2a] rounded-xl animate-pulse" />
          <div className="h-48 bg-[#111111] border border-[#2a2a2a] rounded-xl animate-pulse" />
        </div>
      )}

      {result && (
        <div className="mt-8">
          <div className="bg-[#111111] border border-[#2a2a2a] rounded-xl p-6">
            <div className="flex items-center gap-4 mb-4">
              <div className="text-4xl font-bold text-white">
                {result.overall_score}
              </div>
              <div className="text-sm text-zinc-400">/ 100</div>
              <div className="w-12 h-12 rounded-full bg-[#6366f1]/20 flex items-center justify-center border-2 border-[#6366f1]">
                <span className="text-xl font-bold text-[#6366f1]">
                  {result.grade_label}
                </span>
              </div>
            </div>
            <p className="text-zinc-300 text-sm mb-6">
              {result.overall_summary}
            </p>
            <div className="grid grid-cols-2 gap-3 mb-6">
              <div className="bg-[#1a1a1a] rounded-lg p-3">
                <div className="text-xs text-zinc-500 mb-1">Hook</div>
                <div className="text-lg font-semibold text-white">
                  {result.hook_score}/10
                </div>
              </div>
              <div className="bg-[#1a1a1a] rounded-lg p-3">
                <div className="text-xs text-zinc-500 mb-1">Readability</div>
                <div className="text-lg font-semibold text-white">
                  {result.readability_score}/10
                </div>
              </div>
              <div className="bg-[#1a1a1a] rounded-lg p-3">
                <div className="text-xs text-zinc-500 mb-1">Scroll-Stop</div>
                <div className="text-lg font-semibold text-white">
                  {result.scroll_stop_score}/10
                </div>
              </div>
              <div className="bg-[#1a1a1a] rounded-lg p-3">
                <div className="text-xs text-zinc-500 mb-1">Engagement</div>
                <div className="text-lg font-semibold text-white">
                  {result.engagement_score}/10
                </div>
              </div>
              <div className="bg-[#1a1a1a] rounded-lg p-3">
                <div className="text-xs text-zinc-500 mb-1">Format</div>
                <div className="text-lg font-semibold text-white">
                  {result.format_score}/10
                </div>
              </div>
              <div className="bg-[#1a1a1a] rounded-lg p-3">
                <div className="text-xs text-zinc-500 mb-1">CTA</div>
                <div className="text-lg font-semibold text-white">
                  {result.cta_score}/10
                </div>
              </div>
            </div>
          </div>
          <div className="mt-6 text-center">
            <p className="text-zinc-400 mb-3">
              Want unlimited grades + AI rewrites?
            </p>
            <Link
              href="/signup"
              className="text-[#6366f1] hover:underline font-medium"
            >
              Create your free account →
            </Link>
          </div>
        </div>
      )}
    </section>
  );
}

function ScoreExplainerSection() {
  const cards = [
    {
      icon: "🎣",
      title: "Hook",
      body: "The first 2 lines of your post determine if anyone reads the rest. We score how well your opening creates curiosity, stakes, or surprise.",
    },
    {
      icon: "📖",
      title: "Readability",
      body: "LinkedIn readers are distracted. We measure sentence length, paragraph density, and visual scannability — the invisible factors that affect whether people actually read to the end.",
    },
    {
      icon: "⚡",
      title: "Scroll-Stop Power",
      body: "Would a stranger pause their scroll for this? We evaluate the emotional and intellectual pull of your post — the 'wait, I need to read this' factor.",
    },
    {
      icon: "💬",
      title: "Engagement Bait",
      body: "Comments are the algorithm's love language. We score how well your post invites responses — through questions, controversial takes, or genuine calls for input.",
    },
    {
      icon: "📐",
      title: "Format",
      body: "Walls of text kill reach. We check your line breaks, sentence structure, hashtag usage, and visual rhythm to ensure your post is easy to consume.",
    },
    {
      icon: "🎯",
      title: "Call to Action",
      body: "What do you want readers to do next? We score the clarity, specificity, and placement of your CTA — whether that's following you, clicking a link, or leaving a comment.",
    },
  ];

  return (
    <section className="py-24 px-4 bg-[#111111]">
      <div className="max-w-6xl mx-auto">
        <h2 className="text-3xl sm:text-4xl font-bold text-white text-center mb-16">
          Six dimensions. One score. Total clarity.
        </h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {cards.map((card) => (
            <div
              key={card.title}
              className="bg-[#0a0a0a] border border-[#2a2a2a] rounded-xl p-6"
            >
              <div className="text-3xl mb-4">{card.icon}</div>
              <h3 className="text-lg font-semibold text-white mb-3">
                {card.title}
              </h3>
              <p className="text-zinc-400 text-sm leading-relaxed">
                {card.body}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function TestimonialsSection() {
  const testimonials = [
    {
      quote:
        "I posted the same idea twice — once before PostScore, once after applying its feedback. The second post got 14x more comments. The hook was the entire difference.",
      name: "Marcus T.",
      role: "Marketing Director, B2B SaaS",
    },
    {
      quote:
        "My format score was a 3/10. I had no idea I was writing LinkedIn posts like blog paragraphs. Fixed the formatting, my next post tripled my usual impressions.",
      name: "Priya S.",
      role: "Startup Founder",
    },
    {
      quote:
        "The AI rewrite feature alone is worth $19 a month. It rewrote a post I'd spent 40 minutes on in 8 seconds, and the rewrite was genuinely better. Slightly humbling.",
      name: "James O.",
      role: "Content Creator, 22k followers",
    },
  ];

  return (
    <section className="py-24 px-4 max-w-6xl mx-auto">
      <h2 className="text-3xl sm:text-4xl font-bold text-white text-center mb-16">
        Posts that went from ignored to impossible to scroll past
      </h2>
      <div className="grid md:grid-cols-3 gap-6">
        {testimonials.map((t) => (
          <div
            key={t.name}
            className="bg-[#111111] border border-[#2a2a2a] rounded-xl p-6"
          >
            <div className="text-amber-400 text-sm mb-4">★★★★★</div>
            <p className="text-zinc-300 text-sm leading-relaxed mb-6 italic">
              "{t.quote}"
            </p>
            <div>
              <p className="text-white font-medium text-sm">{t.name}</p>
              <p className="text-zinc-500 text-xs">{t.role}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

function PricingSection() {
  return (
    <section className="py-24 px-4 bg-[#111111]">
      <div className="max-w-4xl mx-auto">
        <h2 className="text-3xl sm:text-4xl font-bold text-white text-center mb-4">
          Start free. Upgrade when you're ready.
        </h2>
        <p className="text-zinc-400 text-center mb-12">
          No contracts. Cancel anytime. 7-day free trial on Pro.
        </p>
        <div className="grid md:grid-cols-2 gap-6 max-w-3xl mx-auto">
          {/* Free Card */}
          <div className="bg-[#0a0a0a] border border-[#2a2a2a] rounded-xl p-6">
            <div className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-4">
              Free Forever
            </div>
            <div className="text-3xl font-bold text-white mb-1">$0</div>
            <div className="text-sm text-zinc-500 mb-6">
              No credit card required
            </div>
            <ul className="space-y-3 mb-8">
              {[
                "3 post grades per month",
                "Full score breakdown (all 6 dimensions)",
                "Written feedback on each dimension",
                "Overall grade (F to A+)",
                "Top strength + top weakness callout",
              ].map((f) => (
                <li key={f} className="flex items-center gap-2 text-sm text-zinc-300">
                  <Check className="w-4 h-4 text-green-500" /> {f}
                </li>
              ))}
              {[
                "AI post rewrite (Pro only)",
                "Unlimited grades (Pro only)",
                "Grade history + score trends (Pro only)",
                "Priority support (Pro only)",
              ].map((f) => (
                <li key={f} className="flex items-center gap-2 text-sm text-zinc-600">
                  <X className="w-4 h-4" /> {f}
                </li>
              ))}
            </ul>
            <Link
              href="/signup"
              className="block w-full py-3 text-center border border-[#2a2a2a] text-white rounded-lg font-medium hover:border-[#6366f1] hover:text-[#6366f1] transition-colors"
            >
              Start Grading Free
            </Link>
          </div>

          {/* Pro Card */}
          <div className="bg-[#0a0a0a] border-2 border-[#6366f1] rounded-xl p-6 relative scale-105">
            <div className="absolute -top-3 left-6 bg-[#6366f1] text-white text-xs font-semibold px-3 py-1 rounded-full">
              Most Popular — Pro
            </div>
            <div className="text-xs font-semibold text-[#6366f1] uppercase tracking-wider mb-4">
              Pro
            </div>
            <div className="flex items-baseline gap-1 mb-1">
              <span className="text-3xl font-bold text-white">$19</span>
              <span className="text-sm text-zinc-500">/month</span>
            </div>
            <div className="text-sm text-zinc-500 mb-6">
              7-day free trial
            </div>
            <ul className="space-y-3 mb-8">
              {[
                "Unlimited post grades",
                "Full score breakdown (all 6 dimensions)",
                "Written feedback on each dimension",
                "Overall grade (F to A+)",
                "Top strength + top weakness callout",
                "AI post rewrite (full rewrite in your voice)",
                "Grade history + 30-day score trend chart",
                "Before/after comparison view",
                "Priority email support",
                "Cancel anytime",
              ].map((f) => (
                <li key={f} className="flex items-center gap-2 text-sm text-zinc-300">
                  <Check className="w-4 h-4 text-green-500" /> {f}
                </li>
              ))}
            </ul>
            <Link
              href="/signup"
              className="block w-full py-3 text-center bg-[#6366f1] text-white rounded-lg font-medium hover:bg-[#5558e0] transition-colors"
            >
              Start 7-Day Free Trial →
            </Link>
          </div>
        </div>
        <p className="text-center text-zinc-500 text-sm mt-8">
          Questions? Email us at hello@postscore.ai — we reply within 24 hours.
        </p>
      </div>
    </section>
  );
}

function FAQSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const faqs = [
    {
      q: "Is it really free?",
      a: "Yes. The free plan gives you 3 post grades every month, forever. No credit card required to sign up. You only pay if you want unlimited grades and the AI rewrite feature.",
    },
    {
      q: "How accurate is the AI grading?",
      a: "The grading is based on patterns from thousands of high-performing LinkedIn posts. It's not a human coach, but it's also not generic. The 6 dimensions map to the specific factors the LinkedIn algorithm rewards — and that experienced content strategists look for. Think of it as a smart, fast first opinion.",
    },
    {
      q: "Will it grade posts in any language?",
      a: "Currently PostScore works best with English-language posts. The AI can process other languages but the feedback quality is optimised for English.",
    },
    {
      q: "What's included in the AI rewrite?",
      a: "Pro users get a full rewrite of their post — a new hook, rewritten body, and a stronger CTA — generated in your original voice. You also get an explanation of what changed and why. It takes about 8 seconds.",
    },
    {
      q: "Can I cancel anytime?",
      a: "Yes. Cancel from your account settings with one click. You keep Pro access until the end of your billing period.",
    },
    {
      q: "Is my post content stored?",
      a: "Yes, your graded posts are stored so you can track your score history over time (Pro feature). We never use your post content to train AI models or share it with third parties. You can delete your history at any time.",
    },
    {
      q: "I have 0 followers. Will this help me?",
      a: "Yes — especially you. The patterns that drive engagement are the same whether you have 100 or 100,000 followers. In fact, building good habits early (strong hooks, clean format, clear CTAs) is exactly how people grow their audience in the first place.",
    },
  ];

  return (
    <section className="py-24 px-4 max-w-3xl mx-auto">
      <h2 className="text-3xl sm:text-4xl font-bold text-white text-center mb-12">
        Questions we get asked
      </h2>
      <div className="space-y-3">
        {faqs.map((faq, i) => (
          <div
            key={i}
            className="bg-[#111111] border border-[#2a2a2a] rounded-xl overflow-hidden"
          >
            <button
              className="w-full flex items-center justify-between p-5 text-left"
              onClick={() => setOpenIndex(openIndex === i ? null : i)}
            >
              <span className="text-white font-medium text-sm">{faq.q}</span>
              <ChevronDown
                className={cn(
                  "w-5 h-5 text-zinc-400 transition-transform",
                  openIndex === i && "rotate-180"
                )}
              />
            </button>
            {openIndex === i && (
              <div className="px-5 pb-5">
                <p className="text-zinc-400 text-sm leading-relaxed">{faq.a}</p>
              </div>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}

function FinalCTASection() {
  return (
    <section className="py-24 px-4 bg-[#6366f1]">
      <div className="max-w-2xl mx-auto text-center">
        <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
          Your next post could be your best post.
        </h2>
        <p className="text-white/80 mb-8">
          Stop posting into the void. Get your first score free in 60 seconds.
        </p>
        <Link
          href="/signup"
          className="inline-block px-8 py-4 bg-white text-[#6366f1] font-semibold rounded-full text-lg hover:bg-zinc-100 transition-colors"
        >
          Grade My Post Now — It's Free →
        </Link>
        <p className="text-white/60 text-sm mt-6">
          ✓ No credit card · ✓ Setup in 30 seconds · ✓ 3 free grades per month
        </p>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="py-8 px-4 border-t border-[#2a2a2a]">
      <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
        <span className="text-white font-bold">PostScore</span>
        <p className="text-zinc-500 text-sm">
          © {new Date().getFullYear()} PostScore. All rights reserved.
        </p>
      </div>
    </footer>
  );
}

// ==================== MAIN PAGE ====================

export default function Home() {
  return (
    <main className="flex-1 bg-[#0a0a0a]">
      <Navbar />
      <HeroSection />
      <SocialProofBar />
      <ProblemSection />
      <HowItWorksSection />
      <DemoSection />
      <ScoreExplainerSection />
      <TestimonialsSection />
      <PricingSection />
      <FAQSection />
      <FinalCTASection />
      <Footer />
    </main>
  );
}