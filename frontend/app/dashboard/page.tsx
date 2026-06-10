"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Nav from "@/components/Nav";
import { api, getToken } from "@/lib/api";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

type Report = { id: string; file_name: string; rows_count: number; created_at: string; industry?: string };
type PlanInfo = { plan_tier: string; is_trial: boolean; days_remaining: number | null; expires_at: string | null };

export default function Dashboard() {
  const router = useRouter();
  const [reports, setReports] = useState<Report[]>([]);
  const [plan, setPlan] = useState<PlanInfo | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!getToken()) { router.push("/login"); return; }
    Promise.all([
      api("/reports"),
      fetch(`${API}/payments/my-plan`, { headers: { Authorization: `Bearer ${getToken()}` } }).then(r => r.json()),
    ])
      .then(([reps, planData]) => { setReports(reps); setPlan(planData); })
      .catch(() => router.push("/login"))
      .finally(() => setLoading(false));
  }, [router]);

  const trialDays = plan?.days_remaining ?? 0;
  const showTrialBanner = plan?.is_trial === true;
  const trialExpiringSoon = showTrialBanner && trialDays <= 3;

  return (
    <>
      <Nav />
      <main className="p-8">
        {/* Trial banner */}
        {showTrialBanner && (
          <div className={`mb-6 flex items-center justify-between gap-4 rounded-xl border px-5 py-4 ${
            trialExpiringSoon
              ? "border-yellow-500/40 bg-yellow-500/10"
              : "border-emerald-500/30 bg-emerald-500/8"
          }`}>
            <div className="flex items-center gap-3">
              <span className={`text-sm font-semibold ${trialExpiringSoon ? "text-yellow-400" : "text-emerald-400"}`}>
                {trialExpiringSoon ? "⚠" : "✦"} Pro Trial
              </span>
              <span className="text-white/70 text-sm">
                {trialDays > 0
                  ? `${trialDays} day${trialDays === 1 ? "" : "s"} remaining — all Pro features unlocked.`
                  : "Your trial ends today."}
              </span>
            </div>
            <Link
              href="/pricing"
              className={`shrink-0 rounded-lg px-4 py-2 text-xs font-semibold transition-colors ${
                trialExpiringSoon
                  ? "bg-yellow-500 text-black hover:bg-yellow-400"
                  : "bg-emerald-500 text-white hover:bg-emerald-400"
              }`}
            >
              Upgrade to keep access →
            </Link>
          </div>
        )}

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
                  <p className="text-white/40 text-xs mt-0.5">
                    {r.rows_count > 0 ? `${r.rows_count} rows · ` : ""}
                    {r.industry && <span className="capitalize">{r.industry.replace("_", " ")} · </span>}
                    {new Date(r.created_at).toLocaleString()}
                  </p>
                </div>
                <Link href="/upload" className="text-sm text-emerald-400 hover:underline">Re-analyze →</Link>
              </div>
            ))}
          </div>
        </section>

        {/* Plan status card */}
        {!loading && plan && (
          <section className="card mt-6">
            <div className="flex items-center justify-between flex-wrap gap-3">
              <div>
                <p className="text-white/50 text-sm">Current Plan</p>
                <div className="mt-1 flex items-center gap-2">
                  <span className={`text-lg font-bold capitalize ${plan.plan_tier === "free" ? "text-white/60" : "text-emerald-400"}`}>
                    {plan.plan_tier}
                  </span>
                  {plan.is_trial && (
                    <span className="rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2 py-0.5 text-xs text-emerald-400">
                      14-day trial
                    </span>
                  )}
                  {plan.plan_tier === "free" && !plan.is_trial && (
                    <span className="text-white/30 text-xs">Trial ended</span>
                  )}
                </div>
              </div>
              {plan.plan_tier === "free" ? (
                <Link href="/pricing" className="btn !py-2 !px-4 !text-sm">Upgrade to Pro</Link>
              ) : (
                <Link href="/pricing" className="text-sm text-white/40 hover:text-white transition-colors">Manage plan →</Link>
              )}
            </div>
          </section>
        )}
      </main>
    </>
  );
}
