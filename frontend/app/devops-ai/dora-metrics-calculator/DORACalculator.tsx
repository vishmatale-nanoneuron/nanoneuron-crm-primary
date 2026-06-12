"use client";
import { useState } from "react";
import Link from "next/link";

type Tier = "Elite" | "High" | "Medium" | "Low";

function deployFreqTier(v: string): Tier {
  if (v === "multiple_day") return "Elite";
  if (v === "once_day") return "High";
  if (v === "weekly") return "Medium";
  return "Low";
}

function leadTimeTier(days: number): Tier {
  if (days < 1) return "Elite";
  if (days <= 7) return "High";
  if (days <= 30) return "Medium";
  return "Low";
}

function cfr(pct: number): Tier {
  if (pct < 5) return "Elite";
  if (pct < 15) return "High";
  if (pct < 30) return "Medium";
  return "Low";
}

function mttrTier(mins: number): Tier {
  if (mins < 60) return "Elite";
  if (mins < 60 * 24) return "High";
  if (mins < 60 * 24 * 7) return "Medium";
  return "Low";
}

const TIER_ORDER: Tier[] = ["Elite", "High", "Medium", "Low"];

function overallTier(tiers: Tier[]): Tier {
  return TIER_ORDER[Math.max(...tiers.map((t) => TIER_ORDER.indexOf(t)))];
}

const TIER_COLOR: Record<Tier, string> = {
  Elite: "text-emerald-400 border-emerald-500/30 bg-emerald-500/8",
  High: "text-blue-400 border-blue-500/30 bg-blue-500/8",
  Medium: "text-amber-400 border-amber-500/30 bg-amber-500/8",
  Low: "text-red-400 border-red-500/30 bg-red-500/8",
};

const TIER_BAR: Record<Tier, string> = {
  Elite: "bg-emerald-500",
  High: "bg-blue-500",
  Medium: "bg-amber-400",
  Low: "bg-red-500",
};

const TIER_WIDTH: Record<Tier, string> = {
  Elite: "100%",
  High: "75%",
  Medium: "45%",
  Low: "20%",
};

const TIER_DESC: Record<Tier, string> = {
  Elite: "DORA Elite: top 10% of DevOps teams globally. Deploy multiple times per day with near-zero failure rate.",
  High: "DORA High: strong performance. Minor improvements in your weakest metric will reach Elite.",
  Medium: "DORA Medium: industry average. 1–2 specific metrics are creating outsized risk — find them and fix them.",
  Low: "DORA Low: below average. Systematic DevOps improvement programme needed. Start with MTTR reduction.",
};

