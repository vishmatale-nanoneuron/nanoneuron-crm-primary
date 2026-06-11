import type { Metadata } from "next";
import Link from "next/link";
import { PainSolver } from "@/components/PainSolver";

const RETAIL_PAINS = [
  {
    pain: "3 of our best-selling SKUs are out of stock. We found out when customers started complaining. We're losing ₹40,000 a day.",
    signal: "SKU-202 stock=0 · weekly demand 28 · last restock 2026-05-20 (21d ago) | SKU-206 stock=0 · demand 15/wk | SKU-210 stock=0 · demand 19/wk",
    aiOutput: {
      risk: 88, label: "CRITICAL — 3 Active Stockouts", color: "red" as const,
      summary: "SKU-202 (Samsung Charger), SKU-206 (Yoga Mat), and SKU-210 (Bluetooth Speaker) are all at zero stock across Mumbai and Delhi stores. Combined weekly demand: 62 units. At current sell price, that is ₹46,200 in weekly revenue stopped. SKU-202 has been stockout for 21 days.",
      action: "Buying team to raise emergency POs for all 3 SKUs today — accept 15% express procurement premium. Prioritise SKU-202 (highest demand, longest stockout). Set auto-reorder triggers at 30-unit threshold across all three.",
      impact: "Recover ₹46,200 weekly revenue; prevent further customer churn to competitor for fast-moving electronics",
    },
  },
  {
    pain: "Winter jackets are taking up shelf space. 220 units, barely selling. Meanwhile summer products are out of stock.",
    signal: "SKU-208 Winter Jacket L: stock=220 · weekly_sales=2 · sell_through=67% · returns=31 · days_until_stockout=110",
    aiOutput: {
      risk: 62, label: "HIGH — Dead Inventory Blocking Cash", color: "red" as const,
      summary: "SKU-208 has 220 units selling at 2/week — 110 weeks of stock at current velocity. 31 returns suggest sizing or quality issue compounding the problem. Carrying cost: ₹1,76,000 in locked working capital. Seasonal window for winter apparel has closed.",
      action: "Merchandising team to markdown SKU-208 by 30% this week — target sell-through of 80 units in 3 weeks before monsoon season. Simultaneously review reorder settings: this SKU should not have been restocked at current levels.",
      impact: "Free ₹1,76,000 in working capital; open shelf space for monsoon/summer high-velocity SKUs",
    },
  },
  {
    pain: "Summer Dress SKU is sitting at 145 units but barely selling. Forecast said 25/week. Actual is 8. Nobody adjusted the buy.",
    signal: "SKU-203 Summer Dress Red: stock=145 · weekly_sales=8 · forecast=25 · sell_through=32% · returns=18",
    aiOutput: {
      risk: 54, label: "MEDIUM — Demand Forecast Miss", color: "yellow" as const,
      summary: "SKU-203 actual demand is 32% of forecast (8 vs 25 units/week). With 145 units in stock, you have 18 weeks of supply at real velocity — far beyond season. 18 returns (12% return rate vs 3% category average) suggest a product-fit issue driving both low sales and high returns.",
      action: "Category manager to review SKU-203 customer return reasons this week — if sizing: raise exchange policy. Reduce buy plan for this SKU next season by 65%. Consider bundling with fast-moving accessories to increase basket conversion.",
      impact: "Prevent end-of-season markdowns; save ₹87,000 in potential inventory write-down next quarter",
    },
  },
];

export const metadata: Metadata = {
  title: "Retail AI — Stockout Prevention, Dead Inventory Detection & Demand Forecasting",
  description:
    "AI-powered retail intelligence. Upload store inventory, sales or POS data to get stockout alerts, dead inventory identification, sell-through analysis and demand forecast accuracy scoring in under 30 seconds.",
  alternates: { canonical: "https://nanoneuron.ai/retail-ai" },
  openGraph: {
    title: "Retail AI — Stockout Prevention & Inventory Health Analysis",
    description:
      "Find stockouts before customers do. OpsOracle AI scores inventory health, flags dead stock and identifies demand forecast misses across your stores instantly.",
    url: "https://nanoneuron.ai/retail-ai",
  },
};

