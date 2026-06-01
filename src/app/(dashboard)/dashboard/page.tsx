"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { PostGrade } from "@/types";
import { Rocket, Trash2, Loader2 } from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

export default function DashboardPage() {
  const [grades, setGrades] = useState<PostGrade[]>([]);
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [selectedGrade, setSelectedGrade] = useState<PostGrade | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) return;

      const { data: profileData } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", userData.user.id)
        .single();

      setProfile(profileData);

      const { data: gradesData } = await supabase
        .from("post_grades")
        .select("*")
        .eq("user_id", userData.user.id)
        .order("created_at", { ascending: false });

      setGrades(gradesData || []);
      setLoading(false);
    };
    fetchData();
  }, []);

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this grade?")) return;
    await supabase.from("post_grades").delete().eq("id", id);
    setGrades(grades.filter((g) => g.id !== id));
    if (selectedGrade?.id === id) setSelectedGrade(null);
  };

  const stats = {
    total: grades.length,
    average:
      grades.length > 0
        ? Math.round(
            grades.reduce((sum, g) => sum + g.overall_score, 0) / grades.length
          )
        : 0,
    best:
      grades.length > 0
        ? grades.reduce((max, g) => (g.overall_score > max.overall_score ? g : max), grades[0])
        : null,
    thisMonth: profile?.grades_used_this_month || 0,
  };

  const chartData = grades
    .slice()
    .reverse()
    .map((g) => ({
      date: new Date(g.created_at).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      }),
      score: g.overall_score,
    }));

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 text-[#6366f1] animate-spin" />
      </div>
    );
  }

  if (grades.length === 0) {
    return (
      <div className="max-w-2xl mx-auto">
        <h1 className="text-2xl font-bold text-white mb-6">My Grades</h1>
        <div className="bg-[#111111] border border-[#2a2a2a] rounded-xl p-12 text-center">
          <Rocket className="w-12 h-12 text-[#6366f1] mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-white mb-2">
            No grades yet
          </h2>
          <p className="text-zinc-400 text-sm mb-6">
            Grade your first LinkedIn post to see your results here.
          </p>
          <Link
            href="/grade"
            className="inline-block px-6 py-3 bg-[#6366f1] text-white font-semibold rounded-lg hover:bg-[#5558e0] transition-colors"
          >
            Grade My First Post →
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold text-white">My Grades</h1>

      {/* Stats Row */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-[#111111] border border-[#2a2a2a] rounded-xl p-4">
          <p className="text-zinc-500 text-xs mb-1">Total Posts Graded</p>
          <p className="text-2xl font-bold text-white">{stats.total}</p>
        </div>
        <div className="bg-[#111111] border border-[#2a2a2a] rounded-xl p-4">
          <p className="text-zinc-500 text-xs mb-1">Average Score</p>
          <p className="text-2xl font-bold text-white">{stats.average}</p>
        </div>
        <div className="bg-[#111111] border border-[#2a2a2a] rounded-xl p-4">
          <p className="text-zinc-500 text-xs mb-1">Best Score</p>
          <div className="flex items-center gap-2">
            <p className="text-2xl font-bold text-white">
              {stats.best?.overall_score || 0}
            </p>
            <span className="text-sm text-[#6366f1] font-medium">
              {stats.best?.grade_label}
            </span>
          </div>
        </div>
        <div className="bg-[#111111] border border-[#2a2a2a] rounded-xl p-4">
          <p className="text-zinc-500 text-xs mb-1">This Month</p>
          <p className="text-2xl font-bold text-white">
            {profile?.subscription_status === "active" ? (
              <span className="text-green-400">Unlimited</span>
            ) : (
              `${stats.thisMonth}/3 used`
            )}
          </p>
        </div>
      </div>

      {/* Score Trend Chart */}
      <div className="bg-[#111111] border border-[#2a2a2a] rounded-xl p-6 relative">
        <h3 className="text-lg font-semibold text-white mb-4">
          Score Trend (30 days)
        </h3>
        {profile?.subscription_status !== "active" ? (
          <div className="relative h-64">
            <div className="absolute inset-0 blur-sm opacity-30 pointer-events-none">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#2a2a2a" />
                  <XAxis dataKey="date" stroke="#666" fontSize={12} />
                  <YAxis domain={[0, 100]} stroke="#666" fontSize={12} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#111",
                      border: "1px solid #2a2a2a",
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="score"
                    stroke="#6366f1"
                    strokeWidth={2}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#0a0a0a]/80">
              <p className="text-white font-semibold mb-2">Pro Feature</p>
              <p className="text-zinc-400 text-sm text-center max-w-xs mb-4">
                Upgrade to Pro to track your score trends over time
              </p>
              <Link
                href="/api/stripe/checkout"
                className="px-4 py-2 bg-[#6366f1] text-white rounded-lg text-sm hover:bg-[#5558e0] transition-colors"
              >
                Upgrade to Pro
              </Link>
            </div>
          </div>
        ) : (
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#2a2a2a" />
                <XAxis dataKey="date" stroke="#666" fontSize={12} />
                <YAxis domain={[0, 100]} stroke="#666" fontSize={12} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#111",
                    border: "1px solid #2a2a2a",
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="score"
                  stroke="#6366f1"
                  strokeWidth={2}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      {/* Grades List */}
      <div>
        <h3 className="text-lg font-semibold text-white mb-4">
          Grade History
        </h3>
        <div className="space-y-3">
          {grades.map((grade) => (
            <div
              key={grade.id}
              className="bg-[#111111] border border-[#2a2a2a] rounded-xl p-4 flex items-center justify-between hover:border-[#6366f1]/50 transition-colors"
            >
              <button
                onClick={() =>
                  setSelectedGrade(selectedGrade?.id === grade.id ? null : grade)
                }
                className="flex-1 text-left"
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-[#6366f1]/20 flex items-center justify-center">
                    <span className="text-sm font-bold text-[#6366f1]">
                      {grade.grade_label}
                    </span>
                  </div>
                  <div>
                    <p className="text-white text-sm font-medium line-clamp-1">
                      {grade.post_content.slice(0, 80)}...
                    </p>
                    <p className="text-zinc-500 text-xs">
                      {new Date(grade.created_at).toLocaleDateString()}
                      {" · "}
                      Score: {grade.overall_score}
                    </p>
                  </div>
                </div>
              </button>
              <button
                onClick={() => handleDelete(grade.id)}
                className="p-2 text-zinc-500 hover:text-red-400 transition-colors"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Selected Grade Detail */}
      {selectedGrade && (
        <div className="bg-[#111111] border border-[#2a2a2a] rounded-xl p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Grade Details</h3>
          <div className="flex items-center gap-4 mb-4">
            <span className="text-4xl font-bold text-white">
              {selectedGrade.overall_score}
            </span>
            <span className="text-zinc-400">/ 100</span>
            <span className="text-xl font-bold text-[#6366f1]">
              {selectedGrade.grade_label}
            </span>
          </div>
          <p className="text-zinc-300 text-sm mb-4">
            {selectedGrade.overall_summary}
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            <div className="bg-[#1a1a1a] rounded-lg p-3">
              <p className="text-xs text-zinc-500">Hook</p>
              <p className="text-white font-semibold">{selectedGrade.hook_score}/10</p>
            </div>
            <div className="bg-[#1a1a1a] rounded-lg p-3">
              <p className="text-xs text-zinc-500">Readability</p>
              <p className="text-white font-semibold">{selectedGrade.readability_score}/10</p>
            </div>
            <div className="bg-[#1a1a1a] rounded-lg p-3">
              <p className="text-xs text-zinc-500">Scroll-Stop</p>
              <p className="text-white font-semibold">{selectedGrade.scroll_stop_score}/10</p>
            </div>
            <div className="bg-[#1a1a1a] rounded-lg p-3">
              <p className="text-xs text-zinc-500">Engagement</p>
              <p className="text-white font-semibold">{selectedGrade.engagement_score}/10</p>
            </div>
            <div className="bg-[#1a1a1a] rounded-lg p-3">
              <p className="text-xs text-zinc-500">Format</p>
              <p className="text-white font-semibold">{selectedGrade.format_score}/10</p>
            </div>
            <div className="bg-[#1a1a1a] rounded-lg p-3">
              <p className="text-xs text-zinc-500">CTA</p>
              <p className="text-white font-semibold">{selectedGrade.cta_score}/10</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}