import type { Metadata } from "next";
import Link from "next/link";
import Nav from "@/components/Nav";
import SafetyStockCalc from "./SafetyStockCalc";

export const metadata: Metadata = {
  title: "Safety Stock Calculator — Free Formula with Safety Stock Formula",
  description:
    "Calculate safety stock instantly using demand variability and lead time. Free calculator with Z-score service level selection. Used by supply chain and inventory managers.",
  alternates: { canonical: "https://nanoneuron.ai/tools/safety-stock-calculator" },
  openGraph: {
    title: "Safety Stock Calculator — Free Formula with Safety Stock Formula",
    description:
      "Calculate safety stock instantly using demand variability and lead time. Free calculator with Z-score service level selection.",
    url: "https://nanoneuron.ai/tools/safety-stock-calculator",
  },
  twitter: {
    card: "summary_large_image",
    title: "Safety Stock Calculator — Free Supply Chain Tool",
    description:
      "Calculate safety stock using demand variability and lead time. Free Z-score service level calculator.",
  },
};

const faqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    {
      "@type": "Question",
      name: "What is the safety stock formula?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "The standard safety stock formula is: Safety Stock = Z × √(Lead Time) × σ(Demand), where Z is the service level Z-score, Lead Time is the average replenishment lead time in days, and σ(Demand) is the standard deviation of daily demand. A more precise version also accounts for lead time variability: Safety Stock = Z × √(Avg Lead Time × σ²Demand + Avg Demand² × σ²Lead Time). Most practitioners use the simpler formula when lead time variability is low.",
      },
    },
    {
      "@type": "Question",
      name: "What Z-score should I use for safety stock?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "The Z-score depends on your target service level. For 90% service level (1 in 10 stockouts), use Z = 1.28. For 95% service level, use Z = 1.65. For 98% service level, use Z = 2.05. For 99% service level, use Z = 2.33. Most supply chain managers targeting world-class performance use 95–98% service level. Higher service levels require more safety stock and tie up more working capital, so balance service requirements against inventory carrying costs.",
      },
    },
    {
      "@type": "Question",
      name: "How can I reduce safety stock without risking stockouts?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "To reduce safety stock without increasing stockout risk, focus on reducing the variability inputs rather than simply cutting the buffer. The most effective strategies are: (1) Reduce lead time variability — negotiate consistent lead times with suppliers and use dual-sourcing; (2) Reduce demand variability — improve demand forecasting accuracy with AI and better customer collaboration; (3) Increase replenishment frequency — more frequent, smaller orders reduce the exposure window; (4) Use VMI (vendor-managed inventory) for your highest-velocity SKUs; (5) Implement S&OP to align demand signals earlier. Cutting safety stock without addressing root variability causes stockouts and lost sales.",
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
      name: "Safety Stock Calculator",
      item: "https://nanoneuron.ai/tools/safety-stock-calculator",
    },
  ],
};

export default function SafetyStockCalculatorPage() {
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
            <span className="text-white/60">Safety Stock Calculator</span>
          </nav>

          <div className="text-center mb-12">
            <p className="text-xs uppercase tracking-widest text-emerald-400/70 mb-3">Free Tool</p>
            <h1 className="text-4xl md:text-5xl font-bold mb-4">Safety Stock Calculator</h1>
            <p className="text-white/55 text-lg max-w-2xl mx-auto">
              Calculate your optimal safety stock level using demand variability, lead time, and
              service level Z-score. Prevent stockouts without over-investing in inventory.
            </p>
          </div>

          <SafetyStockCalc />

          <section className="mt-20 space-y-8">
            <h2 className="text-2xl font-bold mb-6">Safety Stock — Formula &amp; Guide</h2>

            <div className="border border-white/10 bg-white/3 rounded-2xl p-6">
              <h3 className="font-semibold text-base mb-3">Safety stock formula</h3>
              <div className="rounded-xl bg-white/4 border border-white/8 p-4 font-mono text-sm text-emerald-400 mb-3">
                Safety Stock = Z × √(Lead Time) × σ(Daily Demand)
              </div>
              <p className="text-white/50 text-sm">
                Where Z is the service-level Z-score, Lead Time is in days, and σ is the standard
                deviation of daily demand. For high variability environments use the extended formula
                that also accounts for lead time standard deviation.
              </p>
            </div>

            <div className="border border-white/10 bg-white/3 rounded-2xl p-6">
              <h3 className="font-semibold text-base mb-3">Service level Z-score reference</h3>
              <div className="space-y-2">
                {[
                  { level: "90%", z: "1.28", note: "Acceptable for non-critical SKUs" },
                  { level: "95%", z: "1.65", note: "Standard for most operations" },
                  { level: "98%", z: "2.05", note: "High-priority / revenue-critical SKUs" },
                  { level: "99%", z: "2.33", note: "Mission-critical or perishable goods" },
                ].map((row) => (
                  <div key={row.level} className="flex items-center gap-4 text-sm">
                    <span className="w-12 shrink-0 font-semibold text-emerald-400">{row.level}</span>
                    <span className="font-mono text-white/60 w-10 shrink-0">Z={row.z}</span>
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
                Want AI-powered safety stock recommendations across all your SKUs automatically?
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
            <Link href="/tools/inventory-turnover-calculator" className="hover:text-white transition-colors">Inventory Turnover</Link>
            <Link href="/pricing" className="hover:text-white transition-colors">Pricing</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
