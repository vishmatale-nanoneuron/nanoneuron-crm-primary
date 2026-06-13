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
type Brief = {
  available: boolean;
  cross_pattern?: string;
  leverage_point?: string;
  priority_vertical?: string;
  why_first?: string;
  action_sequence?: string[];
  connected_findings?: string;
  vertical_count?: number;
  verticals_included?: string[];
};

function TrendSparkline({ scores }: { scores: number[] }) {
  if (scores.length < 2) return null;
  const W = 110, H = 36, PAD = 4;
  const lo = Math.min(...scores);
  const hi = Math.max(...scores, lo + 1);
  const pts = scores.map((s, i) => ({
    x: PAD + (i / (scores.length - 1)) * (W - PAD * 2),
    y: H - PAD - ((s - lo) / (hi - lo)) * (H - PAD * 2),
  }));
  const d = pts.map((p, i) => `${i === 0 ? "M" : "L"}${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(" ");
  const latest = scores[scores.length - 1];
  const prev = scores[scores.length - 2];
  const stroke = latest >= 70 ? "#ef4444" : latest >= 40 ? "#eab308" : "#10b981";
  const trend = latest > prev + 3 ? "↑ Worsening" : latest < prev - 3 ? "↓ Improving" : "→ Stable";
  const trendColor = latest > prev + 3 ? "text-red-400" : latest < prev - 3 ? "text-emerald-400" : "text-white/40";
  return (
    <div className="flex items-center gap-3">
      <svg width={W} height={H} className="shrink-0">
        <path d={d} fill="none" stroke={stroke} strokeWidth={1.5} strokeLinejoin="round" strokeLinecap="round" />
        {pts.map((p, i) => (
          <circle key={i} cx={p.x} cy={p.y} r={i === pts.length - 1 ? 3 : 1.5}
            fill={i === pts.length - 1 ? stroke : stroke + "60"} stroke={stroke} strokeWidth={1} />
        ))}
      </svg>
      <span className={`text-xs font-medium ${trendColor}`}>{trend}</span>
    </div>
  );
}

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
  const [trendScores, setTrendScores] = useState<number[]>([]);
  const [totalCostUsd, setTotalCostUsd] = useState(0);
  const [plan, setPlan] = useState<PlanInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [brief, setBrief] = useState<Brief | null>(null);

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
          const insightsList: Insight[][] = await Promise.all(
            reps.slice(0, 5).map((r: Report) =>
              api(`/reports/${r.id}/insights`).catch(() => [])
            )
          );
          const firstInsights = insightsList.map(ins => ins[0]).filter(Boolean) as Insight[];
          if (firstInsights.length > 0) {
            setLatestInsight(firstInsights[0]);
            setTrendScores([...firstInsights].reverse().map(i => i.risk_score));
            setTotalCostUsd(firstInsights.reduce((sum, i) => sum + (i.cost_impact_usd ?? 0), 0));
          // Fetch cross-vertical brief if ≥2 industries are present
          const industries = new Set(firstInsights.map(i => i.industry_detected).filter(Boolean));
          if (industries.size >= 2) {
            api("/reports/brief").then(b => { const br = b as Brief; if (br.available) setBrief(br); }).catch(() => {});
          }
          }
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
          {!loading && totalCostUsd > 0 && (
            <div className="rounded-xl border border-red-500/20 bg-red-500/8 px-4 py-3 text-right">
              <p className="text-xs text-red-400/60 uppercase tracking-wider">Total cost at risk</p>
              <p className="text-xl font-bold text-red-400">${totalCostUsd.toLocaleString()}</p>
              <p className="text-xs text-red-400/40 mt-0.5">last {Math.min(reports.length, 5)} reports</p>
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
        <div className="grid gap-6 md:grid-cols-4 mb-6">
          {statsCards.map(m => (
            <ScoreCard key={m.label} label={m.label} value={m.value} loading={loading} />
          ))}
        </div>

        {/* Risk trend sparkline — shown once ≥2 reports are loaded */}
        {!loading && trendScores.length >= 2 && (
          <div className="mb-8 rounded-xl border border-white/8 bg-white/3 px-5 py-4 flex items-center gap-6 flex-wrap">
            <div>
              <p className="text-xs text-white/40 uppercase tracking-wider mb-2">Risk Trend — last {trendScores.length} reports</p>
              <TrendSparkline scores={trendScores} />
            </div>
            <div className="flex gap-2 ml-auto flex-wrap">
              {[...trendScores].reverse().map((s, i) => (
                <div key={i} className={`w-9 h-9 rounded-lg flex items-center justify-center text-xs font-bold shrink-0 border ${
                  s >= 70 ? "bg-red-500/15 text-red-400 border-red-500/20" :
                  s >= 40 ? "bg-yellow-500/15 text-yellow-400 border-yellow-500/20" :
                  "bg-emerald-500/15 text-emerald-400 border-emerald-500/20"
                }`}>
                  {s}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Cross-Vertical Intelligence Brief */}
        {brief && brief.available && (
          <section className="mb-6 rounded-2xl border border-violet-500/25 bg-gradient-to-br from-violet-500/8 to-indigo-500/5 px-6 py-5">
            <div className="flex items-center gap-2 mb-4">
              <span className="text-xs font-bold uppercase tracking-wider text-violet-400">AGI Synthesis</span>
              <span className="rounded-full border border-violet-500/30 bg-violet-500/10 px-2 py-0.5 text-[10px] font-semibold text-violet-300">
                {brief.vertical_count} verticals
              </span>
              {brief.verticals_included && (
                <div className="flex gap-1 ml-1 flex-wrap">
                  {brief.verticals_included.map(v => (
                    <span key={v} className="rounded bg-white/5 px-1.5 py-0.5 text-[10px] text-white/40 capitalize">{v.replace("_", " ")}</span>
                  ))}
                </div>
              )}
            </div>

            <h2 className="text-lg font-bold text-white mb-1">Cross-Vertical Intelligence Brief</h2>
            <p className="text-white/50 text-xs mb-5">Hidden causal chains a single-vertical analysis misses</p>

            <div className="grid gap-4 sm:grid-cols-2">
              {brief.cross_pattern && (
                <div className="rounded-xl border border-violet-500/15 bg-black/20 px-4 py-3">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-violet-400/70 mb-1.5">Connected Pattern</p>
                  <p className="text-sm text-white/85 leading-relaxed">{brief.cross_pattern}</p>
                </div>
              )}
              {brief.leverage_point && (
                <div className="rounded-xl border border-indigo-500/15 bg-black/20 px-4 py-3">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-indigo-400/70 mb-1.5">Highest-Leverage Action</p>
                  <p className="text-sm text-white/85 leading-relaxed">{brief.leverage_point}</p>
                </div>
              )}
              {brief.priority_vertical && (
                <div className="rounded-xl border border-emerald-500/15 bg-black/20 px-4 py-3">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-emerald-400/70 mb-1.5">Fix First</p>
                  <p className="text-sm font-semibold text-emerald-400 capitalize mb-1">{brief.priority_vertical.replace("_", " ")}</p>
                  {brief.why_first && <p className="text-xs text-white/55">{brief.why_first}</p>}
                </div>
              )}
              {brief.connected_findings && (
                <div className="rounded-xl border border-amber-500/15 bg-black/20 px-4 py-3">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-amber-400/70 mb-1.5">Non-Obvious Finding</p>
                  <p className="text-sm text-white/85 leading-relaxed">{brief.connected_findings}</p>
                </div>
              )}
            </div>

            {brief.action_sequence && brief.action_sequence.length > 0 && (
              <div className="mt-4 border-t border-white/5 pt-4">
                <p className="text-[10px] font-bold uppercase tracking-wider text-white/30 mb-2.5">Recommended sequence</p>
                <ol className="space-y-1.5">
                  {brief.action_sequence.map((step, i) => (
                    <li key={i} className="flex gap-2.5 text-sm">
                      <span className="shrink-0 mt-0.5 text-violet-400/50 font-mono text-xs">{i + 1}.</span>
                      <span className="text-white/65">{step}</span>
                    </li>
                  ))}
                </ol>
              </div>
            )}
          </section>
        )}

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
