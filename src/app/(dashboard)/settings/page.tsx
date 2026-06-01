"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { Loader2, Trash2, AlertTriangle } from "lucide-react";

export default function SettingsPage() {
  const [profile, setProfile] = useState<any>(null);
  const [fullName, setFullName] = useState("");
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) return;

      const { data } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", userData.user.id)
        .single();

      setProfile(data);
      setFullName(data?.full_name || "");
      setLoading(false);
    };
    fetchProfile();
  }, []);

  const handleSaveProfile = async () => {
    setSaving(true);
    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user) return;

    await supabase
      .from("profiles")
      .update({ full_name: fullName })
      .eq("id", userData.user.id);

    setProfile({ ...profile, full_name: fullName });
    setSaving(false);
  };

  const handleDeleteHistory = async () => {
    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user) return;

    await supabase.from("post_grades").delete().eq("user_id", userData.user.id);
    setShowDeleteConfirm(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 text-[#6366f1] animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      <h1 className="text-2xl font-bold text-white">Settings</h1>

      {/* Profile Section */}
      <div className="bg-[#111111] border border-[#2a2a2a] rounded-xl p-6">
        <h2 className="text-lg font-semibold text-white mb-4">Profile</h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm text-zinc-400 mb-1">
              Full Name
            </label>
            <input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="w-full px-4 py-2 bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg text-white focus:outline-none focus:border-[#6366f1] transition-colors"
            />
          </div>
          <div>
            <label className="block text-sm text-zinc-400 mb-1">Email</label>
            <input
              type="email"
              value={profile?.email || ""}
              disabled
              className="w-full px-4 py-2 bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg text-zinc-500 cursor-not-allowed"
            />
          </div>
          <button
            onClick={handleSaveProfile}
            disabled={saving}
            className="px-4 py-2 bg-[#6366f1] text-white rounded-lg font-medium hover:bg-[#5558e0] transition-colors disabled:opacity-50"
          >
            {saving ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </div>

      {/* Subscription Section */}
      <div className="bg-[#111111] border border-[#2a2a2a] rounded-xl p-6">
        <h2 className="text-lg font-semibold text-white mb-4">Subscription</h2>
        {profile?.subscription_status === "active" ? (
          <div>
            <div className="flex items-center gap-2 mb-4">
              <span className="w-2 h-2 rounded-full bg-green-500" />
              <span className="text-green-400 font-medium">Pro Plan</span>
            </div>
            <p className="text-zinc-400 text-sm mb-4">
              You have unlimited access to all features.
            </p>
            {!showCancelConfirm ? (
              <button
                onClick={() => setShowCancelConfirm(true)}
                className="px-4 py-2 border border-red-500/30 text-red-400 rounded-lg font-medium hover:bg-red-500/10 transition-colors"
              >
                Cancel Subscription
              </button>
            ) : (
              <div className="bg-red-500/5 border border-red-500/20 rounded-lg p-4">
                <p className="text-red-400 text-sm mb-3">
                  Are you sure? You'll lose Pro access at the end of your billing
                  period.
                </p>
                <div className="flex gap-3">
                  <button
                    onClick={async () => {
                      // In a real app, this would call Stripe to cancel
                      setShowCancelConfirm(false);
                    }}
                    className="px-4 py-2 bg-red-500 text-white rounded-lg text-sm font-medium hover:bg-red-600 transition-colors"
                  >
                    Yes, Cancel
                  </button>
                  <button
                    onClick={() => setShowCancelConfirm(false)}
                    className="px-4 py-2 border border-[#2a2a2a] text-zinc-400 rounded-lg text-sm hover:text-white transition-colors"
                  >
                    Keep Pro
                  </button>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div>
            <div className="flex items-center gap-2 mb-4">
              <span className="w-2 h-2 rounded-full bg-zinc-500" />
              <span className="text-zinc-400 font-medium">Free Plan</span>
            </div>
            <p className="text-zinc-400 text-sm mb-4">
              3 free grades per month. Upgrade to Pro for unlimited grades and
              AI rewrites.
            </p>
            <a
              href="/api/stripe/checkout"
              className="inline-block px-6 py-3 bg-[#6366f1] text-white font-semibold rounded-lg hover:bg-[#5558e0] transition-colors"
            >
              Upgrade to Pro →
            </a>
          </div>
        )}
      </div>

      {/* Danger Zone */}
      <div className="bg-[#111111] border border-red-500/20 rounded-xl p-6">
        <h2 className="text-lg font-semibold text-red-400 mb-4 flex items-center gap-2">
          <AlertTriangle className="w-5 h-5" />
          Danger Zone
        </h2>
        {!showDeleteConfirm ? (
          <button
            onClick={() => setShowDeleteConfirm(true)}
            className="flex items-center gap-2 px-4 py-2 border border-red-500/30 text-red-400 rounded-lg font-medium hover:bg-red-500/10 transition-colors"
          >
            <Trash2 className="w-4 h-4" />
            Delete all grade history
          </button>
        ) : (
          <div className="bg-red-500/5 border border-red-500/20 rounded-lg p-4">
            <p className="text-red-400 text-sm mb-3">
              This will permanently delete all your graded posts. This action
              cannot be undone.
            </p>
            <div className="flex gap-3">
              <button
                onClick={handleDeleteHistory}
                className="px-4 py-2 bg-red-500 text-white rounded-lg text-sm font-medium hover:bg-red-600 transition-colors"
              >
                Yes, Delete Everything
              </button>
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="px-4 py-2 border border-[#2a2a2a] text-zinc-400 rounded-lg text-sm hover:text-white transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}