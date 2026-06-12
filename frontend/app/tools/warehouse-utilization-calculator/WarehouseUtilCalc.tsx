"use client";
import { useState } from "react";
import Link from "next/link";

export default function WarehouseUtilCalc() {
  const [usedSpace, setUsedSpace] = useState("");
  const [totalSpace, setTotalSpace] = useState("");
  const [unit, setUnit] = useState<"sqft" | "sqm" | "pallets">("sqft");
  const [result, setResult] = useState<{ pct: number; free: number; grade: string; color: string; note: string } | null>(null);

  function calculate() {
    const used = parseFloat(usedSpace);
    const total = parseFloat(totalSpace);
    if (!used || !total || used > total) return;
    const pct = (used / total) * 100;
    const free = total - used;
    let grade = "Under-utilised", color = "text-amber-400", note = "Consider consolidation or sub-leasing unused space.";
    if (pct >= 85 && pct <= 92) { grade = "Optimal"; color = "text-emerald-400"; note = "Good balance — room to absorb demand spikes."; }
    else if (pct > 92) { grade = "Over-utilised"; color = "text-red-400"; note = "Risk of congestion and picking errors. Consider expansion or slotting optimisation."; }
    else if (pct >= 70) { grade = "Good"; color = "text-blue-400"; note = "Healthy utilisation. Minor optimisation possible."; }
    setResult({ pct: Math.round(pct * 10) / 10, free: Math.round(free), grade, color, note });
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="rounded-2xl border border-white/10 bg-white/3 p-8 mb-8">
        <h2 className="text-lg font-bold mb-6">Warehouse Utilisation Calculator</h2>
        <div className="flex gap-2 mb-5">
          {(["sqft", "sqm", "pallets"] as const).map(u => (
            <button key={u} type="button" onClick={() => setUnit(u)}
              className={`rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors ${unit === u ? "border-emerald-500/50 bg-emerald-500/15 text-emerald-300" : "border-white/10 text-white/40 hover:text-white/60"}`}>
              {u}
            </button>
          ))}
        </div>
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div>
            <label className="text-xs text-white/40 block mb-1.5">Used Space ({unit}) *</label>
            <input type="number" min="0" value={usedSpace} onChange={e => setUsedSpace(e.target.value)} placeholder="e.g. 8500"
              className="w-full rounded-xl border border-white/15 bg-white/5 px-4 py-3 text-sm text-white placeholder-white/20 focus:border-emerald-500/40 focus:outline-none" />
          </div>
          <div>
            <label className="text-xs text-white/40 block mb-1.5">Total Capacity ({unit}) *</label>
            <input type="number" min="0" value={totalSpace} onChange={e => setTotalSpace(e.target.value)} placeholder="e.g. 10000"
              className="w-full rounded-xl border border-white/15 bg-white/5 px-4 py-3 text-sm text-white placeholder-white/20 focus:border-emerald-500/40 focus:outline-none" />
          </div>
        </div>
        <button onClick={calculate}
          className="w-full rounded-xl bg-emerald-500 hover:bg-emerald-400 text-white px-6 py-3 text-sm font-semibold transition-colors">
          Calculate Utilisation
        </button>
        {result && (
          <div className="mt-6 space-y-3">
            <div className="grid grid-cols-3 gap-3">
              <div className="rounded-xl border border-white/10 bg-white/5 px-4 py-4 text-center">
                <p className="text-xs text-white/40 mb-1">Utilisation</p>
                <p className={`text-3xl font-bold ${result.color}`}>{result.pct}%</p>
              </div>
              <div className="rounded-xl border border-white/10 bg-white/5 px-4 py-4 text-center">
                <p className="text-xs text-white/40 mb-1">Free Space</p>
                <p className="text-2xl font-bold text-white">{result.free.toLocaleString()}</p>
                <p className="text-xs text-white/30 mt-0.5">{unit}</p>
              </div>
              <div className="rounded-xl border border-white/10 bg-white/5 px-4 py-4 text-center">
                <p className="text-xs text-white/40 mb-1">Rating</p>
                <p className={`text-lg font-bold ${result.color}`}>{result.grade}</p>
              </div>
            </div>
            <p className="text-sm text-white/50 text-center">{result.note}</p>
          </div>
        )}
      </div>
      <div className="rounded-2xl border border-white/10 bg-white/3 p-6 text-center">
        <p className="text-sm text-white/60 mb-3">Upload your warehouse data for a full AI analysis — slotting gaps, picking delays, space inefficiencies.</p>
        <Link href="/register" className="inline-block rounded-xl bg-emerald-500 hover:bg-emerald-400 text-white px-6 py-2.5 text-sm font-semibold transition-colors">
          Try OpsOracle AI Free →
        </Link>
      </div>
    </div>
  );
}
