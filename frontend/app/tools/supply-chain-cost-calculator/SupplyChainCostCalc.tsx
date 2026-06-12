"use client";
import { useState } from "react";
import Link from "next/link";

export default function SupplyChainCostCalc() {
  const [transportation, setTransportation] = useState("");
  const [warehousing, setWarehousing] = useState("");
  const [inventory, setInventory] = useState("");
  const [orderProcessing, setOrderProcessing] = useState("");
  const [returns, setReturns] = useState("");
  const [revenue, setRevenue] = useState("");
  const [result, setResult] = useState<{ total: number; pct: number; breakdown: Record<string, number>; grade: string; color: string } | null>(null);

  function calculate() {
    const t = parseFloat(transportation) || 0;
    const w = parseFloat(warehousing) || 0;
    const i = parseFloat(inventory) || 0;
    const o = parseFloat(orderProcessing) || 0;
    const r = parseFloat(returns) || 0;
    const rev = parseFloat(revenue);
    if (!rev) return;
    const total = t + w + i + o + r;
    const pct = (total / rev) * 100;
    let grade = "Poor (>15%)", color = "text-red-400";
    if (pct <= 5) { grade = "World Class (≤5%)"; color = "text-emerald-400"; }
    else if (pct <= 8) { grade = "Excellent (5–8%)"; color = "text-blue-400"; }
    else if (pct <= 12) { grade = "Good (8–12%)"; color = "text-amber-400"; }
    setResult({ total, pct: Math.round(pct * 10) / 10, breakdown: { transportation: t, warehousing: w, inventory: i, orderProcessing: o, returns: r }, grade, color });
  }

  const fmt = (n: number) => n > 0 ? `₹${n.toLocaleString("en-IN")}` : "—";

  return (
    <div className="max-w-2xl mx-auto">
      <div className="rounded-2xl border border-white/10 bg-white/3 p-8 mb-8">
        <h2 className="text-lg font-bold mb-6">Supply Chain Cost Calculator</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
          {[
            { label: "Transportation Cost ₹", val: transportation, set: setTransportation, ph: "e.g. 500000" },
            { label: "Warehousing Cost ₹", val: warehousing, set: setWarehousing, ph: "e.g. 200000" },
            { label: "Inventory Carrying Cost ₹", val: inventory, set: setInventory, ph: "e.g. 150000" },
            { label: "Order Processing Cost ₹", val: orderProcessing, set: setOrderProcessing, ph: "e.g. 50000" },
            { label: "Returns / Reverse Logistics ₹", val: returns, set: setReturns, ph: "e.g. 30000" },
            { label: "Total Revenue ₹ *", val: revenue, set: setRevenue, ph: "e.g. 5000000" },
          ].map(f => (
            <div key={f.label}>
              <label className="text-xs text-white/40 block mb-1.5">{f.label}</label>
              <input type="number" min="0" value={f.val} onChange={e => f.set(e.target.value)} placeholder={f.ph}
                className="w-full rounded-xl border border-white/15 bg-white/5 px-4 py-3 text-sm text-white placeholder-white/20 focus:border-emerald-500/40 focus:outline-none" />
            </div>
          ))}
        </div>
        <button onClick={calculate}
          className="w-full rounded-xl bg-emerald-500 hover:bg-emerald-400 text-white px-6 py-3 text-sm font-semibold transition-colors">
          Calculate Supply Chain Cost
        </button>
        {result && (
          <div className="mt-6 space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-xl border border-white/10 bg-white/5 px-4 py-4 text-center">
                <p className="text-xs text-white/40 mb-1">Total Supply Chain Cost</p>
                <p className="text-2xl font-bold text-white">₹{result.total.toLocaleString("en-IN")}</p>
              </div>
              <div className="rounded-xl border border-white/10 bg-white/5 px-4 py-4 text-center">
                <p className="text-xs text-white/40 mb-1">% of Revenue</p>
                <p className={`text-2xl font-bold ${result.color}`}>{result.pct}%</p>
                <p className={`text-xs mt-0.5 ${result.color}`}>{result.grade}</p>
              </div>
            </div>
            <div className="rounded-xl border border-white/10 bg-white/5 px-4 py-4">
              <p className="text-xs text-white/40 mb-3">Breakdown</p>
              <div className="space-y-2">
                {Object.entries(result.breakdown).filter(([, v]) => v > 0).map(([k, v]) => (
                  <div key={k} className="flex justify-between text-sm">
                    <span className="text-white/60 capitalize">{k.replace(/([A-Z])/g, " $1")}</span>
                    <span className="text-white font-medium">{fmt(v)}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
      <div className="rounded-2xl border border-white/10 bg-white/3 p-6 text-center">
        <p className="text-sm text-white/60 mb-3">Upload your supply chain data for an AI cost-reduction analysis — hidden inefficiencies flagged automatically.</p>
        <Link href="/register" className="inline-block rounded-xl bg-emerald-500 hover:bg-emerald-400 text-white px-6 py-2.5 text-sm font-semibold transition-colors">
          Try OpsOracle AI Free →
        </Link>
      </div>
    </div>
  );
}
