import type { Metadata } from "next";
import Link from "next/link";
import { PainSolver } from "@/components/PainSolver";
import { IndustryKPIShowcase, VerticalFooter } from "@/components/IndustryKPIShowcase";
import { VerticalOutputPreview } from "@/components/VerticalOutputPreview";

const SUPPLY_CHAIN_PAINS = [
  {
    pain: "ImportComp China keeps missing delivery. Lead time is 45 days. We only have 2 Sensor-F6 units left. Production stops next week.",
    signal: "ImportComp China · Sensor-F6 · stock=2 · safety_stock=20 · lead_time=45d · OTD=38% · Risk=CRITICAL · PO_Value=₹2,20,000",
    aiOutput: {
      risk: 94, label: "CRITICAL — Production Stoppage in 3 Days", color: "red" as const,
      summary: "Sensor-F6 stock is 2 units against safety stock of 20 — 10× below threshold. ImportComp China OTD is 38% with 45-day lead time, meaning the open PO (₹2,20,000) has a 62% chance of arriving late. Production stops when this hits zero, estimated 3 days at current consumption.",
      action: "Procurement to (1) expedite existing PO via air freight today — accept 40% premium to prevent line stop. (2) Identify alternative sensor supplier with <21-day lead time. (3) Qualify backup vendor within 30 days to remove single-source dependency on this CRITICAL component.",
      impact: "Prevent production stoppage worth ₹8,50,000/day; eliminate single-source risk on critical path component",
    },
  },
  {
    pain: "ChemSupply Mumbai promised 21 days. Actual is 35. The adhesive is running out. Two assembly lines depend on it.",
    signal: "ChemSupply Mumbai · Adhesive-C3 · stock=8 · safety_stock=50 · lead_time=35d · promised=21d · OTD=44% · Risk=CRITICAL",
    aiOutput: {
      risk: 86, label: "CRITICAL — Below Safety Stock, Long Lead Time", color: "red" as const,
      summary: "Adhesive-C3 is at 8 units against safety stock of 50 — 84% below minimum. ChemSupply's actual lead time is 35 days vs promised 21 — a consistent 67% lead time miss. With 44% OTD rate, the open PO is likely to arrive in 35–42 days. You have approximately 1–2 days of stock left.",
      action: "Operations to ration Adhesive-C3 to highest-priority assembly lines immediately. Procurement to source spot inventory from any distributor within 48 hours. Escalate ChemSupply account: demand penalty clause enforcement or switch to alternate chemical supplier.",
      impact: "Prevent 2-line production halt; recover ₹3,20,000 daily output at risk",
    },
  },
  {
    pain: "TechComp India is 62% on-time and we have two open POs. Their PCB is on the critical path for our flagship product.",
    signal: "TechComp India · PCB-A1 · OTD=62% · stock=120 · reorder_point=300 · lead_time=21d · open_POs=2 · PO_value=₹4,80,000",
    aiOutput: {
      risk: 71, label: "HIGH — Critical Path Supplier Below Threshold", color: "red" as const,
      summary: "TechComp's 62% OTD means 38% of PCB-A1 deliveries are late. Current stock (120) is 60% below the reorder point (300) — the safety buffer is already consumed. With 2 open POs totalling ₹4,80,000 and a 21-day lead time, any further delay puts the flagship product launch at risk.",
      action: "Supply chain manager to request weekly delivery status update from TechComp on both open POs starting this Monday. Simultaneously, qualify PCBFab Bangalore (same category, 28-day lead, 66% OTD) as partial backup. Target: 20% of PCB-A1 volume shifted to backup vendor within 60 days.",
      impact: "Reduce single-supplier concentration risk; protect flagship product launch schedule",
    },
  },
];

export const metadata: Metadata = {
  title: "Supply Chain AI — Supplier Risk Scoring, Lead Time Analysis & Procurement Intelligence",
  description:
    "AI-powered supply chain intelligence. Upload supplier performance data, procurement logs or inventory reports to get supplier risk scores, lead time variance analysis and stockout-risk ranking in under 30 seconds.",
  alternates: { canonical: "https://nanoneuron.ai/supply-chain-ai" },
  openGraph: {
    title: "Supply Chain AI — Supplier Risk & Procurement Analysis",
    description:
      "Find your next production stoppage before it happens. OpsOracle AI scores supplier reliability, flags critical path components below safety stock, and ranks procurement risk instantly.",
    url: "https://nanoneuron.ai/supply-chain-ai",
  },
};

const capabilities = [
  {
    title: "Supplier Risk Scoring",
    desc: "Score every supplier on on-time delivery rate, lead time variance, and single-source dependency. AI ranks suppliers by production risk so procurement knows exactly where to focus vendor management effort.",
    kpi: "Know your riskiest supplier",
  },
  {
    title: "Critical Component Stockout Alert",
    desc: "Flag every component that is below safety stock with a supplier whose lead time means you cannot restock in time. AI calculates days-to-stockout per part and names the production lines at risk.",
    kpi: "Prevent production stoppages",
  },
  {
    title: "Lead Time Variance Analysis",
    desc: "Compare promised vs actual lead times per supplier over your entire PO history. AI identifies which suppliers consistently underperform their commitments — with financial impact of the gap calculated.",
    kpi: "Hold suppliers accountable",
  },
  {
    title: "Open PO Risk Assessment",
    desc: "Score every open purchase order by the supplier's historical OTD rate. AI flags high-risk POs where a late delivery will breach a production deadline, so you can expedite before it is too late.",
    kpi: "Expedite before it is too late",
  },
  {
    title: "Safety Stock Adequacy Scoring",
    desc: "Calculate whether your safety stock levels are adequate given each supplier's actual lead time and OTD variance — not just the promised lead time. AI recommends revised safety stock per critical component.",
    kpi: "Set safety stock correctly",
  },
  {
    title: "Supplier Diversification Analysis",
    desc: "Identify critical path components with single-source suppliers. AI quantifies the concentration risk and recommends which components to dual-source first based on production impact and sourcing feasibility.",
    kpi: "Eliminate single-source risk",
  },
];