export default function DORACalculator() {
  const [deployFreq, setDeployFreq] = useState("");
  const [leadTimeDays, setLeadTimeDays] = useState("");
  const [cfrPct, setCfrPct] = useState("");
  const [mttrMins, setMttrMins] = useState("");

  const ltDays = parseFloat(leadTimeDays);
  const cfrVal = parseFloat(cfrPct);
  const mttrVal = parseFloat(mttrMins);

  const hasFreq = deployFreq !== "";
  const hasLt = !isNaN(ltDays) && ltDays >= 0;
  const hasCfr = !isNaN(cfrVal) && cfrVal >= 0;
  const hasMttr = !isNaN(mttrVal) && mttrVal >= 0;
  const allFilled = hasFreq && hasLt && hasCfr && hasMttr;

  const metrics = allFilled
    ? [
        { name: "Deploy Frequency", tier: deployFreqTier(deployFreq), detail: deployFreq.replace("_", " ") },
        { name: "Lead Time for Changes", tier: leadTimeTier(ltDays), detail: `${ltDays}d` },
        { name: "Change Failure Rate", tier: cfr(cfrVal), detail: `${cfrVal}%` },
        { name: "MTTR", tier: mttrTier(mttrVal), detail: `${mttrVal}min` },
      ]
    : null;

  const overall = metrics ? overallTier(metrics.map((m) => m.tier)) : null;

  return (
    <div className="card max-w-xl mx-auto">
      <h2 className="text-xl font-bold mb-1">DORA Metrics Calculator</h2>
      <p className="text-white/45 text-sm mb-6">Enter your team&apos;s current DevOps metrics to find your DORA tier.</p>

      <div className="space-y-5">
        <div>
          <label className="block text-sm font-medium text-white/80 mb-1">Deployment Frequency</label>
          <p className="text-xs text-white/35 mb-2">How often does your team deploy to production?</p>
          <select
            value={deployFreq}
            onChange={(e) => setDeployFreq(e.target.value)}
            className="w-full rounded-xl border border-white/10 bg-white/4 px-4 py-3 text-white text-sm focus:outline-none focus:border-emerald-500/50"
          >
            <option value="" className="bg-zinc-900">Select frequency…</option>
            <option value="multiple_day" className="bg-zinc-900">Multiple times per day</option>
            <option value="once_day" className="bg-zinc-900">Once per day</option>
            <option value="weekly" className="bg-zinc-900">Once per week to once per month</option>
            <option value="monthly" className="bg-zinc-900">Once per month or less</option>
          </select>
        </div>

        {[
          { label: "Lead Time for Changes (days)", sublabel: "From code commit to production — median in days", val: leadTimeDays, set: setLeadTimeDays, placeholder: "e.g. 3" },
          { label: "Change Failure Rate (%)", sublabel: "% of deployments that caused an incident or required rollback", val: cfrPct, set: setCfrPct, placeholder: "e.g. 12" },
          { label: "Mean Time to Recovery (minutes)", sublabel: "Average minutes to restore service after a production incident", val: mttrMins, set: setMttrMins, placeholder: "e.g. 45" },
        ].map(({ label, sublabel, val, set, placeholder }) => (
          <div key={label}>
            <label className="block text-sm font-medium text-white/80 mb-1">{label}</label>
            <p className="text-xs text-white/35 mb-2">{sublabel}</p>
            <input
              type="number"
              min={0}
              value={val}
              onChange={(e) => set(e.target.value)}
              placeholder={placeholder}
              className="w-full rounded-xl border border-white/10 bg-white/4 px-4 py-3 text-white placeholder-white/20 text-sm focus:outline-none focus:border-emerald-500/50"
            />
          </div>
        ))}
      </div>

      {metrics && overall && (
        <div className={`mt-6 rounded-2xl border p-5 ${TIER_COLOR[overall]}`}>
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs uppercase tracking-wider opacity-60">Your DORA Tier</span>
          </div>
          <div className="text-4xl font-bold mb-1">{overall}</div>
          <div className="h-2 w-full rounded-full bg-white/10 mb-4">
            <div className={`h-2 rounded-full ${TIER_BAR[overall]}`} style={{ width: TIER_WIDTH[overall] }} />
          </div>
          <p className="text-sm opacity-75 mb-4">{TIER_DESC[overall]}</p>

          <div className="space-y-2">
            {metrics.map((m) => (
              <div key={m.name} className="flex items-center justify-between text-xs">
                <span className="opacity-60">{m.name}</span>
                <div className="flex items-center gap-2">
                  <span className="font-mono opacity-50">{m.detail}</span>
                  <span className={`rounded-full border px-2 py-0.5 font-semibold ${TIER_COLOR[m.tier]}`}>{m.tier}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {overall && overall !== "Elite" && (
        <div className="mt-4 rounded-xl border border-white/8 bg-white/3 p-4">
          <p className="text-sm font-medium text-white/80 mb-1">Which service is dragging your DORA tier down?</p>
          <p className="text-xs text-white/40 mb-3">
            Upload your deployment log CSV. OpsOracle AI names the specific services causing your highest change failure rate and worst MTTR — with deploy-to-incident correlation per service.
          </p>
          <Link href="/register" className="btn text-sm py-2.5 px-5 inline-block">
            Analyze Your Pipeline Free →
          </Link>
        </div>
      )}
    </div>
  );
}
