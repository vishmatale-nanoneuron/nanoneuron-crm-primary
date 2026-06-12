import type { Metadata } from "next";
import Link from "next/link";
import Nav from "@/components/Nav";

export const metadata: Metadata = {
  title: "Free Supply Chain & Operations Calculators — OpsOracle AI",
  description:
    "8 free calculators for operations, logistics, and supply chain teams: safety stock, inventory turnover, reorder point, OTIF, OEE, warehouse utilisation, lead time, supply chain cost.",
  alternates: { canonical: "https://nanoneuron.ai/tools" },
  openGraph: {
    title: "Free Supply Chain & Operations Calculators — OpsOracle AI",
    description:
      "8 free calculators for operations, logistics, and supply chain teams. No login required.",
    url: "https://nanoneuron.ai/tools",
  },
  twitter: {
    card: "summary_large_image",
    title: "Free Operations Calculators — OpsOracle AI",
    description:
      "8 free supply chain and operations calculators: safety stock, OTIF, OEE, inventory turnover, and more.",
  },
};

const breadcrumbJsonLd = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: [
    { "@type": "ListItem", position: 1, name: "Home", item: "https://nanoneuron.ai" },
    { "@type": "ListItem", position: 2, name: "Tools", item: "https://nanoneuron.ai/tools" },
  ],
};

const calculators = [
  {
    title: "Safety Stock Calculator",
    href: "/tools/safety-stock-calculator",
    desc: "Calculate safety stock using demand variability and service level Z-score",
    tag: "Inventory",
  },
  {
    title: "Inventory Turnover Calculator",
    href: "/tools/inventory-turnover-calculator",
    desc: "Measure how efficiently you manage inventory vs COGS",
    tag: "Inventory",
  },
  {
    title: "Reorder Point Calculator",
    href: "/tools/reorder-point-calculator",
    desc: "Know exactly when to reorder before you run out of stock",
    tag: "Inventory",
  },
  {
    title: "Supply Chain Cost Calculator",
    href: "/tools/supply-chain-cost-calculator",
    desc: "Total logistics cost as % of revenue, benchmarked against world-class ≤5%",
    tag: "Cost",
  },
  {
    title: "Warehouse Utilisation Calculator",
    href: "/tools/warehouse-utilization-calculator",
    desc: "Are you under- or over-using your warehouse capacity? Optimal: 85–92%",
    tag: "Warehouse",
  },
  {
    title: "Lead Time Calculator",
    href: "/tools/lead-time-calculator",
    desc: "Calculate order-to-receipt time or sum component lead times",
    tag: "Logistics",
  },
  {
    title: "OTIF Calculator",
    href: "/logistics-ai/otif-calculator",
    desc: "On-Time In-Full delivery rate — World Class ≥ 95%",
    tag: "Logistics",
  },
  {
    title: "OEE Calculator",
    href: "/manufacturing-ai/oee-calculator",
    desc: "Overall Equipment Effectiveness for manufacturing lines",
    tag: "Manufacturing",
  },
];

const tagColors: Record<string, string> = {
  Inventory: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
  Cost: "bg-blue-500/10 text-blue-400 border-blue-500/20",
  Warehouse: "bg-purple-500/10 text-purple-400 border-purple-500/20",
  Logistics: "bg-amber-500/10 text-amber-400 border-amber-500/20",
  Manufacturing: "bg-rose-500/10 text-rose-400 border-rose-500/20",
};

export default function ToolsHubPage() {
  return (
    <div className="min-h-screen bg-zinc-950 text-white">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />

      <Nav />

      <main id="main-content" className="pt-28 pb-24 px-6">
        <div className="mx-auto max-w-5xl">
          <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-xs text-white/30 mb-8">
            <Link href="/" className="hover:text-white transition-colors">Home</Link>
            <span>/</span>
            <span className="text-white/60">Tools</span>
          </nav>

          <div className="text-center mb-16">
            <p className="text-xs uppercase tracking-widest text-emerald-400/70 mb-3">Free Tools</p>
            <h1 className="text-4xl md:text-5xl font-bold mb-5">Free Operations Calculators</h1>
            <p className="text-white/55 text-lg max-w-2xl mx-auto">
              Eight free calculators used by supply chain managers, logistics teams, and warehouse
              operators to benchmark performance and make faster decisions. No login required.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {calculators.map((calc) => (
              <Link
                key={calc.href}
                href={calc.href}
                className="group border border-white/10 bg-white/[0.03] rounded-2xl p-6 hover:border-emerald-500/40 hover:bg-white/[0.06] transition-all duration-200"
              >
                <div className="flex items-start justify-between gap-3 mb-3">
                  <h2 className="text-base font-semibold text-white group-hover:text-emerald-400 transition-colors leading-snug">
                    {calc.title}
                  </h2>
                  <span
                    className={`text-xs border rounded-full px-2 py-0.5 shrink-0 ${tagColors[calc.tag] ?? "bg-white/5 text-white/40 border-white/10"}`}
                  >
                    {calc.tag}
                  </span>
                </div>
                <p className="text-white/45 text-sm leading-relaxed">{calc.desc}</p>
                <p className="mt-4 text-xs text-emerald-400 group-hover:text-emerald-300 transition-colors">
                  Open calculator →
                </p>
              </Link>
            ))}
          </div>

          <div className="mt-20 border border-emerald-500/20 bg-emerald-500/5 rounded-2xl p-8 text-center">
            <h2 className="text-xl font-bold mb-3">Want AI analysis across all these KPIs?</h2>
            <p className="text-white/55 text-sm max-w-xl mx-auto mb-6">
              OpsOracle AI uploads your shipment data and automatically calculates OTIF, safety
              stock gaps, inventory turnover, lead time trends, and supply chain cost — across
              every SKU, carrier, and warehouse — in minutes.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link
                href="/register"
                className="bg-emerald-500 hover:bg-emerald-400 text-black font-semibold text-sm px-6 py-3 rounded-xl transition-colors"
              >
                Try OpsOracle AI Free
              </Link>
              <Link
                href="/supply-chain-ai"
                className="text-sm text-white/50 hover:text-white transition-colors"
              >
                Learn about Supply Chain AI
              </Link>
            </div>
          </div>
        </div>
      </main>

      <footer className="border-t border-white/8 px-6 py-8">
        <div className="mx-auto max-w-6xl flex flex-col sm:flex-row items-center justify-between gap-4">
          <Link href="/" className="text-sm font-semibold">
            <span className="text-emerald-400">Ops</span>Oracle AI
          </Link>
          <div className="flex flex-wrap gap-5 text-sm text-white/40 justify-center">
            <Link href="/logistics-ai" className="hover:text-white transition-colors">Logistics AI</Link>
            <Link href="/manufacturing-ai" className="hover:text-white transition-colors">Manufacturing AI</Link>
            <Link href="/guides/supply-chain-kpis" className="hover:text-white transition-colors">Supply Chain KPIs</Link>
            <Link href="/pricing" className="hover:text-white transition-colors">Pricing</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
