type KPIMini = { label: string; value: string; status: "good" | "warn" | "critical" };

type PreviewData = {
  industry: string;
  file: string;
  riskScore: number;
  riskLabel: string;
  riskColor: "red" | "yellow" | "emerald";
  summary: string;
  actions: { horizon: string; text: string }[];
  kpis: KPIMini[];
  benchmarkTeaser: string;
};

const STATUS_BAR: Record<"good" | "warn" | "critical", string> = {
  good: "bg-emerald-500",
  warn: "bg-amber-400",
  critical: "bg-red-500",
};

const STATUS_TEXT: Record<"good" | "warn" | "critical", string> = {
  good: "text-emerald-400",
  warn: "text-amber-400",
  critical: "text-red-400",
};

const RISK_BADGE: Record<"red" | "yellow" | "emerald", string> = {
  red: "border-red-500/40 bg-red-500/10 text-red-400",
  yellow: "border-amber-400/40 bg-amber-400/10 text-amber-400",
  emerald: "border-emerald-500/40 bg-emerald-500/10 text-emerald-400",
};

const PREVIEWS: Record<string, PreviewData> = {
  logistics: {
    industry: "Logistics",
    file: "freight_june_w2.csv",
    riskScore: 82,
    riskLabel: "HIGH — Act Today",
    riskColor: "red",
    summary:
      "BlueDart Mumbai→Delhi route has 100% delay rate across 5 shipments this week (₹28,600 at risk). 3 shipments overdue today. DTDC on the same corridor shows 0% delay. Root cause: BlueDart depot dwell spike — AWB hold suspected.",
    actions: [
      { horizon: "TODAY", text: "Re-route SH-1005, SH-1007, SH-1009 to Delhivery before 5 pm. Escalate SLA breach to BlueDart key account manager." },
      { horizon: "THIS WEEK", text: "Audit all open BlueDart shipments on Mumbai→Delhi corridor. Flag any dwell > 24 hours for manual follow-up." },
      { horizon: "THIS MONTH", text: "Place 20% of Mumbai→Delhi volume on DTDC as parallel carrier until BlueDart SLA returns to >90% OTIF for 3 consecutive weeks." },
    ],
    kpis: [
      { label: "OTIF", value: "64%", status: "critical" },
      { label: "Delay Rate", value: "36%", status: "critical" },
      { label: "Avg Delay Days", value: "2.8d", status: "warn" },
      { label: "Carrier Failure Rate", value: "41%", status: "critical" },
    ],
    benchmarkTeaser: "Your OTIF (64%) vs logistics industry average",
  },
  manufacturing: {
    industry: "Manufacturing",
    file: "shift_report_june_w2.csv",
    riskScore: 78,
    riskLabel: "HIGH — Isolate Today",
    riskColor: "red",
    summary:
      "M2-Lathe is responsible for 61% of all floor downtime this week despite being 1 of 6 machines. OEE sits at 51% — 34 points below world-class target. Defect rate on M2-Lathe night shift is 13× floor average. Pattern is escalating: not random breakdown — mechanical degradation in progress.",
    actions: [
      { horizon: "TODAY", text: "Maintenance engineer to inspect M2-Lathe spindle bearings and coolant system before next shift starts." },
      { horizon: "THIS WEEK", text: "Schedule 4-hour targeted PM on M2-Lathe this Saturday. Do not defer to next scheduled quarterly PM." },
      { horizon: "THIS MONTH", text: "Install vibration sensor on M2-Lathe spindle assembly to enable predictive maintenance alerting before next failure cycle." },
    ],
    kpis: [
      { label: "OEE", value: "51%", status: "critical" },
      { label: "Downtime %", value: "22%", status: "critical" },
      { label: "Defect Rate", value: "8.4%", status: "critical" },
      { label: "Availability", value: "78%", status: "warn" },
    ],
    benchmarkTeaser: "Your OEE (51%) vs manufacturing industry average",
  },
  warehouse: {
    industry: "Warehouse",
    file: "inventory_export_june12.csv",
    riskScore: 71,
    riskLabel: "HIGH — Order Today",
    riskColor: "red",
    summary:
      "3 critical MRO SKUs are below safety stock with lead times of 14–21 days — you will hit zero before any PO can arrive. 1 SKU (SKU-105 Conveyor Belt) is already at zero for 56 days. 4 slow-moving SKUs are tying up ₹3.2L in working capital with >60 days cover.",
    actions: [
      { horizon: "TODAY", text: "Raise emergency PO for SKU-105 Conveyor Belt and SKU-103 Motor 0.5HP. Accept express delivery premium to avoid line stoppage." },
      { horizon: "THIS WEEK", text: "Review and revise reorder points for all 3 critical SKUs — current settings are set to promised lead time, not actual lead time." },
      { horizon: "THIS MONTH", text: "Mark 4 slow-moving SKUs for procurement pause. Redistribute ₹3.2L of excess stock to reduce carrying cost by ₹16,000/month." },
    ],
    kpis: [
      { label: "Stockout Rate", value: "12%", status: "critical" },
      { label: "Fill Rate", value: "81%", status: "warn" },
      { label: "Critical Items", value: "18%", status: "critical" },
      { label: "Avg Days Supply", value: "6.2d", status: "warn" },
    ],
    benchmarkTeaser: "Your Fill Rate (81%) vs warehouse industry average",
  },
  retail: {
    industry: "Retail",
    file: "store_inventory_june.csv",
    riskScore: 88,
    riskLabel: "CRITICAL — 3 Active Stockouts",
    riskColor: "red",
    summary:
      "SKU-202, SKU-206, and SKU-210 are at zero stock across Mumbai and Delhi stores. Combined weekly revenue stopped: ₹46,200. SKU-202 has been in stockout for 21 days. Meanwhile 2 SKUs are carrying 110+ weeks of stock — ₹2.7L locked in dead inventory.",
    actions: [
      { horizon: "TODAY", text: "Raise emergency POs for SKU-202, SKU-206, SKU-210. Prioritise SKU-202 (highest demand, longest stockout). Accept 15% express procurement premium." },
      { horizon: "THIS WEEK", text: "Set auto-reorder triggers at 30-unit threshold for all three stockout SKUs so this is never discovered reactively again." },
      { horizon: "THIS MONTH", text: "Mark winter jacket SKU-208 (220 units at 2/week velocity) for 30% markdown this week — seasonal window is closing fast." },
    ],
    kpis: [
      { label: "Stockout Rate", value: "11%", status: "critical" },
      { label: "Sell-Through", value: "58%", status: "warn" },
      { label: "Return Rate", value: "9%", status: "warn" },
      { label: "Avg Days Stockout", value: "0.8d", status: "critical" },
    ],
    benchmarkTeaser: "Your Sell-Through (58%) vs retail industry average",
  },
  supply_chain: {
    industry: "Supply Chain",
    file: "supplier_scorecard_june.csv",
    riskScore: 91,
    riskLabel: "CRITICAL — Production Stoppage Risk",
    riskColor: "red",
    summary:
      "2 suppliers are CRITICAL: ImportComp China (OTD 38%, Sensor-F6 at 2 units remaining, 45-day lead time) and ChemSupply Mumbai (OTD 44%, Adhesive-C3 at 8 units, 35-day actual vs 21-day promised). Both components are on the production critical path. Lead times guarantee a stockout before any PO can arrive.",
    actions: [
      { horizon: "TODAY", text: "Expedite Sensor-F6 PO via air freight — accept 40% premium to prevent production line stop in 3 days." },
      { horizon: "THIS WEEK", text: "Source spot Adhesive-C3 inventory from any distributor within 48 hours. Ration current stock to highest-priority assembly lines." },
      { horizon: "THIS MONTH", text: "Qualify backup vendor for Sensor-F6 with <21-day lead time. Target: 20% of volume shifted to backup within 30 days." },
    ],
    kpis: [
      { label: "Supplier OTD", value: "61%", status: "critical" },
      { label: "Critical Suppliers", value: "22%", status: "critical" },
      { label: "Lead Time Variance", value: "38%", status: "critical" },
      { label: "High/Crit Risk", value: "44%", status: "critical" },
    ],
    benchmarkTeaser: "Your Supplier OTD (61%) vs supply chain industry average",
  },
  devops: {
    industry: "DevOps",
    file: "deploy_log_june_w2.csv",
    riskScore: 78,
    riskLabel: "HIGH — Measure Before You Fix",
    riskColor: "red",
    summary:
      "4 of 8 production deployments failed this week — 50% change failure rate. DORA tier: Low. auth-service, api-gateway, notification-service, and payment-service all had failures. Average MTTR: 124 minutes — 2× DORA Elite threshold. payment-service has failed 2 of its last 3 deploys.",
    actions: [
      { horizon: "TODAY", text: "Freeze payment-service feature deploys until post-incident review is complete and staging → canary gate is enforced." },
      { horizon: "THIS WEEK", text: "SRE lead to instrument per-service change failure rate in your observability stack. Dashboard target: visible within 5 days." },
      { horizon: "THIS MONTH", text: "Add 30-minute canary soak time before full rollout for all services with >30% historical change failure rate." },
    ],
    kpis: [
      { label: "Deploy Success", value: "50%", status: "critical" },
      { label: "MTTR", value: "124min", status: "critical" },
      { label: "Change Failure", value: "50%", status: "critical" },
      { label: "P1 Rate", value: "3.75", status: "critical" },
    ],
    benchmarkTeaser: "Your Change Failure Rate (50%) vs DevOps industry average",
  },
  mlops: {
    industry: "MLOps",
    file: "model_monitoring_june.csv",
    riskScore: 84,
    riskLabel: "CRITICAL — 2 Models in Production Are Wrong",
    riskColor: "red",
    summary:
      "fraud-detector accuracy has dropped 7.1 points below baseline (87.1% vs 94.2%) with data drift score 0.34 — above the 0.20 threshold. pricing-model has simultaneous failures: P99 latency 4.45× above SLA (890ms vs 200ms) and accuracy 8.7 points below baseline. Both models are serving degraded predictions to production traffic right now.",
    actions: [
      { horizon: "TODAY", text: "Trigger emergency retrain of fraud-detector using last 7 days of labeled transactions. Deploy with shadow mode validation first." },
      { horizon: "TODAY", text: "Scale pricing-model inference replicas from 2 to 6 immediately to address 890ms P99 latency. Add SLA alert at 400ms." },
      { horizon: "THIS WEEK", text: "Fix churn-predictor training pipeline: (1) add null-value validation gate, (2) fix feature store ingestion lag causing 72-hour staleness." },
    ],
    kpis: [
      { label: "Avg Accuracy", value: "83%", status: "critical" },
      { label: "P99 Latency", value: "890ms", status: "critical" },
      { label: "Avg Drift Score", value: "0.48", status: "critical" },
      { label: "Retraining Rate", value: "67%", status: "critical" },
    ],
    benchmarkTeaser: "Your Avg Model Accuracy (83%) vs MLOps industry average",
  },
};

