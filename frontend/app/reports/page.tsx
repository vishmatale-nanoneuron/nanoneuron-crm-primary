"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Nav from "@/components/Nav";
import { api, getToken } from "@/lib/api";

type Report = { id: string; file_name: string; rows_count: number; industry: string | null; created_at: string };

function riskColor(score: number | null) {
  if (score == null) return "text-white/30";
  if (score >= 70) return "text-red-400";
  if (score >= 40) return "text-yellow-400";
  return "text-emerald-400";
}

function riskLabel(score: number | null) {
  if (score == null) return null;
  if (score >= 70) return "High Risk";
  if (score >= 40) return "Medium";
  return "Low Risk";
}

export default function Reports() {
  const router = useRouter();
  const [reports, setReports] = useState<Report[]>([]);
  const [insights, setInsights] = useState<Record<string, { risk_score: number } | null>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!getToken()) { router.push("/login"); return; }
    api("/reports")
      .then(async (reps: Report[]) => {
        setReports(reps);
        // Load insights for the first 10 reports to show risk badge
        const top = reps.slice(0, 10);
        const pairs = await Promise.allSettled(
          top.map(r => api(`/reports/${r.id}/insights`).then((ins: { risk_score: number }[]) => [r.id, ins[0] ?? null] as [string, { risk_score: number } | null]))
        );
        const map: Record<string, { risk_score: number } | null> = {};
        pairs.forEach(p => { if (p.status === "fulfilled" && p.value) map[p.value[0]] = p.value[1]; });
        setInsights(map);
      })
      .catch(() => setError("Failed to load reports. Please login again."))
      .finally(() => setLoading(false));
  }, [router]);

  return (
    <>
      <Nav />
      <main className="p-8 max-w-4xl mx-auto">
        <div className="mb-8 flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-4xl font-bold">Reports</h1>
            <p className="mt-1 text-white/50">All your uploaded operational reports with AI analysis history</p>
          </div>
          <Link href="/upload" className="btn">+ Upload New</Link>
        </div>

        {error && <p className="text-red-400 mb-4">{error}</p>}

        {loading && (
          <div className="space-y-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="card animate-pulse">
                <div className="h-5 bg-white/10 rounded w-48 mb-2" />
                <div className="h-3 bg-white/5 rounded w-32" />
              </div>
            ))}
          </div>
        )}

        {!loading && reports.length === 0 && !error && (
          <div className="card text-center py-16">
            <div className="text-5xl mb-4">📂</div>
            <h2 className="text-xl font-semibold mb-2">No reports yet</h2>
            <p className="text-white/40 mb-6">Upload your first operations CSV, Excel, or PDF to get AI risk analysis.</p>
            <Link href="/upload" className="btn">Upload Your First Report</Link>
          </div>
        )}

        <div className="space-y-3">
          {reports.map(r => {
            const ins = insights[r.id];
            const score = ins?.risk_score ?? null;
            return (
              <div key={r.id} className="card flex items-center justify-between gap-4 hover:border-white/20 transition-colors">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h2 className="font-semibold truncate">{r.file_name}</h2>
                    {r.industry && (
                      <span className="rounded-full border border-emerald-500/20 bg-emerald-500/8 px-2 py-0.5 text-xs text-emerald-400/80 capitalize shrink-0">
                        {r.industry.replace("_", " ")}
                      </span>
                    )}
                  </div>
                  <p className="mt-1 text-white/40 text-sm">
                    {r.rows_count > 0 ? `${r.rows_count} rows · ` : ""}
                    {new Date(r.created_at).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" })}
                  </p>
                </div>
                <div className="flex items-center gap-4 shrink-0">
                  {score !== null && (
                    <div className="text-right">
                      <p className={`text-xl font-bold ${riskColor(score)}`}>{score}%</p>
                      <p className={`text-xs ${riskColor(score)}`}>{riskLabel(score)}</p>
                    </div>
                  )}
                  <Link
                    href={`/reports/${r.id}`}
                    className="rounded-xl border border-white/15 px-4 py-2 text-sm font-medium hover:bg-white/5 transition-colors"
                  >
                    View Analysis →
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      </main>
    </>
  );
}
