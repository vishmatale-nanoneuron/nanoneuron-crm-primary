import type { Metadata } from "next";
import Link from "next/link";
import { PainSolver } from "@/components/PainSolver";
import { IndustryKPIShowcase, VerticalFooter } from "@/components/IndustryKPIShowcase";
import { VerticalOutputPreview } from "@/components/VerticalOutputPreview";

const WAREHOUSE_PAINS = [
  {
    pain: "Conveyor belt snapped. Production stopped 4 hours waiting for a spare that was out of stock.",
    signal: "SKU-105 Conveyor Belt 2m: stock=0 | reorder_point=5 | daily_demand=1 | lead_time=21d | last_restock=2026-04-15",
    aiOutput: {
      risk: 91, label: "CRITICAL — Stockout NOW", color: "red" as const,
      summary: "SKU-105 Conveyor Belt has been at zero stock for 56 days. Lead time is 21 days. With daily demand of 1 unit, every unplanned need causes a production stop — you're operating on luck.",
      action: "Procurement to raise emergency PO for SKU-105 today — request express delivery (2–3 days, accept 30% premium). Set reorder point to 8 units minimum. Never let this go below 3.",
      impact: "Prevent next production stoppage worth ₹2,40,000 per 4-hour stop",
    },
  },
  {
    pain: "Motor broke down. Checked warehouse — only 3 in stock vs reorder point of 15. Too late.",
    signal: "SKU-103 Motor 0.5HP: stock=3 | reorder_point=15 | daily_demand=2 | lead_time=14d | last_restock=2026-05-01",
    aiOutput: {
      risk: 79, label: "HIGH — Order Today", color: "red" as const,
      summary: "SKU-103 Motor 0.5HP has 1.5 days of cover left at current demand. Reorder point is 15 — you're 12 units below trigger. At 14-day lead time, a PO raised today arrives when stock is already zero.",
      action: "Stores manager to raise PO for 25 units of SKU-103 today. Flag as urgent to supplier. Set system reorder point to 30 units to account for lead time buffer.",
      impact: "Prevent 2–3 production stoppages in the next 30 days; save ₹4,80,000 in downtime costs",
    },
  },
  {
    pain: "Carrying ₹8 lakh in safety gloves that aren't moving. Working capital stuck.",
    signal: "SKU-102 Safety Gloves L: stock=320 | reorder_point=50 | daily_demand=12 | days_cover=26 | last_restock=2026-06-05",
    aiOutput: {
      risk: 28, label: "LOW — Optimize Stock", color: "emerald" as const,
      summary: "SKU-102 Safety Gloves has 26 days cover — 2× the optimal 14-day buffer. 160 excess units (₹96,000) are tying up warehouse space and working capital unnecessarily.",
      action: "Procurement to pause next scheduled reorder for SKU-102 until stock drops to 80 units. Redistribute 100 units to sister facility if possible.",
      impact: "Free ₹96,000 working capital; reduce carrying cost by ₹4,800/month",
    },
  },
];

export const metadata: Metadata = {
  title: "Warehouse AI — Inventory Risk Analysis, Stockout Prediction & WMS Analytics",
  description:
    "AI-powered warehouse intelligence. Upload inventory exports, WMS data or stock CSVs to get stockout risk scores, slow-mover detection, carrying cost analysis and reorder gap alerts instantly.",
  alternates: { canonical: "https://nanoneuron.ai/warehouse-ai" },
  openGraph: {
    title: "Warehouse AI — Inventory Risk & Stockout Prediction",
    description:
      "Predict stockouts and inventory imbalances before they stop production or disappoint customers. OpsOracle AI analyzes warehouse data in under 30 seconds.",
    url: "https://nanoneuron.ai/warehouse-ai",
  },
};

