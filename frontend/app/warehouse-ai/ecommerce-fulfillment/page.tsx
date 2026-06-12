import type { Metadata } from "next";
import Link from "next/link";
import { PainSolver } from "@/components/PainSolver";

export const metadata: Metadata = {
  title: "E-commerce Fulfillment Center AI — Warehouse Operations for D2C & Marketplace Sellers",
  description:
    "AI-powered operations intelligence for e-commerce fulfillment centers. Predict SLA misses, optimize carrier mix, reduce returns, and prevent stockouts across your fulfillment network — built for D2C brands, marketplace sellers, and 3PL operators.",
  alternates: { canonical: "https://nanoneuron.ai/warehouse-ai/ecommerce-fulfillment" },
  openGraph: {
    title: "E-commerce Fulfillment Center AI — Operations Intelligence for D2C & Marketplace",
    description:
      "AI for fulfillment center operations. Predict SLA breaches, catch carrier failures, and prevent stockouts across your warehouse network before they become customer complaints.",
    url: "https://nanoneuron.ai/warehouse-ai/ecommerce-fulfillment",
  },
  twitter: {
    card: "summary_large_image",
    title: "E-commerce Fulfillment Center AI — Warehouse Operations Intelligence",
    description: "AI for D2C and marketplace fulfillment. Predict SLA misses, catch carrier failures, prevent stockouts. Upload warehouse data, get AI analysis in 30 seconds.",
  },
};

const FC_PAINS = [
  {
    pain: "Prime/SLA window is 48 hours. 3 carriers consistently miss it on Mumbai orders. Customer complaints are spiking.",
    signal: "Delhivery MUM SLA breach: 23% | Ecom Express MUM SLA breach: 31% | XpressBees MUM SLA breach: 8% | Order volume same | Window: 48h",
    aiOutput: {
      risk: 87, label: "HIGH — Carrier Mix Broken", color: "red" as const,
      summary: "Delhivery and Ecom Express are breaching 48-hour SLA on 23-31% of Mumbai shipments. XpressBees same corridor shows 8%. Root cause: Delhivery's Andheri hub is showing 18-hour average dwell vs 4-hour normal. This is a hub-level issue, not a capacity issue.",
      action: "Route 60% of Mumbai SLA-sensitive orders to XpressBees immediately. Escalate Delhivery Andheri dwell spike to account manager today — request hub-level RCA within 24 hours.",
      impact: "Recover ₹1,12,000 in avoided SLA penalty credits; reduce Mumbai NPS impact this week",
    },
  },
  {
    pain: "Returns are at 18% this month. Warehouse team spending 4 hours/day on return processing. No visibility into which SKUs are driving it.",
    signal: "Total returns: 342 | SKU-405 return rate: 38% | SKU-412 return rate: 29% | Category: Electronics accessories | Reason: 'Not as described' 62%",
    aiOutput: {
      risk: 64, label: "HIGH — Return Root Cause Found", color: "red" as const,
      summary: "SKU-405 (USB-C Cable 2m) and SKU-412 (Charging Adapter 65W) account for 41% of all returns this month. 62% of return reasons are 'not as described' — product listing issue, not quality. These two SKUs have 4× the category return rate.",
      action: "Product team to update SKU-405 and SKU-412 listings today with accurate specs (cable rated current, adapter compatibility). Add Q&A section with top 3 return-driving questions. Consider holding reorder until listing is fixed.",
      impact: "Reduce returns by estimated 140 units/month = ₹84,000 in reverse logistics cost recovered",
    },
  },
  {
    pain: "Dark store in Pune ran out of 12 fast-moving SKUs during the weekend sale. 3-hour window lost completely.",
    signal: "Pune dark store: 12 SKUs at 0 stock | Sales velocity 3.2× normal | Replenishment cycle: 24h | Nearest hub: 45min away | Lost window: Sat 2pm–5pm",
    aiOutput: {
      risk: 79, label: "HIGH — Dark Store Stockout Pattern", color: "red" as const,
      summary: "Pune dark store hit zero on 12 SKUs during peak 3-hour Saturday window. Velocity was 3.2× normal — weekend demand uplift wasn't factored into replenishment trigger. 24-hour replenishment cycle is too slow for dark store demand variance. ₹56,000 in GMV window lost.",
      action: "Increase Pune dark store safety stock multiplier to 2.5× for Friday evening dispatch. Add 4-hour intraday replenishment trigger for any dark store SKU hitting <20% of capacity during a sale window.",
      impact: "Capture ₹56,000 weekend GMV window; reduce dark store stockout events by 70% in next 30 days",
    },
  },
];

