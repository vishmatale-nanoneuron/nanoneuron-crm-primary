"use client";
import { useEffect, useState, useCallback } from "react";
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
    ctaLink: "/register",
    features: [
      { label: "3 reports per day", included: true },
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

const ANNUAL_PRICES: Record<string, { price_inr: string; per: string; save: string }> = {
  pro: { price_inr: "₹8,999", per: "per year", save: "Save 25%" },
  enterprise: { price_inr: "₹39,999", per: "per year", save: "Save 33%" },
};

const BANK_AMOUNTS: Record<string, number> = {
  pro: 999, enterprise: 4999, pro_annual: 8999, enterprise_annual: 39999,
};

interface BankDetails {
  upi_id: string | null;
  account_name: string | null;
  account_number: string | null;
  ifsc: string | null;
  bank_name: string | null;
}

interface BankTransfer {
  id: string;
  plan_tier: string;
  amount_inr: number;
  utr_reference: string;
  transfer_method: string;
  status: string;
  rejection_reason: string | null;
  created_at: string;
}

export default function Pricing() {
  const router = useRouter();
  const [currentPlan, setCurrentPlan] = useState<string | null>(null);
  const [error, setError] = useState("");

  // Bank transfer state
  const [billing, setBilling] = useState<"monthly" | "annual">("monthly");
  const [showBankSection, setShowBankSection] = useState(false);
  const [bankPlan, setBankPlan] = useState("");
  const [bankDetails, setBankDetails] = useState<BankDetails | null>(null);
  const [bankLoading, setBankLoading] = useState(false);
  const [utrRef, setUtrRef] = useState("");
  const [transferMethod, setTransferMethod] = useState("upi");
  const [bankNotes, setBankNotes] = useState("");
  const [bankSubmitting, setBankSubmitting] = useState(false);
  const [bankSubmitted, setBankSubmitted] = useState(false);
  const [myTransfers, setMyTransfers] = useState<BankTransfer[]>([]);
  const [copied, setCopied] = useState<string | null>(null);

  useEffect(() => {
    const token = getToken();
    if (!token) return;
    fetch(`${API}/payments/my-plan`, { headers: { Authorization: `Bearer ${token}` } })
      .then((r) => r.json()).then((d) => setCurrentPlan(d.plan_tier)).catch(() => {});
    fetch(`${API}/payments/bank-transfer/my`, { headers: { Authorization: `Bearer ${token}` } })
      .then((r) => r.json()).then((d) => Array.isArray(d) && setMyTransfers(d)).catch(() => {});
  }, []);

  const openBankSection = useCallback(async (planTier: string) => {
    const token = getToken();
    if (!token) { router.push("/register?next=/pricing"); return; }
    setBankPlan(planTier);
    setShowBankSection(true);
    setBankSubmitted(false);
    setUtrRef("");
    setBankNotes("");
    setTransferMethod("upi");
    setError("");
    setBankLoading(true);
    try {
      const res = await fetch(`${API}/payments/bank-details`, { headers: { Authorization: `Bearer ${token}` } });
      if (!res.ok) { const e = await res.json(); throw new Error(e.detail || "Could not fetch bank details."); }
      setBankDetails(await res.json());
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Bank transfer unavailable. Contact service@nanoneuron.ai");
      setShowBankSection(false);
    } finally {
      setBankLoading(false);
    }
  }, [router]);

  async function handleBankSubmit(e: React.FormEvent) {
    e.preventDefault();
    const token = getToken();
    if (!token) return;
    if (utrRef.trim().length < 6) { setError("Enter a valid UTR / transaction reference (min 6 characters)."); return; }
    setBankSubmitting(true);
    setError("");
    try {
      const res = await fetch(`${API}/payments/bank-transfer`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify({ plan_tier: bankPlan, utr_reference: utrRef.trim(), transfer_method: transferMethod, notes: bankNotes }),
      });
      if (!res.ok) { const e = await res.json(); throw new Error(e.detail || "Submission failed."); }
      const d = await res.json();
      setBankSubmitted(true);
      setMyTransfers((prev) => [{
        id: d.id, plan_tier: d.plan_tier, amount_inr: d.amount_inr,
        utr_reference: d.utr_reference, transfer_method: transferMethod,
        status: "pending", rejection_reason: null, created_at: new Date().toISOString(),
      }, ...prev]);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Submission failed.");
    } finally {
      setBankSubmitting(false);
    }
  }

  function copy(text: string, key: string) {
    navigator.clipboard.writeText(text).then(() => { setCopied(key); setTimeout(() => setCopied(null), 2000); });
  }

  const bankPlanLabel = bankPlan
    ? `${bankPlan.replace("_annual", " Annual").replace(/^(\w)/, (c) => c.toUpperCase())} — ₹${(BANK_AMOUNTS[bankPlan] || 0).toLocaleString("en-IN")}`
    : "";

  return (
    <>
      <Nav />
      <main id="main-content" className="min-h-screen bg-zinc-950 text-white px-6 py-16">
        <div className="mx-auto max-w-5xl">

          {/* Header */}
          <div className="text-center mb-14">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-4 py-1.5 text-sm text-emerald-400">
              <span aria-hidden="true" className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
              Simple, Transparent Pricing
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              Start free. Upgrade when the<br />
              <span className="text-emerald-400">data moat matters.</span>
            </h1>
            <p className="text-white/50 max-w-xl mx-auto">
              Pay via UPI or bank transfer — directly to us, zero gateway fees.
            </p>
          </div>

          {error && (
            <div className="mb-6 rounded-xl border border-red-500/30 bg-red-500/10 px-5 py-4 text-red-400 text-sm max-w-2xl mx-auto">
              {error}
            </div>
          )}

          {/* Billing toggle */}
          <div className="flex items-center justify-center mb-10">
            <div className="inline-flex items-center gap-1 rounded-xl border border-white/10 bg-white/5 p-1">
              <button
                onClick={() => setBilling("monthly")}
                className={`rounded-lg px-5 py-2 text-sm font-medium transition-colors ${billing === "monthly" ? "bg-white text-black" : "text-white/50 hover:text-white"}`}
              >
                Monthly
              </button>
              <button
                onClick={() => setBilling("annual")}
                className={`flex items-center gap-2 rounded-lg px-5 py-2 text-sm font-medium transition-colors ${billing === "annual" ? "bg-emerald-500 text-white" : "text-white/50 hover:text-white"}`}
              >
                Annual
                <span className="rounded-full bg-emerald-500/20 border border-emerald-500/40 px-2 py-0.5 text-xs text-emerald-400">
                  Save 25–33%
                </span>
              </button>
            </div>
          </div>

          {/* Pricing cards */}
          <div className="grid md:grid-cols-3 gap-6 mb-16">
            {PLANS.map((plan) => {
              const annualInfo = billing === "annual" && plan.tier !== "free" ? ANNUAL_PRICES[plan.tier] : null;
              const displayPrice = annualInfo ? annualInfo.price_inr : plan.price;
              const displayPeriod = annualInfo ? annualInfo.per : plan.period;
              const isCurrent = currentPlan === plan.tier;
              const planTier = billing === "annual" && plan.tier !== "free" ? `${plan.tier}_annual` : plan.tier;
              return (
                <div
                  key={plan.tier}
                  className={`relative rounded-2xl border p-8 flex flex-col ${plan.highlight ? "border-emerald-500/50 bg-emerald-500/5" : "border-white/10 bg-white/3"}`}
                >
                  {plan.badge && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                      <span className="rounded-full bg-emerald-500 px-3 py-1 text-xs font-semibold text-white">{plan.badge}</span>
                    </div>
                  )}
                  {isCurrent && (
                    <div className="absolute -top-3 right-4">
                      <span className="rounded-full bg-blue-500 px-3 py-1 text-xs font-semibold text-white">Current Plan</span>
                    </div>
                  )}
                  <div className="mb-6">
                    <div className="flex items-center gap-2 mb-1">
                      <h2 className="text-xl font-bold">{plan.name}</h2>
                      {annualInfo && (
                        <span className="rounded-full bg-emerald-500/20 border border-emerald-500/40 px-2 py-0.5 text-xs text-emerald-400 font-semibold">
                          {annualInfo.save}
                        </span>
                      )}
                    </div>
                    <div className="flex items-baseline gap-1">
                      <span className="text-4xl font-bold text-white">{displayPrice}</span>
                      <span className="text-white/40 text-sm">{displayPeriod}</span>
                    </div>
                  </div>
                  <ul className="space-y-3 mb-8 flex-1">
                    {plan.features.map((f) => (
                      <li key={f.label} className="flex items-center gap-2.5 text-sm">
                        {f.included ? <span className="text-emerald-400 text-base">✓</span> : <span className="text-white/20 text-base">✗</span>}
                        <span className={f.included ? "text-white/80" : "text-white/25"}>{f.label}</span>
                      </li>
                    ))}
                  </ul>
                  {plan.ctaLink ? (
                    <Link href={plan.ctaLink} className="block text-center rounded-xl border border-white/15 px-6 py-3 text-sm font-medium hover:bg-white/5 transition-colors">
                      Get Started Free
                    </Link>
                  ) : isCurrent ? (
                    <div className="block text-center rounded-xl border border-blue-500/30 bg-blue-500/10 px-6 py-3 text-sm font-medium text-blue-400">
                      Active Plan
                    </div>
                  ) : (
                    <button
                      onClick={() => openBankSection(planTier)}
                      className={`w-full rounded-xl px-6 py-3 text-sm font-semibold transition-all ${
                        plan.highlight
                          ? "bg-emerald-500 hover:bg-emerald-400 text-white"
                          : "border border-white/15 hover:bg-white/5 text-white"
                      }`}
                    >
                      Pay via UPI / Bank Transfer
                    </button>
                  )}
                </div>
              );
            })}
          </div>

          {/* ── Bank / UPI payment section ── */}
          {showBankSection && (
            <div className="max-w-xl mx-auto mb-16 rounded-2xl border border-emerald-500/30 bg-emerald-500/5 p-8">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-lg font-bold text-emerald-300">Pay via UPI / Bank Transfer</h3>
                  <p className="text-sm text-white/50 mt-0.5">0% gateway fee · Activates within 2–4 hrs on weekdays</p>
                </div>
                <button onClick={() => setShowBankSection(false)} className="text-white/30 hover:text-white/60 text-xl leading-none">✕</button>
              </div>

              {bankLoading ? (
                <div className="text-center py-8 text-white/40 text-sm">Loading payment details…</div>
              ) : bankDetails ? (
                <>
                  <p className="text-sm text-white/60 mb-6">
                    Plan: <span className="text-white font-semibold">{bankPlanLabel}</span>
                  </p>

                  {/* Step 1 */}
                  <p className="text-xs uppercase tracking-widest text-white/30 mb-3">Step 1 — Send payment to</p>
                  <div className="space-y-3 mb-7">
                    {bankDetails.upi_id && (
                      <div className="flex items-center justify-between rounded-xl border border-white/10 bg-white/5 px-4 py-3">
                        <div>
                          <p className="text-xs text-white/40 mb-0.5">UPI ID</p>
                          <p className="font-mono text-sm text-white">{bankDetails.upi_id}</p>
                        </div>
                        <button onClick={() => copy(bankDetails.upi_id!, "upi")} className="text-xs text-emerald-400 hover:text-emerald-300 border border-emerald-500/30 rounded-lg px-3 py-1.5 transition-colors">
                          {copied === "upi" ? "Copied!" : "Copy"}
                        </button>
                      </div>
                    )}
                    {bankDetails.account_number && (
                      <>
                        <div className="flex items-center justify-between rounded-xl border border-white/10 bg-white/5 px-4 py-3">
                          <div>
                            <p className="text-xs text-white/40 mb-0.5">Account Name</p>
                            <p className="font-mono text-sm text-white">{bankDetails.account_name}</p>
                          </div>
                          <button onClick={() => copy(bankDetails.account_name!, "name")} className="text-xs text-emerald-400 hover:text-emerald-300 border border-emerald-500/30 rounded-lg px-3 py-1.5 transition-colors">
                            {copied === "name" ? "Copied!" : "Copy"}
                          </button>
                        </div>
                        <div className="flex items-center justify-between rounded-xl border border-white/10 bg-white/5 px-4 py-3">
                          <div>
                            <p className="text-xs text-white/40 mb-0.5">Account Number</p>
                            <p className="font-mono text-sm text-white">{bankDetails.account_number}</p>
                          </div>
                          <button onClick={() => copy(bankDetails.account_number!, "acc")} className="text-xs text-emerald-400 hover:text-emerald-300 border border-emerald-500/30 rounded-lg px-3 py-1.5 transition-colors">
                            {copied === "acc" ? "Copied!" : "Copy"}
                          </button>
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                          <div className="flex items-center justify-between rounded-xl border border-white/10 bg-white/5 px-4 py-3">
                            <div>
                              <p className="text-xs text-white/40 mb-0.5">IFSC</p>
                              <p className="font-mono text-sm text-white">{bankDetails.ifsc}</p>
                            </div>
                            <button onClick={() => copy(bankDetails.ifsc!, "ifsc")} className="text-xs text-emerald-400 hover:text-emerald-300 border border-emerald-500/30 rounded-lg px-3 py-1.5 transition-colors">
                              {copied === "ifsc" ? "Copied!" : "Copy"}
                            </button>
                          </div>
                          <div className="rounded-xl border border-white/10 bg-white/5 px-4 py-3">
                            <p className="text-xs text-white/40 mb-0.5">Bank</p>
                            <p className="text-sm text-white">{bankDetails.bank_name}</p>
                          </div>
                        </div>
                      </>
                    )}
                  </div>

                  {/* Step 2 */}
                  <p className="text-xs uppercase tracking-widest text-white/30 mb-3">Step 2 — Submit your UTR / Transaction ID</p>
                  {bankSubmitted ? (
                    <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-5 py-6 text-center">
                      <p className="text-emerald-400 font-semibold mb-1">Submitted!</p>
                      <p className="text-white/50 text-sm">We&apos;ll verify and activate your plan within 2–4 business hours on weekdays.</p>
                    </div>
                  ) : (
                    <form onSubmit={handleBankSubmit} className="space-y-3">
                      <div>
                        <label className="text-xs text-white/40 block mb-1.5">Transfer method</label>
                        <div className="flex gap-2">
                          {["upi", "neft", "rtgs", "imps"].map((m) => (
                            <button key={m} type="button" onClick={() => setTransferMethod(m)}
                              className={`rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors ${transferMethod === m ? "border-emerald-500/50 bg-emerald-500/15 text-emerald-300" : "border-white/10 text-white/40 hover:text-white/60"}`}>
                              {m.toUpperCase()}
                            </button>
                          ))}
                        </div>
                      </div>
                      <div>
                        <label className="text-xs text-white/40 block mb-1.5">UTR / Transaction Reference <span className="text-red-400">*</span></label>
                        <input
                          type="text" value={utrRef} onChange={(e) => setUtrRef(e.target.value)} required
                          placeholder={transferMethod === "upi" ? "e.g. 407318263456" : "e.g. HDFC00012345678"}
                          className="w-full rounded-xl border border-white/15 bg-white/5 px-4 py-3 text-sm text-white placeholder-white/20 focus:border-emerald-500/40 focus:outline-none"
                        />
                        <p className="text-xs text-white/25 mt-1">Find it in your bank app → transaction history → UTR / Ref No.</p>
                      </div>
                      <div>
                        <label className="text-xs text-white/40 block mb-1.5">Notes (optional)</label>
                        <input type="text" value={bankNotes} onChange={(e) => setBankNotes(e.target.value)}
                          placeholder="Any additional info"
                          className="w-full rounded-xl border border-white/15 bg-white/5 px-4 py-3 text-sm text-white placeholder-white/20 focus:border-emerald-500/40 focus:outline-none"
                        />
                      </div>
                      <button type="submit" disabled={bankSubmitting || utrRef.trim().length < 6}
                        className="w-full rounded-xl bg-emerald-500 hover:bg-emerald-400 text-white px-6 py-3 text-sm font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
                        {bankSubmitting ? "Submitting…" : "Submit for Verification"}
                      </button>
                    </form>
                  )}
                </>
              ) : null}
            </div>
          )}

          {/* Transfer history */}
          {myTransfers.length > 0 && (
            <div className="max-w-xl mx-auto mb-16">
              <h3 className="text-sm font-semibold text-white/40 uppercase tracking-widest mb-4">Your Submissions</h3>
              <div className="space-y-3">
                {myTransfers.map((t) => (
                  <div key={t.id} className="rounded-xl border border-white/10 bg-white/3 px-5 py-4 flex items-center justify-between gap-4">
                    <div>
                      <p className="text-sm font-medium text-white capitalize">{t.plan_tier.replace("_", " ")} — ₹{t.amount_inr.toLocaleString("en-IN")}</p>
                      <p className="text-xs text-white/40 mt-0.5">UTR: {t.utr_reference} · {t.transfer_method.toUpperCase()}</p>
                      {t.rejection_reason && <p className="text-xs text-red-400 mt-1">Rejected: {t.rejection_reason}</p>}
                    </div>
                    <span className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${
                      t.status === "approved" ? "text-emerald-400 border-emerald-500/30 bg-emerald-500/10"
                      : t.status === "rejected" ? "text-red-400 border-red-500/30 bg-red-500/10"
                      : "text-amber-400 border-amber-500/30 bg-amber-500/10"
                    }`}>
                      {t.status.charAt(0).toUpperCase() + t.status.slice(1)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* FAQ */}
          <div className="max-w-2xl mx-auto space-y-5">
            {[
              { q: "Can I cancel anytime?", a: "Yes. Monthly plans run 30 days from payment. Annual plans run 365 days. No auto-renewals — you choose each period." },
              { q: "Is my operational data safe?", a: "Your uploaded data is used only for your analysis. Only anonymized aggregates (risk score averages) flow into industry benchmarks. No raw data is shared." },
              { q: "How does payment work?", a: "Transfer the exact plan amount to our UPI ID or bank account shown on this page, then submit your UTR / transaction reference. We verify against our bank statement and activate your plan — usually within 2–4 business hours on weekdays. Zero gateway fees." },
              { q: "Which UPI apps work?", a: "Any UPI app works — Google Pay, PhonePe, Paytm, BHIM, or your bank's app. For larger amounts (₹4,999 or ₹39,999), NEFT/RTGS/IMPS via net banking is more reliable." },
              { q: "I'm a startup. Can I get a discount?", a: "Email us at vish.matale@gmail.com with your startup details. We offer founder plans for early-stage teams." },
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
