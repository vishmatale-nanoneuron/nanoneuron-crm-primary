import type { Metadata } from "next";
import Link from "next/link";
import { PainSolver } from "@/components/PainSolver";

const LOGISTICS_PAINS = [
  {
    pain: "BlueDart keeps missing Delhi deliveries. You find out 4 days late, after the customer calls.",
    signal: "SH-1005 Mumbai→Delhi BlueDart PENDING +3d | SH-1007 Mumbai→Delhi BlueDart PENDING +2d | SH-1009 Mumbai→Delhi BlueDart PENDING +1d",
    aiOutput: {
      risk: 82, label: "HIGH — Act Today", color: "red" as const,
      summary: "BlueDart Mumbai→Delhi route has 100% delay rate across 5 shipments (₹28,600 at risk). 3 pending shipments overdue today. DTDC same corridor shows 0% delay.",
      action: "Logistics Manager to re-route SH-1005, SH-1007, SH-1009 to Delhivery before 5pm today. Escalate SLA breach to BlueDart key account.",
      impact: "Prevent ₹28,600 cost-in-transit + 3 customer SLA breaches this week",
    },
  },
  {
    pain: "Freight costs jumped 23% this month. Finance wants answers. You don't have them.",
    signal: "Route: Chennai→Bangalore | Avg cost May: ₹1,800 | Avg cost June: ₹2,214 | Volume: same | Carrier: mixed",
    aiOutput: {
      risk: 61, label: "MEDIUM — Investigate", color: "yellow" as const,
      summary: "Chennai→Bangalore lane shows 23% cost increase with flat volume. Top driver: DTDC surcharge effective June 1 (+₹180/shipment). 12 affected shipments this month.",
      action: "Procurement to request DTDC rate card revision. Meanwhile consolidate Tuesday/Thursday dispatches to cut per-shipment cost by ₹340.",
      impact: "Recover ₹4,080 in June, ₹16,320 annually on this lane alone",
    },
  },
  {
    pain: "3 shipments stuck at Hyderabad depot for 6 days. Root cause unknown.",
    signal: "SH-1006 HYD depot dwell: 6d | SH-1010 HYD depot dwell: 4d | Normal dwell: 0.5d | Status: Pending",
    aiOutput: {
      risk: 74, label: "HIGH — Escalate Now", color: "red" as const,
      summary: "Hyderabad depot showing 8–12× normal dwell time on 3 shipments. Pattern matches a documentation hold — AWB mismatch or GST number issue is the likely cause.",
      action: "Ops team to call HYD depot supervisor directly — request AWB scan and customs/GST check on SH-1006 and SH-1010 before close of business today.",
      impact: "Release ₹14,400 in stuck inventory; prevent customer escalation",
    },
  },
];

export const metadata: Metadata = {
  title: "Logistics AI — Shipment Delay Prediction & Freight Risk Analysis",
  description:
    "AI-powered logistics intelligence. Upload dispatch reports, carrier SLA data or shipment CSVs to get delay probability scores, route risk analysis and cost impact estimates instantly.",
  alternates: { canonical: "https://nanoneuron.ai/logistics-ai" },
  openGraph: {
    title: "Logistics AI — Shipment Delay Prediction",
    description:
      "Predict shipment delays and carrier SLA breaches before they cascade. OpsOracle AI analyzes your freight data in under 30 seconds.",
    url: "https://nanoneuron.ai/logistics-ai",
  },
};

const capabilities = [
  {
    title: "Shipment Delay Prediction",
    desc: "Score every shipment line for delay probability. AI identifies late patterns across carriers, routes and depots before the breach occurs.",
    kpi: "Reduce SLA breaches",
  },
  {
    title: "Carrier Performance Benchmarking",
    desc: "Rank carriers by on-time rate, cost-per-kg and damage frequency. Know which partners need an SLA conversation today.",
    kpi: "Cut carrier disputes",
  },
  {
    title: "Route Cost Anomaly Detection",
    desc: "Flag cost-per-shipment outliers, dwell time spikes and misrouted consignments across your network automatically.",
    kpi: "Recover freight overcharges",
  },
  {
    title: "Last-Mile Risk Scoring",
    desc: "Detect high-failure delivery zones, address quality issues and time-slot conflicts before dispatch — not after failed attempts.",
    kpi: "Improve first-attempt delivery",
  },
  {
    title: "AWB & Tracking Data Analysis",
    desc: "Parse raw tracking exports, AWB data and dispatch sheets. No template required — AI reads any CSV or Excel format.",
    kpi: "Zero manual formatting",
  },
  {
    title: "Freight Cost Impact Estimate",
    desc: "Every analysis includes a USD cost impact estimate — how much money the detected risks put at risk in your current shipment batch.",
    kpi: "Justify operational spend",
  },
];

const metrics = [
  { value: "< 30s", label: "Analysis time per report" },
  { value: "95%", label: "Delay detection accuracy" },
  { value: "6 engines", label: "Specialized for logistics" },
  { value: "Free", label: "No credit card to start" },
];

