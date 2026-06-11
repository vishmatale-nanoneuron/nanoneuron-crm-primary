"use client";
import { useState } from "react";

export type InsightData = {
  id: string;
  report_id: string;
  risk_score: number;
  delay_probability: number;
  inventory_risk: number;
  bottleneck_summary: string;
  executive_summary: string;
  recommendations: string;
  industry_detected?: string | null;
  cost_impact_usd?: number | null;
  vertical_ai_score?: number | null;
  annual_savings_usd?: number | null;
  sub_vertical?: string | null;
  benchmark_count?: number | null;
  expert_reviewed?: boolean;
  resolved_at?: string | null;
  resolution_note?: string | null;
  agi_analysis?: boolean;
  analysis_method?: string;
  risk_delta?: number | null;
  baseline_comparison?: string | null;
  recommendations_json?: string | null;
  evidence?: string | null;
  confidence_level?: string | null;
  data_quality_issues?: string | null;
  agi_reasoning?: string | null;
};

type ActionCard = {
  timeframe: string;
  action: string;
  owner: string;
  impact: string;
  urgency: string;
};

function parseJson<T>(raw: string | null | undefined, fallback: T): T {
  if (!raw) return fallback;
  try { return JSON.parse(raw) as T; } catch { return fallback; }
}

function RiskBar({ value, label }: { value: number; label: string }) {
  const color = value >= 70 ? "bg-red-500" : value >= 40 ? "bg-yellow-500" : "bg-emerald-500";
  const textColor = value >= 70 ? "text-red-400" : value >= 40 ? "text-yellow-400" : "text-emerald-400";
  const tag = value >= 70 ? "High risk — immediate action" : value >= 40 ? "Medium risk — monitor closely" : "Low risk — normal range";
  return (
    <div className="card print:border print:border-gray-200 print:bg-white">
      <p className="text-white/50 text-sm print:text-gray-500">{label}</p>
      <h2 className={`mt-1 text-4xl font-bold ${textColor} print:text-gray-900`}>{value}%</h2>
      <div className="mt-3 h-2 w-full rounded-full bg-white/10 print:bg-gray-100">
        <div className={`h-2 rounded-full ${color}`} style={{ width: `${value}%` }} />
      </div>
      <p className="mt-2 text-xs text-white/30 print:text-gray-400">{tag}</p>
    </div>
  );
}

