"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Nav from "@/components/Nav";
import { api, getToken } from "@/lib/api";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

type Report = { id: string; file_name: string; rows_count: number; created_at: string; industry?: string };
type Insight = { risk_score: number; delay_probability: number; inventory_risk: number; cost_impact_usd?: number; vertical_ai_score?: number; industry_detected?: string; benchmark_count?: number | null; sub_vertical?: string | null; resolved_at?: string | null; };
type PlanInfo = { plan_tier: string; is_trial: boolean; days_remaining: number | null };

function ScoreCard({ label, value, loading }: { label: string; value: string; loading: boolean }) {
  const num = parseInt(value);
  const color = !isNaN(num) ? (num >= 70 ? "text-red-400" : num >= 40 ? "text-yellow-400" : "text-emerald-400") : "text-white/40";
  return (
    <div className="card">
      <p className="text-white/50 text-sm">{label}</p>
      <h2 className={`mt-1 text-4xl font-bold ${loading ? "text-white/20" : color}`}>
        {loading ? "..." : value}
      </h2>
      {!isNaN(num) && !loading && (
        <div className="mt-3 h-1.5 w-full rounded-full bg-white/10">
          <div
            className={`h-1.5 rounded-full transition-all ${num >= 70 ? "bg-red-500" : num >= 40 ? "bg-yellow-500" : "bg-emerald-500"}`}
            style={{ width: `${num}%` }}
          />
        </div>
      )}
    </div>
  );
}

