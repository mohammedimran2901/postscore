"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { GradeResult, PostGrade } from "@/types";
import Link from "next/link";
import { Copy, ChevronDown, ChevronUp, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

function getScoreColor(score: number) {
  if (score >= 9) return "bg-[#6366f1]";
  if (score >= 7) return "bg-green-500";
  if (score >= 5) return "bg-amber-500";
  return "bg-red-500";
}

export default function GradePage() {
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<(GradeResult & { grade_id?: string }) | null>(null);
  const [error, setError] = useState("");
  const [profile, setProfile] = useState<any>(null);
  const [rewriteLoading, setRewriteLoading] = useState(false);
  const [rewriteResult, setRewriteResult] = useState<any>(null);
  const [showWhatChanged, setShowWhatChanged] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const fetchProfile = async () => {
      const { data: userData } = await supabase.auth.getUser();
      if (userData.user) {
        const { data } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", userData.user.id)
          .single();
        setProfile(data);
      }
    };
    fetchProfile();
  }, []);

  const handleGrade = async () => {
    if (content.length < 50) {
      setError("Post must be at least 50 characters");
      return;
    }
    setLoading(true);
    setError("");
    setResult(null);
    setRewriteResult(null);

    try {
      const res = await fetch("/api/grade", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ post_content: content }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.message || data.error || "Failed to grade");
      } else {
        setResult(data);
        // Refresh profile to update grade count
        const { data: userData } = await supabase.auth.getUser();
        if (userData.user) {
          const { data: p } = await supabase
            .from("profiles")
            .select("*")
            .eq("id", userData.user.id)
            .single();
          setProfile(p);
        }
      }
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleRewrite = async () => {
    if (!result?.grade_id) return;
    setRewriteLoading(true);
    try {
      const res = await fetch("/api/rewrite", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ grade_id: result.grade_id }),
      });
      const data = await res.json();
      if (res.ok) {
        setRewriteResult(data);
      }
    } catch {
      // error handled silently
    } finally {
      setRewriteLoading(false);
    }
  };

  const isFree = profile?.subscription_status !== "active";
  const gradesUsed = profile?.grades_used_this_month || 0;
  const isLimitReached = isFree && gradesUsed >= 3;

  return (
    <div className="max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold text-white mb-2">Grade a Post</h1>
      <p className="text-zinc-400 text-sm mb-6">
        Paste your LinkedIn post below for an instant AI score.
      </p>

      {isLimitReached ? (
        <div className="bg-[#111111] border border-[#2a2a2a] rounded-xl p-6 text-center">
          <p className="text-white mb-4">
            You've used your 3 free grades this month. Upgrade to Pro for
            unlimited grades.
          </p>
          <Link
            href="/api/stripe/checkout"
            className="inline-block px-6 py-3 bg-[#6366f1] text-white font-semibold rounded-lg hover:bg-[#5558e0] transition-colors"
          >
            Upgrade Now →
          </Link>
        </div>
      ) : (
        <>
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
            disabled={loading || content.length < 50}
            className="w-full mt-4 py-4 bg-[#6366f1] text-white font-semibold rounded-xl text-lg hover:bg-[#5558e0] transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Grading...
              </>
            ) : (
              "Grade This Post →"
            )}
          </button>
        </>
      )}

      {loading && !result && (
        <div className="mt-8 space-y-4">
          <div className="h-32 bg-[#111111] border border-[#2a2a2a] rounded-xl animate-pulse" />
          <div className="h-48 bg-[#111111] border border-[#2a2a2a] rounded-xl animate-pulse" />
        </div>
      )}

      {result && (
        <div className="mt-10 space-y-6">
          {/* Top Score */}
          <div className="bg-[#111111] border border-[#2a2a2a] rounded-xl p-6 text-center">
            <div className="flex items-center justify-center gap-4 mb-4">
              <span className="text-6xl font-bold text-white">
                {result.overall_score}
              </span>
              <span className="text-zinc-400">/ 100</span>
              <div className="w-16 h-16 rounded-full bg-[#6366f1]/20 flex items-center justify-center border-2 border-[#6366f1]">
                <span className="text-2xl font-bold text-[#6366f1]">
                  {result.grade_label}
                </span>
              </div>
            </div>
            <p className="text-zinc-300 text-sm">{result.overall_summary}</p>
          </div>

          {/* Strength/Weakness */}
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="bg-green-500/5 border border-green-500/20 rounded-xl p-4">
              <p className="text-green-400 text-sm font-medium mb-2">
                💪 Top Strength
              </p>
              <p className="text-white text-sm">{result.top_strength}</p>
            </div>
            <div className="bg-red-500/5 border border-red-500/20 rounded-xl p-4">
              <p className="text-red-400 text-sm font-medium mb-2">
                ⚠️ Biggest Weakness
              </p>
              <p className="text-white text-sm">{result.top_weakness}</p>
            </div>
          </div>

          {/* Score Breakdown */}
          <div>
            <h3 className="text-lg font-semibold text-white mb-4">
              Score Breakdown
            </h3>
            <div className="grid sm:grid-cols-2 gap-4">
              {[
                { label: "Hook", score: result.hook_score, feedback: result.hook_feedback, icon: "🎣" },
                { label: "Readability", score: result.readability_score, feedback: result.readability_feedback, icon: "📖" },
                { label: "Scroll-Stop", score: result.scroll_stop_score, feedback: result.scroll_stop_feedback, icon: "⚡" },
                { label: "Engagement", score: result.engagement_score, feedback: result.engagement_feedback, icon: "💬" },
                { label: "Format", score: result.format_score, feedback: result.format_feedback, icon: "📐" },
                { label: "CTA", score: result.cta_score, feedback: result.cta_feedback, icon: "🎯" },
              ].map((dim) => (
                <div
                  key={dim.label}
                  className="bg-[#111111] border border-[#2a2a2a] rounded-xl p-4"
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <span>{dim.icon}</span>
                      <span className="text-white text-sm font-medium">
                        {dim.label}
                      </span>
                    </div>
                    <span className="text-white font-semibold">
                      {dim.score}/10
                    </span>
                  </div>
                  <div className="h-2 bg-[#1a1a1a] rounded-full overflow-hidden mb-3">
                    <div
                      className={cn("h-full rounded-full", getScoreColor(dim.score))}
                      style={{ width: `${(dim.score / 10) * 100}%` }}
                    />
                  </div>
                  <p className="text-zinc-400 text-xs leading-relaxed">
                    {dim.feedback}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* AI Rewrite Section */}
          <div className="relative">
            {isFree ? (
              <div className="bg-[#111111] border border-[#2a2a2a] rounded-xl p-6 relative overflow-hidden">
                <div className="blur-sm opacity-50 pointer-events-none">
                  <h3 className="text-lg font-semibold text-white mb-2">
                    ✨ AI Rewrite
                  </h3>
                  <p className="text-zinc-400 text-sm mb-4">
                    Let AI rewrite this post with a stronger hook, cleaner
                    format, and better CTA.
                  </p>
                  <div className="h-20 bg-[#1a1a1a] rounded-lg" />
                </div>
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#0a0a0a]/90">
                  <p className="text-2xl mb-2">🔒</p>
                  <p className="text-white font-semibold mb-1">
                    AI Rewrite — Pro Feature
                  </p>
                  <p className="text-zinc-400 text-sm text-center max-w-xs mb-4">
                    See how your post looks when rewritten by AI with a stronger
                    hook and better CTA.
                  </p>
                  <Link
                    href="/api/stripe/checkout"
                    className="px-6 py-2 bg-[#6366f1] text-white rounded-lg font-medium hover:bg-[#5558e0] transition-colors"
                  >
                    Unlock with Pro — 7 Day Free Trial →
                  </Link>
                </div>
              </div>
            ) : (
              <div className="bg-[#111111] border border-[#2a2a2a] rounded-xl p-6">
                <h3 className="text-lg font-semibold text-white mb-2">
                  ✨ AI Rewrite
                </h3>
                <p className="text-zinc-400 text-sm mb-4">
                  Let AI rewrite this post with a stronger hook, cleaner format,
                  and better CTA.
                </p>
                {!rewriteResult && (
                  <button
                    onClick={handleRewrite}
                    disabled={rewriteLoading}
                    className="px-6 py-2 border border-[#6366f1] text-[#6366f1] rounded-lg font-medium hover:bg-[#6366f1]/10 transition-colors disabled:opacity-50 flex items-center gap-2"
                  >
                    {rewriteLoading ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Rewriting...
                      </>
                    ) : (
                      "Rewrite My Post →"
                    )}
                  </button>
                )}

                {rewriteResult && (
                  <div className="space-y-4">
                    <div className="bg-[#1a1a1a] rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-medium text-[#6366f1]">
                          New Hook
                        </span>
                        <button
                          onClick={() =>
                            navigator.clipboard.writeText(rewriteResult.rewrite_hook)
                          }
                          className="text-zinc-500 hover:text-white"
                        >
                          <Copy className="w-4 h-4" />
                        </button>
                      </div>
                      <p className="text-white text-sm">
                        {rewriteResult.rewrite_hook}
                      </p>
                    </div>
                    <div className="bg-[#1a1a1a] rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-medium text-green-400">
                          Rewritten Body
                        </span>
                        <button
                          onClick={() =>
                            navigator.clipboard.writeText(rewriteResult.rewrite_body)
                          }
                          className="text-zinc-500 hover:text-white"
                        >
                          <Copy className="w-4 h-4" />
                        </button>
                      </div>
                      <p className="text-white text-sm whitespace-pre-line">
                        {rewriteResult.rewrite_body}
                      </p>
                    </div>
                    <div className="bg-[#1a1a1a] rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-medium text-amber-400">
                          New CTA
                        </span>
                        <button
                          onClick={() =>
                            navigator.clipboard.writeText(rewriteResult.rewrite_cta)
                          }
                          className="text-zinc-500 hover:text-white"
                        >
                          <Copy className="w-4 h-4" />
                        </button>
                      </div>
                      <p className="text-white text-sm">
                        {rewriteResult.rewrite_cta}
                      </p>
                    </div>

                    <button
                      onClick={() => setShowWhatChanged(!showWhatChanged)}
                      className="flex items-center gap-2 text-sm text-zinc-400 hover:text-white transition-colors"
                    >
                      What changed
                      {showWhatChanged ? (
                        <ChevronUp className="w-4 h-4" />
                      ) : (
                        <ChevronDown className="w-4 h-4" />
                      )}
                    </button>
                    {showWhatChanged && (
                      <p className="text-zinc-400 text-sm leading-relaxed">
                        {rewriteResult.what_changed}
                      </p>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Bottom Actions */}
          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={() => {
                setContent("");
                setResult(null);
                setRewriteResult(null);
              }}
              className="flex-1 py-3 border border-[#2a2a2a] text-white rounded-lg font-medium hover:border-[#6366f1] transition-colors"
            >
              Grade Another Post
            </button>
            <Link
              href="/dashboard"
              className="flex-1 py-3 border border-[#2a2a2a] text-white rounded-lg font-medium hover:border-[#6366f1] transition-colors text-center"
            >
              View My History →
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}