"use client";
import { useState } from "react";
import Link from "next/link";

export default function LeadTimeCalc() {
  const [orderDate, setOrderDate] = useState("");
  const [receiptDate, setReceiptDate] = useState("");
  const [rows, setRows] = useState([{ name: "", days: "" }]);
  const [mode, setMode] = useState<"dates" | "components">("dates");
  const [result, setResult] = useState<{ total: number; grade: string; color: string } | null>(null);

  function calculateDates() {
    if (!orderDate || !receiptDate) return;
    const diff = Math.round((new Date(receiptDate).getTime() - new Date(orderDate).getTime()) / 86400000);
    if (diff < 0) return;
    grade(diff);
  }

  function calculateComponents() {
    const total = rows.reduce((sum, r) => sum + (parseFloat(r.days) || 0), 0);
    if (!total) return;
    grade(total);
  }

  function grade(days: number) {
    let g = "Slow (>30 days)", c = "text-red-400";
    if (days <= 3) { g = "Excellent (≤3 days)"; c = "text-emerald-400"; }
    else if (days <= 7) { g = "Good (4–7 days)"; c = "text-blue-400"; }
    else if (days <= 14) { g = "Average (8–14 days)"; c = "text-amber-400"; }
    else if (days <= 30) { g = "Slow (15–30 days)"; c = "text-orange-400"; }
    setResult({ total: days, grade: g, color: c });
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="rounded-2xl border border-white/10 bg-white/3 p-8 mb-8">
        <h2 className="text-lg font-bold mb-4">Lead Time Calculator</h2>
        <div className="flex gap-2 mb-6">
          {[{ k: "dates", l: "Order → Receipt dates" }, { k: "components", l: "Add components" }].map(m => (
            <button key={m.k} type="button" onClick={() => setMode(m.k as "dates" | "components")}
              className={`rounded-lg border px-4 py-1.5 text-xs font-medium transition-colors ${mode === m.k ? "border-emerald-500/50 bg-emerald-500/15 text-emerald-300" : "border-white/10 text-white/40 hover:text-white/60"}`}>
              {m.l}
            </button>
          ))}
        </div>
        {mode === "dates" ? (
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div>
              <label className="text-xs text-white/40 block mb-1.5">Order Date *</label>
              <input type="date" value={orderDate} onChange={e => setOrderDate(e.target.value)}
                className="w-full rounded-xl border border-white/15 bg-white/5 px-4 py-3 text-sm text-white focus:border-emerald-500/40 focus:outline-none" />
            </div>
            <div>
              <label className="text-xs text-white/40 block mb-1.5">Receipt Date *</label>
              <input type="date" value={receiptDate} onChange={e => setReceiptDate(e.target.value)}
                className="w-full rounded-xl border border-white/15 bg-white/5 px-4 py-3 text-sm text-white focus:border-emerald-500/40 focus:outline-none" />
            </div>
          </div>
        ) : (
          <div className="mb-6 space-y-2">
            {rows.map((row, i) => (
              <div key={i} className="grid grid-cols-3 gap-2">
                <input type="text" value={row.name} onChange={e => { const r = [...rows]; r[i].name = e.target.value; setRows(r); }} placeholder="Component (e.g. Procurement)"
                  className="col-span-2 rounded-xl border border-white/15 bg-white/5 px-3 py-2 text-sm text-white placeholder-white/20 focus:border-emerald-500/40 focus:outline-none" />
                <input type="number" min="0" value={row.days} onChange={e => { const r = [...rows]; r[i].days = e.target.value; setRows(r); }} placeholder="Days"
                  className="rounded-xl border border-white/15 bg-white/5 px-3 py-2 text-sm text-white placeholder-white/20 focus:border-emerald-500/40 focus:outline-none" />
              </div>
            ))}
            <button type="button" onClick={() => setRows([...rows, { name: "", days: "" }])}
              className="text-xs text-emerald-400 hover:text-emerald-300 transition-colors">+ Add component</button>
          </div>
        )}
        <button onClick={mode === "dates" ? calculateDates : calculateComponents}
          className="w-full rounded-xl bg-emerald-500 hover:bg-emerald-400 text-white px-6 py-3 text-sm font-semibold transition-colors">
          Calculate Lead Time
        </button>
        {result && (
          <div className="mt-6 grid grid-cols-2 gap-3">
            <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-5 py-4 text-center">
              <p className="text-xs text-white/40 mb-1">Total Lead Time</p>
              <p className="text-4xl font-bold text-white">{result.total}</p>
              <p className="text-xs text-white/30 mt-1">days</p>
            </div>
            <div className="rounded-xl border border-white/10 bg-white/5 px-5 py-4 text-center">
              <p className="text-xs text-white/40 mb-1">Benchmark</p>
              <p className={`text-lg font-bold ${result.color}`}>{result.grade}</p>
            </div>
          </div>
        )}
      </div>
      <div className="rounded-2xl border border-white/10 bg-white/3 p-6 text-center">
        <p className="text-sm text-white/60 mb-3">AI analysis of your supply chain data flags the exact steps driving your longest lead times.</p>
        <Link href="/register" className="inline-block rounded-xl bg-emerald-500 hover:bg-emerald-400 text-white px-6 py-2.5 text-sm font-semibold transition-colors">
          Try OpsOracle AI Free →
        </Link>
      </div>
    </div>
  );
}