export default function Dashboard() {
  const router = useRouter();
  const [reports, setReports] = useState<Report[]>([]);
  const [latestInsight, setLatestInsight] = useState<Insight | null>(null);
  const [plan, setPlan] = useState<PlanInfo | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!getToken()) { router.push("/login"); return; }
    const token = getToken();
    Promise.all([
      api("/reports"),
      fetch(`${API}/payments/my-plan`, { headers: { Authorization: `Bearer ${token}` } }).then(r => r.json()),
    ])
      .then(async ([reps, planData]) => {
        setReports(reps);
        setPlan(planData);
        if (reps.length > 0) {
          const insights = await api(`/reports/${reps[0].id}/insights`).catch(() => []);
          if (insights.length > 0) setLatestInsight(insights[0]);
        }
      })
      .catch(() => router.push("/login"))
      .finally(() => setLoading(false));
  }, [router]);

  const trialDays = plan?.days_remaining ?? 0;
  const showTrialBanner = plan?.is_trial === true;
  const trialExpiringSoon = showTrialBanner && trialDays <= 3;

  const statsCards = [
    { label: "Reports Analyzed", value: loading ? "..." : String(reports.length) },
    { label: "Latest Risk Score", value: loading ? "..." : latestInsight ? `${latestInsight.risk_score}%` : "--" },
    { label: "Delay Probability", value: loading ? "..." : latestInsight ? `${latestInsight.delay_probability}%` : "--" },
    { label: "Inventory Risk", value: loading ? "..." : latestInsight ? `${latestInsight.inventory_risk}%` : "--" },
  ];

  return (
    <>
      <Nav />
      <main id="main-content" className="p-8 max-w-6xl mx-auto">
        {/* Trial banner */}
        {showTrialBanner && (
          <div className={`mb-6 flex items-center justify-between gap-4 rounded-xl border px-5 py-4 ${
            trialExpiringSoon ? "border-yellow-500/40 bg-yellow-500/10" : "border-emerald-500/30 bg-emerald-500/8"
          }`}>
            <div className="flex items-center gap-3">
              <span className={`text-sm font-semibold ${trialExpiringSoon ? "text-yellow-400" : "text-emerald-400"}`}>
                {trialExpiringSoon ? "⚠" : "✦"} Pro Trial Active
              </span>
              <span className="text-white/70 text-sm">
                {trialDays > 0 ? `${trialDays} day${trialDays === 1 ? "" : "s"} remaining — all Pro features unlocked.` : "Trial ends today."}
              </span>
            </div>
            <Link href="/pricing" className={`shrink-0 rounded-lg px-4 py-2 text-xs font-semibold transition-colors ${
              trialExpiringSoon ? "bg-yellow-500 text-black hover:bg-yellow-400" : "bg-emerald-500 text-white hover:bg-emerald-400"
            }`}>
              Upgrade to keep access →
            </Link>
          </div>
        )}

        <div className="mb-8 flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-4xl font-bold">Operations Dashboard</h1>
            <p className="text-white/50 mt-1">
              {latestInsight && reports[0]
                ? `Latest analysis: ${reports[0].file_name}`
                : "Upload a report to see live AI risk scores"}
            </p>
          </div>
          {latestInsight && latestInsight.cost_impact_usd != null && latestInsight.cost_impact_usd > 0 && (
            <div className="rounded-xl border border-red-500/20 bg-red-500/8 px-4 py-3 text-right">
              <p className="text-xs text-red-400/60 uppercase tracking-wider">Cost at risk</p>
              <p className="text-xl font-bold text-red-400">${latestInsight.cost_impact_usd.toLocaleString()}</p>
            </div>
          )}
        </div>

        {/* Data flywheel contribution — Kai-Fu Lee principle #1 */}
        {latestInsight && (latestInsight.benchmark_count ?? 0) > 0 && (
          <div className="mb-6 flex items-center gap-3 rounded-xl border border-blue-500/20 bg-blue-500/8 px-5 py-3">
            <span className="text-blue-400 shrink-0">◉</span>
            <p className="text-sm text-blue-300">
              Your latest upload contributed to the{" "}
              <span className="font-semibold capitalize">{(latestInsight.industry_detected || "operations").replace("_", " ")}</span>{" "}
              benchmark — <span className="font-semibold">{latestInsight.benchmark_count} report{latestInsight.benchmark_count !== 1 ? "s" : ""}</span> analyzed across operations teams.
            </p>
          </div>
        )}

        {/* Score cards */}
        <div className="grid gap-6 md:grid-cols-4 mb-8">
          {statsCards.map(m => (
            <ScoreCard key={m.label} label={m.label} value={m.value} loading={loading} />
          ))}
        </div>

        {/* Upload CTA or latest report link */}
        {!loading && reports.length === 0 ? (
          <section className="card flex flex-col items-start gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <h2 className="text-xl font-semibold">Analyze Your First Report</h2>
              <p className="mt-1 text-white/60 text-sm">Upload CSV, Excel, or PDF operational data to get instant AI risk predictions.</p>
            </div>
            <Link href="/upload" className="btn shrink-0">Upload Report</Link>
          </section>
        ) : (
          <section className="card flex flex-col items-start gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <h2 className="text-xl font-semibold">Analyze Another Report</h2>
              <p className="mt-1 text-white/60 text-sm">Upload a new CSV, Excel, or PDF to get fresh AI risk predictions.</p>
            </div>
            <div className="flex gap-3">
              {reports[0] && <Link href={`/reports/${reports[0].id}`} className="rounded-xl border border-white/15 px-5 py-3 text-sm hover:bg-white/5 transition-colors">View Latest →</Link>}
              <Link href="/upload" className="btn shrink-0">Upload Report</Link>
            </div>
          </section>
        )}

        {/* Recent reports */}
        <section aria-label="Recent reports" className="card mt-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">Recent Reports</h2>
            <Link href="/reports" className="text-sm text-emerald-400 hover:underline">View all →</Link>
          </div>
          {loading && <p className="text-white/40 text-sm">Loading...</p>}
          {!loading && reports.length === 0 && (
            <p className="text-white/40 text-sm">No reports yet. <Link href="/upload" className="text-emerald-400 hover:underline">Upload your first report →</Link></p>
          )}
          <div className="space-y-2">
            {reports.slice(0, 5).map((r, i) => (
              <Link key={r.id} href={`/reports/${r.id}`} className="flex items-center justify-between rounded-xl bg-white/5 px-4 py-3 hover:bg-white/8 transition-colors">
                <div>
                  <p className="font-medium text-sm">{r.file_name}</p>
                  <p className="text-white/40 text-xs mt-0.5">
                    {r.rows_count > 0 ? `${r.rows_count} rows · ` : ""}
                    {r.industry && <span className="capitalize">{r.industry.replace("_", " ")} · </span>}
                    {new Date(r.created_at).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" })}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  {i === 0 && <span className="text-xs text-white/30">Latest</span>}
                  <span className="text-white/30 text-sm">→</span>
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* Plan status */}
        {!loading && plan && (
          <section className="card mt-6">
            <div className="flex items-center justify-between flex-wrap gap-3">
              <div>
                <p className="text-white/50 text-sm">Current Plan</p>
                <div className="mt-1 flex items-center gap-2">
                  <span className={`text-lg font-bold capitalize ${plan.plan_tier === "free" ? "text-white/60" : "text-emerald-400"}`}>
                    {plan.plan_tier}
                  </span>
                  {plan.is_trial && <span className="rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2 py-0.5 text-xs text-emerald-400">14-day trial</span>}
                </div>
              </div>
              {plan.plan_tier === "free" && !plan.is_trial
                ? <Link href="/pricing" className="btn !py-2 !px-4 !text-sm">Upgrade to Pro</Link>
                : <Link href="/pricing" className="text-sm text-white/40 hover:text-white transition-colors">Manage plan →</Link>
              }
            </div>
          </section>
        )}
      </main>
    </>
  );
}