const capabilities = [
  {
    title: "Stockout Detection & Alerting",
    desc: "Scan every SKU across every store for zero or near-zero stock against real demand velocity. AI flags stockouts before customers hit an empty shelf — with revenue loss quantified per day.",
    kpi: "Never lose a sale to empty shelf",
  },
  {
    title: "Dead Inventory Identification",
    desc: "Find SKUs where stock weeks-on-hand far exceeds sell-through velocity. AI calculates working capital locked in slow movers and recommends markdown timing before the seasonal window closes.",
    kpi: "Free locked working capital",
  },
  {
    title: "Demand Forecast Accuracy",
    desc: "Compare actual weekly sales against forecast per SKU. AI names the specific products where buys were over or under by the most — so your merchandising team can fix the forecast model before next season.",
    kpi: "Fix buys before next season",
  },
  {
    title: "Returns Rate Analysis",
    desc: "Detect SKUs with abnormal return rates and correlate with sales velocity, sizing data or product category. AI identifies whether high returns signal a product defect, sizing issue or misleading listing.",
    kpi: "Diagnose return root causes",
  },
  {
    title: "Sell-Through Scoring",
    desc: "Score every category and SKU on sell-through percentage against plan. AI ranks your worst-performing categories so the buying team knows where to cut inventory investment in the next buy cycle.",
    kpi: "Optimize every buy cycle",
  },
  {
    title: "Cross-Store Inventory Rebalancing",
    desc: "Identify where the same SKU is overstocked in one store and understocked in another. AI recommends inter-store transfers to maximise sell-through without fresh procurement.",
    kpi: "Move stock, not POs",
  },
];

const metrics = [
  { value: "< 30s", label: "Inventory analysis per store" },
  { value: "SKU", label: "Item-level, not category averages" },
  { value: "6 engines", label: "Calibrated for retail signals" },
  { value: "Free", label: "No credit card to start" },
];

const faqJsonLd = {
  "@context": "https://schema.org", "@type": "FAQPage",
  mainEntity: [
    { "@type": "Question", name: "How can AI prevent retail stockouts?", acceptedAnswer: { "@type": "Answer", text: "OpsOracle AI reads your store inventory and sales data, calculates days-until-stockout per SKU based on real demand velocity, and flags items that will hit zero before the next restock arrives. It quantifies the daily revenue loss per stockout so your buying team can prioritize emergency POs." } },
    { "@type": "Question", name: "How does AI identify dead inventory in retail?", acceptedAnswer: { "@type": "Answer", text: "OpsOracle compares weeks-on-hand against actual weekly sales velocity per SKU. Items with more than 8–12 weeks of stock at current velocity are flagged as dead inventory, with working capital locked calculated in rupees." } },
    { "@type": "Question", name: "What retail data can I upload to OpsOracle?", acceptedAnswer: { "@type": "Answer", text: "Upload store inventory exports, POS sales data, or stock replenishment reports as CSV or Excel. Any format from Shopify, Unicommerce, Vinculum, Increff or manual tracking sheets works." } },
    { "@type": "Question", name: "How does OpsOracle measure demand forecast accuracy?", acceptedAnswer: { "@type": "Answer", text: "OpsOracle compares your forecast quantity against actual weekly sales per SKU. It calculates forecast error percentage, identifies which SKUs were over-bought or under-bought by the largest margin, and recommends buy plan adjustments for the next season." } },
    { "@type": "Question", name: "What is the cost of retail AI software in India?", acceptedAnswer: { "@type": "Answer", text: "OpsOracle Pro starts at ₹999/month for unlimited retail inventory analysis. A free tier with 3 analyses per day is available with no credit card required — suitable for single stores or small retail chains." } },
  ],
};

