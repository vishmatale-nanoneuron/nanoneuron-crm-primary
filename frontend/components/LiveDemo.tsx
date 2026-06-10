"use client";
import { useState } from "react";
import Link from "next/link";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

type DemoResult = {
  risk_score: number;
  delay_probability: number;
  inventory_risk: number;
  executive_summary: string | null;
  bottleneck_summary: string | null;
  recommendations: string | null;
  industry_detected: string | null;
  cost_impact_usd: number | null;
  annual_savings_usd: number | null;
  vertical_ai_score: number | null;
  sub_vertical: string | null;
};

const INDUSTRIES = [
  { value: "logistics", label: "Logistics" },
  { value: "manufacturing", label: "Manufacturing" },
  { value: "warehouse", label: "Warehouse" },
];

function RiskBar({ value, label }: { value: number; label: string }) {
  const color = value >= 70 ? "bg-red-500" : value >= 40 ? "bg-yellow-500" : "bg-emerald-500";
  const textColor = value >= 70 ? "text-red-400" : value >= 40 ? "text-yellow-400" : "text-emerald-400";
  return (
    <div className="rounded-xl border border-white/10 bg-white/5 p-4">
      <p className="text-white/50 text-xs uppercase tracking-wider">{label}</p>
      <p className={`mt-1 text-3xl font-bold ${textColor}`}>{value}%</p>
      <div className="mt-2 h-1.5 w-full rounded-full bg-white/10">
        <div className={`h-1.5 rounded-full ${color} transition-all duration-700`} style={{ width: `${value}%` }} />
      </div>
    </div>
  );
}

export function LiveDemo() {
  const [industry, setIndustry] = useState("logistics");
  const [result, setResult] = useState<DemoResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function runDemo() {
    setLoading(true);
    setError("");
    setResult(null);
    try {
      const r = await fetch(`${API}/reports/public-demo?industry=${industry}`);
      if (!r.ok) throw new Error("API error");
      setResult(await r.json());
    } catch {
      setError("Demo unavailable — try again in a moment.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="px-6 py-20 border-t border-white/8">
      <div className="mx-auto max-w-5xl">
        <div className="text-center mb-10">
          <p className="text-sm uppercase tracking-widest text-emerald-400/70 mb-3">Try it live — no login needed</p>
          <h2 className="text-3xl md:text-4xl font-bold">Watch AI read real operations data</h2>
          <p className="mt-3 text-white/50 text-base max-w-xl mx-auto">
            Pick an industry. Click run. See exactly what your team gets in 30 seconds.
          </p>
        </div>

        {/* Controls */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center mb-8">
          <div className="flex rounded-xl border border-white/10 overflow-hidden">
            {INDUSTRIES.map((ind) => (
              <button
                key={ind.value}
                onClick={() => { setIndustry(ind.value); setResult(null); }}
                className={`px-5 py-2.5 text-sm font-medium transition-colors ${
                  industry === ind.value
                    ? "bg-emerald-500/20 text-emerald-400 border-x border-emerald-500/30"
                    : "text-white/50 hover:text-white hover:bg-white/5"
                }`}
              >
                {ind.label}
              </button>
            ))}
          </div>
          <button
            onClick={runDemo}
            disabled={loading}
            className="rounded-xl bg-emerald-500 hover:bg-emerald-400 px-7 py-2.5 text-sm font-semibold text-white transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <span className="h-3.5 w-3.5 rounded-full border-2 border-white/40 border-t-white animate-spin" />
                Analyzing data...
              </span>
            ) : "▶ Run AI Analysis"}
          </button>
        </div>

        {error && (
          <p className="text-center text-red-400 text-sm mb-6">{error}</p>
        )}

        {/* Loading skeleton */}
        {loading && (
          <div className="animate-pulse space-y-4 max-w-3xl mx-auto">
            <div className="grid grid-cols-3 gap-4">
              {[1,2,3].map(i => <div key={i} className="h-20 bg-white/5 rounded-xl" />)}
            </div>
            <div className="h-32 bg-white/5 rounded-xl" />
            <div className="h-24 bg-white/5 rounded-xl" />
          </div>
        )}

        {/* Results */}
        {result && !loading && (
          <div className="max-w-3xl mx-auto space-y-5">
            {/* Risk scores */}
            <div className="grid grid-cols-3 gap-4">
              <RiskBar value={result.risk_score} label="Overall Risk" />
              <RiskBar value={result.delay_probability} label="Delay Probability" />
              <RiskBar value={result.inventory_risk} label="Inventory Risk" />
            </div>

            {/* Financial impact */}
            {((result.cost_impact_usd ?? 0) > 0 || (result.annual_savings_usd ?? 0) > 0) && (
              <div className="grid grid-cols-2 gap-4">
                {(result.cost_impact_usd ?? 0) > 0 && (
                  <div className="rounded-xl border border-red-500/20 bg-red-500/8 px-4 py-3">
                    <p className="text-xs text-red-400/70 uppercase tracking-wider">Cost at risk</p>
                    <p className="text-xl font-bold text-red-400">${result.cost_impact_usd!.toLocaleString()}</p>
                  </div>
                )}
                {(result.annual_savings_usd ?? 0) > 0 && (
                  <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/8 px-4 py-3">
                    <p className="text-xs text-emerald-400/70 uppercase tracking-wider">Annual savings if fixed</p>
                    <p className="text-xl font-bold text-emerald-400">${result.annual_savings_usd!.toLocaleString()}</p>
                  </div>
                )}
              </div>
            )}

            {/* AI analysis text */}
            <div className="rounded-xl border border-white/10 bg-white/5 p-5 space-y-4">
              {result.executive_summary && (
                <div>
                  <p className="text-xs text-emerald-400/70 uppercase tracking-wider mb-1">Executive Summary</p>
                  <p className="text-white/80 text-sm leading-relaxed">{result.executive_summary}</p>
                </div>
              )}
              {result.bottleneck_summary && (
                <div className="border-t border-white/8 pt-4">
                  <p className="text-xs text-white/40 uppercase tracking-wider mb-1">Bottleneck</p>
                  <p className="text-white/70 text-sm leading-relaxed">{result.bottleneck_summary}</p>
                </div>
              )}
              {result.recommendations && (
                <div className="border-t border-white/8 pt-4">
                  <p className="text-xs text-white/40 uppercase tracking-wider mb-1">Recommendations</p>
                  <p className="text-white/70 text-sm leading-relaxed whitespace-pre-line">{result.recommendations}</p>
                </div>
              )}
            </div>

            {/* CTA */}
            <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 px-6 py-5 text-center">
              <p className="text-white/70 text-sm mb-1">This is sample data. Ready to analyze YOUR operations?</p>
              <p className="text-white/40 text-xs mb-4">Upload your CSV, Excel, or PDF — results in under 30 seconds.</p>
              <Link href="/register" className="inline-block rounded-xl bg-emerald-500 hover:bg-emerald-400 px-7 py-2.5 text-sm font-semibold text-white transition-colors">
                Analyze Your Data Free →
              </Link>
            </div>
          </div>
        )}

        {/* Default state CTA (before running) */}
        {!result && !loading && !error && (
          <p className="text-center text-white/25 text-sm">
            Click "Run AI Analysis" above to see the output live — no account needed.
          </p>
        )}
      </div>
    </section>
  );
}
