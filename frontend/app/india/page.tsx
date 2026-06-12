import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Operations AI Software India — Logistics, Manufacturing, Warehouse, Supply Chain | OpsOracle",
  description:
    "AI-powered operations software built for Indian businesses. Logistics (BlueDart, Delhivery, Ecom Express), manufacturing (automotive, pharma, FMCG), warehouse, retail, and supply chain AI. Starts at ₹999/month. Free to start.",
  alternates: { canonical: "https://nanoneuron.ai/india" },
  openGraph: {
    title: "Operations AI Software India — Logistics, Manufacturing, Warehouse & Supply Chain",
    description: "AI operations intelligence built for Indian businesses. Upload CSV data, get risk analysis in 30 seconds. Starts at ₹999/month.",
    url: "https://nanoneuron.ai/india",
  },
  twitter: {
    card: "summary_large_image",
    title: "Operations AI Software for Indian Businesses — OpsOracle AI",
    description: "AI for logistics, manufacturing, warehouse, and supply chain teams in India. Starts at ₹999/month. Free to start.",
  },
  keywords: [
    "operations AI software India",
    "logistics software India",
    "warehouse management software India",
    "supply chain software India",
    "manufacturing AI India",
    "inventory management software India",
    "AI for Indian businesses",
    "operations analytics India",
    "logistics analytics software India",
    "ERP alternative India small business",
    "predictive analytics operations India",
    "supply chain risk management India",
    "logistics KPI software India",
    "manufacturing OEE software India",
    "D2C operations software India",
  ],
};

const industries = [
  {
    sector: "Logistics & 3PL",
    examples: "BlueDart, Delhivery, Ecom Express, XpressBees, Rivigo",
    problems: ["Carrier SLA breach patterns", "Last-mile failure corridors", "Freight cost anomalies", "AWB tracking exceptions"],
    href: "/logistics-ai",
    label: "Logistics AI →",
  },
  {
    sector: "Manufacturing",
    examples: "Automotive (Tier 1/2), Pharma, FMCG, Textiles, Electronics PLI",
    problems: ["OEE below target", "Unplanned downtime escalation", "Defect rate spikes", "Production bottleneck identification"],
    href: "/manufacturing-ai",
    label: "Manufacturing AI →",
  },
  {
    sector: "Warehouse & Inventory",
    examples: "D2C brands, Flipkart / Meesho sellers, Industrial MRO, 3PL operators",
    problems: ["Stockout risk before it hits", "Safety stock miscalibration", "Dead inventory tying up capital", "Reorder point gaps"],
    href: "/warehouse-ai",
    label: "Warehouse AI →",
  },
  {
    sector: "Retail & E-commerce",
    examples: "Multi-store retail chains, D2C brands, Marketplace sellers, FMCG distributors",
    problems: ["Active stockouts driving lost sales", "Slow-moving and dead SKUs", "Demand forecast miss by SKU", "Return rate root causes"],
    href: "/retail-ai",
    label: "Retail AI →",
  },
  {
    sector: "Supply Chain & Procurement",
    examples: "Auto ancillary, Electronics, Pharma APIs, Capital goods manufacturers",
    problems: ["Supplier OTD below 80%", "Critical components below safety stock", "Single-source dependency risk", "Open PO delay prediction"],
    href: "/supply-chain-ai",
    label: "Supply Chain AI →",
  },
  {
    sector: "DevOps & Engineering",
    examples: "Indian SaaS companies, IT services, Product engineering teams",
    problems: ["High change failure rate", "P1 incidents from bad deploys", "MTTR above 2 hours", "DORA metrics benchmarking"],
    href: "/devops-ai",
    label: "DevOps AI →",
  },
];

const indianContext = [
  { label: "Indian carrier data", desc: "BlueDart, Delhivery, DTDC, Ecom Express, XpressBees, Shadowfax, Rivigo — carrier-specific patterns built in" },
  { label: "INR pricing", desc: "Free tier + Pro at ₹999/month. No USD conversion, no international credit card required." },
  { label: "India-specific benchmarks", desc: "Industry averages from Indian operations data — not US or EU baselines that don't apply to Indian conditions." },
  { label: "Indian regulatory context", desc: "GST invoice requirements, WMS export formats (Tally, SAP India), Indian ERP data compatibility." },
  { label: "Hindi / regional language data", desc: "OpsOracle reads your data regardless of language — column headers, date formats, and units in any format." },
  { label: "No expensive setup", desc: "No implementation consultant, no 6-month onboarding. Upload CSV, get analysis. Start in minutes." },
];