const capabilities = [
  {
    title: "Stockout Risk Prediction",
    desc: "Score every SKU for stockout probability. AI flags items approaching zero stock before demand spikes, considering lead time and reorder cycles.",
    kpi: "Prevent production stops",
  },
  {
    title: "Slow Mover & Dead Stock Detection",
    desc: "Automatically surface SKUs with low velocity, excess age or carrying cost above margin. Quantifies the capital tied up in non-moving inventory.",
    kpi: "Free up working capital",
  },
  {
    title: "Reorder Gap Analysis",
    desc: "Detect SKUs where reorder points lag actual consumption rates. AI recalibrates safety stock levels and flags procurement gaps before they become shortages.",
    kpi: "Optimize safety stock",
  },
  {
    title: "Warehouse Utilization Scoring",
    desc: "Parse slot utilization data, bin occupancy and throughput metrics to identify congestion zones, pick path inefficiencies and capacity constraints.",
    kpi: "Improve pick efficiency",
  },
  {
    title: "Order Fill Rate Risk",
    desc: "Identify SKUs that will degrade your order fill rate in the next 30 days based on current stock, open POs and forecast demand patterns.",
    kpi: "Protect customer SLA",
  },
  {
    title: "Inventory Cost Impact Estimate",
    desc: "Every analysis includes a USD cost impact — translating stockout risk, carrying costs and fill rate exposure into dollar figures for prioritization.",
    kpi: "Quantify inventory risk",
  },
];

const metrics = [
  { value: "< 30s", label: "Analysis time per inventory report" },
  { value: "SKU", label: "Level scoring, not summary averages" },
  { value: "6 engines", label: "Calibrated for warehouse ops" },
  { value: "Free", label: "No credit card to start" },
];

const faqJsonLd = {
  "@context": "https://schema.org", "@type": "FAQPage",
  mainEntity: [
    { "@type": "Question", name: "How does AI detect warehouse stockouts before they happen?", acceptedAnswer: { "@type": "Answer", text: "OpsOracle AI reads your inventory CSV or WMS export and calculates days-until-stockout per SKU by dividing current stock by daily demand velocity. It flags SKUs that will hit zero before the next restock arrives, given supplier lead times." } },
    { "@type": "Question", name: "What warehouse data formats does OpsOracle support?", acceptedAnswer: { "@type": "Answer", text: "OpsOracle accepts CSV, Excel and PDF exports from any WMS, ERP or inventory management system. No specific column format or template is required." } },
    { "@type": "Question", name: "Can OpsOracle AI identify slow-moving and dead inventory?", acceptedAnswer: { "@type": "Answer", text: "Yes. OpsOracle calculates weeks-on-hand per SKU against actual sales velocity. It flags items with more than 12 weeks of stock, quantifies the working capital locked in slow movers, and recommends markdown timing." } },
    { "@type": "Question", name: "How does OpsOracle calculate reorder points?", acceptedAnswer: { "@type": "Answer", text: "OpsOracle compares your current reorder point setting against actual lead times and daily demand. It recommends revised reorder points for SKUs where the current setting leaves insufficient safety buffer." } },
    { "@type": "Question", name: "Is warehouse AI software available for small businesses in India?", acceptedAnswer: { "@type": "Answer", text: "Yes. OpsOracle has a free tier with 3 warehouse analyses per day. Pro plans start at ₹999/month — affordable for businesses of any size." } },
  ],
};

