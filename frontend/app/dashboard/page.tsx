"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Nav from "@/components/Nav";
import { api, getToken } from "@/lib/api";

type Report = { id: string; file_name: string; rows_count: number; created_at: string };

export default function Dashboard() {
  const router = useRouter();
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!getToken()) { router.push("/login"); return; }
    api("/reports")
      .then(setReports)
      .catch(() => router.push("/login"))
      .finally(() => setLoading(false));
  }, [router]);

  return (
    <>
      <Nav />
      <main className="p-8">
        <h1 className="mb-2 text-4xl font-bold">Predictive Operations Dashboard</h1>
        <p className="mb-8 text-white/50">Upload a report to see live AI risk scores</p>
        <div className="grid gap-6 md:grid-cols-4">
          {[
            { label: "Reports Analyzed", value: loading ? "..." : String(reports.length) },
            { label: "Risk Score", value: "--" },
            { label: "Delay Probability", value: "--" },
            { label: "Inventory Risk", value: "--" },
          ].map(m => (
            <div key={m.label} className="card">
              <p className="text-white/50 text-sm">{m.label}</p>
              <h2 className="mt-1 text-4xl font-bold">{m.value}</h2>
            </div>
          ))}
        </div>
        <section className="card mt-8 flex flex-col items-start gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-xl font-semibold">Analyze Your Next Report</h2>
            <p className="mt-1 text-white/60 text-sm">Upload CSV, Excel, or PDF operational data to get instant AI predictions.</p>
          </div>
          <Link href="/upload" className="btn shrink-0">Upload Report</Link>
        </section>
        <section className="card mt-6">
          <h2 className="mb-3 text-lg font-semibold">Recent Reports</h2>
          {loading && <p className="text-white/40 text-sm">Loading...</p>}
          {!loading && reports.length === 0 && (
            <p className="text-white/40 text-sm">No reports yet. <Link href="/upload" className="text-emerald-400 hover:underline">Upload your first report →</Link></p>
          )}
          <div className="space-y-3">
            {reports.slice(0, 5).map(r => (
              <div key={r.id} className="flex items-center justify-between rounded-xl bg-white/5 px-4 py-3">
                <div>
                  <p className="font-medium">{r.file_name}</p>
                  <p className="text-white/40 text-xs mt-0.5">{r.rows_count} rows · {new Date(r.created_at).toLocaleString()}</p>
                </div>
                <Link href="/upload" className="text-sm text-emerald-400 hover:underline">Re-analyze →</Link>
              </div>
            ))}
          </div>
        </section>
      </main>
    </>
  );
}
