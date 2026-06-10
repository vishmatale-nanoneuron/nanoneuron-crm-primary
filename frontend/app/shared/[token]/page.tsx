"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

type SharedInsight = {
  risk_score: number;
  delay_probability: number;
  inventory_risk: number;
  bottleneck_summary: string | null;
  executive_summary: string | null;
  recommendations: string | null;
  industry_detected: string | null;
  cost_impact_usd: number | null;
  vertical_ai_score: number | null;
  annual_savings_usd: number | null;
  sub_vertical: string | null;
  agi_analysis: boolean;
  created_at: string;
};

type SharedReport = {
  file_name: string;
  industry: string | null;
  rows_count: number;
  created_at: string;
  insight: SharedInsight;
};

function RiskBar({ value, label }: { value: number; label: string }) {
  const color = value >= 70 ? "bg-red-500" : value >= 40 ? "bg-yellow-500" : "bg-emerald-500";
  const textColor = value >= 70 ? "text-red-400" : value >= 40 ? "text-yellow-400" : "text-emerald-400";
  return (
    <div className="rounded-xl border border-white/10 bg-white/5 p-5">
      <p className="text-white/50 text-sm">{label}</p>
      <p className={`mt-1 text-4xl font-bold ${textColor}`}>{value}%</p>
      <div className="mt-3 h-2 w-full rounded-full bg-white/10">
        <div className={`h-2 rounded-full ${color}`} style={{ width: `${value}%` }} />
      </div>
      <p className="mt-2 text-xs text-white/30">
        {value >= 70 ? "High risk — immediate action needed" : value >= 40 ? "Medium risk — monitor closely" : "Low risk — within normal range"}
      </p>
    </div>
  );
}

