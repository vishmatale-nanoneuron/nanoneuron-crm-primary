"use client";
import { useState } from "react";
import Link from "next/link";

export default function InventoryTurnoverCalc() {
  const [cogs, setCogs] = useState("");
  const [avgInventory, setAvgInventory] = useState("");
  const [openingInventory, setOpeningInventory] = useState("");
  const [closingInventory, setClosingInventory] = useState("");
  const [mode, setMode] = useState<"direct" | "derived">("direct");
  const [result, setResult] = useState<{ ratio: number; dsi: number; grade: string; color: string } | null>(null);

  function calculate() {
    const cogsVal = parseFloat(cogs);
    let avgInv: number;
    if (mode === "derived") {
      const open = parseFloat(openingInventory);
      const close = parseFloat(closingInventory);
      if (!open || !close) return;
      avgInv = (open + close) / 2;
    } else {
      avgInv = parseFloat(avgInventory);
    }
    if (!cogsVal || !avgInv) return;
    const ratio = cogsVal / avgInv;
    const dsi = 365 / ratio;
    let grade = "Poor", color = "text-red-400";
    if (ratio >= 8) { grade = "Excellent"; color = "text-emerald-400"; }
    else if (ratio >= 5) { grade = "Good"; color = "text-blue-400"; }
    else if (ratio >= 3) { grade = "Average"; color = "text-amber-400"; }
    setResult({ ratio: Math.round(ratio * 10) / 10, dsi: Math.round(dsi), grade, color });
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="rounded-2xl border border-white/10 bg-white/3 p-8 mb-8">
        <h2 className="text-lg font-bold mb-4">Inventory Turnover Calculator</h2>
        <div className="flex gap-2 mb-6">
          {[{ k: "direct", l: "Enter avg inventory" }, { k: "derived", l: "Use opening + closing" }].map(m => (
            <button key={m.k} type="button" onClick={() => setMode(m.k as "direct" | "derived")}
              className={`rounded-lg border px-4 py-1.5 text-xs font-medium transition-colors ${mode === m.k ? "border-emerald-500/50 bg-emerald-500/15 text-emerald-300" : "border-white/10 text-white/40 hover:text-white/60"}`}>
              {m.l}
            </button>
          ))}
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
          <div className="sm:col-span-2">
            <label className="text-xs text-white/40 block mb-1.5">Cost of Goods Sold (COGS) ₹ *</label>
            <input type="number" min="0" value={cogs} onChange={e => setCogs(e.target.value)} placeholder="e.g. 5000000"
              className="w-full rounded-xl border border-white/15 bg-white/5 px-4 py-3 text-sm text-white placeholder-white/20 focus:border-emerald-500/40 focus:outline-none" />
          </div>
          {mode === "direct" ? (
            <div className="sm:col-span-2">
              <label className="text-xs text-white/40 block mb-1.5">Average Inventory Value ₹ *</label>
              <input type="number" min="0" value={avgInventory} onChange={e => setAvgInventory(e.target.value)} placeholder="e.g. 1000000"
                className="w-full rounded-xl border border-white/15 bg-white/5 px-4 py-3 text-sm text-white placeholder-white/20 focus:border-emerald-500/40 focus:outline-none" />
            </div>
          ) : (
            <>
              <div>
                <label className="text-xs text-white/40 block mb-1.5">Opening Inventory ₹ *</label>
                <input type="number" min="0" value={openingInventory} onChange={e => setOpeningInventory(e.target.value)} placeholder="e.g. 800000"
                  className="w-full rounded-xl border border-white/15 bg-white/5 px-4 py-3 text-sm text-white placeholder-white/20 focus:border-emerald-500/40 focus:outline-none" />
              </div>
              <div>
                <label className="text-xs text-white/40 block mb-1.5">Closing Inventory ₹ *</label>
                <input type="number" min="0" value={closingInventory} onChange={e => setClosingInventory(e.target.value)} placeholder="e.g. 1200000"
                  className="w-full rounded-xl border border-white/15 bg-white/5 px-4 py-3 text-sm text-white placeholder-white/20 focus:border-emerald-500/40 focus:outline-none" />
              </div>
            </>
          )}
        </div>
        <button onClick={calculate}
          className="w-full rounded-xl bg-emerald-500 hover:bg-emerald-400 text-white px-6 py-3 text-sm font-semibold transition-colors">
          Calculate Inventory Turnover
        </button>
        {result && (
          <div className="mt-6 grid grid-cols-3 gap-3">
            <div className="rounded-xl border border-white/10 bg-white/5 px-4 py-4 text-center">
              <p className="text-xs text-white/40 mb-1">Turnover Ratio</p>
              <p className={`text-3xl font-bold ${result.color}`}>{result.ratio}x</p>
            </div>
            <div className="rounded-xl border border-white/10 bg-white/5 px-4 py-4 text-center">
              <p className="text-xs text-white/40 mb-1">Days Sales of Inventory</p>
              <p className="text-3xl font-bold text-white">{result.dsi}</p>
              <p className="text-xs text-white/30 mt-0.5">days</p>
            </div>
            <div className="rounded-xl border border-white/10 bg-white/5 px-4 py-4 text-center">
              <p className="text-xs text-white/40 mb-1">Rating</p>
              <p className={`text-xl font-bold ${result.color}`}>{result.grade}</p>
            </div>
          </div>
        )}
      </div>
      <div className="rounded-2xl border border-white/10 bg-white/3 p-6 text-center">
        <p className="text-sm text-white/60 mb-3">Upload your inventory data for a full AI risk analysis — dead stock, carrying costs, reorder alerts.</p>
        <Link href="/register" className="inline-block rounded-xl bg-emerald-500 hover:bg-emerald-400 text-white px-6 py-2.5 text-sm font-semibold transition-colors">
          Try OpsOracle AI Free →
        </Link>
      </div>
    </div>
  );
}
