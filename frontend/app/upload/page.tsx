"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Nav from "@/components/Nav";
import { getToken } from "@/lib/api";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

type Insight = {
  risk_score: number;
  delay_probability: number;
  inventory_risk: number;
  bottleneck_summary: string;
  executive_summary: string;
  recommendations: string;
  industry_detected?: string;
  cost_impact_usd?: number;
  vertical_ai_score?: number;
  annual_savings_usd?: number;
};

type Usage = { plan_tier: string; used: number; limit: number | null; unlimited: boolean; remaining: number | null };

function RiskBar({ value, label }: { value: number; label: string }) {
  const color = value >= 70 ? "bg-red-500" : value >= 40 ? "bg-yellow-500" : "bg-emerald-500";
  return (
    <div className="card">
      <p className="text-white/50 text-sm">{label}</p>
      <h2 className="mt-1 text-4xl font-bold">{value}%</h2>
      <div className="mt-3 h-2 w-full rounded-full bg-white/10">
        <div className={`h-2 rounded-full ${color} transition-all`} style={{ width: `${value}%` }} />
      </div>
    </div>
  );
}

export default function Upload() {
  const router = useRouter();
  const [file, setFile] = useState<File | null>(null);
  const [insight, setInsight] = useState<Insight | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [usage, setUsage] = useState<Usage | null>(null);

  useEffect(() => {
    if (!getToken()) { router.push("/login"); return; }
    fetch(`${API}/reports/usage`, { headers: { Authorization: `Bearer ${getToken()}` } })
      .then(r => r.json())
      .then(setUsage)
      .catch(() => {});
  }, [router]);

  const limitReached = usage !== null && !usage.unlimited && (usage.remaining ?? 1) <= 0;

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!file || limitReached) return;
    setLoading(true);
    setError("");
    setInsight(null);
    const fd = new FormData();
    fd.append("file", file);
    const res = await fetch(`${API}/reports/upload`, {
      method: "POST",
      headers: { Authorization: `Bearer ${getToken()}` },
      body: fd,
    });
    setLoading(false);
    if (res.status === 429) {
      const d = await res.json();
      setError(d.detail || "Daily limit reached.");
      setUsage(prev => prev ? { ...prev, remaining: 0 } : prev);
      return;
    }
    if (!res.ok) { setError("Upload failed. Please try again."); return; }
    const data = await res.json();
    setInsight(data);
    // Refresh usage counter after successful upload
    fetch(`${API}/reports/usage`, { headers: { Authorization: `Bearer ${getToken()}` } })
      .then(r => r.json()).then(setUsage).catch(() => {});
  }

  return (
    <>
      <Nav />
      <main className="p-8">
        <div className="mb-8 flex items-start justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-4xl font-bold">Upload Operations Report</h1>
            <p className="mt-1 text-white/50">CSV, Excel, or PDF — AI analyzes it instantly</p>
          </div>
          {/* Daily usage counter */}
          {usage && !usage.unlimited && (
            <div className={`rounded-xl border px-4 py-3 text-right ${
              limitReached
                ? "border-red-500/30 bg-red-500/8"
                : (usage.remaining ?? 3) <= 1
                ? "border-yellow-500/30 bg-yellow-500/8"
                : "border-white/10 bg-white/5"
            }`}>
              <p className="text-xs text-white/40 uppercase tracking-wider">Free daily limit</p>
              <p className={`text-2xl font-bold mt-0.5 ${
                limitReached ? "text-red-400" : (usage.remaining ?? 3) <= 1 ? "text-yellow-400" : "text-white"
              }`}>
                {usage.remaining} <span className="text-sm font-normal text-white/40">/ {usage.limit} left today</span>
              </p>
            </div>
          )}
          {usage?.unlimited && (
            <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 px-4 py-3 text-right">
              <p className="text-xs text-emerald-400/70 uppercase tracking-wider">Pro plan</p>
              <p className="text-sm font-semibold text-emerald-400 mt-0.5">Unlimited uploads</p>
            </div>
          )}
        </div>

        {/* Limit reached banner */}
        {limitReached && (
          <div className="mb-6 rounded-xl border border-red-500/30 bg-red-500/8 px-5 py-4">
            <p className="font-semibold text-red-400 mb-1">Daily limit reached</p>
            <p className="text-white/60 text-sm mb-3">
              Free accounts get {usage?.limit} reports per day. Your limit resets at midnight UTC.
              Upgrade to Pro for unlimited uploads.
            </p>
            <Link href="/pricing" className="inline-block rounded-lg bg-emerald-500 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-400 transition-colors">
              Upgrade to Pro — ₹999/month →
            </Link>
          </div>
        )}

        <form onSubmit={submit} className="card max-w-xl space-y-4">
          <input
            className="input"
            type="file"
            accept=".csv,.xlsx,.xls,.pdf"
            onChange={e => setFile(e.target.files?.[0] || null)}
            required
            disabled={limitReached}
          />
          <button
            disabled={loading || limitReached}
            className="btn w-full disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Analyzing with AI..." : limitReached ? "Daily limit reached — upgrade to continue" : "Analyze Report"}
          </button>
          {error && <p className="text-red-400 text-sm">{error}</p>}
          {!limitReached && usage && !usage.unlimited && (usage.remaining ?? 3) <= 1 && (
            <p className="text-yellow-400/70 text-xs text-center">
              {usage.remaining === 1 ? "Last free upload today." : "No free uploads left."}{" "}
              <Link href="/pricing" className="underline hover:text-yellow-300">Upgrade for unlimited →</Link>
            </p>
          )}
        </form>

        {insight && (
          <section className="mt-10">
            <div className="mb-6 flex items-center justify-between flex-wrap gap-4">
              <h2 className="text-2xl font-semibold">AI Risk Analysis</h2>
              <div className="flex items-center gap-3 flex-wrap">
                {insight.industry_detected && (
                  <span className="rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-xs text-emerald-400 capitalize">
                    {insight.industry_detected.replace("_", " ")} operations
                  </span>
                )}
                {insight.vertical_ai_score != null && (
                  <span className="rounded-full border border-blue-500/30 bg-blue-500/10 px-3 py-1 text-xs text-blue-400">
                    Vertical AI Score: {insight.vertical_ai_score}/100
                  </span>
                )}
              </div>
            </div>

            {(insight.cost_impact_usd != null || insight.annual_savings_usd != null) && (
              <div className="mb-6 grid gap-4 md:grid-cols-2">
                {insight.cost_impact_usd != null && insight.cost_impact_usd > 0 && (
                  <div className="rounded-xl border border-red-500/20 bg-red-500/8 px-5 py-4">
                    <p className="text-xs text-red-400/70 uppercase tracking-wider mb-1">Cost at risk (current period)</p>
                    <p className="text-2xl font-bold text-red-400">${insight.cost_impact_usd.toLocaleString()}</p>
                    <p className="text-xs text-white/40 mt-1">Estimated from detected operational issues</p>
                  </div>
                )}
                {insight.annual_savings_usd != null && insight.annual_savings_usd > 0 && (
                  <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/8 px-5 py-4">
                    <p className="text-xs text-emerald-400/70 uppercase tracking-wider mb-1">Estimated annual savings if fixed</p>
                    <p className="text-2xl font-bold text-emerald-400">${insight.annual_savings_usd.toLocaleString()}</p>
                    <p className="text-xs text-white/40 mt-1">Kai-Fu Lee ROI model (prevented losses × recurrence)</p>
                  </div>
                )}
              </div>
            )}

            <div className="grid gap-6 md:grid-cols-3">
              <RiskBar value={insight.risk_score} label="Overall Risk Score" />
              <RiskBar value={insight.delay_probability} label="Delay Probability" />
              <RiskBar value={insight.inventory_risk} label="Inventory Risk" />
            </div>
            <div className="card mt-6 space-y-6">
              <div>
                <h3 className="font-semibold text-lg">Executive Summary</h3>
                <p className="mt-2 text-white/70">{insight.executive_summary}</p>
              </div>
              <div>
                <h3 className="font-semibold text-lg">Bottleneck Analysis</h3>
                <p className="mt-2 text-white/70">{insight.bottleneck_summary}</p>
              </div>
              <div>
                <h3 className="font-semibold text-lg">Recommendations</h3>
                <p className="mt-2 text-white/70">{insight.recommendations}</p>
              </div>
            </div>
          </section>
        )}
      </main>
    </>
  );
}
