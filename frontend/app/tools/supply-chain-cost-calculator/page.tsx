import type { Metadata } from "next";
import Link from "next/link";
import Nav from "@/components/Nav";
import SupplyChainCostCalc from "./SupplyChainCostCalc";

export const metadata: Metadata = {
  title: "Supply Chain Cost Calculator — Total Cost as % of Revenue",
  description:
    "Calculate total supply chain costs as a percentage of revenue. Benchmark against world-class ≤5%. Covers transportation, warehousing, inventory, and returns.",
  alternates: { canonical: "https://nanoneuron.ai/tools/supply-chain-cost-calculator" },
  openGraph: {
    title: "Supply Chain Cost Calculator — Total Cost as % of Revenue",
    description:
      "Calculate total supply chain costs as a percentage of revenue. Benchmark against world-class ≤5%.",
    url: "https://nanoneuron.ai/tools/supply-chain-cost-calculator",
  },
  twitter: {
    card: "summary_large_image",
    title: "Supply Chain Cost Calculator — Free Benchmarking Tool",
    description:
      "Calculate your total supply chain cost as % of revenue. World-class benchmark: ≤5%.",
  },
};

const faqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    {
      "@type": "Question",
      name: "What is world-class supply chain cost as a percentage of revenue?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "World-class total supply chain cost is 5% or less of revenue, according to Gartner Supply Chain Top 25 research. This includes all logistics costs: transportation, warehousing, inventory carrying costs, and reverse logistics. Average companies spend 8–12% of revenue on supply chain costs. Poor performers spend 15%+. The gap between world-class (5%) and average (10%) represents enormous profit improvement potential — a company with $100M revenue could free up $5M+ in profit by reaching world-class performance.",
      },
    },
    {
      "@type": "Question",
      name: "How can companies reduce total supply chain cost?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "The highest-impact levers for reducing total supply chain cost are: (1) Reduce inventory carrying costs by improving turnover and reducing dead stock — carrying costs typically represent 20–30% of inventory value per year; (2) Optimise transportation through carrier consolidation, mode optimisation (rail/sea vs air), and load factor improvement; (3) Improve warehouse productivity through slotting, pick-path optimisation, and automation where ROI is positive; (4) Reduce returns costs through better order accuracy, quality inspection at source, and returns prevention analytics; (5) Negotiate supplier terms — payment terms improvements reduce working capital cost without operational change.",
      },
    },
    {
      "@type": "Question",
      name: "What percentage of revenue should supply chain cost be?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Target supply chain cost benchmarks vary by industry. Grocery and FMCG: world-class is 6–8% (higher due to refrigeration and high SKU count). General retail: 6–10%. E-commerce: 10–15% (last-mile delivery intensive). Manufacturing / industrial: 5–8%. High-tech electronics: 4–6% (high-value, low-weight goods). If your supply chain cost exceeds these benchmarks by more than 3 percentage points, a detailed cost decomposition is warranted to find the highest-cost components.",
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
      name: "Supply Chain Cost Calculator",
      item: "https://nanoneuron.ai/tools/supply-chain-cost-calculator",
    },
  ],
};

export default function SupplyChainCostCalculatorPage() {
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
            <span className="text-white/60">Supply Chain Cost Calculator</span>
          </nav>

          <div className="text-center mb-12">
            <p className="text-xs uppercase tracking-widest text-emerald-400/70 mb-3">Free Tool</p>
            <h1 className="text-4xl md:text-5xl font-bold mb-4">Supply Chain Cost Calculator</h1>
            <p className="text-white/55 text-lg max-w-2xl mx-auto">
              Calculate your total supply chain cost as a percentage of revenue and benchmark it
              against world-class operations. Covers transportation, warehousing, inventory carrying,
              and returns.
            </p>
          </div>

          <SupplyChainCostCalc />

          <section className="mt-20 space-y-8">
            <h2 className="text-2xl font-bold mb-6">Supply Chain Cost — Benchmarks &amp; Guide</h2>

            <div className="border border-white/10 bg-white/3 rounded-2xl p-6">
              <h3 className="font-semibold text-base mb-3">Total supply chain cost components</h3>
              <div className="space-y-2 text-sm text-white/60">
                {[
                  { cost: "Transportation", typical: "2–5% of revenue" },
                  { cost: "Warehousing & fulfilment", typical: "1.5–4% of revenue" },
                  { cost: "Inventory carrying cost", typical: "1–3% of revenue" },
                  { cost: "Returns & reverse logistics", typical: "0.5–2% of revenue" },
                  { cost: "Planning & administration", typical: "0.3–1% of revenue" },
                ].map((row) => (
                  <div key={row.cost} className="flex items-center justify-between">
                    <span className="text-white/70">{row.cost}</span>
                    <span className="text-emerald-400 font-mono text-xs">{row.typical}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="border border-white/10 bg-white/3 rounded-2xl p-6">
              <h3 className="font-semibold text-base mb-3">Performance tiers</h3>
              <div className="space-y-2">
                {[
                  { tier: "World Class", pct: "≤ 5%", color: "emerald" },
                  { tier: "Good", pct: "5–8%", color: "blue" },
                  { tier: "Average", pct: "8–12%", color: "amber" },
                  { tier: "Poor", pct: "> 12%", color: "red" },
                ].map((row) => (
                  <div key={row.tier} className="flex items-center gap-4 text-sm">
                    <span
                      className={`w-28 shrink-0 font-semibold ${
                        row.color === "emerald"
                          ? "text-emerald-400"
                          : row.color === "blue"
                          ? "text-blue-400"
                          : row.color === "amber"
                          ? "text-amber-400"
                          : "text-red-400"
                      }`}
                    >
                      {row.tier}
                    </span>
                    <span className="font-mono text-white/60">{row.pct} of revenue</span>
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
                OpsOracle AI breaks down your supply chain costs by component, corridor, and carrier
                — and surfaces the highest-impact reduction opportunities automatically.
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
            <Link href="/tools/inventory-turnover-calculator" className="hover:text-white transition-colors">Inventory Turnover</Link>
            <Link href="/tools/lead-time-calculator" className="hover:text-white transition-colors">Lead Time</Link>
            <Link href="/pricing" className="hover:text-white transition-colors">Pricing</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
