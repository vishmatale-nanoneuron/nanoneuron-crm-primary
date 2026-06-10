"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import Nav from "@/components/Nav";
import { api, getToken } from "@/lib/api";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

type Report = { id: string; file_name: string; file_type: string | null; rows_count: number; industry: string | null; created_at: string };
type Insight = {
  id: string; risk_score: number; delay_probability: number; inventory_risk: number;
  bottleneck_summary: string; executive_summary: string; recommendations: string;
  industry_detected: string | null; cost_impact_usd: number | null;
  vertical_ai_score: number | null; annual_savings_usd: number | null; created_at: string;
};

function RiskBar({ value, label }: { value: number; label: string }) {
  const color = value >= 70 ? "bg-red-500" : value >= 40 ? "bg-yellow-500" : "bg-emerald-500";
  const textColor = value >= 70 ? "text-red-400" : value >= 40 ? "text-yellow-400" : "text-emerald-400";
  return (
    <div className="card print:border print:border-gray-200 print:bg-white print:shadow-none">
      <p className="text-white/50 text-sm print:text-gray-500">{label}</p>
      <h2 className={`mt-1 text-4xl font-bold ${textColor} print:text-gray-900`}>{value}%</h2>
      <div className="mt-3 h-2 w-full rounded-full bg-white/10 print:bg-gray-100">
        <div className={`h-2 rounded-full ${color} print:bg-gray-700`} style={{ width: `${value}%` }} />
      </div>
      <p className="mt-2 text-xs text-white/30 print:text-gray-400">
        {value >= 70 ? "High risk — immediate action needed" : value >= 40 ? "Medium risk — monitor closely" : "Low risk — within normal range"}
      </p>
    </div>
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

  function handlePrint() {
    window.print();
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

  return (
    <>
      <Nav />
      <main className="p-8 max-w-5xl mx-auto">
        {/* Header — hidden in print */}
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
              {report?.rows_count != null && report.rows_count > 0 && (
                <span className="text-white/40 text-sm">{report.rows_count} rows analyzed</span>
              )}
              <span className="text-white/30 text-sm">
                {report?.created_at ? new Date(report.created_at).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" }) : ""}
              </span>
            </div>
          </div>
          <button
            onClick={handlePrint}
            className="flex items-center gap-2 rounded-xl border border-white/15 px-5 py-2.5 text-sm font-medium hover:bg-white/5 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            Download PDF
          </button>
        </div>

        {/* Print header — only in print */}
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
            {/* ROI panels */}
            {((insight.cost_impact_usd ?? 0) > 0 || (insight.annual_savings_usd ?? 0) > 0) && (
              <div className="mb-6 grid gap-4 md:grid-cols-2">
                {(insight.cost_impact_usd ?? 0) > 0 && (
                  <div className="rounded-xl border border-red-500/20 bg-red-500/8 px-5 py-4 print:border-red-200 print:bg-red-50">
                    <p className="text-xs text-red-400/70 uppercase tracking-wider mb-1 print:text-red-600">Cost at risk (current period)</p>
                    <p className="text-2xl font-bold text-red-400 print:text-red-700">${insight.cost_impact_usd!.toLocaleString()}</p>
                    <p className="text-xs text-white/40 mt-1 print:text-gray-500">Estimated from detected operational issues</p>
                  </div>
                )}
                {(insight.annual_savings_usd ?? 0) > 0 && (
                  <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/8 px-5 py-4 print:border-green-200 print:bg-green-50">
                    <p className="text-xs text-emerald-400/70 uppercase tracking-wider mb-1 print:text-green-600">Estimated annual savings if fixed</p>
                    <p className="text-2xl font-bold text-emerald-400 print:text-green-700">${insight.annual_savings_usd!.toLocaleString()}</p>
                    <p className="text-xs text-white/40 mt-1 print:text-gray-500">AI-predicted recurrence savings (ROI model)</p>
                  </div>
                )}
              </div>
            )}

            {/* Risk scores */}
            <div className="grid gap-6 md:grid-cols-3 mb-6">
              <RiskBar value={insight.risk_score} label="Overall Risk Score" />
              <RiskBar value={insight.delay_probability} label="Delay Probability" />
              <RiskBar value={insight.inventory_risk} label="Inventory Risk" />
            </div>

            {/* AI Analysis */}
            <div className="card space-y-6 print:border print:border-gray-200 print:bg-white print:shadow-none">
              {insight.vertical_ai_score != null && (
                <div className="flex items-center gap-2 pb-4 border-b border-white/10 print:border-gray-100">
                  <span className="rounded-full border border-blue-500/30 bg-blue-500/10 px-3 py-1 text-xs text-blue-400 print:border-blue-200 print:bg-blue-50 print:text-blue-700">
                    Vertical AI Score: {insight.vertical_ai_score}/100
                  </span>
                  <span className="text-white/30 text-xs print:text-gray-400">
                    {insight.vertical_ai_score >= 70 ? "High confidence analysis" : insight.vertical_ai_score >= 40 ? "Medium confidence" : "Low signal in data"}
                  </span>
                </div>
              )}
              <div>
                <h3 className="font-semibold text-lg print:text-gray-900">Executive Summary</h3>
                <p className="mt-2 text-white/70 leading-relaxed print:text-gray-700">{insight.executive_summary}</p>
              </div>
              <div>
                <h3 className="font-semibold text-lg print:text-gray-900">Bottleneck Analysis</h3>
                <p className="mt-2 text-white/70 leading-relaxed print:text-gray-700">{insight.bottleneck_summary}</p>
              </div>
              <div>
                <h3 className="font-semibold text-lg print:text-gray-900">Recommendations</h3>
                <p className="mt-2 text-white/70 leading-relaxed print:text-gray-700">{insight.recommendations}</p>
              </div>
            </div>

            {/* Print footer */}
            <div className="hidden print:block mt-8 border-t border-gray-200 pt-4 text-xs text-gray-400 flex items-center justify-between">
              <span>OpsOracle AI — Vertical AI for Industrial Operations</span>
              <span>nanoneuron.ai</span>
            </div>
          </>
        )}
      </main>
    </>
  );
}
