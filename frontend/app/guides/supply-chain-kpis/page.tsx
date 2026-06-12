import type { Metadata } from "next";
import Link from "next/link";
import Nav from "@/components/Nav";

export const metadata: Metadata = {
  title: "25 Supply Chain KPIs Every Manager Must Track (2024)",
  description:
    "The complete list of supply chain KPIs: OTIF, inventory turnover, perfect order rate, cash-to-cash cycle, freight cost per unit, and 20 more. Definitions, formulas, benchmarks.",
  alternates: { canonical: "https://nanoneuron.ai/guides/supply-chain-kpis" },
  openGraph: {
    title: "25 Supply Chain KPIs Every Manager Must Track (2024)",
    description:
      "Complete supply chain KPI list with formulas and world-class benchmarks. OTIF, inventory turnover, perfect order rate, and 22 more.",
    url: "https://nanoneuron.ai/guides/supply-chain-kpis",
  },
  twitter: {
    card: "summary_large_image",
    title: "25 Supply Chain KPIs — Formulas & Benchmarks (2024)",
    description:
      "The definitive supply chain KPI guide: 25 metrics with formulas, world-class benchmarks, and improvement tips.",
  },
};

const faqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    {
      "@type": "Question",
      name: "What are the most important supply chain KPIs?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "The five most important supply chain KPIs are: (1) OTIF (On-Time In-Full) — measures delivery execution quality, world-class ≥95%; (2) Inventory Turnover — how efficiently you convert inventory to sales, world-class 8x+ for most industries; (3) Perfect Order Rate — orders delivered defect-free end-to-end, world-class ≥98%; (4) Cash-to-Cash Cycle Time — how quickly you convert cash into inventory and back to cash, world-class <30 days; (5) Total Supply Chain Cost as % of Revenue — world-class ≤5%. These five metrics together give a comprehensive view of delivery quality, inventory efficiency, cost competitiveness, and cash management.",
      },
    },
    {
      "@type": "Question",
      name: "What is the difference between OTIF and perfect order rate?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "OTIF (On-Time In-Full) measures whether shipments are delivered on time and with correct quantity. Perfect Order Rate is a broader metric that adds documentation accuracy and condition requirements — the order must be on time, in full, damage-free, and correctly invoiced/documented. A shipment can be OTIF compliant but still fail Perfect Order if the invoice has errors or the goods arrive with transit damage. Perfect Order Rate is always lower than OTIF for the same operation.",
      },
    },
    {
      "@type": "Question",
      name: "How do I calculate cash-to-cash cycle time?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Cash-to-Cash Cycle Time = Days Inventory Outstanding (DIO) + Days Sales Outstanding (DSO) - Days Payable Outstanding (DPO). DIO measures how long inventory sits before being sold. DSO measures how long it takes to collect payment after a sale. DPO measures how long you take to pay suppliers. A company with DIO=45, DSO=30, DPO=60 has a Cash-to-Cash cycle of 45+30-60 = 15 days, meaning it takes 15 days to recover its cash. Negative cash-to-cash (like Amazon's model at -30 days) means you collect from customers before paying suppliers.",
      },
    },
  ],
};

const breadcrumbJsonLd = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: [
    { "@type": "ListItem", position: 1, name: "Home", item: "https://nanoneuron.ai" },
    { "@type": "ListItem", position: 2, name: "Guides", item: "https://nanoneuron.ai/guides" },
    {
      "@type": "ListItem",
      position: 3,
      name: "Supply Chain KPIs",
      item: "https://nanoneuron.ai/guides/supply-chain-kpis",
    },
  ],
};

type KPI = {
  name: string;
  formula: string;
  benchmark: string;
};

