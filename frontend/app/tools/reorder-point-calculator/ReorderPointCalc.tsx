"use client";
import { useState } from "react";
import Link from "next/link";

export default function ReorderPointCalc() {
  const [avgDemand, setAvgDemand] = useState("");
  const [leadTime, setLeadTime] = useState("");
  const [safetyStock, setSafetyStock] = useState("");
  const [result, setResult] = useState<{ rop: number; breakdown: string } | null>(null);

  function calculate() {
    const d = parseFloat(avgDemand);
    const L = parseFloat(leadTime);
    const ss = parseFloat(safetyStock) || 0;
    if (!d || !L) return;
    const demandDuringLT = d * L;
    const rop = demandDuringLT + ss;
    setResult({
      rop: Math.round(rop),
      breakdown: `(${d} × ${L}) + ${ss} = ${Math.round(demandDuringLT)} + ${ss}`,
    });
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="rounded-2xl border border-white/10 bg-white/3 p-8 mb-8">
        <h2 className="text-lg font-bold mb-6">Reorder Point Calculator</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
          <div>
            <label className="text-xs text-white/40 block mb-1.5">Average Daily Demand (units) *</label>
            <input type="number" min="0" value={avgDemand} onChange={e => setAvgDemand(e.target.value)} placeholder="e.g. 50"
              className="w-full rounded-xl border border-white/15 bg-white/5 px-4 py-3 text-sm text-white placeholder-white/20 focus:border-emerald-500/40 focus:outline-none" />
          </div>
          <div>
            <label className="text-xs text-white/40 block mb-1.5">Lead Time (days) *</label>
            <input type="number" min="0" value={leadTime} onChange={e => setLeadTime(e.target.value)} placeholder="e.g. 7"
              className="w-full rounded-xl border border-white/15 bg-white/5 px-4 py-3 text-sm text-white placeholder-white/20 focus:border-emerald-500/40 focus:outline-none" />
          </div>
          <div className="sm:col-span-2">
            <label className="text-xs text-white/40 block mb-1.5">Safety Stock (units) — optional</label>
            <input type="number" min="0" value={safetyStock} onChange={e => setSafetyStock(e.target.value)} placeholder="e.g. 100 (use our Safety Stock Calculator above)"
              className="w-full rounded-xl border border-white/15 bg-white/5 px-4 py-3 text-sm text-white placeholder-white/20 focus:border-emerald-500/40 focus:outline-none" />
          </div>
        </div>
        <button onClick={calculate}
          className="w-full rounded-xl bg-emerald-500 hover:bg-emerald-400 text-white px-6 py-3 text-sm font-semibold transition-colors">
          Calculate Reorder Point
        </button>
        {result && (
          <div className="mt-6">
            <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-5 py-6 text-center mb-3">
              <p className="text-xs text-white/40 mb-1">Reorder Point</p>
              <p className="text-4xl font-bold text-emerald-400">{result.rop.toLocaleString()}</p>
              <p className="text-xs text-white/30 mt-1">units — place a new order when inventory hits this level</p>
            </div>
            <p className="text-xs text-white/30 text-center">Formula: {result.breakdown} = {result.rop} units</p>
          </div>
        )}
      </div>
      <div className="rounded-2xl border border-white/10 bg-white/3 p-6 text-center">
        <p className="text-sm text-white/60 mb-3">Let AI monitor your inventory levels and alert you before stockouts happen — automatically.</p>
        <Link href="/register" className="inline-block rounded-xl bg-emerald-500 hover:bg-emerald-400 text-white px-6 py-2.5 text-sm font-semibold transition-colors">
          Try OpsOracle AI Free →
        </Link>
      </div>
    </div>
  );
}
