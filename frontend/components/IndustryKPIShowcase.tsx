import Link from "next/link";

type KPIItem = {
  label: string;
  description: string;
  good: string;
  unit: string;
};

type VerticalLink = {
  href: string;
  label: string;
};

const INDUSTRY_KPIS: Record<string, { headline: string; kpis: KPIItem[]; benchmarkNote: string }> = {
  logistics: {
    headline: "4 KPIs OpsOracle computes from every logistics upload",
    benchmarkNote: "Pro users see their KPIs vs live industry averages from all OpsOracle logistics teams",
    kpis: [
      { label: "On-Time In-Full (OTIF)", description: "% shipments delivered on time and complete — the single number that determines customer satisfaction", good: "World class: ≥ 95%", unit: "%" },
      { label: "Delay Rate", description: "% of shipments with actual date beyond scheduled date — carrier and corridor level", good: "Best-in-class: ≤ 5%", unit: "%" },
      { label: "Avg Delay Days", description: "Mean days past SLA for delayed shipments — indicates severity, not just frequency", good: "Target: < 1 day", unit: "days" },
      { label: "Carrier Failure Rate", description: "% failures for your highest-risk carrier — surfaces which partner needs an SLA conversation", good: "Healthy: < 15%", unit: "%" },
    ],
  },
  manufacturing: {
    headline: "4 KPIs OpsOracle computes from every production upload",
    benchmarkNote: "Pro users see their OEE, downtime, and defect rates vs live industry averages",
    kpis: [
      { label: "OEE (Overall Equipment Effectiveness)", description: "Availability × Performance × Quality — the master metric of manufacturing efficiency", good: "World class: ≥ 85%", unit: "%" },
      { label: "Downtime %", description: "% of scheduled production time lost to breakdowns, setup delays, or material waits", good: "Target: < 5%", unit: "%" },
      { label: "Defect Rate", description: "% of actual output that fails quality — reveals whether downtime and quality issues are the same machine", good: "Target: < 1%", unit: "%" },
      { label: "Machine Availability", description: "% of machines with downtime under 30 mins per shift — flags chronic failure patterns", good: "Healthy: ≥ 90%", unit: "%" },
    ],
  },
  warehouse: {
    headline: "4 KPIs OpsOracle computes from every inventory upload",
    benchmarkNote: "Pro users see stockout rates, fill rates, and days-of-supply vs live warehouse benchmarks",
    kpis: [
      { label: "Stockout Rate", description: "% SKUs with zero inventory — every stockout is a production stop or a lost sale", good: "Target: < 2%", unit: "%" },
      { label: "Fill Rate", description: "% SKUs above reorder point — measures whether inventory planning is working", good: "Healthy: ≥ 95%", unit: "%" },
      { label: "Critical Stock Items", description: "% SKUs at or below reorder threshold — your 48-hour warning list", good: "Target: < 10%", unit: "%" },
      { label: "Avg Days of Supply", description: "Mean days until stockout across all SKUs — tells you how much runway your inventory provides", good: "Safe: ≥ 14 days", unit: "days" },
    ],
  },
  retail: {
    headline: "4 KPIs OpsOracle computes from every retail data upload",
    benchmarkNote: "Pro users see sell-through rates and stockout metrics vs live retail benchmarks",
    kpis: [
      { label: "Sell-Through Rate", description: "% of available inventory sold — low sell-through = dead stock eating margin", good: "Healthy: ≥ 75%", unit: "%" },
      { label: "Stockout Rate", description: "% of SKU-store combinations with zero days until stockout — every 0 is a missed sale today", good: "Target: < 5%", unit: "%" },
      { label: "Return Rate", description: "Returns as % of weekly sales — high return rates signal product, price, or description problems", good: "Good: < 5%", unit: "%" },
      { label: "Avg Days Until Stockout", description: "How many days of stock remain across your portfolio — tells you urgency of replenishment decisions", good: "Safe: ≥ 7 days", unit: "days" },
    ],
  },
  supply_chain: {
    headline: "4 KPIs OpsOracle computes from every procurement upload",
    benchmarkNote: "Pro users see supplier OTD rates and risk exposure vs live supply chain benchmarks",
    kpis: [
      { label: "Supplier On-Time Delivery (OTD)", description: "% orders from each supplier delivered within promised lead time — the key supplier health signal", good: "World class: ≥ 95%", unit: "%" },
      { label: "Critical Supplier %", description: "% of suppliers at CRITICAL risk level — these are the ones that can stop your production line", good: "Target: 0%", unit: "%" },
      { label: "Lead Time Variance", description: "Mean deviation from promised lead time — high variance makes production scheduling impossible", good: "Healthy: < 10%", unit: "%" },
      { label: "High+Critical Risk Suppliers", description: "% of suppliers at HIGH or CRITICAL risk — your supplier diversification priority list", good: "Target: < 15%", unit: "%" },
    ],
  },
  devops: {
    headline: "4 DORA metrics OpsOracle computes from every deployment log",
    benchmarkNote: "Pro users see deploy success rates and MTTR vs live DevOps benchmarks",
    kpis: [
      { label: "Deploy Success Rate", description: "% of deployments that complete without rollback or incident — the core deployment reliability signal", good: "Elite: ≥ 95%", unit: "%" },
      { label: "Mean Time to Recovery (MTTR)", description: "Average minutes to restore service after an incident — lower = faster detection and response", good: "Elite: < 60 mins", unit: "mins" },
      { label: "Change Failure Rate", description: "% of deploys that triggered an incident — the DORA metric that reveals deployment risk", good: "Elite: < 5%", unit: "%" },
      { label: "P1 Incidents per 10 Deploys", description: "Rate of critical incidents per deploy volume — tells you whether engineering velocity is sustainable", good: "Healthy: < 1", unit: "" },
    ],
  },
  mlops: {
    headline: "4 model health KPIs OpsOracle computes from every ML log",
    benchmarkNote: "Pro users see model accuracy and drift scores vs live MLOps benchmarks",
    kpis: [
      { label: "Avg Model Accuracy", description: "Mean accuracy % across healthy/active models — the business-facing signal that catches model decay early", good: "Target: ≥ 90%", unit: "%" },
      { label: "P99 Inference Latency", description: "99th percentile response time — SLA breaches here cause user-facing slowdowns before teams notice", good: "Target: < 200 ms", unit: "ms" },
      { label: "Avg Data Drift Score", description: "Mean feature/data drift across all models — drift > 0.4 predicts accuracy degradation within days", good: "Healthy: < 0.2", unit: "" },
      { label: "Retraining Rate", description: "% of models flagged for retraining — high rates signal data quality or feature store problems upstream", good: "Healthy: < 20%", unit: "%" },
    ],
  },
};

