import type { Metadata } from "next";
import Link from "next/link";
import OTIFCalculator from "./OTIFCalculator";

export const metadata: Metadata = {
  title: "OTIF Calculator — Free On-Time In-Full Rate Calculator",
  description:
    "Calculate your OTIF rate instantly. Enter total shipments and on-time in-full deliveries — get your OTIF percentage with benchmarking (World Class ≥ 95%). Free tool for logistics and supply chain teams.",
  alternates: { canonical: "https://nanoneuron.ai/logistics-ai/otif-calculator" },
  openGraph: {
    title: "OTIF Calculator — Free On-Time In-Full Rate Calculator",
    description: "Calculate your On-Time In-Full delivery rate in seconds. World Class OTIF: ≥ 95%. Free tool for logistics, 3PL, and supply chain teams.",
    url: "https://nanoneuron.ai/logistics-ai/otif-calculator",
  },
  twitter: {
    card: "summary_large_image",
    title: "OTIF Calculator — Free Logistics Performance Tool",
    description: "Calculate your On-Time In-Full delivery rate. World Class target: ≥ 95%.",
  },
};

const faqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    {
      "@type": "Question",
      name: "What is OTIF and how is it calculated?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "OTIF stands for On-Time In-Full. It measures the percentage of customer orders delivered both on time (by the agreed delivery date) and in full (with no short-shipment, damage, or substitution). OTIF is calculated as: (Orders delivered on time AND in full ÷ Total orders) × 100. A world-class OTIF rate is 95% or higher.",
      },
    },
    {
      "@type": "Question",
      name: "What is a good OTIF score?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "World-class OTIF is 95% or above — meaning 95 out of every 100 shipments arrive on time and in full. An OTIF of 85-94% is above average. 70-84% represents an industry average with noticeable customer impact. Below 70% indicates high customer escalation risk and requires immediate carrier or process investigation.",
      },
    },
    {
      "@type": "Question",
      name: "What is the difference between on-time delivery and OTIF?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "On-time delivery only measures whether a shipment arrived by the agreed date. OTIF is stricter — it requires the shipment to be both on time AND complete (in full). A shipment that arrives on time but with 3 items missing counts as an OTIF failure. OTIF is a more accurate measure of customer satisfaction because it captures both timing and completeness.",
      },
    },
    {
      "@type": "Question",
      name: "How can I improve my OTIF rate?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "To improve OTIF, start by diagnosing whether failures are coming from late deliveries (carrier issue, routing problem, or depot dwell) or short-shipments (picking errors, stockout, or quality rejects). Analyse your OTIF failures by carrier, corridor, and product to find the patterns. AI tools like OpsOracle automatically identify which specific carriers, routes, or SKUs are responsible for the most OTIF failures when you upload your shipment data.",
      },
    },
    {
      "@type": "Question",
      name: "What is OTIF compliance for large retailers?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Large retailers and e-commerce platforms typically require suppliers to maintain OTIF rates of 95-98%. Failure to meet OTIF SLAs often results in financial chargebacks, which can be 1-3% of the invoice value per failed shipment. Walmart, Amazon, and most major retailers track OTIF rigorously and impose penalties for sustained underperformance.",
      },
    },
  ],
};

const breadcrumbJsonLd = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: [
    { "@type": "ListItem", position: 1, name: "Home", item: "https://nanoneuron.ai" },
    { "@type": "ListItem", position: 2, name: "Logistics AI", item: "https://nanoneuron.ai/logistics-ai" },
    { "@type": "ListItem", position: 3, name: "OTIF Calculator", item: "https://nanoneuron.ai/logistics-ai/otif-calculator" },
  ],
};

