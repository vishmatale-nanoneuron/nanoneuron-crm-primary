import type { Metadata } from "next";
import Link from "next/link";
import Nav from "@/components/Nav";
import LeadTimeCalc from "./LeadTimeCalc";

export const metadata: Metadata = {
  title: "Lead Time Calculator — Supply Chain Lead Time Formula",
  description:
    "Calculate supply chain lead time from order date to receipt, or by adding procurement, production, and shipping components. Free tool with industry benchmarks.",
  alternates: { canonical: "https://nanoneuron.ai/tools/lead-time-calculator" },
  openGraph: {
    title: "Lead Time Calculator — Supply Chain Lead Time Formula",
    description:
      "Calculate supply chain lead time from order date to receipt or by summing procurement, production, and shipping components.",
    url: "https://nanoneuron.ai/tools/lead-time-calculator",
  },
  twitter: {
    card: "summary_large_image",
    title: "Lead Time Calculator — Free Supply Chain Tool",
    description:
      "Calculate supply chain lead time using order-to-receipt dates or component breakdown.",
  },
};

const faqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    {
      "@type": "Question",
      name: "What is lead time in supply chain management?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Lead time in supply chain is the total time elapsed from placing a purchase or production order to receiving the finished goods. It encompasses: (1) Procurement lead time — supplier processing and manufacturing time; (2) Shipping lead time — freight transit time; (3) Receiving and inspection time at the destination. Total supply chain lead time can range from a few days for local suppliers to 60–90 days for ocean freight from distant manufacturers. Accurate lead time data is critical for calculating safety stock and reorder points correctly.",
      },
    },
    {
      "@type": "Question",
      name: "How can companies reduce supply chain lead time?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "To reduce supply chain lead time: (1) Nearshore or dual-source suppliers — moving from China to India or Southeast Asia for certain categories can reduce lead times from 60+ days to 20–30 days; (2) Use air freight for high-value or urgent replenishment rather than ocean — adds cost but reduces time from 30 days to 3–5 days; (3) Share demand forecasts with suppliers earlier to give them production lead time; (4) Negotiate consignment stock or VMI arrangements so replenishment starts before you place a formal order; (5) Improve demand forecast accuracy to reduce panic orders and emergency shipments; (6) Streamline receiving — automate ASN (advance shipping notices) and pre-inspection where possible.",
      },
    },
    {
      "@type": "Question",
      name: "What is the difference between lead time and cycle time?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Lead time and cycle time are often confused. Lead time is the customer-facing or procurement-facing metric — the elapsed time from order placement to receipt. It includes waiting, queuing, and transit time. Cycle time is the production metric — the time to complete one unit of production, excluding wait time. In manufacturing, cycle time measures how fast the process runs; lead time includes the full order-to-delivery journey. For supply chain planning, lead time is the relevant input. For manufacturing efficiency and capacity planning, cycle time is the relevant metric.",
      },
    },
  ],
};

const breadcrumbJsonLd = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: [
    { "@type": "ListItem", position: 1, name: "Home", item: "https://nanoneuron.ai" },
    { "@type": "ListItem", position: 2, name: "Tools", item: "https://nanoneuron.ai/tools" },
    {
      "@type": "ListItem",
      position: 3,
      name: "Lead Time Calculator",
      item: "https://nanoneuron.ai/tools/lead-time-calculator",
    },
  ],
};