const ALL_VERTICALS: VerticalLink[] = [
  { href: "/logistics-ai", label: "Logistics AI" },
  { href: "/manufacturing-ai", label: "Manufacturing AI" },
  { href: "/warehouse-ai", label: "Warehouse AI" },
  { href: "/devops-ai", label: "DevOps AI" },
  { href: "/mlops-ai", label: "MLOps AI" },
  { href: "/retail-ai", label: "Retail AI" },
  { href: "/supply-chain-ai", label: "Supply Chain AI" },
];

export function IndustryKPIShowcase({ industry, currentHref }: { industry: string; currentHref: string }) {
  const data = INDUSTRY_KPIS[industry];
  if (!data) return null;

  return (
    <section aria-label="KPI intelligence" className="px-6 py-20 border-t border-white/8">
      <div className="mx-auto max-w-5xl">
        <div className="text-center mb-12">
          <p className="text-xs uppercase tracking-widest text-blue-400/70 mb-3">KPI Intelligence</p>
          <h2 className="text-3xl md:text-4xl font-bold">{data.headline}</h2>
          <p className="mt-4 text-white/40 text-sm max-w-lg mx-auto">{data.benchmarkNote}</p>
        </div>

        <div className="grid md:grid-cols-2 gap-5 mb-12">
          {data.kpis.map((kpi) => (
            <div key={kpi.label} className="card hover:border-blue-500/20 transition-colors">
              <div className="flex items-start justify-between gap-3 mb-2">
                <h3 className="font-semibold text-base text-white/90">{kpi.label}</h3>
                {kpi.unit && (
                  <span className="shrink-0 rounded-full border border-blue-500/20 bg-blue-500/8 px-2 py-0.5 text-xs text-blue-400 font-mono">
                    {kpi.unit}
                  </span>
                )}
              </div>
              <p className="text-sm text-white/55 leading-relaxed mb-3">{kpi.description}</p>
              <p className="text-xs text-emerald-400/70 font-mono">{kpi.good}</p>
            </div>
          ))}
        </div>

        <div className="rounded-2xl border border-emerald-500/15 bg-emerald-500/5 px-6 py-5 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <p className="font-semibold text-sm text-emerald-400">Pro: see your KPIs vs the industry benchmark</p>
            <p className="text-white/50 text-sm mt-1">
              Every upload feeds the anonymized benchmark. Pro users see their numbers vs the live average.
            </p>
          </div>
          <Link href="/register" className="shrink-0 btn !py-2.5 !px-6 text-sm">
            Start Free Trial →
          </Link>
        </div>
      </div>
    </section>
  );
}

export function VerticalFooter({ currentHref, industryName }: { currentHref: string; industryName: string }) {
  const others = ALL_VERTICALS.filter((v) => v.href !== currentHref);
  return (
    <footer aria-label="Site footer" className="border-t border-white/8 px-6 py-12">
      <div className="mx-auto max-w-6xl">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 mb-10">
          <div>
            <Link href="/" className="text-lg font-bold">
              <span className="text-emerald-400">Ops</span>Oracle AI
            </Link>
            <p className="mt-2 text-sm text-white/40 leading-relaxed">
              Vertical AI for industrial operations. Upload your data, get AI risk analysis in 30 seconds.
            </p>
          </div>
          <div>
            <p className="text-xs uppercase tracking-wider text-white/30 mb-3">All Verticals</p>
            <ul className="space-y-1.5">
              {ALL_VERTICALS.map((v) => (
                <li key={v.href}>
                  <Link
                    href={v.href}
                    className={`text-sm transition-colors ${
                      v.href === currentHref ? "text-emerald-400 font-medium" : "text-white/40 hover:text-white"
                    }`}
                  >
                    {v.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <p className="text-xs uppercase tracking-wider text-white/30 mb-3">Product</p>
            <ul className="space-y-1.5">
              {[
                { href: "/", label: "Home" },
                { href: "/pricing", label: "Pricing" },
                { href: "/register", label: "Start Free" },
                { href: "/login", label: "Login" },
              ].map((l) => (
                <li key={l.href}>
                  <Link href={l.href} className="text-sm text-white/40 hover:text-white transition-colors">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
        <div className="border-t border-white/8 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs text-white/25">© {new Date().getFullYear()} OpsOracle AI. All rights reserved.</p>
          <p className="text-xs text-white/25">
            Vertical AI for{" "}
            {others.slice(0, 3).map((v, i) => (
              <span key={v.href}>
                <Link href={v.href} className="hover:text-white transition-colors">{v.label.replace(" AI", "")}</Link>
                {i < 2 ? ", " : ""}
              </span>
            ))}
            {" "}and more.
          </p>
        </div>
      </div>
    </footer>
  );
}