const faqJsonLd = {
  "@context": "https://schema.org", "@type": "FAQPage",
  mainEntity: [
    { "@type": "Question", name: "Can AI predict shipment delays before they happen?", acceptedAnswer: { "@type": "Answer", text: "Yes. OpsOracle AI reads your shipment CSV or TMS export and detects delay patterns — carrier-level, corridor-level and seasonal — before the delivery date is missed. It names the specific carrier or route causing the pattern and quantifies the financial risk." } },
    { "@type": "Question", name: "Which Indian logistics carriers does OpsOracle AI support?", acceptedAnswer: { "@type": "Answer", text: "OpsOracle detects patterns for BlueDart, DTDC, Delhivery, Ecom Express, XpressBees, Shadowfax, FedEx India and DHL India. It includes India-specific context like BlueDart Mumbai-Delhi dwell spikes, DTDC B2C surcharge issues and monsoon delay seasonality." } },
    { "@type": "Question", name: "What file formats can I upload for logistics analysis?", acceptedAnswer: { "@type": "Answer", text: "OpsOracle accepts CSV, Excel (.xlsx) and PDF files. Any export from your TMS, ERP or carrier portal works — no specific template or column format is required." } },
    { "@type": "Question", name: "How accurate is AI shipment delay prediction?", acceptedAnswer: { "@type": "Answer", text: "OpsOracle detects delay patterns with high confidence when carrier and route data is present. It assigns delay probability scores 0–100 per shipment and flags corridors where historical delay rates exceed 50%." } },
    { "@type": "Question", name: "How much does logistics AI cost in India?", acceptedAnswer: { "@type": "Answer", text: "OpsOracle has a free tier with 3 analyses per day. Pro plans start at ₹999/month — less than the cost of one delayed shipment penalty for most logistics companies." } },
  ],
};

export default function LogisticsAI() {
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
            Logistics & Freight Intelligence
          </div>
          <h1 className="text-5xl font-bold md:text-6xl leading-tight tracking-tight">
            AI that predicts shipment<br />
            <span className="text-emerald-400">delays before they happen.</span>
          </h1>
          <p className="mx-auto mt-8 max-w-2xl text-lg text-white/60 leading-relaxed">
            Upload your dispatch reports, carrier exports or freight CSV files. OpsOracle AI
            scores every shipment for delay probability, flags SLA breach risk and estimates
            the financial impact — in under 30 seconds.
          </p>
          <div className="mt-10 flex flex-col sm:flex-row justify-center gap-4">
            <Link href="/register" className="btn text-base px-8 py-4">Analyze Your Freight Data Free</Link>
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
            <p className="text-sm uppercase tracking-widest text-emerald-400/70 mb-3">Logistics AI Capabilities</p>
            <h2 className="text-3xl md:text-4xl font-bold">Built for freight and supply chain teams</h2>
            <p className="mt-4 text-white/50 max-w-xl mx-auto">
              Not a generic AI. Every engine is calibrated on logistics-specific signals — SLA windows, carrier patterns, route economics.
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

      <PainSolver pains={LOGISTICS_PAINS} industry="Logistics" />

      <section aria-label="How it works" className="px-6 py-20 border-t border-white/8">
        <div className="mx-auto max-w-5xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold">How logistics teams use OpsOracle AI</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              { step: "01", title: "Upload dispatch export", desc: "Drag your carrier CSV, AWB export or TMS extract. OpsOracle reads any column layout." },
              { step: "02", title: "AI scores every shipment", desc: "Each row gets a delay probability score, SLA risk flag and cost estimate. Outliers highlighted automatically." },
              { step: "03", title: "Act before the breach", desc: "Executive summary + 3 specific actions delivered in under 30 seconds. Share to ops team immediately." },
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

      <section aria-label="Get started" className="px-6 py-24 border-t border-white/8">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="text-4xl font-bold mb-6">Stop discovering delays after the customer complains.</h2>
          <p className="text-white/55 text-lg mb-10">
            Upload your freight report now — OpsOracle AI returns risk scores, SLA breach predictions and cost impact in seconds.
          </p>
          <Link href="/register" className="btn text-base px-10 py-4 inline-block">
            Start Analyzing Free
          </Link>
        </div>
      </section>

      </main>
      <footer aria-label="Site footer" className="border-t border-white/8 px-6 py-10">
        <div className="mx-auto max-w-6xl flex flex-col sm:flex-row items-center justify-between gap-4">
          <Link href="/" className="text-sm font-semibold">
            <span className="text-emerald-400">Ops</span>Oracle AI
          </Link>
          <p className="text-sm text-white/30">© {new Date().getFullYear()} OpsOracle AI. All rights reserved.</p>
          <div className="flex gap-6 text-sm text-white/40">
            <Link href="/manufacturing-ai" className="hover:text-white transition-colors">Manufacturing AI</Link>
            <Link href="/warehouse-ai" className="hover:text-white transition-colors">Warehouse AI</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
