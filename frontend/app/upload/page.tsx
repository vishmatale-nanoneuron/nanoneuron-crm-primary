"use client";
import { useState } from "react";
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
};

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
  const [file, setFile] = useState<File | null>(null);
  const [insight, setInsight] = useState<Insight | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!file) return;
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
    if (!res.ok) { setError("Upload failed. Please login and use CSV, XLSX, or PDF."); return; }
    setInsight(await res.json());
  }

  return (
    <>
      <Nav />
      <main className="p-8">
        <h1 className="mb-2 text-4xl font-bold">Upload Operations Report</h1>
        <p className="mb-8 text-white/50">CSV, Excel, or PDF — AI analyzes it instantly</p>
        <form onSubmit={submit} className="card max-w-xl space-y-4">
          <input className="input" type="file" accept=".csv,.xlsx,.xls,.pdf" onChange={e => setFile(e.target.files?.[0] || null)} required />
          <button disabled={loading} className="btn w-full">{loading ? "Analyzing with AI..." : "Analyze Report"}</button>
          {error && <p className="text-red-400 text-sm">{error}</p>}
        </form>

        {insight && (
          <section className="mt-10">
            <h2 className="mb-6 text-2xl font-semibold">AI Risk Analysis</h2>
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