export default function WarehouseAI() {
  return (
    <div className="min-h-screen bg-zinc-950 text-white">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }} />
      <header>
      <nav aria-label="Main navigation" className="fixed top-0 left-0 right-0 z-50 border-b border-white/8 bg-zinc-950/80 backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <Link href="/" className="text-lg font-bold tracking-tight">
            <span className="text-emerald-400">Ops</span>Oracle AI
          </Link>
          <div className="flex items-center gap-4">
            <Link href="/login" className="text-sm text-white/60 hover:text-white transition-colors">Login</Link>
            <Link href="/register" className="btn text-sm py-2 px-5">Get Started Free</Link>
          </div>
        </div>
      </nav>
      </header>

      <main id="main-content">
      <section aria-label="Hero" className="pt-32 pb-20 px-6">
        <div className="mx-auto max-w-5xl text-center">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-4 py-1.5 text-sm text-emerald-400">
            <span aria-hidden="true" className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
            Warehouse & Inventory Intelligence
          </div>
          <h1 className="text-5xl font-bold md:text-6xl leading-tight tracking-tight">
            AI that predicts inventory<br />
            <span className="text-emerald-400">risks before they become crises.</span>
          </h1>
          <p className="mx-auto mt-8 max-w-2xl text-lg text-white/60 leading-relaxed">
            Upload inventory exports, WMS data or stock CSVs. OpsOracle AI scores every
            SKU for stockout risk, flags slow movers, detects reorder gaps and estimates
            the cost impact — in under 30 seconds.
          </p>
          <div className="mt-10 flex flex-col sm:flex-row justify-center gap-4">
            <Link href="/register" className="btn text-base px-8 py-4">Analyze Your Inventory Free</Link>
            <Link href="/" className="rounded-xl border border-white/15 px-8 py-4 text-base hover:bg-white/5 transition-colors">
              View All Features
            </Link>
          </div>
        </div>
      </section>

      <section aria-label="Key metrics" className="px-6 pb-16">
        <div className="mx-auto max-w-5xl grid grid-cols-2 md:grid-cols-4 gap-4">
          {metrics.map((m) => (
            <div key={m.label} className="card text-center">
              <div className="text-3xl font-bold text-emerald-400">{m.value}</div>
              <div className="mt-1 text-sm text-white/50">{m.label}</div>
            </div>
          ))}
        </div>
      </section>

      <section aria-label="Capabilities" className="px-6 py-20 border-t border-white/8">
        <div className="mx-auto max-w-5xl">
          <div className="text-center mb-14">
            <p className="text-sm uppercase tracking-widest text-emerald-400/70 mb-3">Warehouse AI Capabilities</p>
            <h2 className="text-3xl md:text-4xl font-bold">Built for warehouse managers and supply planners</h2>
            <p className="mt-4 text-white/50 max-w-xl mx-auto">
              Not a generic AI. Every engine is calibrated on warehouse-specific signals — turnover velocity, safety stock buffers, SKU-level demand patterns.
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-5">
            {capabilities.map((c) => (
              <div key={c.title} className="card hover:border-emerald-500/30 hover:bg-white/8 transition-all">
                <div className="text-xs text-emerald-400/70 font-mono uppercase tracking-wider mb-2">{c.kpi}</div>
                <h3 className="font-semibold text-base mb-2">{c.title}</h3>
                <p className="text-white/55 text-sm leading-relaxed">{c.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <PainSolver pains={WAREHOUSE_PAINS} industry="Warehouse" />

      <IndustryKPIShowcase industry="warehouse" currentHref="/warehouse-ai" />

      <section aria-label="How it works" className="px-6 py-20 border-t border-white/8">
        <div className="mx-auto max-w-5xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold">How warehouse teams use OpsOracle AI</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              { step: "01", title: "Upload your inventory report", desc: "Drag your WMS export, stock count CSV or purchase order sheet. OpsOracle reads any column layout — no template required." },
              { step: "02", title: "AI scores every SKU", desc: "Stockout probability, days-of-cover risk, slow-mover flag and reorder gap detection calculated per SKU automatically." },
              { step: "03", title: "Act before the stockout", desc: "Prioritized action list with cost impact estimates ready in under 30 seconds. Share directly with procurement and planning teams." },
            ].map((s) => (
              <div key={s.step} className="card relative overflow-hidden">
                <div aria-hidden="true" className="text-6xl font-bold text-white/5 absolute -top-2 -right-2 select-none">{s.step}</div>
                <div className="text-emerald-400 text-sm font-mono mb-3">{s.step}</div>
                <h3 className="font-semibold text-lg mb-2">{s.title}</h3>
                <p className="text-white/55 text-sm leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <VerticalOutputPreview industry="warehouse" />

      <section aria-label="Get started" className="px-6 py-24 border-t border-white/8">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="text-4xl font-bold mb-6">Stop finding out about stockouts when production calls.</h2>
          <p className="text-white/55 text-lg mb-10">
            Upload your inventory report now — OpsOracle AI returns SKU risk scores, reorder gap analysis and cost impact in seconds.
          </p>
          <Link href="/register" className="btn text-base px-10 py-4 inline-block">
            Start Analyzing Free
          </Link>
        </div>
      </section>

      </main>
      <VerticalFooter currentHref="/warehouse-ai" industryName="Warehouse" />
    </div>
  );
}
