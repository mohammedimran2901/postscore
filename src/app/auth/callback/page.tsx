"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { Loader2 } from "lucide-react";

export default function AuthCallbackPage() {
  const router = useRouter();
  const [error, setError] = useState("");

  useEffect(() => {
    const handleAuth = async () => {
      // Check if we have a hash with access_token (implicit flow)
      const hash = window.location.hash;
      const searchParams = new URLSearchParams(window.location.search);
      
      // Try to get session - Supabase client automatically handles hash
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError) {
        console.error("Session error:", sessionError);
        setError("Authentication failed");
        return;
      }

      if (session) {
        // User is authenticated, create profile if needed
        const { data: { user } } = await supabase.auth.getUser();
        
        if (user) {
          // Check if profile exists
          const { data: existing } = await supabase
            .from("profiles")
            .select("id")
            .eq("id", user.id)
            .single();

          if (!existing) {
            // Create profile
            await supabase.from("profiles").insert({
              id: user.id,
              email: user.email,
              full_name: user.user_metadata?.full_name || user.user_metadata?.name || null,
              avatar_url: user.user_metadata?.avatar_url || null,
              subscription_status: "free",
              grades_used_this_month: 0,
              grades_reset_at: new Date().toISOString(),
            });
          }
        }

        // Redirect to dashboard
        router.push("/dashboard");
        return;
      }

      // Check for error in query params
      const errorMsg = searchParams.get("error");
      if (errorMsg) {
        setError(errorMsg);
        return;
      }

      // No session and no error - try to exchange code if present
      const code = searchParams.get("code");
      if (code) {
        const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);
        if (exchangeError) {
          console.error("Exchange error:", exchangeError);
          setError("Failed to complete authentication");
          return;
        }
        // Retry getting session
        window.location.reload();
        return;
      }

      // No code, no session - redirect to login
      setError("No authentication data found");
    };

    handleAuth();
  }, [router]);

  if (error) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center px-4">
        <div className="text-center">
          <p className="text-red-400 mb-4">Authentication failed</p>
          <p className="text-zinc-500 text-sm mb-4">{error}</p>
          <button
            onClick={() => window.location.href = "/login"}
            className="text-[#6366f1] hover:underline"
          >
            Back to login →
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
      <div className="text-center">
        <Loader2 className="w-8 h-8 text-[#6366f1] animate-spin mx-auto mb-4" />
        <p className="text-zinc-400">Completing sign in...</p>
      </div>
    </div>
  );
}