function ConfidenceBadge({ level }: { level: string | null | undefined }) {
  if (!level) return null;
  const config: Record<string, { label: string; className: string }> = {
    high: { label: "High confidence — strong evidence", className: "border-emerald-500/30 bg-emerald-500/10 text-emerald-400" },
    medium: { label: "Medium confidence — partial evidence", className: "border-yellow-500/30 bg-yellow-500/10 text-yellow-400" },
    low: { label: "Low confidence — sparse data", className: "border-orange-500/30 bg-orange-500/10 text-orange-400" },
    insufficient_data: { label: "Insufficient data for strong conclusions", className: "border-red-500/30 bg-red-500/10 text-red-400" },
  };
  const c = config[level] ?? config["low"];
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium ${c.className}`}>
      <span className="w-1.5 h-1.5 rounded-full bg-current inline-block" />
      {c.label}
    </span>
  );
}

const URGENCY_CONFIG: Record<string, { badge: string; border: string; bg: string }> = {
  critical: { badge: "bg-red-500 text-white", border: "border-red-500/30", bg: "bg-red-500/5" },
  important: { badge: "bg-yellow-500 text-black", border: "border-yellow-500/30", bg: "bg-yellow-500/5" },
  strategic: { badge: "bg-blue-500 text-white", border: "border-blue-500/30", bg: "bg-blue-500/5" },
};

function ActionCards({ cards, onMarkDone }: { cards: ActionCard[]; onMarkDone?: (i: number) => void }) {
  const [done, setDone] = useState<Set<number>>(new Set());
  return (
    <div className="space-y-3">
      {cards.map((card, i) => {
        const isDone = done.has(i);
        const cfg = URGENCY_CONFIG[card.urgency] ?? URGENCY_CONFIG.strategic;
        return (
          <div key={i} className={`rounded-xl border p-5 transition-opacity ${cfg.border} ${cfg.bg} ${isDone ? "opacity-40" : ""}`}>
            <div className="flex items-start justify-between gap-3 flex-wrap">
              <div className="flex items-center gap-2 flex-wrap">
                <span className={`rounded-full px-2 py-0.5 text-xs font-bold uppercase tracking-wider ${cfg.badge}`}>
                  {card.timeframe}
                </span>
                <span className={`rounded-full px-2 py-0.5 text-xs capitalize ${cfg.badge} opacity-70`}>
                  {card.urgency}
                </span>
              </div>
              <button
                onClick={() => {
                  setDone(prev => { const s = new Set(prev); isDone ? s.delete(i) : s.add(i); return s; });
                  onMarkDone?.(i);
                }}
                className={`shrink-0 rounded-lg border px-3 py-1.5 text-xs font-semibold transition-colors ${
                  isDone
                    ? "border-emerald-500/40 bg-emerald-500/20 text-emerald-400"
                    : "border-white/15 text-white/50 hover:border-white/30 hover:text-white"
                }`}
              >
                {isDone ? "✓ Done" : "Mark Done"}
              </button>
            </div>
            <p className={`mt-3 font-medium leading-snug ${isDone ? "line-through text-white/30" : "text-white"} print:text-gray-900`}>
              {card.action}
            </p>
            <div className="mt-3 flex items-center gap-4 text-xs flex-wrap">
              <span className="text-white/40 print:text-gray-500">
                <span className="font-semibold text-white/60 print:text-gray-700">Owner:</span> {card.owner}
              </span>
              <span className="text-emerald-400 font-semibold print:text-green-700">Impact: {card.impact}</span>
            </div>
          </div>
        );
      })}
    </div>
  );
}

function EvidenceSection({ evidence }: { evidence: string | null | undefined }) {
  const items = parseJson<string[]>(evidence, []);
  if (!items.length) return null;
  return (
    <div>
      <h3 className="font-semibold text-base text-white/90 print:text-gray-900 mb-3 flex items-center gap-2">
        <span className="text-blue-400">◎</span>
        What the AI saw — evidence from your data
      </h3>
      <ul className="space-y-2">
        {items.map((item, i) => (
          <li key={i} className="flex items-start gap-2.5">
            <span className="mt-1 w-1.5 h-1.5 rounded-full bg-blue-400/60 shrink-0" />
            <span className="text-sm text-white/65 font-mono leading-relaxed print:text-gray-600">{item}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function AGIReasoningChain({ reasoning }: { reasoning: string | null | undefined }) {
  const steps = parseJson<string[]>(reasoning, []);
  if (!steps.length) return null;
  return (
    <div className="rounded-xl border border-violet-500/15 bg-violet-500/5 p-5 print:border-violet-200">
      <h3 className="font-semibold text-sm text-violet-400 mb-4 flex items-center gap-2 print:text-violet-700">
        <span aria-hidden="true">⚡</span>
        AGI Reasoning Chain — how the AI reached this conclusion
      </h3>
      <ol className="space-y-3">
        {steps.map((step, i) => (
          <li key={i} className="flex items-start gap-3">
            <span
              aria-hidden="true"
              className="shrink-0 w-5 h-5 rounded-full bg-violet-500/20 border border-violet-500/30 text-violet-400 text-xs font-bold flex items-center justify-center mt-0.5 print:bg-violet-100 print:text-violet-700"
            >
              {i + 1}
            </span>
            <span className="text-sm text-white/65 font-mono leading-relaxed print:text-gray-600">
              {step.replace(/^Step \d+:\s*/i, "")}
            </span>
          </li>
        ))}
      </ol>
    </div>
  );
}

function DataQualitySection({ issues }: { issues: string | null | undefined }) {
  const items = parseJson<string[]>(issues, []);
  if (!items.length) return null;
  return (
    <div className="rounded-xl border border-white/8 bg-white/3 px-5 py-4 print:border-gray-200">
      <h3 className="font-semibold text-sm text-white/50 print:text-gray-500 mb-2 flex items-center gap-2">
        <span className="text-yellow-400/70">⚑</span>
        Data gaps — what we couldn&apos;t fully assess
      </h3>
      <ul className="space-y-1.5">
        {items.map((item, i) => (
          <li key={i} className="text-xs text-white/40 print:text-gray-400 flex items-start gap-2">
            <span className="shrink-0 mt-0.5">·</span>
            {item}
          </li>
        ))}
      </ul>
    </div>
  );
}

type Props = {
  insight: InsightData;
  showBenchmarkBadge?: boolean;
  showBaselineComparison?: boolean;
  printMode?: boolean;
};

export default function InsightAnalysis({ insight, showBenchmarkBadge = true, showBaselineComparison = true, printMode = false }: Props) {
  const actionCards = parseJson<ActionCard[]>(insight.recommendations_json, []);
  const industry = insight.industry_detected || "operations";
  const isAgi = insight.agi_analysis;

  return (
    <div className="space-y-6">
      {/* AI engine status — replaces fake "High confidence analysis" */}
      {insight.analysis_method === "fallback_regex" && (
        <div role="alert" className="flex items-start gap-3 rounded-xl border border-yellow-500/30 bg-yellow-500/8 px-5 py-4">
          <span className="text-yellow-400 text-lg shrink-0 mt-0.5">⚠</span>
          <div>
            <p className="font-semibold text-yellow-400 text-sm">Pattern analysis mode — AI engine offline</p>
            <p className="text-white/60 text-xs mt-1">
              Results are keyword-frequency estimates, not LLM analysis. Item names, specific row citations, and confidence signals are not available. The AI engine will retry on your next upload.
            </p>
          </div>
        </div>
      )}

      {/* Baseline comparison — Alibaba data moat */}
      {showBaselineComparison && insight.baseline_comparison && (
        <div className={`flex items-center gap-3 rounded-xl border px-5 py-3 ${
          (insight.risk_delta ?? 0) > 5 ? "border-red-500/20 bg-red-500/8"
          : (insight.risk_delta ?? 0) < -5 ? "border-emerald-500/20 bg-emerald-500/8"
          : "border-white/10 bg-white/5"
        }`}>
          <span className={`text-base shrink-0 ${
            (insight.risk_delta ?? 0) > 5 ? "text-red-400" :
            (insight.risk_delta ?? 0) < -5 ? "text-emerald-400" : "text-white/50"
          }`}>
            {(insight.risk_delta ?? 0) > 5 ? "↑" : (insight.risk_delta ?? 0) < -5 ? "↓" : "→"}
          </span>
          <p className="text-sm text-white/70">{insight.baseline_comparison}</p>
        </div>
      )}

      {/* Data flywheel */}
      {showBenchmarkBadge && (insight.benchmark_count ?? 0) > 0 && (
        <div className="flex items-center gap-3 rounded-xl border border-blue-500/20 bg-blue-500/8 px-5 py-3 print:hidden">
          <span className="text-blue-400 text-base shrink-0">◉</span>
          <p className="text-sm text-blue-300">
            Your data contributes to the <span className="font-semibold capitalize">{industry.replace("_", " ")}</span> benchmark —{" "}
            <span className="font-semibold">{insight.benchmark_count} report{insight.benchmark_count !== 1 ? "s" : ""}</span> analyzed.
          </p>
        </div>
      )}

      {/* Critical Bottleneck — prominent red alert, not buried in text */}
      {insight.bottleneck_summary && (
        <div className="rounded-xl border border-red-500/30 bg-red-500/8 px-5 py-4">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-red-400 text-sm font-bold uppercase tracking-wider">Critical finding</span>
            {isAgi && (
              <span className="rounded-full bg-violet-500/20 border border-violet-500/30 px-2 py-0.5 text-xs text-violet-400 font-semibold print:hidden">
                ⚡ Vertical AGI
              </span>
            )}
          </div>
          <p className="text-white/85 leading-relaxed print:text-gray-900">{insight.bottleneck_summary}</p>
        </div>
      )}

      {/* ROI panels */}
      {((insight.cost_impact_usd ?? 0) > 0 || (insight.annual_savings_usd ?? 0) > 0) && (
        <div className="grid gap-4 md:grid-cols-2">
          {(insight.cost_impact_usd ?? 0) > 0 && (
            <div className="rounded-xl border border-red-500/20 bg-red-500/8 px-5 py-4 print:border-red-200 print:bg-red-50">
              <p className="text-xs text-red-400/70 uppercase tracking-wider mb-1 print:text-red-600">Cost at risk (current period)</p>
              <p className="text-2xl font-bold text-red-400 print:text-red-700">${insight.cost_impact_usd!.toLocaleString()}</p>
              <p className="text-xs text-white/40 mt-1 print:text-gray-500">From detected operational issues</p>
            </div>
          )}
          {(insight.annual_savings_usd ?? 0) > 0 && (
            <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/8 px-5 py-4 print:border-green-200 print:bg-green-50">
              <p className="text-xs text-emerald-400/70 uppercase tracking-wider mb-1 print:text-green-600">Annual savings if fixed</p>
              <p className="text-2xl font-bold text-emerald-400 print:text-green-700">${insight.annual_savings_usd!.toLocaleString()}</p>
              <p className="text-xs text-white/40 mt-1 print:text-gray-500">AI estimate — industry recurrence patterns</p>
            </div>
          )}
        </div>
      )}

      {/* Risk score grid */}
      <div className="grid gap-6 md:grid-cols-3">
        <RiskBar value={insight.risk_score} label="Overall Risk Score" />
        <RiskBar value={insight.delay_probability} label="Delay Probability" />
        <RiskBar value={insight.inventory_risk} label="Inventory Risk" />
      </div>

      {/* Main analysis card */}
      <div className="card space-y-6 print:border print:border-gray-200 print:bg-white print:shadow-none">
        {/* Header: real confidence + engine badges */}
        <div className="flex items-center gap-2 pb-4 border-b border-white/10 print:border-gray-100 flex-wrap">
          <ConfidenceBadge level={insight.confidence_level} />
          {insight.analysis_method && insight.analysis_method !== "fallback_regex" && (
            <span className="rounded-full border border-emerald-500/20 bg-emerald-500/8 px-2.5 py-1 text-xs text-emerald-400/80 print:hidden">
              {insight.analysis_method === "llm_groq" ? "Groq Llama 3.3-70B" : "OpenAI GPT-4o-mini"}
            </span>
          )}
          {isAgi && (
            <span className="rounded-full border border-violet-500/40 bg-violet-500/10 px-3 py-1 text-xs text-violet-400 font-semibold print:hidden">
              ⚡ Vertical AGI Analysis
            </span>
          )}
          {insight.expert_reviewed && (
            <span className="ml-auto rounded-full border border-amber-500/40 bg-amber-500/10 px-3 py-1 text-xs text-amber-400 font-semibold">
              ✓ Expert Reviewed
            </span>
          )}
        </div>

        {/* Executive Summary */}
        <div>
          <h3 className="font-semibold text-lg print:text-gray-900">Executive Summary</h3>
          <p className="mt-2 text-white/70 leading-relaxed print:text-gray-700">{insight.executive_summary}</p>
        </div>

        {/* Evidence — "What the AI saw" */}
        <EvidenceSection evidence={insight.evidence} />

        {/* AGI Reasoning Chain — chain-of-thought */}
        <AGIReasoningChain reasoning={insight.agi_reasoning} />

        {/* Structured Action Plan */}
        {actionCards.length > 0 ? (
          <div>
            <h3 className="font-semibold text-lg print:text-gray-900 mb-3">Action Plan</h3>
            <ActionCards cards={actionCards} />
          </div>
        ) : insight.recommendations ? (
          <div>
            <h3 className="font-semibold text-lg print:text-gray-900">Recommendations</h3>
            <p className="mt-2 text-white/70 leading-relaxed whitespace-pre-line print:text-gray-700">{insight.recommendations}</p>
          </div>
        ) : null}

        {/* Data quality issues — honest uncertainty */}
        <DataQualitySection issues={insight.data_quality_issues} />
      </div>
    </div>
  );
}
