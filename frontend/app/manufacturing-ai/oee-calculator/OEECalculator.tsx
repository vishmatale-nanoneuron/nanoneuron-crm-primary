"use client";
import { useState } from "react";
import Link from "next/link";

function tier(oee: number) {
  if (oee >= 85) return { label: "World Class", color: "emerald", desc: "Top 5% of manufacturers globally. Benchmark target for OEE excellence." };
  if (oee >= 65) return { label: "Good", color: "blue", desc: "Above average. Targeted improvement on the weakest component will reach world class." };
  if (oee >= 45) return { label: "Typical", color: "yellow", desc: "Industry average for manufacturers not actively managing OEE. Significant improvement potential." };
  return { label: "Poor", color: "red", desc: "Below industry average. Systematic OEE improvement programme recommended immediately." };
}

export default function OEECalculator() {
  const [avail, setAvail] = useState("");
  const [perf, setPerf] = useState("");
  const [qual, setQual] = useState("");

  const a = parseFloat(avail);
  const p = parseFloat(perf);
  const q = parseFloat(qual);
  const valid = !isNaN(a) && !isNaN(p) && !isNaN(q) && a > 0 && p > 0 && q > 0;
  const oee = valid ? (a / 100) * (p / 100) * (q / 100) * 100 : null;
  const t = oee !== null ? tier(oee) : null;

  const COLOR: Record<string, string> = {
    emerald: "text-emerald-400 border-emerald-500/30 bg-emerald-500/8",
    blue: "text-blue-400 border-blue-500/30 bg-blue-500/8",
    yellow: "text-amber-400 border-amber-500/30 bg-amber-500/8",
    red: "text-red-400 border-red-500/30 bg-red-500/8",
  };

  return (
    <div className="card max-w-xl mx-auto">
      <h2 className="text-xl font-bold mb-1">OEE Calculator</h2>
      <p className="text-white/45 text-sm mb-6">Enter each component as a percentage (0–100).</p>

      <div className="space-y-4">
        {[
          { label: "Availability %", sublabel: "Actual run time ÷ Planned production time × 100", val: avail, set: setAvail, placeholder: "e.g. 87" },
          { label: "Performance %", sublabel: "Actual output rate ÷ Theoretical maximum output rate × 100", val: perf, set: setPerf, placeholder: "e.g. 92" },
          { label: "Quality %", sublabel: "Good units ÷ Total units started × 100", val: qual, set: setQual, placeholder: "e.g. 98" },
        ].map(({ label, sublabel, val, set, placeholder }) => (
          <div key={label}>
            <label className="block text-sm font-medium text-white/80 mb-1">{label}</label>
            <p className="text-xs text-white/35 mb-2">{sublabel}</p>
            <input
              type="number"
              min={0}
              max={100}
              step={0.1}
              value={val}
              onChange={(e) => set(e.target.value)}
              placeholder={placeholder}
              className="w-full rounded-xl border border-white/10 bg-white/4 px-4 py-3 text-white placeholder-white/20 text-sm focus:outline-none focus:border-emerald-500/50"
            />
          </div>
        ))}
      </div>

      {oee !== null && t !== null && (
        <div className={`mt-6 rounded-2xl border p-5 ${COLOR[t.color]}`}>
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs uppercase tracking-wider opacity-60">Your OEE Score</span>
            <span className={`text-xs font-semibold rounded-full border px-3 py-1 ${COLOR[t.color]}`}>{t.label}</span>
          </div>
          <div className="text-5xl font-bold font-mono mb-3">{oee.toFixed(1)}%</div>

          <div className="h-2 w-full rounded-full bg-white/10 mb-3">
            <div
              className={`h-2 rounded-full ${t.color === "emerald" ? "bg-emerald-500" : t.color === "blue" ? "bg-blue-500" : t.color === "yellow" ? "bg-amber-400" : "bg-red-500"}`}
              style={{ width: `${Math.min(oee, 100)}%` }}
            />
          </div>

          <p className="text-sm opacity-75 mb-4">{t.desc}</p>

          <div className="grid grid-cols-3 gap-2 text-xs">
            {[["Availability", a, 90], ["Performance", p, 95], ["Quality", q, 99]].map(([name, val, wc]) => (
              <div key={String(name)} className="rounded-xl border border-white/10 bg-white/5 p-2 text-center">
                <p className="opacity-50 mb-0.5">{name}</p>
                <p className="font-mono font-bold">{Number(val).toFixed(1)}%</p>
                <p className="opacity-35 text-[10px]">WC: ≥{wc}%</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {oee !== null && oee < 85 && (
        <div className="mt-4 rounded-xl border border-white/8 bg-white/3 p-4">
          <p className="text-sm font-medium text-white/80 mb-1">Want to find which machine or shift is dragging your OEE down?</p>
          <p className="text-xs text-white/40 mb-3">
            Upload your full shift report CSV. OpsOracle AI identifies the exact workstation, shift, and root cause pulling OEE below target — with a cost impact estimate.
          </p>
          <Link href="/register" className="btn text-sm py-2.5 px-5 inline-block">
            Analyze Your Production Data Free →
          </Link>
        </div>
      )}

      {oee !== null && oee >= 85 && (
        <div className="mt-4 rounded-xl border border-emerald-500/15 bg-emerald-500/5 p-4">
          <p className="text-sm font-medium text-emerald-400 mb-1">World-class OEE — keep the data flywheel running.</p>
          <p className="text-xs text-white/40 mb-3">
            Upload your shift report to OpsOracle AI. Pro users see their OEE benchmarked against industry averages in real time.
          </p>
          <Link href="/register" className="btn text-sm py-2.5 px-5 inline-block">
            Track OEE Over Time Free →
          </Link>
        </div>
      )}
    </div>
  );
}
