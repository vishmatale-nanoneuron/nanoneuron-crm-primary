"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Nav from "@/components/Nav";
import { getToken } from "@/lib/api";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";


const PLANS = [
  {
    tier: "free",
    name: "Free",
    price: "₹0",
    period: "forever",
    badge: null,
    highlight: false,
    cta: "Get Started Free",
    ctaLink: "/register",
    features: [
      { label: "3 reports per day (free)", included: true },
      { label: "AI risk scoring (0–100)", included: true },
      { label: "Delay probability analysis", included: true },
      { label: "Inventory risk detection", included: true },
      { label: "Executive AI summary", included: true },
      { label: "Bottleneck recommendations", included: true },
      { label: "Industry benchmarks", included: false },
      { label: "Risk trend dashboard", included: false },
      { label: "Cost ROI analytics", included: false },
      { label: "API access", included: false },
    ],
  },
  {
    tier: "pro",
    name: "Pro",
    price: "₹999",
    period: "per month",
    badge: "Most Popular",
    highlight: true,
    cta: "Upgrade to Pro",
    ctaLink: null,
    features: [
      { label: "Unlimited report uploads", included: true },
      { label: "AI risk scoring (0–100)", included: true },
      { label: "Delay probability analysis", included: true },
      { label: "Inventory risk detection", included: true },
      { label: "Executive AI summary", included: true },
      { label: "Bottleneck recommendations", included: true },
      { label: "Industry benchmarks", included: true },
      { label: "Risk trend dashboard", included: true },
      { label: "Cost ROI analytics", included: true },
      { label: "API access", included: false },
    ],
  },
  {
    tier: "enterprise",
    name: "Enterprise",
    price: "₹4,999",
    period: "per month",
    badge: null,
    highlight: false,
    cta: "Upgrade to Enterprise",
    ctaLink: null,
    features: [
      { label: "Unlimited report uploads", included: true },
      { label: "AI risk scoring (0–100)", included: true },
      { label: "Delay probability analysis", included: true },
      { label: "Inventory risk detection", included: true },
      { label: "Executive AI summary", included: true },
      { label: "Bottleneck recommendations", included: true },
      { label: "Industry benchmarks", included: true },
      { label: "Risk trend dashboard", included: true },
      { label: "Cost ROI analytics", included: true },
      { label: "API access", included: true },
    ],
  },
];