export default function RetailAI() {
  return (
    <div className="min-h-screen bg-zinc-950 text-white">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }} />
      <header>
      <nav aria-label="Main navigation" className="fixed top-0 left-0 right-0 z-50 border-b border-white/8 bg-zinc-950/80 backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <Link href="/" className="text-lg font-bold tracking-tight">
            <span className="text-emerald-400">Ops</span>Oracle AI
          </Link>
          <div className="flex items-center gap-4">
            <Link href="/login" className="text-sm text-white/60 hover:text-white transition-colors">Login</Link>
            <Link href="/register" className="btn text-sm py-2 px-5">Get Started Free</Link>
          </div>
        </div>
      </nav>
      </header>

      <main id="main-content">
      <section aria-label="Hero" className="pt-32 pb-20 px-6">
        <div className="mx-auto max-w-5xl text-center">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-4 py-1.5 text-sm text-emerald-400">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
            Retail & Store Operations
          </div>
          <h1 className="text-5xl font-bold md:text-6xl leading-tight tracking-tight">
            AI that finds the stockout<br />
            <span className="text-emerald-400">before your customer does.</span>
          </h1>
          <p className="mx-auto mt-8 max-w-2xl text-lg text-white/60 leading-relaxed">
            Upload store inventory, POS data or sales reports. OpsOracle AI flags active
            stockouts, identifies dead inventory tying up working capital, scores sell-through
            by SKU, and tells your buying team exactly what to act on — in under 30 seconds.
          </p>
          <div className="mt-10 flex flex-col sm:flex-row justify-center gap-4">
            <Link href="/register" className="btn text-base px-8 py-4">Analyze Your Store Data Free</Link>
            <Link href="/" className="rounded-xl border border-white/15 px-8 py-4 text-base hover:bg-white/5 transition-colors">
              View All Features
            </Link>
          </div>
        </div>
      </section>

      <section aria-label="Key metrics" className="px-6 pb-16">
        <div className="mx-auto max-w-5xl grid grid-cols-2 md:grid-cols-4 gap-4">
          {metrics.map((m) => (
            <div key={m.label} className="card text-center">
              <div className="text-3xl font-bold text-emerald-400">{m.value}</div>
              <div className="mt-1 text-sm text-white/50">{m.label}</div>
            </div>
          ))}
        </div>
      </section>

      <section aria-label="Capabilities" className="px-6 py-20 border-t border-white/8">
        <div className="mx-auto max-w-5xl">
          <div className="text-center mb-14">
            <p className="text-sm uppercase tracking-widest text-emerald-400/70 mb-3">Retail AI Capabilities</p>
            <h2 className="text-3xl md:text-4xl font-bold">Built for buyers, merchandisers and store managers</h2>
            <p className="mt-4 text-white/50 max-w-xl mx-auto">
              Not a generic AI. Every engine is calibrated on retail signals — sell-through velocity, stockout cost, dead inventory carrying cost, returns root causes.
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-5">
            {capabilities.map((c) => (
              <div key={c.title} className="card hover:border-emerald-500/30 hover:bg-white/8 transition-all">
                <div className="text-xs text-emerald-400/70 font-mono uppercase tracking-wider mb-2">{c.kpi}</div>
                <h3 className="font-semibold text-base mb-2">{c.title}</h3>
                <p className="text-white/55 text-sm leading-relaxed">{c.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <PainSolver pains={RETAIL_PAINS} industry="Retail" />

      <section aria-label="How it works" className="px-6 py-20 border-t border-white/8">
        <div className="mx-auto max-w-5xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold">How retail teams use OpsOracle AI</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              { step: "01", title: "Upload your inventory or POS export", desc: "Export your store inventory, weekly sales report or POS data as CSV. OpsOracle reads any column format — no template required." },
              { step: "02", title: "AI scores every SKU's health", desc: "Stockouts flagged with daily revenue loss, dead inventory ranked by working capital locked, demand forecast misses identified by SKU. All in one analysis." },
              { step: "03", title: "Act before the week is over", desc: "Three specific actions — emergency PO, markdown trigger, inter-store transfer — each names the SKU, the store, and the rupee impact of fixing it today." },
            ].map((s) => (
              <div key={s.step} className="card relative overflow-hidden">
                <div className="text-6xl font-bold text-white/5 absolute -top-2 -right-2 select-none">{s.step}</div>
                <div className="text-emerald-400 text-sm font-mono mb-3">{s.step}</div>
                <h3 className="font-semibold text-lg mb-2">{s.title}</h3>
                <p className="text-white/55 text-sm leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section aria-label="Get started" className="px-6 py-24 border-t border-white/8">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="text-4xl font-bold mb-6">Stop losing sales to stockouts you could have predicted.</h2>
          <p className="text-white/55 text-lg mb-10">
            Upload your inventory report now — OpsOracle AI returns stockout alerts, dead inventory analysis and demand forecast scores in seconds.
          </p>
          <Link href="/register" className="btn text-base px-10 py-4 inline-block">
            Start Analyzing Free
          </Link>
        </div>
      </section>

      </main>
      <footer className="border-t border-white/8 px-6 py-10">
        <div className="mx-auto max-w-6xl flex flex-col sm:flex-row items-center justify-between gap-4">
          <Link href="/" className="text-sm font-semibold">
            <span className="text-emerald-400">Ops</span>Oracle AI
          </Link>
          <p className="text-sm text-white/30">© {new Date().getFullYear()} OpsOracle AI. All rights reserved.</p>
          <div className="flex gap-6 text-sm text-white/40 flex-wrap justify-center">
            <Link href="/logistics-ai" className="hover:text-white transition-colors">Logistics AI</Link>
            <Link href="/warehouse-ai" className="hover:text-white transition-colors">Warehouse AI</Link>
            <Link href="/manufacturing-ai" className="hover:text-white transition-colors">Manufacturing AI</Link>
            <Link href="/supply-chain-ai" className="hover:text-white transition-colors">Supply Chain AI</Link>
            <Link href="/devops-ai" className="hover:text-white transition-colors">DevOps AI</Link>
            <Link href="/mlops-ai" className="hover:text-white transition-colors">MLOps AI</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