const indianFAQ = [
  { q: "Is OpsOracle AI available in India?", a: "Yes. OpsOracle AI is built and operated from India, with all pricing in INR. It is specifically calibrated for Indian operations — Indian logistics carriers (BlueDart, Delhivery, Ecom Express), Indian manufacturing patterns, and Indian supply chain conditions. The free tier gives 3 analyses per day with no credit card required." },
  { q: "What is the price of OpsOracle AI in India?", a: "OpsOracle AI has a free tier with 3 analyses per day — no credit card required. Pro plans start at ₹999/month (approximately less than the cost of one delayed shipment penalty for most logistics companies). Enterprise plans are available at ₹4,999/month with API access, unlimited team members, and dedicated support. Annual plans are available at ₹8,999/year (Pro) and ₹39,999/year (Enterprise) — saving 25–33%." },
  { q: "Does OpsOracle work with Indian ERP systems like Tally, SAP India, or Oracle?", a: "Yes. OpsOracle accepts CSV and Excel exports from any ERP, WMS, or TMS system. If your ERP can export data to CSV or Excel — Tally, SAP India, Oracle, Microsoft Dynamics, or any custom system — OpsOracle can analyze it. No API integration or implementation required." },
  { q: "Which Indian industries use operations AI software?", a: "OpsOracle is used across Indian manufacturing (automotive Tier 1/2 suppliers, pharma, FMCG, textiles, electronics), logistics (3PLs, e-commerce companies, last-mile carriers), retail (multi-store chains, D2C brands, marketplace sellers), and supply chain (procurement teams in auto ancillary, electronics, and capital goods). Any operations team managing data in spreadsheets or basic reports can benefit immediately." },
  { q: "How does OpsOracle compare to expensive ERP systems for Indian SMEs?", a: "Enterprise ERP systems cost ₹5-50L for implementation and ₹2-10L/year in licensing — beyond reach for most Indian SMEs. OpsOracle does not replace your ERP. It sits on top of whatever data system you already have (including spreadsheets) and gives you AI analysis in 30 seconds. Pro starts at ₹999/month and delivers the kind of operational insight that previously required a business intelligence team." },
  { q: "Is operations AI useful for small manufacturing businesses in India?", a: "Yes. OpsOracle is specifically designed for operations teams of any size — from a 50-person factory to a 5,000-person plant. You don't need a data science team or an IT department. Upload your shift report, inventory export, or dispatch log and OpsOracle returns risk scores, root cause analysis, and specific recommended actions in under 30 seconds." },
];

const faqJsonLd = {
  "@context": "https://schema.org", "@type": "FAQPage",
  mainEntity: indianFAQ.map((f) => ({
    "@type": "Question", name: f.q,
    acceptedAnswer: { "@type": "Answer", text: f.a },
  })),
};

const breadcrumbJsonLd = {
  "@context": "https://schema.org", "@type": "BreadcrumbList",
  itemListElement: [
    { "@type": "ListItem", position: 1, name: "Home", item: "https://nanoneuron.ai" },
    { "@type": "ListItem", position: 2, name: "OpsOracle AI India", item: "https://nanoneuron.ai/india" },
  ],
};