export default function Pricing() {
  const router = useRouter();
  const [currentPlan, setCurrentPlan] = useState<string | null>(null);
  const [loading, setLoading] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    const token = getToken();
    if (!token) return;
    fetch(`${API}/payments/my-plan`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => r.json())
      .then((d) => setCurrentPlan(d.plan_tier))
      .catch(() => {});
  }, []);

  async function handleUpgrade(planTier: "pro" | "enterprise") {
    const token = getToken();
    if (!token) {
      router.push("/register?next=/pricing");
      return;
    }
    setLoading(planTier);
    setError("");
    setSuccess("");
    try {
      const res = await fetch(`${API}/payments/create-order`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify({ plan_tier: planTier }),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.detail || "Could not create payment order.");
      }
      const order = await res.json();
      localStorage.setItem("ops_pending_order", order.order_id);
      window.location.href = order.payment_url;
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
      setLoading(null);
    }
  }

  return (
    <>
      <Nav />
      <main className="min-h-screen bg-zinc-950 text-white px-6 py-16">
        <div className="mx-auto max-w-6xl">
          {/* Header */}
          <div className="text-center mb-14">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-4 py-1.5 text-sm text-emerald-400">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
              Transparent Pricing
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              Start free. Upgrade when the<br />
              <span className="text-emerald-400">data moat matters.</span>
            </h1>
            <p className="text-white/50 max-w-xl mx-auto">
              Every upload improves our industry benchmarks. Pro users get access to those
              benchmarks — that is the Kai-Fu Lee data flywheel in action.
            </p>
          </div>

          {/* Alerts */}
          {error && (
            <div className="mb-6 rounded-xl border border-red-500/30 bg-red-500/10 px-5 py-4 text-red-400 text-sm max-w-2xl mx-auto">
              {error}
            </div>
          )}
          {success && (
            <div className="mb-6 rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-5 py-4 text-emerald-400 text-sm max-w-2xl mx-auto">
              {success} Redirecting to dashboard…
            </div>
          )}

          {/* Pricing cards */}
          <div className="grid md:grid-cols-3 gap-6 mb-16">
            {PLANS.map((plan) => {
              const isCurrent = currentPlan === plan.tier;
              return (
                <div
                  key={plan.tier}
                  className={`relative rounded-2xl border p-8 flex flex-col ${
                    plan.highlight
                      ? "border-emerald-500/50 bg-emerald-500/5"
                      : "border-white/10 bg-white/3"
                  }`}
                >
                  {plan.badge && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                      <span className="rounded-full bg-emerald-500 px-3 py-1 text-xs font-semibold text-white">
                        {plan.badge}
                      </span>
                    </div>
                  )}
                  {isCurrent && (
                    <div className="absolute -top-3 right-4">
                      <span className="rounded-full bg-blue-500 px-3 py-1 text-xs font-semibold text-white">
                        Current Plan
                      </span>
                    </div>
                  )}
                  <div className="mb-6">
                    <h2 className="text-xl font-bold mb-1">{plan.name}</h2>
                    <div className="flex items-baseline gap-1">
                      <span className="text-4xl font-bold text-white">{plan.price}</span>
                      <span className="text-white/40 text-sm">{plan.period}</span>
                    </div>
                  </div>
                  <ul className="space-y-3 mb-8 flex-1">
                    {plan.features.map((f) => (
                      <li key={f.label} className="flex items-center gap-2.5 text-sm">
                        {f.included ? (
                          <span className="text-emerald-400 text-base">✓</span>
                        ) : (
                          <span className="text-white/20 text-base">✗</span>
                        )}
                        <span className={f.included ? "text-white/80" : "text-white/25"}>
                          {f.label}
                        </span>
                      </li>
                    ))}
                  </ul>
                  {plan.ctaLink ? (
                    <Link
                      href={plan.ctaLink}
                      className="block text-center rounded-xl border border-white/15 px-6 py-3 text-sm font-medium hover:bg-white/5 transition-colors"
                    >
                      {plan.cta}
                    </Link>
                  ) : isCurrent ? (
                    <div className="block text-center rounded-xl border border-blue-500/30 bg-blue-500/10 px-6 py-3 text-sm font-medium text-blue-400">
                      Active Plan
                    </div>
                  ) : (
                    <button
                      disabled={loading === plan.tier}
                      onClick={() => handleUpgrade(plan.tier as "pro" | "enterprise")}
                      className={`block w-full rounded-xl px-6 py-3 text-sm font-semibold transition-all ${
                        plan.highlight
                          ? "bg-emerald-500 hover:bg-emerald-400 text-white"
                          : "border border-white/15 hover:bg-white/5 text-white"
                      } disabled:opacity-50 disabled:cursor-not-allowed`}
                    >
                      {loading === plan.tier ? "Opening payment…" : plan.cta}
                    </button>
                  )}
                </div>
              );
            })}
          </div>

          {/* Data flywheel explainer */}
          <div className="card max-w-3xl mx-auto mb-14 text-center py-10 px-8">
            <p className="text-xs uppercase tracking-widest text-emerald-400/70 mb-3">Kai-Fu Lee Data Flywheel</p>
            <h2 className="text-2xl font-bold mb-4">Why benchmarks are worth paying for</h2>
            <p className="text-white/55 text-sm leading-relaxed max-w-xl mx-auto">
              Every OpsOracle upload — across all users — feeds anonymized data into our industry
              benchmark engine. Pro users get access to those averages: how your risk scores compare
              to other logistics companies, manufacturers, or warehouses. The more users upload, the
              more accurate the benchmarks. This is the compounding moat that AI Superpowers
              describes: your competitors make your benchmarks better.
            </p>
          </div>

          {/* FAQ */}
          <div className="max-w-2xl mx-auto space-y-5">
            {[
              {
                q: "Can I cancel anytime?",
                a: "Yes. Your plan runs for 30 days from payment. There are no automatic renewals — you pay for each month you want Pro access.",
              },
              {
                q: "Is my operational data safe?",
                a: "Your uploaded data is used only for your analysis. Only anonymized aggregates (risk score averages) flow into industry benchmarks. No raw data is shared.",
              },
              {
                q: "What payment methods are accepted?",
                a: "All major Indian cards, UPI, net banking, and wallets via Instamojo. International cards also accepted.",
              },
              {
                q: "I'm a startup. Can I get a discount?",
                a: "Email us at vish.matale@gmail.com with your startup details. We offer founder plans for early-stage teams.",
              },
            ].map((item) => (
              <div key={item.q} className="border border-white/10 rounded-xl px-6 py-5">
                <p className="font-semibold text-sm mb-2">{item.q}</p>
                <p className="text-white/50 text-sm leading-relaxed">{item.a}</p>
              </div>
            ))}
          </div>
        </div>
      </main>
    </>
  );
}