export default function SharedReportPage() {
  const params = useParams();
  const token = params.token as string;
  const [data, setData] = useState<SharedReport | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    fetch(`${API}/reports/shared/${token}`)
      .then(r => {
        if (!r.ok) { setNotFound(true); return null; }
        return r.json();
      })
      .then(d => { if (d) setData(d); })
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false));
  }, [token]);

  if (loading) return (
    <div className="min-h-screen bg-zinc-950 text-white flex items-center justify-center">
      <div className="text-center space-y-3">
        <div className="h-8 w-8 rounded-full border-2 border-emerald-500/40 border-t-emerald-500 animate-spin mx-auto" />
        <p className="text-white/40 text-sm">Loading report...</p>
      </div>
    </div>
  );

  if (notFound || !data) return (
    <div className="min-h-screen bg-zinc-950 text-white flex items-center justify-center px-6">
      <div className="text-center max-w-md">
        <p className="text-white/30 text-5xl mb-4">404</p>
        <h1 className="text-xl font-bold mb-2">Report not found</h1>
        <p className="text-white/50 text-sm mb-6">This link may have expired or been removed.</p>
        <Link href="/" className="inline-block rounded-xl bg-emerald-500 hover:bg-emerald-400 px-6 py-2.5 text-sm font-semibold text-white transition-colors">
          Go to OpsOracle AI →
        </Link>
      </div>
    </div>
  );

  const { insight } = data;
  const industry = insight.industry_detected || data.industry || "operations";

  return (
    <div className="min-h-screen bg-zinc-950 text-white">
      {/* Minimal nav */}
      <nav className="border-b border-white/8 bg-zinc-950/80 backdrop-blur-md px-6 py-4">
        <div className="mx-auto max-w-5xl flex items-center justify-between">
          <Link href="/" className="text-lg font-bold tracking-tight">
            <span className="text-emerald-400">Ops</span>Oracle AI
          </Link>
          <div className="flex items-center gap-3">
            <span className="hidden sm:block text-xs text-white/30 border border-white/10 rounded-full px-3 py-1">
              Shared Report
            </span>
            <Link href="/register" className="rounded-xl bg-emerald-500 hover:bg-emerald-400 px-4 py-2 text-sm font-semibold text-white transition-colors">
              Analyze your data free →
            </Link>
          </div>
        </div>
      </nav>

      <main className="p-6 max-w-5xl mx-auto">
        {/* Header */}
        <div className="my-8">
          <div className="flex flex-wrap items-center gap-3 mb-2">
            <span className="rounded-full border border-white/15 bg-white/5 px-3 py-1 text-xs text-white/50">
              Shared Report
            </span>
            {industry && (
              <span className="rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-xs text-emerald-400 capitalize">
                {industry.replace("_", " ")} operations
              </span>
            )}
            {insight.agi_analysis && (
              <span className="rounded-full border border-violet-500/40 bg-violet-500/10 px-3 py-1 text-xs text-violet-400 font-semibold">
                ⚡ AGI Analysis
              </span>
            )}
            {insight.sub_vertical && insight.sub_vertical !== "general" && (
              <span className="rounded-full border border-purple-500/30 bg-purple-500/10 px-3 py-1 text-xs text-purple-400 capitalize">
                {industry} › {insight.sub_vertical.replace("_", " ")}
              </span>
            )}
          </div>
          <h1 className="text-2xl font-bold break-all">{data.file_name}</h1>
          <p className="text-white/35 text-sm mt-1">
            {data.rows_count > 0 ? `${data.rows_count} rows analyzed · ` : ""}
            {data.created_at ? new Date(data.created_at).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" }) : ""}
          </p>
        </div>

        {/* ROI panels */}
        {((insight.cost_impact_usd ?? 0) > 0 || (insight.annual_savings_usd ?? 0) > 0) && (
          <div className="mb-6 grid gap-4 md:grid-cols-2">
            {(insight.cost_impact_usd ?? 0) > 0 && (
              <div className="rounded-xl border border-red-500/20 bg-red-500/8 px-5 py-4">
                <p className="text-xs text-red-400/70 uppercase tracking-wider mb-1">Cost at risk</p>
                <p className="text-2xl font-bold text-red-400">${insight.cost_impact_usd!.toLocaleString()}</p>
              </div>
            )}
            {(insight.annual_savings_usd ?? 0) > 0 && (
              <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/8 px-5 py-4">
                <p className="text-xs text-emerald-400/70 uppercase tracking-wider mb-1">Annual savings if fixed</p>
                <p className="text-2xl font-bold text-emerald-400">${insight.annual_savings_usd!.toLocaleString()}</p>
              </div>
            )}
          </div>
        )}

        {/* Risk scores */}
        <div className="grid gap-5 md:grid-cols-3 mb-6">
          <RiskBar value={insight.risk_score} label="Overall Risk Score" />
          <RiskBar value={insight.delay_probability} label="Delay Probability" />
          <RiskBar value={insight.inventory_risk} label="Inventory Risk" />
        </div>

        {/* AI Analysis */}
        <div className="rounded-xl border border-white/10 bg-white/5 p-6 space-y-6 mb-8">
          {insight.vertical_ai_score != null && (
            <div className="flex items-center gap-3 pb-4 border-b border-white/8">
              <span className="rounded-full border border-blue-500/30 bg-blue-500/10 px-3 py-1 text-xs text-blue-400">
                Vertical AI Score: {insight.vertical_ai_score}/100
              </span>
              <span className="text-white/30 text-xs">
                {insight.vertical_ai_score >= 70 ? "High confidence analysis" : insight.vertical_ai_score >= 40 ? "Medium confidence" : "Low signal in data"}
              </span>
            </div>
          )}
          {insight.executive_summary && (
            <div>
              <h3 className="font-semibold text-lg mb-2">Executive Summary</h3>
              <p className="text-white/70 leading-relaxed">{insight.executive_summary}</p>
            </div>
          )}
          {insight.bottleneck_summary && (
            <div>
              <h3 className="font-semibold text-lg mb-2">Bottleneck Analysis</h3>
              <p className="text-white/70 leading-relaxed">{insight.bottleneck_summary}</p>
            </div>
          )}
          {insight.recommendations && (
            <div>
              <h3 className="font-semibold text-lg mb-2">Recommendations</h3>
              <p className="text-white/70 leading-relaxed whitespace-pre-line">{insight.recommendations}</p>
            </div>
          )}
        </div>

        {/* CTA */}
        <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 px-6 py-6 text-center mb-8">
          <p className="text-sm text-white/50 mb-1">Powered by OpsOracle AI — Vertical AI for Industrial Operations</p>
          <h2 className="text-xl font-bold mb-2">Analyze your own operations data</h2>
          <p className="text-white/50 text-sm mb-5">
            Upload your CSV, Excel, or PDF — AI reads every row, names the specific pain, and tells your team exactly what to do. 14-day Pro trial, no card needed.
          </p>
          <Link href="/register" className="inline-block rounded-xl bg-emerald-500 hover:bg-emerald-400 px-8 py-3 text-sm font-semibold text-white transition-colors">
            Start Free — Analyze Your Data →
          </Link>
        </div>

        <div className="text-center text-xs text-white/20 pb-8">
          <Link href="/" className="hover:text-white/40 transition-colors">
            OpsOracle AI · nanoneuron.ai
          </Link>
        </div>
      </main>
    </div>
  );
}