export default function IndiaPage() {
  return (
    <div className="min-h-screen bg-zinc-950 text-white">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }} />

      <header>
        <nav aria-label="Main navigation" className="fixed top-0 left-0 right-0 z-50 border-b border-white/8 bg-zinc-950/80 backdrop-blur-md">
          <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
            <Link href="/" className="text-lg font-bold tracking-tight"><span className="text-emerald-400">Ops</span>Oracle AI</Link>
            <div className="flex items-center gap-4">
              <Link href="/pricing" className="text-sm text-white/60 hover:text-white transition-colors">Pricing</Link>
              <Link href="/login" className="text-sm text-white/60 hover:text-white transition-colors">Login</Link>
              <Link href="/register" className="btn text-sm py-2 px-5">Try Free</Link>
            </div>
          </div>
        </nav>
      </header>

      <main id="main-content">
        {/* Hero */}
        <section aria-label="Hero" className="pt-32 pb-20 px-6">
          <div className="mx-auto max-w-5xl text-center">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-orange-500/30 bg-orange-500/10 px-4 py-1.5 text-sm text-orange-400">
              <span aria-hidden="true" className="h-1.5 w-1.5 rounded-full bg-orange-400 animate-pulse" />
              Made for India · Priced for India · ₹999/month
            </div>
            <h1 className="text-5xl font-bold md:text-6xl leading-tight tracking-tight">
              AI operations intelligence<br />
              <span className="text-emerald-400">for Indian businesses.</span>
            </h1>
            <p className="mx-auto mt-8 max-w-2xl text-lg text-white/60 leading-relaxed">
              Logistics, manufacturing, warehouse, retail, supply chain, DevOps — OpsOracle AI
              analyzes your operational data and returns risk scores, root cause analysis, and
              specific recommended actions in under 30 seconds. Starts free, Pro at ₹999/month.
            </p>
            <div className="mt-10 flex flex-col sm:flex-row justify-center gap-4">
              <Link href="/register" className="btn text-base px-8 py-4">Start Free — No Card Required</Link>
              <Link href="/pricing" className="rounded-xl border border-white/15 px-8 py-4 text-base hover:bg-white/5 transition-colors">
                View Pricing in INR
              </Link>
            </div>
            <p className="mt-6 text-sm text-white/30">Free tier: 3 analyses/day · Pro: ₹999/month · Enterprise: ₹2,999/month</p>
          </div>
        </section>

        {/* What makes it India-specific */}
        <section aria-label="India-specific features" className="px-6 py-16 border-t border-white/8">
          <div className="mx-auto max-w-5xl">
            <div className="text-center mb-12">
              <p className="text-xs uppercase tracking-widest text-orange-400/70 mb-3">Built for India</p>
              <h2 className="text-3xl font-bold">Not a generic AI tool translated for India.<br />Built for Indian operations from the ground up.</h2>
            </div>
            <div className="grid md:grid-cols-3 gap-5">
              {indianContext.map((c) => (
                <div key={c.label} className="card hover:border-orange-500/15 transition-colors">
                  <div className="text-xs text-orange-400/70 font-mono uppercase tracking-wider mb-2">{c.label}</div>
                  <p className="text-white/60 text-sm leading-relaxed">{c.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Industry coverage */}
        <section aria-label="Industries" className="px-6 py-20 border-t border-white/8">
          <div className="mx-auto max-w-5xl">
            <div className="text-center mb-12">
              <p className="text-xs uppercase tracking-widest text-emerald-400/70 mb-3">6 Verticals</p>
              <h2 className="text-3xl font-bold">AI for every operations function in your business.</h2>
            </div>
            <div className="grid md:grid-cols-2 gap-6">
              {industries.map((ind) => (
                <div key={ind.sector} className="card hover:border-emerald-500/25 transition-colors">
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div>
                      <h3 className="font-semibold text-base">{ind.sector}</h3>
                      <p className="text-xs text-white/35 mt-0.5">{ind.examples}</p>
                    </div>
                    <Link href={ind.href} className="shrink-0 text-xs text-emerald-400 hover:text-emerald-300 transition-colors font-medium">
                      {ind.label}
                    </Link>
                  </div>
                  <ul className="space-y-1">
                    {ind.problems.map((p) => (
                      <li key={p} className="flex items-center gap-2 text-sm text-white/50">
                        <span className="h-1 w-1 rounded-full bg-emerald-400/50 shrink-0" />
                        {p}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Pricing CTA */}
        <section aria-label="Pricing" className="px-6 py-16 border-t border-white/8">
          <div className="mx-auto max-w-4xl">
            <div className="text-center mb-10">
              <h2 className="text-3xl font-bold">Affordable for Indian businesses of every size.</h2>
              <p className="text-white/50 mt-3">Enterprise AI at SME prices. No implementation cost. No consultant. No lock-in.</p>
            </div>
            <div className="grid md:grid-cols-3 gap-5">
              {[
                { name: "Free", price: "₹0", period: "forever", features: ["3 analyses per day", "All 6 verticals", "Risk scores + AI summary", "Recommended actions", "CSV, Excel, PDF support"], cta: "Start Free", href: "/register", highlight: false },
                { name: "Pro", price: "₹999", period: "per month", features: ["Unlimited analyses", "Industry KPI benchmarking", "Benchmark comparison vs industry avg", "Cost impact estimates", "Monday morning digest email", "Annual plan: ₹8,999/year (save 25%)"], cta: "Upgrade to Pro →", href: "/pricing", highlight: true },
                { name: "Enterprise", price: "₹4,999", period: "per month", features: ["Everything in Pro", "Unlimited team members", "API access", "Priority support", "Custom industry vertical", "Annual plan: ₹39,999/year (save 33%)"], cta: "View Enterprise Plan →", href: "/pricing", highlight: false },
              ].map((plan) => (
                <div key={plan.name} className={`card ${plan.highlight ? "border-emerald-500/40 bg-emerald-500/5" : ""}`}>
                  <p className="text-xs uppercase tracking-wider text-white/40 mb-1">{plan.name}</p>
                  <div className="flex items-baseline gap-1 mb-1">
                    <span className="text-3xl font-bold">{plan.price}</span>
                    <span className="text-sm text-white/40">{plan.period}</span>
                  </div>
                  <ul className="space-y-2 mt-4 mb-5">
                    {plan.features.map((f) => (
                      <li key={f} className="flex items-start gap-2 text-sm text-white/60">
                        <span className="text-emerald-400 mt-0.5 shrink-0">✓</span>
                        {f}
                      </li>
                    ))}
                  </ul>
                  <Link href={plan.href} className={`block text-center py-2.5 rounded-xl text-sm font-medium transition-colors ${plan.highlight ? "btn" : "border border-white/15 hover:bg-white/5"}`}>
                    {plan.cta}
                  </Link>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section aria-label="FAQ" className="px-6 py-16 border-t border-white/8">
          <div className="mx-auto max-w-3xl">
            <h2 className="text-2xl font-bold mb-6">Frequently asked questions — India</h2>
            <div className="space-y-4">
              {indianFAQ.map((f) => (
                <details key={f.q} className="card cursor-pointer">
                  <summary className="font-semibold text-sm text-white/90 list-none flex items-center justify-between">
                    {f.q}<span className="text-white/30 ml-3 shrink-0">+</span>
                  </summary>
                  <p className="text-white/55 text-sm leading-relaxed mt-3">{f.a}</p>
                </details>
              ))}
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-white/8 px-6 py-10">
        <div className="mx-auto max-w-6xl">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
            <div>
              <Link href="/" className="text-base font-bold"><span className="text-emerald-400">Ops</span>Oracle AI</Link>
              <p className="mt-2 text-xs text-white/35 leading-relaxed">Vertical AI for Indian operations teams. Built in India.</p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-wider text-white/25 mb-3">Verticals</p>
              {["/logistics-ai", "/manufacturing-ai", "/warehouse-ai", "/retail-ai", "/supply-chain-ai", "/devops-ai", "/mlops-ai"].map((h) => (
                <Link key={h} href={h} className="block text-xs text-white/35 hover:text-white transition-colors mb-1.5">
                  {h.replace("/", "").replace("-", " ").replace("-ai", " AI").replace(/\b\w/g, (c) => c.toUpperCase())}
                </Link>
              ))}
            </div>
            <div>
              <p className="text-xs uppercase tracking-wider text-white/25 mb-3">Tools</p>
              {[
                ["/manufacturing-ai/oee-calculator", "OEE Calculator"],
                ["/logistics-ai/otif-calculator", "OTIF Calculator"],
                ["/devops-ai/dora-metrics-calculator", "DORA Calculator"],
              ].map(([href, label]) => (
                <Link key={href} href={href} className="block text-xs text-white/35 hover:text-white transition-colors mb-1.5">{label}</Link>
              ))}
            </div>
            <div>
              <p className="text-xs uppercase tracking-wider text-white/25 mb-3">Company</p>
              {[["/pricing", "Pricing (INR)"], ["/register", "Start Free"], ["/login", "Login"]].map(([href, label]) => (
                <Link key={href} href={href} className="block text-xs text-white/35 hover:text-white transition-colors mb-1.5">{label}</Link>
              ))}
            </div>
          </div>
          <div className="border-t border-white/8 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3">
            <p className="text-xs text-white/20">© {new Date().getFullYear()} OpsOracle AI. Made in India.</p>
            <p className="text-xs text-white/20">Logistics · Manufacturing · Warehouse · Retail · Supply Chain · DevOps · MLOps</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
