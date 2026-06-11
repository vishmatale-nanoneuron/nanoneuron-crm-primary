"use client";
import { Suspense, useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { getToken } from "@/lib/api";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

type Status = "verifying" | "success" | "failed" | "pending";

function PaymentSuccessInner() {
  const params = useSearchParams();
  const router = useRouter();
  const [status, setStatus] = useState<Status>("verifying");
  const [planTier, setPlanTier] = useState("");
  const [detail, setDetail] = useState("");

  useEffect(() => {
    const orderId = params.get("order_id") || localStorage.getItem("ops_pending_order");
    const gateway = params.get("gateway") || localStorage.getItem("ops_pending_gateway") || "cashfree";
    if (!orderId) {
      setStatus("failed");
      setDetail("No order ID found. If you paid, contact support at service@nanoneuron.ai");
      return;
    }

    const token = getToken();
    if (!token) {
      router.push(`/login?next=/payment/success?order_id=${orderId}&gateway=${gateway}`);
      return;
    }

    fetch(`${API}/payments/verify`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      body: JSON.stringify({ order_id: orderId, gateway }),
    })
      .then(async (r) => {
        const data = await r.json();
        if (r.ok) {
          setPlanTier(data.plan_tier);
          setStatus("success");
          localStorage.removeItem("ops_pending_order");
          localStorage.removeItem("ops_pending_gateway");
          setTimeout(() => router.push("/dashboard"), 3000);
        } else if (r.status === 400 && data.detail?.includes("ACTIVE")) {
          // Payment still processing
          setStatus("pending");
          setDetail("Your payment is being processed. Check back in a minute.");
        } else {
          setStatus("failed");
          setDetail(data.detail || "Verification failed. Contact support at service@nanoneuron.ai");
        }
      })
      .catch(() => {
        setStatus("failed");
        setDetail("Network error during verification. Contact support at service@nanoneuron.ai");
      });
  }, [params, router]);

  return (
    <div className="min-h-screen bg-zinc-950 text-white flex items-center justify-center px-6">
      <main id="main-content" className="max-w-md w-full text-center">
        {status === "verifying" && (
          <div role="status" aria-live="polite" aria-label="Verifying payment">
            <div aria-hidden="true" className="h-12 w-12 rounded-full border-2 border-emerald-500/40 border-t-emerald-500 animate-spin mx-auto mb-6" />
            <h1 className="text-xl font-bold mb-2">Verifying your payment…</h1>
            <p className="text-white/40 text-sm">This takes just a second.</p>
          </div>
        )}

        {status === "success" && (
          <div role="status" aria-live="polite">
            <div aria-hidden="true" className="h-16 w-16 rounded-full bg-emerald-500/15 border border-emerald-500/40 flex items-center justify-center mx-auto mb-6">
              <span className="text-emerald-400 text-3xl">✓</span>
            </div>
            <h1 className="text-2xl font-bold mb-2">Payment Successful!</h1>
            <p className="text-white/60 mb-2">
              You are now on <span className="text-emerald-400 font-semibold capitalize">{planTier}</span>.
            </p>
            <p className="text-white/30 text-sm mb-8">Redirecting to your dashboard…</p>
            <Link
              href="/dashboard"
              className="inline-block rounded-xl bg-emerald-500 hover:bg-emerald-400 px-8 py-3 text-sm font-semibold text-white transition-colors"
            >
              Go to Dashboard
            </Link>
          </div>
        )}

        {status === "pending" && (
          <div role="status" aria-live="polite">
            <div aria-hidden="true" className="h-16 w-16 rounded-full bg-yellow-500/15 border border-yellow-500/40 flex items-center justify-center mx-auto mb-6">
              <span className="text-yellow-400 text-3xl">⏳</span>
            </div>
            <h1 className="text-2xl font-bold mb-2">Payment Processing</h1>
            <p className="text-white/60 text-sm mb-8">{detail}</p>
            <Link
              href="/pricing"
              className="inline-block rounded-xl border border-white/15 px-6 py-2.5 text-sm text-white/70 hover:bg-white/5 transition-colors"
            >
              Back to Pricing
            </Link>
          </div>
        )}

        {status === "failed" && (
          <div role="alert">
            <div aria-hidden="true" className="h-16 w-16 rounded-full bg-red-500/15 border border-red-500/40 flex items-center justify-center mx-auto mb-6">
              <span className="text-red-400 text-3xl">✗</span>
            </div>
            <h1 className="text-2xl font-bold mb-2">Payment Not Verified</h1>
            <p className="text-white/50 text-sm mb-8">{detail}</p>
            <div className="flex gap-3 justify-center">
              <Link
                href="/pricing"
                className="rounded-xl bg-emerald-500 hover:bg-emerald-400 px-6 py-2.5 text-sm font-semibold text-white transition-colors"
              >
                Try Again
              </Link>
              <a
                href="mailto:service@nanoneuron.ai"
                className="rounded-xl border border-white/15 px-6 py-2.5 text-sm text-white/70 hover:bg-white/5 transition-colors"
              >
                Contact Support
              </a>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default function PaymentSuccess() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-zinc-950 text-white flex items-center justify-center">
        <div className="h-8 w-8 rounded-full border-2 border-emerald-500/40 border-t-emerald-500 animate-spin" />
      </div>
    }>
      <PaymentSuccessInner />
    </Suspense>
  );
}
