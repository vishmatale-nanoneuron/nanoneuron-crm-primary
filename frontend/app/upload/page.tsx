"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Nav from "@/components/Nav";
import InsightAnalysis, { type InsightData } from "@/components/InsightAnalysis";
import { getToken } from "@/lib/api";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

type Insight = InsightData;

type Usage = { plan_tier: string; used: number; limit: number | null; unlimited: boolean; remaining: number | null };


const DEMO_INDUSTRIES = [
  { value: "logistics", label: "Logistics & Shipments" },
  { value: "manufacturing", label: "Manufacturing & Machines" },
  { value: "warehouse", label: "Warehouse & Inventory" },
  { value: "devops", label: "DevOps & Deployments" },
  { value: "mlops", label: "MLOps & Model Health" },
  { value: "retail", label: "Retail & Store Analytics" },
  { value: "supply_chain", label: "Supply Chain & Procurement" },
];

export default function Upload() {
  const router = useRouter();
  const [file, setFile] = useState<File | null>(null);
  const [insight, setInsight] = useState<Insight | null>(null);
  const [loading, setLoading] = useState(false);
  const [demoLoading, setDemoLoading] = useState(false);
  const [demoIndustry, setDemoIndustry] = useState("logistics");
  const [error, setError] = useState("");
  const [usage, setUsage] = useState<Usage | null>(null);

  useEffect(() => {
    if (!getToken()) { router.push("/login"); return; }
    fetch(`${API}/reports/usage`, { headers: { Authorization: `Bearer ${getToken()}` } })
      .then(r => r.json())
      .then(setUsage)
      .catch(() => {});
  }, [router]);

  async function runDemo() {
    setDemoLoading(true);
    setError("");
    setInsight(null);
    const res = await fetch(`${API}/reports/demo?industry=${demoIndustry}`, {
      headers: { Authorization: `Bearer ${getToken()}` },
    });
    setDemoLoading(false);
    if (!res.ok) { setError("Demo failed. Please try again."); return; }
    setInsight(await res.json());
    fetch(`${API}/reports/usage`, { headers: { Authorization: `Bearer ${getToken()}` } })
      .then(r => r.json()).then(setUsage).catch(() => {});
  }

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
      <main id="main-content" className="p-8">
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

        {/* Try with sample data */}
        <div className="card max-w-xl mb-4 border-emerald-500/20 bg-emerald-500/5">
          <p className="text-xs uppercase tracking-wider text-emerald-400/70 mb-3">No file? Try live sample data</p>
          <div className="flex gap-3 flex-wrap">
            <label htmlFor="demo-industry" className="sr-only">Select industry for demo</label>
            <select
              id="demo-industry"
              value={demoIndustry}
              onChange={e => setDemoIndustry(e.target.value)}
              className="flex-1 rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-white focus:border-emerald-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-emerald-400"
            >
              {DEMO_INDUSTRIES.map(d => (
                <option key={d.value} value={d.value} className="bg-zinc-900">{d.label}</option>
              ))}
            </select>
            <button
              onClick={runDemo}
              disabled={demoLoading}
              className="rounded-xl border border-emerald-500/40 bg-emerald-500/10 px-5 py-2.5 text-sm font-semibold text-emerald-400 hover:bg-emerald-500/20 transition-colors disabled:opacity-50"
            >
              {demoLoading ? "Analyzing..." : "▶ Run AI Demo"}
            </button>
          </div>
          <p className="mt-2 text-xs text-white/30">Uses real industry data — shows exactly how OpsOracle finds your pains</p>
        </div>

        {/* CSV templates */}
        <div className="card max-w-xl mb-4 border-white/8">
          <p className="text-xs uppercase tracking-wider text-white/40 mb-3">Don&apos;t have a file? Download a CSV template</p>
          <div className="flex gap-2 flex-wrap">
            {[
              { id: "logistics", label: "Logistics", headers: "Shipment ID,Origin,Destination,Carrier,Scheduled Date,Actual Date,Status,Weight_kg,Cost_INR\nSH-001,Mumbai,Delhi,BlueDart,2026-06-10,,Pending,100,3500\nSH-002,Chennai,Bangalore,DTDC,2026-06-10,2026-06-12,Delayed,50,1800\nSH-003,Mumbai,Pune,Delhivery,2026-06-10,2026-06-10,Delivered,200,2800" },
              { id: "manufacturing", label: "Manufacturing", headers: "Machine,Shift,Planned Output,Actual Output,Downtime_mins,Defects,Operator,Reason\nM1-Press,Morning,500,450,25,12,Raj Kumar,Breakdown\nM2-Lathe,Morning,300,290,10,3,Suresh P,Setup delay\nM3-Weld,Afternoon,400,398,5,1,Amit S,None" },
              { id: "warehouse", label: "Warehouse", headers: "SKU,Product Name,Category,Current Stock,Reorder Point,Daily Demand,Lead Time Days,Last Restock\nSKU-001,Bearings 6204,Mechanical,50,20,5,7,2026-06-01\nSKU-002,Motor 0.5HP,Electrical,5,15,3,14,2026-05-15\nSKU-003,Safety Gloves L,PPE,150,30,8,3,2026-06-10" },
            ].map(({ id, label, headers }) => (
              <button
                key={id}
                onClick={() => {
                  const blob = new Blob([headers], { type: "text/csv" });
                  const a = document.createElement("a");
                  a.href = URL.createObjectURL(blob);
                  a.download = `opsoracle_${id}_template.csv`;
                  a.click();
                  URL.revokeObjectURL(a.href);
                }}
                className="flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-xs text-white/60 hover:text-white hover:bg-white/10 transition-colors"
              >
                <svg aria-hidden="true" focusable="false" className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                {label} template
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-3 max-w-xl mb-4">
          <div className="flex-1 h-px bg-white/10" />
          <span className="text-white/30 text-xs">or upload your own file</span>
          <div className="flex-1 h-px bg-white/10" />
        </div>

        <form onSubmit={submit} className="card max-w-xl space-y-4">
          <div className="space-y-1">
            <label htmlFor="report-file" className="block text-sm text-white/60">
              Upload report <span aria-hidden="true" className="text-red-400">*</span>
              <span className="sr-only">(required)</span>
            </label>
            <input
              id="report-file"
              className="input"
              type="file"
              accept=".csv,.xlsx,.xls,.pdf"
              onChange={e => setFile(e.target.files?.[0] || null)}
              required
              disabled={limitReached}
              aria-describedby="file-hint"
            />
            <p id="file-hint" className="text-xs text-white/30">CSV, Excel (.xlsx) or PDF — any format, no template needed</p>
          </div>
          <button
            disabled={loading || limitReached}
            className="btn w-full disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Analyzing with AI..." : limitReached ? "Daily limit reached — upgrade to continue" : "Analyze Report"}
          </button>
          {error && <p role="alert" className="text-red-400 text-sm">{error}</p>}
          {!limitReached && usage && !usage.unlimited && (usage.remaining ?? 3) <= 1 && (
            <p className="text-yellow-400/70 text-xs text-center">
              {usage.remaining === 1 ? "Last free upload today." : "No free uploads left."}{" "}
              <Link href="/pricing" className="underline hover:text-yellow-300">Upgrade for unlimited →</Link>
            </p>
          )}
        </form>

        {insight && (
          <section aria-label="AI analysis results" aria-live="polite" className="mt-10">
            <div className="mb-6 flex items-center justify-between flex-wrap gap-4">
              <div>
                <h2 className="text-2xl font-semibold">AI Risk Analysis</h2>
                <p className="text-white/40 text-sm mt-1">
                  {insight.industry_detected && (
                    <span className="capitalize">{insight.industry_detected.replace("_", " ")} operations</span>
                  )}
                  {insight.sub_vertical && insight.sub_vertical !== "general" && (
                    <span className="ml-1 text-purple-400 capitalize"> › {insight.sub_vertical.replace("_", " ")}</span>
                  )}
                </p>
              </div>
              {insight.report_id && (
                <Link
                  href={`/reports/${insight.report_id}`}
                  className="rounded-xl bg-emerald-500 hover:bg-emerald-400 px-4 py-2 text-sm font-semibold text-white transition-colors"
                >
                  View Full Report →
                </Link>
              )}
            </div>
            <InsightAnalysis insight={insight} showBenchmarkBadge showBaselineComparison />
          </section>
        )}
      </main>
    </>
  );
}
