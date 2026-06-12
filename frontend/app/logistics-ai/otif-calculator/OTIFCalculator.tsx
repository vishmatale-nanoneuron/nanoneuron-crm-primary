"use client";
import { useState } from "react";
import Link from "next/link";

function tier(otif: number) {
  if (otif >= 95) return { label: "World Class", color: "emerald", desc: "Top-tier logistics performance. Customers experience near-perfect reliability." };
  if (otif >= 85) return { label: "Good", color: "blue", desc: "Above average. A 5-10% gap to world class — identify your top failure carrier or corridor." };
  if (otif >= 70) return { label: "Average", color: "yellow", desc: "Industry average. Noticeable customer impact. Carrier or route patterns need investigation." };
  return { label: "Poor", color: "red", desc: "Below average. High customer escalation risk. Carrier SLA review and re-routing needed urgently." };
}

export default function OTIFCalculator() {
  const [total, setTotal] = useState("");
  const [complete, setComplete] = useState("");

  const t = parseFloat(total);
  const c = parseFloat(complete);
  const valid = !isNaN(t) && !isNaN(c) && t > 0 && c >= 0 && c <= t;
  const otif = valid ? (c / t) * 100 : null;
  const tr = otif !== null ? tier(otif) : null;

  const delayed = valid ? t - c : null;
  const monthlyLoss = valid && delayed !== null ? delayed * 1800 : null; // rough ₹1800/delayed shipment cost

  const COLOR: Record<string, string> = {
    emerald: "text-emerald-400 border-emerald-500/30 bg-emerald-500/8",
    blue: "text-blue-400 border-blue-500/30 bg-blue-500/8",
    yellow: "text-amber-400 border-amber-500/30 bg-amber-500/8",
    red: "text-red-400 border-red-500/30 bg-red-500/8",
  };

  return (
    <div className="card max-w-xl mx-auto">
      <h2 className="text-xl font-bold mb-1">OTIF Calculator</h2>
      <p className="text-white/45 text-sm mb-6">
        OTIF = shipments delivered <strong className="text-white/70">on time</strong> <em>and</em> <strong className="text-white/70">in full</strong> ÷ total shipments × 100
      </p>

      <div className="space-y-4">
        {[
          { label: "Total shipments dispatched", sublabel: "All outbound shipments in the period", val: total, set: setTotal, placeholder: "e.g. 450" },
          { label: "Shipments on-time AND in full", sublabel: "Delivered by SLA date with no short-shipment or damage", val: complete, set: setComplete, placeholder: "e.g. 387" },
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

      {otif !== null && tr !== null && (
        <div className={`mt-6 rounded-2xl border p-5 ${COLOR[tr.color]}`}>
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs uppercase tracking-wider opacity-60">Your OTIF Rate</span>
            <span className={`text-xs font-semibold rounded-full border px-3 py-1 ${COLOR[tr.color]}`}>{tr.label}</span>
          </div>
          <div className="text-5xl font-bold font-mono mb-3">{otif.toFixed(1)}%</div>

          <div className="h-2 w-full rounded-full bg-white/10 mb-3">
            <div
              className={`h-2 rounded-full ${tr.color === "emerald" ? "bg-emerald-500" : tr.color === "blue" ? "bg-blue-500" : tr.color === "yellow" ? "bg-amber-400" : "bg-red-500"}`}
              style={{ width: `${Math.min(otif, 100)}%` }}
            />
          </div>

          <p className="text-sm opacity-75 mb-4">{tr.desc}</p>

          {delayed !== null && delayed > 0 && (
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="rounded-xl border border-white/10 bg-white/5 p-2 text-center">
                <p className="opacity-50 mb-0.5">Shipments missing OTIF</p>
                <p className="font-mono font-bold text-red-400">{delayed.toLocaleString()}</p>
              </div>
              <div className="rounded-xl border border-white/10 bg-white/5 p-2 text-center">
                <p className="opacity-50 mb-0.5">Est. cost exposure</p>
                <p className="font-mono font-bold text-red-400">₹{monthlyLoss?.toLocaleString()}</p>
              </div>
            </div>
          )}
        </div>
      )}

      {otif !== null && otif < 95 && (
        <div className="mt-4 rounded-xl border border-white/8 bg-white/3 p-4">
          <p className="text-sm font-medium text-white/80 mb-1">Which carrier or corridor is pulling your OTIF down?</p>
          <p className="text-xs text-white/40 mb-3">
            Upload your dispatch CSV. OpsOracle AI identifies which specific carrier, route, or depot is responsible for your OTIF gap — with per-shipment risk scores.
          </p>
          <Link href="/register" className="btn text-sm py-2.5 px-5 inline-block">
            Find Your OTIF Root Cause Free →
          </Link>
        </div>
      )}
    </div>
  );
}