export default function OTIFCalculatorPage() {
  return (
    <div className="min-h-screen bg-zinc-950 text-white">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }} />

      <header>
        <nav aria-label="Main navigation" className="fixed top-0 left-0 right-0 z-50 border-b border-white/8 bg-zinc-950/80 backdrop-blur-md">
          <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
            <Link href="/" className="text-lg font-bold tracking-tight">
              <span className="text-emerald-400">Ops</span>Oracle AI
            </Link>
            <div className="flex items-center gap-4">
              <Link href="/logistics-ai" className="text-sm text-white/60 hover:text-white transition-colors">Logistics AI</Link>
              <Link href="/register" className="btn text-sm py-2 px-5">Try Free</Link>
            </div>
          </div>
        </nav>
      </header>

      <main id="main-content" className="pt-28 pb-24 px-6">
        <div className="mx-auto max-w-3xl">
          <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-xs text-white/30 mb-8">
            <Link href="/" className="hover:text-white transition-colors">Home</Link>
            <span>/</span>
            <Link href="/logistics-ai" className="hover:text-white transition-colors">Logistics AI</Link>
            <span>/</span>
            <span className="text-white/60">OTIF Calculator</span>
          </nav>

          <div className="text-center mb-12">
            <p className="text-xs uppercase tracking-widest text-emerald-400/70 mb-3">Free Tool</p>
            <h1 className="text-4xl md:text-5xl font-bold mb-4">OTIF Calculator</h1>
            <p className="text-white/55 text-lg max-w-2xl mx-auto">
              Calculate your On-Time In-Full delivery rate instantly. Enter your shipment counts and see how your logistics performance stacks up against world-class benchmarks.
            </p>
          </div>

          <OTIFCalculator />

          <section className="mt-20 prose-sm prose-invert max-w-none">
            <h2 className="text-2xl font-bold mb-6">What is OTIF? The complete guide for logistics teams</h2>

            <div className="card mb-8">
              <h3 className="font-semibold text-base mb-3">OTIF formula</h3>
              <div className="rounded-xl bg-white/4 border border-white/8 p-4 font-mono text-sm text-emerald-400 mb-3">
                OTIF % = (Shipments delivered on time AND in full ÷ Total shipments) × 100
              </div>
              <p className="text-white/50 text-sm">
                A shipment counts as OTIF only if it is both on time (arrived by agreed delivery date) AND in full (no short-shipment, no damage, no substitution). Either failure alone is an OTIF miss.
              </p>
            </div>

            <div className="card mb-6">
              <h3 className="font-semibold text-base mb-2">OTIF benchmarks at a glance</h3>
              <div className="space-y-2">
                {[
                  { label: "World Class", score: "≥ 95%", color: "emerald", desc: "Best-in-class 3PLs and enterprise logistics operations" },
                  { label: "Good", score: "85–94%", color: "blue", desc: "Above average — identify top failure carrier to reach world class" },
                  { label: "Average", score: "70–84%", color: "yellow", desc: "Noticeable customer impact — carrier or route investigation needed" },
                  { label: "Poor", score: "< 70%", color: "red", desc: "High chargeback and customer escalation risk — urgent review needed" },
                ].map((b) => (
                  <div key={b.label} className="flex items-center gap-4 text-sm">
                    <span className={`w-24 shrink-0 font-semibold ${b.color === "emerald" ? "text-emerald-400" : b.color === "blue" ? "text-blue-400" : b.color === "yellow" ? "text-amber-400" : "text-red-400"}`}>{b.label}</span>
                    <span className="font-mono text-white/60 w-16 shrink-0">{b.score}</span>
                    <span className="text-white/40">{b.desc}</span>
                  </div>
                ))}
              </div>
            </div>

            <h2 className="text-2xl font-bold mb-4 mt-12">Frequently asked questions about OTIF</h2>
            <div className="space-y-4">
              {faqJsonLd.mainEntity.map((q) => (
                <details key={q.name} className="card group cursor-pointer">
                  <summary className="font-semibold text-sm text-white/90 list-none flex items-center justify-between">
                    {q.name}
                    <span className="text-white/30 ml-3 shrink-0">+</span>
                  </summary>
                  <p className="text-white/55 text-sm leading-relaxed mt-3">{q.acceptedAnswer.text}</p>
                </details>
              ))}
            </div>
          </section>
        </div>
      </main>

      <footer className="border-t border-white/8 px-6 py-8">
        <div className="mx-auto max-w-6xl flex flex-col sm:flex-row items-center justify-between gap-4">
          <Link href="/" className="text-sm font-semibold"><span className="text-emerald-400">Ops</span>Oracle AI</Link>
          <div className="flex gap-5 text-sm text-white/40">
            <Link href="/logistics-ai" className="hover:text-white transition-colors">Logistics AI</Link>
            <Link href="/manufacturing-ai/oee-calculator" className="hover:text-white transition-colors">OEE Calculator</Link>
            <Link href="/devops-ai/dora-metrics-calculator" className="hover:text-white transition-colors">DORA Calculator</Link>
            <Link href="/pricing" className="hover:text-white transition-colors">Pricing</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