const metrics = [
  { value: "< 30s", label: "Supplier risk analysis" },
  { value: "OTD", label: "On-time delivery scoring" },
  { value: "6 engines", label: "Calibrated for procurement" },
  { value: "Free", label: "No credit card to start" },
];

const faqJsonLd = {
  "@context": "https://schema.org", "@type": "FAQPage",
  mainEntity: [
    { "@type": "Question", name: "How does AI score supplier reliability in supply chain management?", acceptedAnswer: { "@type": "Answer", text: "OpsOracle AI reads your supplier performance data and scores each vendor on on-time delivery rate, lead time variance (actual vs promised), and production impact. Suppliers are ranked from CRITICAL to LOW risk so your procurement team knows where to focus vendor management effort." } },
    { "@type": "Question", name: "How can AI prevent production stoppages from supplier delays?", acceptedAnswer: { "@type": "Answer", text: "OpsOracle calculates days-until-stockout for every component by combining current stock levels with each supplier's actual (not promised) lead time and historical OTD rate. It flags components that will hit zero before a reliable restock arrives, giving procurement time to expedite or dual-source." } },
    { "@type": "Question", name: "What supply chain data can I upload to OpsOracle?", acceptedAnswer: { "@type": "Answer", text: "Upload supplier scorecards, open PO lists, component inventory reports or procurement logs as CSV or Excel. Any export from SAP, Oracle, Tally, or manual procurement tracking sheets works." } },
    { "@type": "Question", name: "How does OpsOracle identify single-source supplier risk?", acceptedAnswer: { "@type": "Answer", text: "OpsOracle flags components with only one active supplier, calculates the production impact if that supplier fails to deliver on time, and recommends which components to dual-source first based on lead time criticality and current OTD performance." } },
    { "@type": "Question", name: "What is a good on-time delivery rate for a supplier in India?", acceptedAnswer: { "@type": "Answer", text: "Best-in-class Indian suppliers achieve 90%+ on-time delivery. OpsOracle benchmarks your suppliers against this threshold and flags any supplier below 75% OTD that is on the critical path for production components." } },
  ],
};

export default function SupplyChainAI() {
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
            Supply Chain & Procurement
          </div>
          <h1 className="text-5xl font-bold md:text-6xl leading-tight tracking-tight">
            AI that finds the supplier risk<br />
            <span className="text-emerald-400">before production stops.</span>
          </h1>
          <p className="mx-auto mt-8 max-w-2xl text-lg text-white/60 leading-relaxed">
            Upload supplier performance data, PO logs or procurement reports. OpsOracle AI
            scores every supplier on OTD reliability, flags components below safety stock,
            identifies single-source risks — and gives procurement the action plan before
            the line stops. In under 30 seconds.
          </p>
          <div className="mt-10 flex flex-col sm:flex-row justify-center gap-4">
            <Link href="/register" className="btn text-base px-8 py-4">Analyze Your Supply Chain Free</Link>
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
            <p className="text-sm uppercase tracking-widest text-emerald-400/70 mb-3">Supply Chain AI Capabilities</p>
            <h2 className="text-3xl md:text-4xl font-bold">Built for procurement managers and supply chain leads</h2>
            <p className="mt-4 text-white/50 max-w-xl mx-auto">
              Not a generic AI. Every engine is calibrated on supply chain signals — OTD variance, safety stock adequacy, single-source concentration, critical path component risk.
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

      <PainSolver pains={SUPPLY_CHAIN_PAINS} industry="Supply Chain" />

      <IndustryKPIShowcase industry="supply_chain" currentHref="/supply-chain-ai" />

      <section aria-label="How it works" className="px-6 py-20 border-t border-white/8">
        <div className="mx-auto max-w-5xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold">How procurement teams use OpsOracle AI</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              { step: "01", title: "Upload supplier or PO data", desc: "Export your supplier scorecard, open PO list or procurement log as CSV. OpsOracle reads any format — lead times, OTD rates, stock levels, PO values." },
              { step: "02", title: "AI scores every supplier and component", desc: "OTD reliability scored per supplier, components ranked by stockout risk, single-source dependencies flagged, open POs rated by late-delivery probability." },
              { step: "03", title: "Act before production is affected", desc: "Three specific actions — expedite PO, raise safety stock, qualify alternate vendor — each names the supplier, the part, and the production impact of acting now vs later." },
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

      <VerticalOutputPreview industry="supply_chain" />

      <section aria-label="Get started" className="px-6 py-24 border-t border-white/8">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="text-4xl font-bold mb-6">Stop finding out about supplier failures after production stops.</h2>
          <p className="text-white/55 text-lg mb-10">
            Upload your supplier data now — OpsOracle AI returns risk scores, safety stock gaps and critical path alerts in seconds.
          </p>
          <Link href="/register" className="btn text-base px-10 py-4 inline-block">
            Start Analyzing Free
          </Link>
        </div>
      </section>

      </main>
      <VerticalFooter currentHref="/supply-chain-ai" industryName="Supply Chain" />
    </div>
  );
}
