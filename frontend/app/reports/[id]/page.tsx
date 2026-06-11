"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import Nav from "@/components/Nav";
import InsightAnalysis, { type InsightData } from "@/components/InsightAnalysis";
import { api, getToken } from "@/lib/api";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

type Report = { id: string; file_name: string; file_type: string | null; rows_count: number; industry: string | null; created_at: string };
type Insight = InsightData & { created_at: string };

function SubVerticalLabel({ sub, industry }: { sub: string; industry: string }) {
  if (!sub || sub === "general") return null;
  const labels: Record<string, string> = {
    last_mile: "Last Mile", ftl: "FTL", cold_chain: "Cold Chain", air_freight: "Air Freight",
    discrete: "Discrete Mfg", process: "Process Mfg", automotive: "Automotive", pharma: "Pharma",
    spare_parts: "Spare Parts", "3pl": "3PL", dark_store: "Dark Store",
    ci_cd: "CI/CD", incident_mgmt: "Incident Mgmt", infrastructure: "Infrastructure",
    model_monitoring: "Model Monitoring", training_pipeline: "Training Pipeline", inference: "Inference",
  };
  return (
    <span className="rounded-full border border-purple-500/30 bg-purple-500/10 px-3 py-1 text-xs text-purple-400 capitalize print:hidden">
      {industry} › {labels[sub] || sub.replace("_", " ")}
    </span>
  );
}

