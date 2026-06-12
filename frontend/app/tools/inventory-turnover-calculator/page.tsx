import type { Metadata } from "next";
import Link from "next/link";
import Nav from "@/components/Nav";
import InventoryTurnoverCalc from "./InventoryTurnoverCalc";

export const metadata: Metadata = {
  title: "Inventory Turnover Calculator — Ratio + Days Sales of Inventory",
  description:
    "Calculate inventory turnover ratio and days sales of inventory (DSI) free. Benchmark against world-class 8x+ turnover. For retail, manufacturing, and e-commerce teams.",
  alternates: { canonical: "https://nanoneuron.ai/tools/inventory-turnover-calculator" },
  openGraph: {
    title: "Inventory Turnover Calculator — Ratio + Days Sales of Inventory",
    description:
      "Calculate inventory turnover ratio and DSI free. Benchmark against world-class 8x+ turnover.",
    url: "https://nanoneuron.ai/tools/inventory-turnover-calculator",
  },
  twitter: {
    card: "summary_large_image",
    title: "Inventory Turnover Calculator — Free Tool",
    description:
      "Calculate your inventory turnover ratio and days sales of inventory. Benchmark against world-class 8x+.",
  },
};

const faqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    {
      "@type": "Question",
      name: "What is a good inventory turnover ratio?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "A good inventory turnover ratio depends heavily on your industry. For fast-moving consumer goods (FMCG) and grocery retail, world-class is 12–20x per year. For general retail, 6–12x is strong. For manufacturing, 4–8x is typically world-class. For automotive parts or industrial distributors, 3–6x can be acceptable. The key benchmark is whether your turnover is improving year-over-year. Below 3x in most industries signals excess inventory, obsolescence risk, and tied-up working capital.",
      },
    },
    {
      "@type": "Question",
      name: "What is the Days Sales of Inventory (DSI) formula?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Days Sales of Inventory (DSI) = (Average Inventory ÷ Cost of Goods Sold) × 365. DSI tells you how many days it takes to sell through your average inventory level. A DSI of 30 means you turn your inventory every 30 days. DSI is the inverse of inventory turnover expressed in days, and is also called Days Inventory Outstanding (DIO). World-class DSI for retail is under 30 days; for manufacturing it is typically under 60 days.",
      },
    },
    {
      "@type": "Question",
      name: "How can I improve my inventory turnover ratio?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "To improve inventory turnover: (1) Identify slow-moving and dead stock SKUs using ABC-XYZ analysis and liquidate or discount them; (2) Improve demand forecasting accuracy to reduce over-buying; (3) Negotiate shorter lead times with suppliers to reduce safety stock requirements; (4) Implement vendor-managed inventory (VMI) for high-velocity items; (5) Review reorder points and quantities — many companies carry 2–3x more safety stock than needed; (6) Run promotions on excess stock before it becomes dead inventory; (7) Use AI-powered demand planning to reduce forecast error by 30–50%.",
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
      name: "Inventory Turnover Calculator",
      item: "https://nanoneuron.ai/tools/inventory-turnover-calculator",
    },
  ],
};

export default function InventoryTurnoverCalculatorPage() {
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
            <span className="text-white/60">Inventory Turnover Calculator</span>
          </nav>

          <div className="text-center mb-12">
            <p className="text-xs uppercase tracking-widest text-emerald-400/70 mb-3">Free Tool</p>
            <h1 className="text-4xl md:text-5xl font-bold mb-4">Inventory Turnover Calculator</h1>
            <p className="text-white/55 text-lg max-w-2xl mx-auto">
              Calculate your inventory turnover ratio and days sales of inventory (DSI). Benchmark
              against world-class performance and identify working capital opportunities.
            </p>
          </div>

          <InventoryTurnoverCalc />

          <section className="mt-20 space-y-8">
            <h2 className="text-2xl font-bold mb-6">Inventory Turnover — Formula &amp; Benchmarks</h2>

            <div className="border border-white/10 bg-white/3 rounded-2xl p-6">
              <h3 className="font-semibold text-base mb-3">Formulas</h3>
              <div className="space-y-3">
                <div className="rounded-xl bg-white/4 border border-white/8 p-4 font-mono text-sm text-emerald-400">
                  Inventory Turnover = COGS ÷ Average Inventory
                </div>
                <div className="rounded-xl bg-white/4 border border-white/8 p-4 font-mono text-sm text-emerald-400">
                  DSI (Days) = (Average Inventory ÷ COGS) × 365
                </div>
              </div>
            </div>

            <div className="border border-white/10 bg-white/3 rounded-2xl p-6">
              <h3 className="font-semibold text-base mb-3">Industry benchmarks</h3>
              <div className="space-y-2">
                {[
                  { industry: "Grocery / FMCG", turnover: "12–20×", dsi: "18–30 days" },
                  { industry: "General Retail", turnover: "6–12×", dsi: "30–60 days" },
                  { industry: "E-commerce", turnover: "8–15×", dsi: "24–45 days" },
                  { industry: "Manufacturing", turnover: "4–8×", dsi: "45–90 days" },
                  { industry: "Industrial / B2B", turnover: "3–6×", dsi: "60–120 days" },
                ].map((row) => (
                  <div key={row.industry} className="flex items-center gap-4 text-sm">
                    <span className="w-44 shrink-0 text-white/70">{row.industry}</span>
                    <span className="font-mono text-emerald-400 w-16 shrink-0">{row.turnover}</span>
                    <span className="text-white/40">{row.dsi}</span>
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
                OpsOracle AI calculates inventory turnover across all your SKUs and identifies
                which products are dragging down your working capital.
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
            <Link href="/tools/safety-stock-calculator" className="hover:text-white transition-colors">Safety Stock</Link>
            <Link href="/tools/reorder-point-calculator" className="hover:text-white transition-colors">Reorder Point</Link>
            <Link href="/pricing" className="hover:text-white transition-colors">Pricing</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
