"use client";

import { useState } from "react";
import { Loader2 } from "lucide-react";

interface CheckoutButtonProps {
  children: React.ReactNode;
  className?: string;
}

export default function CheckoutButton({ children, className = "" }: CheckoutButtonProps) {
  const [loading, setLoading] = useState(false);

  const handleCheckout = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/stripe/checkout", { method: "POST" });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        alert(data.error || "Something went wrong");
        setLoading(false);
      }
    } catch {
      alert("Failed to start checkout");
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleCheckout}
      disabled={loading}
      className={className}
    >
      {loading ? (
        <>
          <Loader2 className="w-4 h-4 animate-spin inline mr-2" />
          Loading...
        </>
      ) : (
        children
      )}
    </button>
  );
}