export default function ReportDetail() {
  const params = useParams();
  const router = useRouter();
  const reportId = params.id as string;

  const [report, setReport] = useState<Report | null>(null);
  const [insight, setInsight] = useState<Insight | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [resolving, setResolving] = useState(false);
  const [resolveNote, setResolveNote] = useState("");
  const [showResolveForm, setShowResolveForm] = useState(false);
  const [sharing, setSharing] = useState(false);
  const [shareCopied, setShareCopied] = useState(false);

  useEffect(() => {
    if (!getToken()) { router.push("/login"); return; }
    Promise.all([
      api(`/reports/${reportId}`),
      api(`/reports/${reportId}/insights`),
    ])
      .then(([rep, insights]) => {
        setReport(rep);
        setInsight(Array.isArray(insights) && insights.length > 0 ? insights[0] : null);
      })
      .catch(() => setError("Report not found or you don't have access."))
      .finally(() => setLoading(false));
  }, [reportId, router]);

  async function handleShare() {
    setSharing(true);
    try {
      const res = await fetch(`${API}/reports/${reportId}/share`, {
        method: "POST",
        headers: { Authorization: `Bearer ${getToken()}` },
      });
      if (res.ok) {
        const { share_url } = await res.json();
        await navigator.clipboard.writeText(share_url);
        setShareCopied(true);
        setTimeout(() => setShareCopied(false), 3000);
      }
    } finally {
      setSharing(false);
    }
  }

  async function handleResolve() {
    if (!insight) return;
    setResolving(true);
    try {
      const res = await fetch(`${API}/reports/${reportId}/insights/${insight.id}/resolve`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${getToken()}` },
        body: JSON.stringify({ note: resolveNote }),
      });
      if (res.ok) {
        const updated = await res.json();
        setInsight(updated);
        setShowResolveForm(false);
      }
    } finally {
      setResolving(false);
    }
  }

  if (loading) return (
    <>
      <Nav />
      <main className="p-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-white/10 rounded-xl w-64" />
          <div className="h-4 bg-white/5 rounded-xl w-48" />
          <div className="grid md:grid-cols-3 gap-6 mt-8">
            {[1,2,3].map(i => <div key={i} className="h-32 bg-white/5 rounded-2xl" />)}
          </div>
        </div>
      </main>
    </>
  );

  if (error) return (
    <>
      <Nav />
      <main className="p-8">
        <p className="text-red-400">{error}</p>
        <Link href="/reports" className="mt-4 inline-block text-emerald-400 hover:underline">← Back to reports</Link>
      </main>
    </>
  );

  const industry = insight?.industry_detected || report?.industry || "operations";
  const isResolved = !!insight?.resolved_at;

  return (
    <>
      <Nav />
      <main className="p-8 max-w-5xl mx-auto">
        {/* Header */}
        <div className="mb-8 flex items-start justify-between flex-wrap gap-4 print:hidden">
          <div>
            <Link href="/reports" className="text-sm text-white/40 hover:text-white transition-colors">← All Reports</Link>
            <h1 className="mt-2 text-3xl font-bold break-all">{report?.file_name}</h1>
            <div className="mt-2 flex items-center gap-3 flex-wrap">
              {industry && (
                <span className="rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-xs text-emerald-400 capitalize">
                  {industry.replace("_", " ")} operations
                </span>
              )}
              {insight?.sub_vertical && (
                <SubVerticalLabel sub={insight.sub_vertical} industry={industry} />
              )}
              {insight?.expert_reviewed && (
                <span className="rounded-full border border-amber-500/40 bg-amber-500/10 px-3 py-1 text-xs text-amber-400 font-semibold">
                  ✓ Reviewed by Expert
                </span>
              )}
              {insight?.agi_analysis && (
                <span className="rounded-full border border-violet-500/40 bg-violet-500/10 px-3 py-1 text-xs text-violet-400 font-semibold">
                  ⚡ Vertical AGI Analysis
                </span>
              )}
              {isResolved && (
                <span className="rounded-full border border-emerald-500/40 bg-emerald-500/10 px-3 py-1 text-xs text-emerald-400 font-semibold">
                  ✓ Resolved {insight!.resolved_at ? new Date(insight!.resolved_at).toLocaleDateString("en-IN") : ""}
                </span>
              )}
              {report?.rows_count != null && report.rows_count > 0 && (
                <span className="text-white/40 text-sm">{report.rows_count} rows analyzed</span>
              )}
              <span className="text-white/30 text-sm">
                {report?.created_at ? new Date(report.created_at).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" }) : ""}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={handleShare}
              disabled={sharing}
              className={`flex items-center gap-2 rounded-xl border px-5 py-2.5 text-sm font-medium transition-colors ${
                shareCopied
                  ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-400"
                  : "border-white/15 hover:bg-white/5"
              }`}
            >
              {shareCopied ? (
                <>
                  <svg aria-hidden="true" focusable="false" className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Link copied!
                </>
              ) : (
                <>
                  <svg aria-hidden="true" focusable="false" className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                  </svg>
                  {sharing ? "Generating..." : "Share Report"}
                </>
              )}
            </button>
            <button
              onClick={() => window.print()}
              className="flex items-center gap-2 rounded-xl border border-white/15 px-5 py-2.5 text-sm font-medium hover:bg-white/5 transition-colors"
            >
              <svg aria-hidden="true" focusable="false" className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Download PDF
            </button>
          </div>
        </div>

        {/* Print header */}
        <div className="hidden print:block mb-8 border-b border-gray-200 pb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">OpsOracle AI — Operations Risk Report</h1>
              <p className="text-gray-500 mt-1">{report?.file_name}</p>
            </div>
            <div className="text-right text-sm text-gray-400">
              <p>Generated: {report?.created_at ? new Date(report.created_at).toLocaleString("en-IN", { dateStyle: "long", timeStyle: "short" }) : ""}</p>
              <p className="capitalize">{industry.replace("_", " ")} operations</p>
              {report?.rows_count != null && report.rows_count > 0 && <p>{report.rows_count} rows analyzed</p>}
            </div>
          </div>
        </div>

        {!insight ? (
          <div className="card text-center py-12">
            <p className="text-white/40">No analysis found for this report.</p>
            <Link href="/upload" className="mt-4 inline-block text-emerald-400 hover:underline">Re-analyze →</Link>
          </div>
        ) : (
          <>
            {/* Resolution status banner */}
            {isResolved && (
              <div className="mb-6 flex items-center gap-3 rounded-xl border border-emerald-500/30 bg-emerald-500/8 px-5 py-3 print:hidden">
                <span className="text-emerald-400 text-lg">✓</span>
                <div>
                  <p className="text-sm font-semibold text-emerald-400">This report has been resolved</p>
                  {insight.resolution_note && (
                    <p className="text-xs text-white/50 mt-0.5">{insight.resolution_note}</p>
                  )}
                  <p className="text-xs text-white/30 mt-0.5">
                    Resolved on {new Date(insight.resolved_at!).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" })}
                  </p>
                </div>
              </div>
            )}

            {/* World-class analysis */}
            <InsightAnalysis insight={insight} showBenchmarkBadge showBaselineComparison />

            {/* Mark as Resolved */}
            {!isResolved && (
              <div className="mt-6 card border-white/8 print:hidden">
                <div className="flex items-start justify-between gap-4 flex-wrap">
                  <div>
                    <h3 className="font-semibold text-base">Mark as Resolved</h3>
                    <p className="text-white/40 text-sm mt-1">
                      Did your team act on this analysis? Mark it resolved to close the feedback loop.
                    </p>
                  </div>
                  {!showResolveForm && (
                    <button
                      onClick={() => setShowResolveForm(true)}
                      className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-5 py-2.5 text-sm font-semibold text-emerald-400 hover:bg-emerald-500/20 transition-colors shrink-0"
                    >
                      ✓ Mark Resolved
                    </button>
                  )}
                </div>
                {showResolveForm && (
                  <div className="mt-4 space-y-3">
                    <label htmlFor="resolve-note" className="sr-only">Resolution note (optional)</label>
                    <textarea
                      id="resolve-note"
                      value={resolveNote}
                      onChange={e => setResolveNote(e.target.value)}
                      placeholder="Optional: describe what action your team took..."
                      rows={2}
                      className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder-white/25 focus:border-emerald-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-emerald-400 resize-none"
                    />
                    <div className="flex gap-3">
                      <button
                        onClick={handleResolve}
                        disabled={resolving}
                        className="rounded-xl bg-emerald-500 hover:bg-emerald-400 px-5 py-2.5 text-sm font-semibold text-white transition-colors disabled:opacity-50"
                      >
                        {resolving ? "Saving..." : "Confirm Resolution"}
                      </button>
                      <button
                        onClick={() => setShowResolveForm(false)}
                        className="rounded-xl border border-white/15 px-5 py-2.5 text-sm hover:bg-white/5 transition-colors"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Print footer */}
            <div className="hidden print:flex mt-8 border-t border-gray-200 pt-4 text-xs text-gray-400 items-center justify-between">
              <span>OpsOracle AI — Vertical AGI for Industrial Operations</span>
              <span>nanoneuron.ai</span>
            </div>
          </>
        )}
      </main>
    </>
  );
}
