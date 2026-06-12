import type { Metadata } from "next";
import Link from "next/link";
import Nav from "@/components/Nav";
import ReorderPointCalc from "./ReorderPointCalc";

export const metadata: Metadata = {
  title: "Reorder Point Calculator — Free ROP Formula Tool",
  description:
    "Calculate reorder point (ROP) using average demand, lead time, and safety stock. Free tool for inventory and supply chain managers. Prevent stockouts automatically.",
  alternates: { canonical: "https://nanoneuron.ai/tools/reorder-point-calculator" },
  openGraph: {
    title: "Reorder Point Calculator — Free ROP Formula Tool",
    description:
      "Calculate reorder point (ROP) using average demand, lead time, and safety stock. Prevent stockouts automatically.",
    url: "https://nanoneuron.ai/tools/reorder-point-calculator",
  },
  twitter: {
    card: "summary_large_image",
    title: "Reorder Point Calculator — Free Inventory Tool",
    description:
      "Calculate when to reorder inventory using average demand, lead time, and safety stock.",
  },
};

const faqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    {
      "@type": "Question",
      name: "What is the reorder point formula?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Reorder Point (ROP) = (Average Daily Demand × Lead Time in Days) + Safety Stock. The first part (Average Daily Demand × Lead Time) is the demand during lead time — the inventory you expect to consume while waiting for a new order to arrive. Safety stock is added as a buffer against demand spikes or supplier delays. When your inventory level hits the reorder point, place a new purchase order immediately.",
      },
    },
    {
      "@type": "Question",
      name: "What is the difference between reorder point and safety stock?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Safety stock is a buffer inventory held to absorb demand variability and supply uncertainty — it is the cushion that prevents stockouts when demand is higher than expected or the supplier delivers late. Reorder point (ROP) is the inventory trigger level at which you place a new order. ROP includes safety stock but also covers the expected demand during the replenishment lead time. Safety stock is a component of ROP, not the same thing. You can have zero safety stock and still have a reorder point (it just means no buffer for variability).",
      },
    },
    {
      "@type": "Question",
      name: "How often should I recalculate my reorder point?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Reorder points should be reviewed whenever your demand pattern or lead times change significantly. Best practice is to recalculate ROPs monthly for fast-moving SKUs and quarterly for slow-movers. Seasonality is a critical factor — ROPs for seasonal products should be adjusted 4–6 weeks before demand peaks. AI-powered inventory systems like OpsOracle automatically recalculate ROPs in real-time as demand signals and supplier lead times change, eliminating the need for manual review cycles.",
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
      name: "Reorder Point Calculator",
      item: "https://nanoneuron.ai/tools/reorder-point-calculator",
    },
  ],
};

export default function ReorderPointCalculatorPage() {
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
            <span className="text-white/60">Reorder Point Calculator</span>
          </nav>

          <div className="text-center mb-12">
            <p className="text-xs uppercase tracking-widest text-emerald-400/70 mb-3">Free Tool</p>
            <h1 className="text-4xl md:text-5xl font-bold mb-4">Reorder Point Calculator</h1>
            <p className="text-white/55 text-lg max-w-2xl mx-auto">
              Calculate the exact inventory level at which to place a new order. Combines average
              demand, supplier lead time, and safety stock into a single trigger point.
            </p>
          </div>

          <ReorderPointCalc />

          <section className="mt-20 space-y-8">
            <h2 className="text-2xl font-bold mb-6">Reorder Point — Formula &amp; Guide</h2>

            <div className="border border-white/10 bg-white/3 rounded-2xl p-6">
              <h3 className="font-semibold text-base mb-3">ROP formula</h3>
              <div className="rounded-xl bg-white/4 border border-white/8 p-4 font-mono text-sm text-emerald-400 mb-3">
                ROP = (Avg Daily Demand × Lead Time Days) + Safety Stock
              </div>
              <p className="text-white/50 text-sm">
                When your on-hand inventory falls to the ROP level, trigger a purchase order
                immediately. The lead time demand portion ensures you do not run out while waiting
                for the replenishment to arrive. Safety stock provides a buffer against variability.
              </p>
            </div>

            <div className="border border-white/10 bg-white/3 rounded-2xl p-6">
              <h3 className="font-semibold text-base mb-3">Example calculation</h3>
              <div className="space-y-1 text-sm text-white/60">
                <p>Average daily demand: <span className="text-white">50 units/day</span></p>
                <p>Supplier lead time: <span className="text-white">7 days</span></p>
                <p>Safety stock: <span className="text-white">75 units</span></p>
                <p className="pt-2 border-t border-white/10 text-emerald-400 font-mono">
                  ROP = (50 × 7) + 75 = 425 units
                </p>
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
                OpsOracle AI automatically calculates and updates reorder points for every SKU
                based on live demand data and supplier lead time changes.
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
            <Link href="/tools/inventory-turnover-calculator" className="hover:text-white transition-colors">Inventory Turnover</Link>
            <Link href="/pricing" className="hover:text-white transition-colors">Pricing</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