const capabilities = [
  { kpi: "SLA breach prediction", title: "Carrier SLA Monitoring", desc: "Track per-carrier, per-corridor SLA adherence rate in real time. AI flags carriers breaching your SLA window before customer complaint volume spikes." },
  { kpi: "Returns intelligence", title: "Return Root Cause Analysis", desc: "Identify which SKUs, categories, and listing issues are driving return rates above category average — with specific actionable fixes per SKU." },
  { kpi: "Dark store optimization", title: "Dark Store & FC Replenishment", desc: "AI calculates demand velocity per location and flags SKUs that will stockout before the next replenishment cycle — across every node in your fulfillment network." },
  { kpi: "Inventory positioning", title: "Multi-Node Inventory Intelligence", desc: "Detect which products are over-stocked in slow-demand nodes and under-stocked near high-demand zones. AI recommends inter-FC transfers before stockouts hit." },
  { kpi: "Peak demand readiness", title: "Sale & Peak Event Planning", desc: "Analyse historical demand uplift per SKU for sales events. AI flags which SKUs need pre-positioning and which carriers need capacity booking 72 hours in advance." },
  { kpi: "Carrier mix optimization", title: "Carrier Performance Benchmarking", desc: "Rank your carrier mix by on-time rate, damage rate, and cost-per-shipment per corridor. Know which routes need carrier substitution before the NPS damage is done." },
];

const metrics = [
  { value: "< 30s", label: "Analysis per FC export" },
  { value: "SKU", label: "Level scoring across all nodes" },
  { value: "6 engines", label: "Calibrated for fulfillment ops" },
  { value: "Free", label: "No credit card to start" },
];

const faqJsonLd = {
  "@context": "https://schema.org", "@type": "FAQPage",
  mainEntity: [
    { "@type": "Question", name: "How does AI help e-commerce fulfillment center operations?", acceptedAnswer: { "@type": "Answer", text: "AI analyzes your fulfillment center data — order dispatch logs, carrier SLA reports, inventory levels, and return data — to predict problems before they reach the customer. It identifies which carriers are about to breach SLA windows, which SKUs will stockout before the next replenishment cycle, and which product listings are driving abnormal return rates." } },
    { "@type": "Question", name: "Which Indian logistics carriers does OpsOracle support for fulfillment analysis?", acceptedAnswer: { "@type": "Answer", text: "OpsOracle detects performance patterns for all major Indian e-commerce carriers: Delhivery, Ecom Express, XpressBees, Shadowfax, Dunzo, Bluedart, DTDC, and Amazon Logistics. It includes India-specific context like BlueDart hub dwell patterns, Delhivery corridor SLA windows, and Ecom Express last-mile failure rates." } },
    { "@type": "Question", name: "How can AI reduce e-commerce returns?", acceptedAnswer: { "@type": "Answer", text: "OpsOracle identifies SKUs with above-average return rates and correlates return reasons (not as described, sizing, quality) with sales velocity and listing data. It flags whether high returns are caused by product defects, listing inaccuracy, or category-level issues — so your merchandising and operations teams know exactly what to fix per SKU." } },
    { "@type": "Question", name: "What data do I need to upload for fulfillment center analysis?", acceptedAnswer: { "@type": "Answer", text: "Upload your order dispatch CSV, carrier SLA performance report, inventory snapshot, or returns data as CSV or Excel. Any export from Unicommerce, Vinculum, Increff, ShipRocket, or your WMS works — no specific format required." } },
    { "@type": "Question", name: "Is OpsOracle AI suitable for D2C brands?", acceptedAnswer: { "@type": "Answer", text: "Yes. OpsOracle is built for operations teams of all sizes. D2C brands can start with the free tier (3 analyses per day) and upgrade to Pro at ₹999/month for unlimited analyses and industry benchmark comparison. It is used by brands selling on Amazon, Flipkart, Meesho, and their own websites." } },
  ],
};

const breadcrumbJsonLd = {
  "@context": "https://schema.org", "@type": "BreadcrumbList",
  itemListElement: [
    { "@type": "ListItem", position: 1, name: "Home", item: "https://nanoneuron.ai" },
    { "@type": "ListItem", position: 2, name: "Warehouse AI", item: "https://nanoneuron.ai/warehouse-ai" },
    { "@type": "ListItem", position: 3, name: "E-commerce Fulfillment", item: "https://nanoneuron.ai/warehouse-ai/ecommerce-fulfillment" },
  ],
};

const indianBrands = [
  "D2C brands (Boat, Mamaearth, Lenskart)", "Marketplace sellers on Amazon & Flipkart",
  "Meesho & Snapdeal fulfillment operations", "3PL operators (Delhivery, Ecom Express)",
  "Quick commerce dark store networks", "ONDC-enabled seller fulfillment",
];

