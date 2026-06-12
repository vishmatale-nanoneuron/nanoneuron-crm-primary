"use client";
import { useState } from "react";
import Link from "next/link";

export default function SafetyStockCalc() {
  const [demandStdDev, setDemandStdDev] = useState("");
  const [leadTime, setLeadTime] = useState("");
  const [leadTimeStdDev, setLeadTimeStdDev] = useState("");
  const [avgDemand, setAvgDemand] = useState("");
  const [serviceLevelZ, setServiceLevelZ] = useState("1.65");
  const [result, setResult] = useState<{ ss: number; rop: number } | null>(null);

  const SERVICE_LEVELS = [
    { label: "90% (Z = 1.28)", z: "1.28" },
    { label: "95% (Z = 1.65)", z: "1.65" },
    { label: "98% (Z = 2.05)", z: "2.05" },
    { label: "99% (Z = 2.33)", z: "2.33" },
    { label: "99.9% (Z = 3.09)", z: "3.09" },
  ];

  function calculate() {
    const σd = parseFloat(demandStdDev);
    const L = parseFloat(leadTime);
    const σL = parseFloat(leadTimeStdDev) || 0;
    const d = parseFloat(avgDemand);
    const Z = parseFloat(serviceLevelZ);
    if (!σd || !L || !d || !Z) return;
    const ss = Z * Math.sqrt(L * σd ** 2 + d ** 2 * σL ** 2);
    const rop = d * L + ss;
    setResult({ ss: Math.round(ss), rop: Math.round(rop) });
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="rounded-2xl border border-white/10 bg-white/3 p-8 mb-8">
        <h2 className="text-lg font-bold mb-6">Safety Stock Calculator</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
          <div>
            <label className="text-xs text-white/40 block mb-1.5">Demand Std. Deviation (units/day) *</label>
            <input type="number" min="0" value={demandStdDev} onChange={e => setDemandStdDev(e.target.value)}
              placeholder="e.g. 25"
              className="w-full rounded-xl border border-white/15 bg-white/5 px-4 py-3 text-sm text-white placeholder-white/20 focus:border-emerald-500/40 focus:outline-none" />
          </div>
          <div>
            <label className="text-xs text-white/40 block mb-1.5">Average Daily Demand (units) *</label>
            <input type="number" min="0" value={avgDemand} onChange={e => setAvgDemand(e.target.value)}
              placeholder="e.g. 100"
              className="w-full rounded-xl border border-white/15 bg-white/5 px-4 py-3 text-sm text-white placeholder-white/20 focus:border-emerald-500/40 focus:outline-none" />
          </div>
          <div>
            <label className="text-xs text-white/40 block mb-1.5">Average Lead Time (days) *</label>
            <input type="number" min="0" value={leadTime} onChange={e => setLeadTime(e.target.value)}
              placeholder="e.g. 7"
              className="w-full rounded-xl border border-white/15 bg-white/5 px-4 py-3 text-sm text-white placeholder-white/20 focus:border-emerald-500/40 focus:outline-none" />
          </div>
          <div>
            <label className="text-xs text-white/40 block mb-1.5">Lead Time Std. Deviation (days)</label>
            <input type="number" min="0" value={leadTimeStdDev} onChange={e => setLeadTimeStdDev(e.target.value)}
              placeholder="e.g. 2 (optional)"
              className="w-full rounded-xl border border-white/15 bg-white/5 px-4 py-3 text-sm text-white placeholder-white/20 focus:border-emerald-500/40 focus:outline-none" />
          </div>
          <div className="sm:col-span-2">
            <label className="text-xs text-white/40 block mb-1.5">Service Level *</label>
            <div className="flex flex-wrap gap-2">
              {SERVICE_LEVELS.map(s => (
                <button key={s.z} type="button" onClick={() => setServiceLevelZ(s.z)}
                  className={`rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors ${serviceLevelZ === s.z ? "border-emerald-500/50 bg-emerald-500/15 text-emerald-300" : "border-white/10 text-white/40 hover:text-white/60"}`}>
                  {s.label}
                </button>
              ))}
            </div>
          </div>
        </div>
        <button onClick={calculate}
          className="w-full rounded-xl bg-emerald-500 hover:bg-emerald-400 text-white px-6 py-3 text-sm font-semibold transition-colors">
          Calculate Safety Stock
        </button>

        {result && (
          <div className="mt-6 grid grid-cols-2 gap-4">
            <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-5 py-4 text-center">
              <p className="text-xs text-white/40 mb-1">Safety Stock</p>
              <p className="text-3xl font-bold text-emerald-400">{result.ss.toLocaleString()}</p>
              <p className="text-xs text-white/30 mt-1">units</p>
            </div>
            <div className="rounded-xl border border-blue-500/30 bg-blue-500/10 px-5 py-4 text-center">
              <p className="text-xs text-white/40 mb-1">Reorder Point</p>
              <p className="text-3xl font-bold text-blue-400">{result.rop.toLocaleString()}</p>
              <p className="text-xs text-white/30 mt-1">units</p>
            </div>
          </div>
        )}
      </div>

      <div className="rounded-2xl border border-white/10 bg-white/3 p-6 text-center">
        <p className="text-sm text-white/60 mb-3">Want AI to analyse your full inventory data and flag risky SKUs automatically?</p>
        <Link href="/register" className="inline-block rounded-xl bg-emerald-500 hover:bg-emerald-400 text-white px-6 py-2.5 text-sm font-semibold transition-colors">
          Try OpsOracle AI Free →
        </Link>
      </div>
    </div>
  );
}
