import type { Metadata } from "next";
import Link from "next/link";
import Nav from "@/components/Nav";
import WarehouseUtilCalc from "./WarehouseUtilCalc";

export const metadata: Metadata = {
  title: "Warehouse Utilisation Calculator — Space & Capacity Rate",
  description:
    "Calculate warehouse utilisation rate instantly. Optimal range: 85–92%. Free tool for warehouse managers, 3PLs, and e-commerce fulfilment teams.",
  alternates: { canonical: "https://nanoneuron.ai/tools/warehouse-utilization-calculator" },
  openGraph: {
    title: "Warehouse Utilisation Calculator — Space & Capacity Rate",
    description:
      "Calculate warehouse utilisation rate instantly. Optimal range: 85–92%. Free tool for warehouse managers and 3PLs.",
    url: "https://nanoneuron.ai/tools/warehouse-utilization-calculator",
  },
  twitter: {
    card: "summary_large_image",
    title: "Warehouse Utilisation Calculator — Free Tool",
    description:
      "Calculate your warehouse utilisation rate. Optimal range: 85–92% of usable capacity.",
  },
};

const faqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    {
      "@type": "Question",
      name: "What is the ideal warehouse utilisation rate?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "The optimal warehouse utilisation rate is between 85% and 92% of usable storage capacity. Below 85% suggests underused space and potentially high cost-per-pallet-position. Above 92% creates operational problems: pickers cannot move efficiently, replenishment becomes blocked, and put-away slows significantly because there are no obvious empty locations. Running at 95%+ consistently is a warning sign that you need either more space or better inventory management to reduce stock levels.",
      },
    },
    {
      "@type": "Question",
      name: "How can I improve warehouse space utilisation?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "To improve warehouse space utilisation: (1) Conduct a slotting review — relocate fast-moving SKUs to the most accessible positions and move slow-movers to higher levels; (2) Review racking configuration — adding mezzanine levels or converting to narrower aisle racking can increase capacity by 30–50%; (3) Reduce excess inventory — identify slow-moving and dead stock and liquidate or return to supplier; (4) Implement warehouse management system (WMS) directed put-away to fill locations systematically; (5) Review pallet heights and weight limits — many warehouses underutilise vertical space because of inconsistent stacking practices; (6) Consider goods-to-person automation for picking to reclaim floor space currently used for pick aisles.",
      },
    },
    {
      "@type": "Question",
      name: "What happens when warehouse utilisation exceeds 95%?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "When warehouse utilisation exceeds 95%, operational performance degrades rapidly. Pickers spend significantly more time searching for available locations. Put-away productivity drops as forklift operators cannot find open slots and must wait or double-handle pallets. Stocktake accuracy deteriorates because items are stored in non-standard locations. Safety incidents increase due to congestion in aisles and staging areas. Inbound receiving slows because floor staging areas become blocked. Many operations see a 20–30% drop in labour productivity when consistently running above 95% utilisation.",
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
      name: "Warehouse Utilisation Calculator",
      item: "https://nanoneuron.ai/tools/warehouse-utilization-calculator",
    },
  ],
};

export default function WarehouseUtilisationCalculatorPage() {
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
            <span className="text-white/60">Warehouse Utilisation Calculator</span>
          </nav>

          <div className="text-center mb-12">
            <p className="text-xs uppercase tracking-widest text-emerald-400/70 mb-3">Free Tool</p>
            <h1 className="text-4xl md:text-5xl font-bold mb-4">Warehouse Utilisation Calculator</h1>
            <p className="text-white/55 text-lg max-w-2xl mx-auto">
              Calculate your warehouse space utilisation rate and see whether you are under- or
              over-using capacity. Optimal range is 85–92% of usable storage space.
            </p>
          </div>

          <WarehouseUtilCalc />

          <section className="mt-20 space-y-8">
            <h2 className="text-2xl font-bold mb-6">Warehouse Utilisation — Guide &amp; Benchmarks</h2>

            <div className="border border-white/10 bg-white/3 rounded-2xl p-6">
              <h3 className="font-semibold text-base mb-3">Utilisation formula</h3>
              <div className="rounded-xl bg-white/4 border border-white/8 p-4 font-mono text-sm text-emerald-400 mb-3">
                Utilisation % = (Used Locations ÷ Total Usable Locations) × 100
              </div>
              <p className="text-white/50 text-sm">
                Note: &ldquo;usable&rdquo; locations exclude pick aisles, staging areas, dock bays,
                and other non-storage space. Using gross floor area inflates your apparent
                utilisation rate.
              </p>
            </div>

            <div className="border border-white/10 bg-white/3 rounded-2xl p-6">
              <h3 className="font-semibold text-base mb-3">Utilisation benchmarks</h3>
              <div className="space-y-2">
                {[
                  { range: "< 75%", status: "Underutilised", note: "Excess capacity — review lease costs or sublease options", color: "blue" },
                  { range: "75–84%", status: "Under target", note: "Room to grow but cost-per-location is high", color: "amber" },
                  { range: "85–92%", status: "Optimal", note: "World-class — efficient space with operational flexibility", color: "emerald" },
                  { range: "93–95%", status: "High", note: "Approaching congestion — monitor picker productivity", color: "amber" },
                  { range: "> 95%", status: "Overcrowded", note: "Productivity and safety risk — expansion or destock needed", color: "red" },
                ].map((row) => (
                  <div key={row.range} className="flex items-start gap-3 text-sm">
                    <span className="font-mono text-white/50 w-16 shrink-0">{row.range}</span>
                    <span
                      className={`font-semibold w-24 shrink-0 ${
                        row.color === "emerald"
                          ? "text-emerald-400"
                          : row.color === "blue"
                          ? "text-blue-400"
                          : row.color === "amber"
                          ? "text-amber-400"
                          : "text-red-400"
                      }`}
                    >
                      {row.status}
                    </span>
                    <span className="text-white/40">{row.note}</span>
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
                OpsOracle AI analyses your warehouse utilisation alongside inventory data to
                identify which SKUs are consuming the most space relative to their value.
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
            <Link href="/tools/supply-chain-cost-calculator" className="hover:text-white transition-colors">SC Cost</Link>
            <Link href="/tools/lead-time-calculator" className="hover:text-white transition-colors">Lead Time</Link>
            <Link href="/pricing" className="hover:text-white transition-colors">Pricing</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