const kpiCategories: { category: string; kpis: KPI[] }[] = [
  {
    category: "Delivery Performance",
    kpis: [
      {
        name: "OTIF (On-Time In-Full)",
        formula: "(Orders on time AND in full ÷ Total orders) × 100",
        benchmark: "≥ 95%",
      },
      {
        name: "On-Time Delivery Rate",
        formula: "(Orders delivered on time ÷ Total orders) × 100",
        benchmark: "≥ 97%",
      },
      {
        name: "Perfect Order Rate",
        formula: "(Orders defect-free end-to-end ÷ Total orders) × 100",
        benchmark: "≥ 98%",
      },
      {
        name: "Fill Rate",
        formula: "(Units shipped ÷ Units ordered) × 100",
        benchmark: "≥ 98%",
      },
      {
        name: "Order Cycle Time",
        formula: "Actual delivery date − Order placement date (in days)",
        benchmark: "Industry-specific; trend toward zero",
      },
    ],
  },
  {
    category: "Inventory Management",
    kpis: [
      {
        name: "Inventory Turnover",
        formula: "COGS ÷ Average Inventory",
        benchmark: "8–12× (retail); 4–8× (manufacturing)",
      },
      {
        name: "Days Sales of Inventory (DSI)",
        formula: "(Average Inventory ÷ COGS) × 365",
        benchmark: "< 30 days (retail); < 60 days (manufacturing)",
      },
      {
        name: "Safety Stock Accuracy",
        formula: "Actual stockouts ÷ SKUs with safety stock set",
        benchmark: "< 1% stockout rate",
      },
      {
        name: "Stockout Rate",
        formula: "(SKUs with zero stock ÷ Total active SKUs) × 100",
        benchmark: "< 2%",
      },
      {
        name: "Inventory Accuracy",
        formula: "(Inventory records matching physical count ÷ Total records) × 100",
        benchmark: "≥ 99.5%",
      },
      {
        name: "Dead Stock Ratio",
        formula: "(Units with no movement in 180+ days ÷ Total units) × 100",
        benchmark: "< 3%",
      },
    ],
  },
  {
    category: "Cost Efficiency",
    kpis: [
      {
        name: "Total Supply Chain Cost % Revenue",
        formula: "(Total SC costs ÷ Revenue) × 100",
        benchmark: "≤ 5%",
      },
      {
        name: "Freight Cost Per Unit",
        formula: "Total freight spend ÷ Total units shipped",
        benchmark: "Trending down YoY",
      },
      {
        name: "Warehousing Cost Per Order",
        formula: "Total warehousing cost ÷ Total orders processed",
        benchmark: "Trending down YoY",
      },
      {
        name: "Cash-to-Cash Cycle Time",
        formula: "DIO + DSO − DPO (days)",
        benchmark: "< 30 days",
      },
      {
        name: "Cost Per Shipment",
        formula: "Total logistics cost ÷ Total shipments",
        benchmark: "Industry-specific; trend toward zero",
      },
    ],
  },
  {
    category: "Quality & Returns",
    kpis: [
      {
        name: "Return Rate",
        formula: "(Units returned ÷ Units sold) × 100",
        benchmark: "< 2% (B2B); < 5% (e-commerce)",
      },
      {
        name: "Damage Rate in Transit",
        formula: "(Damaged shipments ÷ Total shipments) × 100",
        benchmark: "< 0.5%",
      },
      {
        name: "Picking Accuracy",
        formula: "(Correct picks ÷ Total picks) × 100",
        benchmark: "≥ 99.9%",
      },
      {
        name: "Complaint Rate",
        formula: "(Orders with complaints ÷ Total orders) × 100",
        benchmark: "< 0.5%",
      },
    ],
  },
  {
    category: "Supplier Performance",
    kpis: [
      {
        name: "Supplier OTIF",
        formula: "(Supplier deliveries on time AND in full ÷ Total POs) × 100",
        benchmark: "≥ 95%",
      },
      {
        name: "Supplier Lead Time Accuracy",
        formula: "(POs received within agreed lead time ÷ Total POs) × 100",
        benchmark: "≥ 95%",
      },
      {
        name: "Purchase Order Accuracy",
        formula: "(POs fulfilled without discrepancies ÷ Total POs) × 100",
        benchmark: "≥ 99%",
      },
      {
        name: "Supplier Quality Rejection Rate",
        formula: "(Incoming units rejected ÷ Total incoming units) × 100",
        benchmark: "< 0.5%",
      },
      {
        name: "Supplier Concentration Risk",
        formula: "(Units from top supplier ÷ Total units purchased) × 100",
        benchmark: "< 30% from any single supplier",
      },
    ],
  },
];