export default function EcommerceFulfillmentPage() {
  return (
    <div className="min-h-screen bg-zinc-950 text-white">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }} />

      <header>
        <nav aria-label="Main navigation" className="fixed top-0 left-0 right-0 z-50 border-b border-white/8 bg-zinc-950/80 backdrop-blur-md">
          <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
            <Link href="/" className="text-lg font-bold tracking-tight"><span className="text-emerald-400">Ops</span>Oracle AI</Link>
            <div className="flex items-center gap-4">
              <Link href="/warehouse-ai" className="text-sm text-white/60 hover:text-white transition-colors">Warehouse AI</Link>
              <Link href="/pricing" className="text-sm text-white/60 hover:text-white transition-colors">Pricing</Link>
              <Link href="/register" className="btn text-sm py-2 px-5">Try Free</Link>
            </div>
          </div>
        </nav>
      </header>

      <main id="main-content">
        <section aria-label="Hero" className="pt-32 pb-20 px-6">
          <div className="mx-auto max-w-5xl text-center">
            <nav aria-label="Breadcrumb" className="flex items-center justify-center gap-2 text-xs text-white/30 mb-6">
              <Link href="/" className="hover:text-white transition-colors">Home</Link>
              <span>/</span>
              <Link href="/warehouse-ai" className="hover:text-white transition-colors">Warehouse AI</Link>
              <span>/</span>
              <span className="text-white/60">E-commerce Fulfillment</span>
            </nav>
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-4 py-1.5 text-sm text-emerald-400">
              <span aria-hidden="true" className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
              E-commerce & Fulfillment Operations
            </div>
            <h1 className="text-5xl font-bold md:text-6xl leading-tight tracking-tight">
              AI for fulfillment centers,<br />
              <span className="text-emerald-400">dark stores, and D2C warehouses.</span>
            </h1>
            <p className="mx-auto mt-8 max-w-2xl text-lg text-white/60 leading-relaxed">
              Upload your dispatch logs, carrier SLA data or inventory exports. OpsOracle AI
              predicts SLA breaches before customers complain, finds the return root cause by SKU,
              and prevents dark store stockouts during peak windows — in under 30 seconds.
            </p>
            <div className="mt-10 flex flex-col sm:flex-row justify-center gap-4">
              <Link href="/register" className="btn text-base px-8 py-4">Analyze Your FC Data Free</Link>
              <Link href="/warehouse-ai" className="rounded-xl border border-white/15 px-8 py-4 text-base hover:bg-white/5 transition-colors">All Warehouse Features</Link>
            </div>
          </div>
        </section>

        <section aria-label="Who it's for" className="px-6 pb-16">
          <div className="mx-auto max-w-5xl">
            <p className="text-xs uppercase tracking-widest text-white/30 text-center mb-6">Built for</p>
            <div className="flex flex-wrap justify-center gap-3">
              {indianBrands.map((b) => (
                <span key={b} className="rounded-full border border-white/10 bg-white/4 px-4 py-1.5 text-sm text-white/55">{b}</span>
              ))}
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
              <p className="text-sm uppercase tracking-widest text-emerald-400/70 mb-3">Fulfillment AI Capabilities</p>
              <h2 className="text-3xl md:text-4xl font-bold">Built for fulfillment operations at scale</h2>
              <p className="mt-4 text-white/50 max-w-xl mx-auto">
                Not a generic warehouse tool. Every engine is calibrated on e-commerce signals — SLA windows, carrier corridor patterns, return root causes, dark store demand spikes.
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

        <PainSolver pains={FC_PAINS} industry="E-commerce Fulfillment" />

        <section aria-label="Get started" className="px-6 py-24 border-t border-white/8">
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="text-4xl font-bold mb-6">Stop losing SLA windows, GMV, and NPS to problems you could have predicted.</h2>
            <p className="text-white/55 text-lg mb-10">
              Upload your fulfillment data now — OpsOracle AI returns carrier risk scores, stockout predictions and return root cause analysis in seconds.
            </p>
            <Link href="/register" className="btn text-base px-10 py-4 inline-block">Start Analyzing Free</Link>
          </div>
        </section>

        <section aria-label="FAQ" className="px-6 py-16 border-t border-white/8">
          <div className="mx-auto max-w-3xl">
            <h2 className="text-2xl font-bold mb-6">Frequently asked questions</h2>
            <div className="space-y-4">
              {faqJsonLd.mainEntity.map((q) => (
                <details key={q.name} className="card cursor-pointer">
                  <summary className="font-semibold text-sm text-white/90 list-none flex items-center justify-between">
                    {q.name}<span className="text-white/30 ml-3 shrink-0">+</span>
                  </summary>
                  <p className="text-white/55 text-sm leading-relaxed mt-3">{q.acceptedAnswer.text}</p>
                </details>
              ))}
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-white/8 px-6 py-8">
        <div className="mx-auto max-w-6xl flex flex-col sm:flex-row items-center justify-between gap-4">
          <Link href="/" className="text-sm font-semibold"><span className="text-emerald-400">Ops</span>Oracle AI</Link>
          <div className="flex gap-5 text-sm text-white/40 flex-wrap justify-center">
            <Link href="/warehouse-ai" className="hover:text-white transition-colors">Warehouse AI</Link>
            <Link href="/logistics-ai" className="hover:text-white transition-colors">Logistics AI</Link>
            <Link href="/supply-chain-ai" className="hover:text-white transition-colors">Supply Chain AI</Link>
            <Link href="/retail-ai" className="hover:text-white transition-colors">Retail AI</Link>
            <Link href="/pricing" className="hover:text-white transition-colors">Pricing</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
