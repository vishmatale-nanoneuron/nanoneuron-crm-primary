import type { Metadata } from "next";
import Link from "next/link";
import OEECalculator from "./OEECalculator";

export const metadata: Metadata = {
  title: "OEE Calculator — Free Overall Equipment Effectiveness Calculator",
  description:
    "Calculate your OEE score instantly. Enter Availability %, Performance %, and Quality % — get your OEE percentage with DORA-style tier benchmarking (World Class ≥ 85%). Free tool for manufacturing and plant teams.",
  alternates: { canonical: "https://nanoneuron.ai/manufacturing-ai/oee-calculator" },
  openGraph: {
    title: "OEE Calculator — Free Overall Equipment Effectiveness Calculator",
    description:
      "Calculate your OEE score in seconds. Availability × Performance × Quality — with World Class benchmarking. Free tool for plant managers and ops engineers.",
    url: "https://nanoneuron.ai/manufacturing-ai/oee-calculator",
  },
  twitter: {
    card: "summary_large_image",
    title: "OEE Calculator — Free Manufacturing Efficiency Tool",
    description: "Calculate your Overall Equipment Effectiveness score instantly. World Class target: ≥ 85%.",
  },
};

const faqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    {
      "@type": "Question",
      name: "What is OEE and how is it calculated?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "OEE (Overall Equipment Effectiveness) measures manufacturing productivity as a percentage. It is calculated by multiplying three components: Availability (actual run time ÷ planned production time), Performance (actual output rate ÷ theoretical maximum output rate), and Quality (good units ÷ total units started). OEE = Availability × Performance × Quality. A world-class OEE score is 85% or higher.",
      },
    },
    {
      "@type": "Question",
      name: "What is a good OEE score?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "World-class OEE is 85% or above. An OEE of 65-84% is considered good and above average for most manufacturers. 45-64% is typical — the industry average for manufacturers not actively managing OEE. Below 45% indicates significant improvement is needed across one or more OEE components.",
      },
    },
    {
      "@type": "Question",
      name: "What is the difference between Availability, Performance, and Quality in OEE?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Availability measures the percentage of planned production time the machine was actually running (accounts for breakdowns, setup delays, and material waits). Performance measures how fast the machine ran versus its theoretical maximum speed. Quality measures the percentage of total output that met quality standards without rework. All three must be high for world-class OEE.",
      },
    },
    {
      "@type": "Question",
      name: "How can I improve my OEE score?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Start by identifying which of the three OEE components — Availability, Performance, or Quality — is lowest, then focus improvement efforts there. If Availability is low, investigate breakdown frequency and setup times. If Performance is low, look for speed losses and micro-stoppages. If Quality is low, investigate defect root causes. AI tools like OpsOracle can automatically identify which machine or shift is causing the largest OEE drop from your production data.",
      },
    },
    {
      "@type": "Question",
      name: "What causes low OEE in manufacturing?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Low OEE is caused by the Six Big Losses: equipment breakdowns, setup and adjustment time, idling and minor stoppages, reduced speed, process defects, and reduced yield during startups. OEE analysis helps identify which of these losses is the primary driver so maintenance and production teams can focus on the highest-impact fix.",
      },
    },
  ],
};

const breadcrumbJsonLd = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: [
    { "@type": "ListItem", position: 1, name: "Home", item: "https://nanoneuron.ai" },
    { "@type": "ListItem", position: 2, name: "Manufacturing AI", item: "https://nanoneuron.ai/manufacturing-ai" },
    { "@type": "ListItem", position: 3, name: "OEE Calculator", item: "https://nanoneuron.ai/manufacturing-ai/oee-calculator" },
  ],
};

export default function OEECalculatorPage() {
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
              <Link href="/manufacturing-ai" className="text-sm text-white/60 hover:text-white transition-colors">Manufacturing AI</Link>
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
            <Link href="/manufacturing-ai" className="hover:text-white transition-colors">Manufacturing AI</Link>
            <span>/</span>
            <span className="text-white/60">OEE Calculator</span>
          </nav>

          <div className="text-center mb-12">
            <p className="text-xs uppercase tracking-widest text-emerald-400/70 mb-3">Free Tool</p>
            <h1 className="text-4xl md:text-5xl font-bold mb-4">OEE Calculator</h1>
            <p className="text-white/55 text-lg max-w-2xl mx-auto">
              Calculate your Overall Equipment Effectiveness score instantly. Enter your three OEE components and see where your plant stands vs world-class benchmarks.
            </p>
          </div>

          <OEECalculator />

          <section className="mt-20 prose-sm prose-invert max-w-none">
            <h2 className="text-2xl font-bold mb-6">What is OEE? The complete guide for plant managers</h2>

            <div className="grid md:grid-cols-3 gap-5 mb-10">
              {[
                { name: "Availability", formula: "Run Time ÷ Planned Time × 100", desc: "Measures losses from equipment breakdowns, setup delays, and material waits. Target: ≥ 90%." },
                { name: "Performance", formula: "Actual Rate ÷ Ideal Rate × 100", desc: "Measures speed losses — micro-stoppages, reduced speed, and operator or material inefficiencies. Target: ≥ 95%." },
                { name: "Quality", formula: "Good Units ÷ Total Units × 100", desc: "Measures quality losses — defects, scrap, and rework. Includes startup yield losses. Target: ≥ 99%." },
              ].map((c) => (
                <div key={c.name} className="card">
                  <p className="text-xs text-emerald-400/70 font-mono uppercase tracking-wider mb-1">{c.name}</p>
                  <p className="font-mono text-sm text-white/70 mb-2">{c.formula}</p>
                  <p className="text-white/50 text-sm">{c.desc}</p>
                </div>
              ))}
            </div>

            <div className="card mb-6">
              <h3 className="font-semibold text-base mb-2">OEE benchmarks at a glance</h3>
              <div className="space-y-2">
                {[
                  { label: "World Class", score: "≥ 85%", color: "emerald", desc: "Achieved by top 5% of manufacturers globally" },
                  { label: "Good", score: "65–84%", color: "blue", desc: "Above average — targeted improvement reaches world class" },
                  { label: "Typical", score: "45–64%", color: "yellow", desc: "Industry average without active OEE management" },
                  { label: "Poor", score: "< 45%", color: "red", desc: "Significant losses in one or more OEE components" },
                ].map((b) => (
                  <div key={b.label} className="flex items-center gap-4 text-sm">
                    <span className={`w-24 shrink-0 font-semibold ${b.color === "emerald" ? "text-emerald-400" : b.color === "blue" ? "text-blue-400" : b.color === "yellow" ? "text-amber-400" : "text-red-400"}`}>{b.label}</span>
                    <span className="font-mono text-white/60 w-16 shrink-0">{b.score}</span>
                    <span className="text-white/40">{b.desc}</span>
                  </div>
                ))}
              </div>
            </div>

            <h2 className="text-2xl font-bold mb-4 mt-12">Frequently asked questions about OEE</h2>
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
            <Link href="/manufacturing-ai" className="hover:text-white transition-colors">Manufacturing AI</Link>
            <Link href="/logistics-ai/otif-calculator" className="hover:text-white transition-colors">OTIF Calculator</Link>
            <Link href="/devops-ai/dora-metrics-calculator" className="hover:text-white transition-colors">DORA Calculator</Link>
            <Link href="/pricing" className="hover:text-white transition-colors">Pricing</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