export default function SupplyChainKPIsPage() {
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
        <div className="mx-auto max-w-4xl">
          <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-xs text-white/30 mb-8">
            <Link href="/" className="hover:text-white transition-colors">Home</Link>
            <span>/</span>
            <Link href="/guides" className="hover:text-white transition-colors">Guides</Link>
            <span>/</span>
            <span className="text-white/60">Supply Chain KPIs</span>
          </nav>

          <div className="mb-12">
            <p className="text-xs uppercase tracking-widest text-emerald-400/70 mb-3">Supply Chain Guide</p>
            <h1 className="text-4xl md:text-5xl font-bold mb-5 leading-tight">
              25 Supply Chain KPIs Every Manager Must Track (2024)
            </h1>
            <p className="text-white/55 text-lg leading-relaxed">
              The complete reference guide for supply chain performance measurement. Each KPI
              includes a clear definition, the exact formula, and a world-class benchmark.
              Grouped into 5 categories: Delivery, Inventory, Cost, Quality, and Supplier.
            </p>
          </div>

          <div className="space-y-12">
            {kpiCategories.map((cat) => (
              <section key={cat.category}>
                <h2 className="text-2xl font-bold mb-5 flex items-center gap-3">
                  <span className="w-1 h-7 bg-emerald-500 rounded-full" />
                  {cat.category}
                </h2>
                <div className="space-y-3">
                  {cat.kpis.map((kpi) => (
                    <div
                      key={kpi.name}
                      className="border border-white/10 bg-white/3 rounded-2xl p-5"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2 mb-2">
                        <h3 className="font-semibold text-base text-white">{kpi.name}</h3>
                        <span className="text-emerald-400 text-xs font-mono bg-emerald-500/10 border border-emerald-500/20 rounded-full px-3 py-0.5 shrink-0">
                          {kpi.benchmark}
                        </span>
                      </div>
                      <p className="font-mono text-xs text-white/40 bg-white/3 rounded-lg px-3 py-2">
                        {kpi.formula}
                      </p>
                    </div>
                  ))}
                </div>
              </section>
            ))}

            <section>
              <h2 className="text-2xl font-bold mb-6">Frequently Asked Questions</h2>
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
            </section>

            <div className="border border-emerald-500/20 bg-emerald-500/5 rounded-2xl p-8 text-center">
              <h2 className="text-xl font-bold mb-3">
                OpsOracle AI analyses all 25 KPIs automatically
              </h2>
              <p className="text-white/55 text-sm max-w-xl mx-auto mb-6">
                Upload your shipment, inventory, and PO data. OpsOracle AI calculates every KPI
                in this list, identifies which are below benchmark, and surfaces the root causes
                and highest-impact improvement actions — in minutes.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                <Link
                  href="/register"
                  className="bg-emerald-500 hover:bg-emerald-400 text-black font-semibold text-sm px-6 py-3 rounded-xl transition-colors"
                >
                  Try OpsOracle AI Free
                </Link>
                <Link
                  href="/tools"
                  className="border border-white/20 hover:border-white/40 text-white/70 hover:text-white font-semibold text-sm px-6 py-3 rounded-xl transition-colors"
                >
                  Free Calculators
                </Link>
              </div>
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
            <Link href="/guides/what-is-otif" className="hover:text-white transition-colors">What is OTIF</Link>
            <Link href="/guides/reduce-logistics-delays" className="hover:text-white transition-colors">Reduce Delays</Link>
            <Link href="/tools" className="hover:text-white transition-colors">Calculators</Link>
            <Link href="/pricing" className="hover:text-white transition-colors">Pricing</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