export default function LeadTimeCalculatorPage() {
  return (
    <div className="min-h-screen bg-zinc-950 text-white">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />

      <Nav />

      <main id="main-content" className="pt-28 pb-24 px-6">
        <div className="mx-auto max-w-3xl">
          <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-xs text-white/30 mb-8">
            <Link href="/" className="hover:text-white transition-colors">Home</Link>
            <span>/</span>
            <Link href="/tools" className="hover:text-white transition-colors">Tools</Link>
            <span>/</span>
            <span className="text-white/60">Lead Time Calculator</span>
          </nav>

          <div className="text-center mb-12">
            <p className="text-xs uppercase tracking-widest text-emerald-400/70 mb-3">Free Tool</p>
            <h1 className="text-4xl md:text-5xl font-bold mb-4">Lead Time Calculator</h1>
            <p className="text-white/55 text-lg max-w-2xl mx-auto">
              Calculate supply chain lead time by entering order and receipt dates, or by summing
              procurement, production, and shipping components. Get benchmarks for your industry.
            </p>
          </div>

          <LeadTimeCalc />

          <section className="mt-20 space-y-8">
            <h2 className="text-2xl font-bold mb-6">Lead Time — Formula &amp; Industry Benchmarks</h2>

            <div className="border border-white/10 bg-white/3 rounded-2xl p-6">
              <h3 className="font-semibold text-base mb-3">Lead time components</h3>
              <div className="space-y-2 text-sm">
                {[
                  { component: "Order processing time", desc: "Supplier receives and confirms PO" },
                  { component: "Manufacturing / procurement", desc: "Production or picking at supplier" },
                  { component: "Shipping transit time", desc: "Ocean, air, rail, or road freight" },
                  { component: "Customs & clearance", desc: "Import duties, inspection, documentation" },
                  { component: "Inbound receiving", desc: "GRN, QC inspection, put-away" },
                ].map((row) => (
                  <div key={row.component} className="flex items-center gap-3">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 shrink-0" />
                    <span className="text-white/70 w-52 shrink-0">{row.component}</span>
                    <span className="text-white/40">{row.desc}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="border border-white/10 bg-white/3 rounded-2xl p-6">
              <h3 className="font-semibold text-base mb-3">Industry lead time benchmarks</h3>
              <div className="space-y-2 text-sm">
                {[
                  { source: "Local domestic supplier", leadTime: "3–10 days" },
                  { source: "India / South Asia manufacturing", leadTime: "15–30 days" },
                  { source: "China ocean freight", leadTime: "35–65 days" },
                  { source: "Air freight (any origin)", leadTime: "3–7 days" },
                  { source: "European manufacturing", leadTime: "20–45 days" },
                ].map((row) => (
                  <div key={row.source} className="flex items-center justify-between">
                    <span className="text-white/70">{row.source}</span>
                    <span className="text-emerald-400 font-mono text-xs">{row.leadTime}</span>
                  </div>
                ))}
              </div>
            </div>

            <h2 className="text-2xl font-bold mt-12 mb-4">Frequently asked questions</h2>
            <div className="space-y-4">
              {faqJsonLd.mainEntity.map((q) => (
                <details key={q.name} className="border border-white/10 bg-white/3 rounded-2xl p-6 cursor-pointer">
                  <summary className="font-semibold text-sm text-white/90 list-none flex items-center justify-between">
                    {q.name}
                    <span className="text-white/30 ml-3 shrink-0">+</span>
                  </summary>
                  <p className="text-white/55 text-sm leading-relaxed mt-3">{q.acceptedAnswer.text}</p>
                </details>
              ))}
            </div>

            <div className="border border-emerald-500/20 bg-emerald-500/5 rounded-2xl p-6 mt-10 text-center">
              <p className="text-white/70 text-sm mb-3">
                OpsOracle AI tracks actual vs planned lead times across all your suppliers and
                flags which ones are increasing your safety stock requirements.
              </p>
              <Link
                href="/register"
                className="inline-block bg-emerald-500 hover:bg-emerald-400 text-black font-semibold text-sm px-6 py-3 rounded-xl transition-colors"
              >
                Try OpsOracle AI Free
              </Link>
            </div>
          </section>
        </div>
      </main>

      <footer className="border-t border-white/8 px-6 py-8">
        <div className="mx-auto max-w-6xl flex flex-col sm:flex-row items-center justify-between gap-4">
          <Link href="/" className="text-sm font-semibold">
            <span className="text-emerald-400">Ops</span>Oracle AI
          </Link>
          <div className="flex gap-5 text-sm text-white/40">
            <Link href="/tools" className="hover:text-white transition-colors">All Calculators</Link>
            <Link href="/tools/reorder-point-calculator" className="hover:text-white transition-colors">Reorder Point</Link>
            <Link href="/tools/safety-stock-calculator" className="hover:text-white transition-colors">Safety Stock</Link>
            <Link href="/pricing" className="hover:text-white transition-colors">Pricing</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
