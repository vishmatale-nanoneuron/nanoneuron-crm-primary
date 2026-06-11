"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import InsightAnalysis, { type InsightData } from "@/components/InsightAnalysis";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

type SharedInsight = InsightData & { created_at: string };

type SharedReport = {
  file_name: string;
  industry: string | null;
  rows_count: number;
  created_at: string;
  insight: SharedInsight;
};

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
      <header>
        <nav aria-label="Main navigation" className="border-b border-white/8 bg-zinc-950/80 backdrop-blur-md px-6 py-4">
          <div className="mx-auto max-w-5xl flex items-center justify-between">
            <Link href="/" className="text-lg font-bold tracking-tight" aria-label="OpsOracle AI home">
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
      </header>

      <main id="main-content" className="p-6 max-w-5xl mx-auto">
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
                ⚡ Vertical AGI Analysis
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

        {/* Full world-class analysis */}
        <InsightAnalysis
          insight={{ ...insight, id: "", report_id: "" }}
          showBenchmarkBadge={false}
          showBaselineComparison={false}
        />

        {/* CTA */}
        <div className="mt-10 rounded-xl border border-emerald-500/20 bg-emerald-500/5 px-6 py-6 text-center">
          <p className="text-sm text-white/40 mb-1">Powered by OpsOracle AI — Vertical AGI for Industrial Operations</p>
          <h2 className="text-xl font-bold mb-2">Analyze your own operations data</h2>
          <p className="text-white/50 text-sm mb-5">
            Upload your CSV, Excel, or PDF — AI reads every row, names the specific pain, shows its reasoning chain, and tells your team exactly what to do. 14-day Pro trial, no card needed.
          </p>
          <Link href="/register" className="inline-block rounded-xl bg-emerald-500 hover:bg-emerald-400 px-8 py-3 text-sm font-semibold text-white transition-colors">
            Start Free — Analyze Your Data →
          </Link>
        </div>

        <div className="text-center text-xs text-white/20 pb-8 mt-6">
          <Link href="/" className="hover:text-white/40 transition-colors">
            OpsOracle AI · nanoneuron.ai
          </Link>
        </div>
      </main>
    </div>
  );
}