export function VerticalOutputPreview({ industry }: { industry: string }) {
  const d = PREVIEWS[industry];
  if (!d) return null;

  return (
    <section aria-label="Sample analysis output" className="px-6 py-20 border-t border-white/8">
      <div className="mx-auto max-w-5xl">
        <div className="text-center mb-10">
          <p className="text-xs uppercase tracking-widest text-emerald-400/70 mb-3">Sample Output</p>
          <h2 className="text-3xl md:text-4xl font-bold">This is what OpsOracle returns on your data.</h2>
          <p className="mt-4 text-white/40 text-sm">Real output format. Mocked data — yours will reflect your actual {d.industry.toLowerCase()} operations.</p>
        </div>

        <div className="rounded-2xl border border-white/10 bg-white/3 overflow-hidden">
          {/* Header bar */}
          <div className="flex items-center justify-between gap-4 border-b border-white/8 px-5 py-3 bg-white/2">
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-xs text-white/40 font-mono">{d.file}</span>
            </div>
            <span className={`rounded-full border px-3 py-1 text-xs font-semibold ${RISK_BADGE[d.riskColor]}`}>
              Risk {d.riskScore} — {d.riskLabel}
            </span>
          </div>

          <div className="p-5 space-y-5">
            {/* Executive summary */}
            <div>
              <p className="text-xs uppercase tracking-wider text-white/30 mb-2">Executive Summary</p>
              <p className="text-sm text-white/75 leading-relaxed">{d.summary}</p>
            </div>

            {/* Actions */}
            <div>
              <p className="text-xs uppercase tracking-wider text-white/30 mb-2">Recommended Actions</p>
              <div className="space-y-2">
                {d.actions.map((a) => (
                  <div key={a.horizon} className="flex gap-3">
                    <span className="shrink-0 rounded border border-white/10 bg-white/5 px-2 py-0.5 text-xs font-mono text-white/40 self-start mt-0.5">
                      {a.horizon}
                    </span>
                    <p className="text-sm text-white/65 leading-relaxed">{a.text}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* KPI mini-bars */}
            <div>
              <p className="text-xs uppercase tracking-wider text-white/30 mb-2">Your Industry KPIs</p>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {d.kpis.map((k) => (
                  <div key={k.label} className="rounded-xl border border-white/8 bg-white/3 p-3">
                    <p className="text-xs text-white/35 mb-1">{k.label}</p>
                    <p className={`text-lg font-bold font-mono ${STATUS_TEXT[k.status]}`}>{k.value}</p>
                    <div className="mt-2 h-1 w-full rounded-full bg-white/8">
                      <div className={`h-1 rounded-full ${STATUS_BAR[k.status]}`} style={{ width: k.status === "good" ? "80%" : k.status === "warn" ? "50%" : "25%" }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Pro benchmark row — blurred with lock */}
            <div className="relative rounded-xl border border-emerald-500/20 overflow-hidden">
              <div className="p-4 blur-sm select-none pointer-events-none" aria-hidden="true">
                <p className="text-xs uppercase tracking-wider text-white/30 mb-2">Benchmark Comparison (Pro)</p>
                <div className="flex items-center gap-4">
                  <div className="flex-1 h-2 rounded-full bg-white/10">
                    <div className="h-2 w-2/5 rounded-full bg-red-500" />
                  </div>
                  <span className="text-sm text-white/60 font-mono">{d.benchmarkTeaser}</span>
                  <div className="flex-1 h-2 rounded-full bg-white/10">
                    <div className="h-2 w-4/5 rounded-full bg-emerald-500" />
                  </div>
                </div>
                <p className="text-xs text-white/40 mt-2">Your team is in the bottom 30% of {d.industry.toLowerCase()} operations on this KPI. Industry median: —. Top quartile: —.</p>
              </div>
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-zinc-950/60 backdrop-blur-[1px]">
                <div className="text-center">
                  <span className="mb-2 inline-block rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-xs text-emerald-400 font-semibold">Pro</span>
                  <p className="text-sm font-semibold text-white mt-1">See how you compare to your industry</p>
                  <p className="text-xs text-white/40 mt-1">Upgrade to Pro to unlock benchmark comparison</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <p className="mt-4 text-center text-xs text-white/25">
          Your analysis is generated in &lt; 30 seconds from any CSV or Excel export. No formatting required.
        </p>
      </div>
    </section>
  );
}
