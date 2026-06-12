import type { Metadata } from "next";
import Link from "next/link";
import DORACalculator from "./DORACalculator";

export const metadata: Metadata = {
  title: "DORA Metrics Calculator — Find Your DevOps Performance Tier Free",
  description:
    "Calculate your DORA metrics tier (Elite, High, Medium, Low) instantly. Enter deployment frequency, lead time for changes, change failure rate, and MTTR — get your DevOps performance score with benchmarks. Free tool.",
  alternates: { canonical: "https://nanoneuron.ai/devops-ai/dora-metrics-calculator" },
  openGraph: {
    title: "DORA Metrics Calculator — DevOps Performance Tier (Elite/High/Medium/Low)",
    description: "Find your DORA tier in 30 seconds. Enter deployment frequency, change failure rate, MTTR and lead time — see if your DevOps team is Elite, High, Medium or Low.",
    url: "https://nanoneuron.ai/devops-ai/dora-metrics-calculator",
  },
  twitter: {
    card: "summary_large_image",
    title: "DORA Metrics Calculator — Find Your DevOps Tier",
    description: "Calculate your DORA performance tier. Are you Elite, High, Medium, or Low? Free tool for DevOps and SRE teams.",
  },
};

const faqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    {
      "@type": "Question",
      name: "What are DORA metrics?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "DORA metrics (from the DevOps Research and Assessment program) are four key measures of software delivery performance: Deployment Frequency (how often you deploy to production), Lead Time for Changes (time from code commit to production), Change Failure Rate (percentage of deployments causing an incident), and Mean Time to Recovery / MTTR (how long to restore service after an incident). They are used to benchmark DevOps team performance as Elite, High, Medium, or Low.",
      },
    },
    {
      "@type": "Question",
      name: "What is DORA Elite performance?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "DORA Elite performers deploy multiple times per day, have a lead time for changes under one hour, maintain a change failure rate below 5%, and recover from incidents in under one hour (MTTR < 60 minutes). Elite teams represent the top 10% of DevOps performance globally and are most common at high-maturity technology companies.",
      },
    },
    {
      "@type": "Question",
      name: "What is a good change failure rate?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "DORA Elite teams have a change failure rate below 5%, meaning fewer than 5% of their deployments cause an incident or require rollback. DORA High performers are below 15%. A change failure rate above 30% is classified as Low (DORA's lowest tier) and indicates that deployments are creating more incidents than they deliver value.",
      },
    },
    {
      "@type": "Question",
      name: "What is a good MTTR for DevOps?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "DORA Elite teams restore service in under one hour (MTTR < 60 minutes). DORA High performers recover within one day. DORA Medium teams recover within one week. MTTR above one week is classified as Low. MTTR is often the easiest DORA metric to improve — better monitoring, runbooks, and on-call processes can cut MTTR significantly without code changes.",
      },
    },
    {
      "@type": "Question",
      name: "How do I improve my DORA metrics?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Start by identifying which of the four DORA metrics is lowest, then focus improvement efforts there. High change failure rate: add canary deployments and better test coverage for your most unstable services. High MTTR: improve alerting and runbooks. Long lead time: remove manual approval gates and improve CI speed. Low deployment frequency is usually caused by one of the other three — fix those first.",
      },
    },
  ],
};

const breadcrumbJsonLd = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: [
    { "@type": "ListItem", position: 1, name: "Home", item: "https://nanoneuron.ai" },
    { "@type": "ListItem", position: 2, name: "DevOps AI", item: "https://nanoneuron.ai/devops-ai" },
    { "@type": "ListItem", position: 3, name: "DORA Metrics Calculator", item: "https://nanoneuron.ai/devops-ai/dora-metrics-calculator" },
  ],
};

const doraTable = [
  { metric: "Deployment Frequency", elite: "Multiple/day", high: "Once/day–week", medium: "Once/week–month", low: "< Once/month" },
  { metric: "Lead Time for Changes", elite: "< 1 hour", high: "1 day – 1 week", medium: "1 week – 1 month", low: "> 1 month" },
  { metric: "Change Failure Rate", elite: "< 5%", high: "< 15%", medium: "< 30%", low: "> 30%" },
  { metric: "MTTR", elite: "< 1 hour", high: "< 1 day", medium: "< 1 week", low: "> 1 week" },
];

export default function DORACalculatorPage() {
  return (
    <div className="min-h-screen bg-zinc-950 text-white">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }} />

      <header>
        <nav aria-label="Main navigation" className="fixed top-0 left-0 right-0 z-50 border-b border-white/8 bg-zinc-950/80 backdrop-blur-md">
          <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
            <Link href="/" className="text-lg font-bold tracking-tight">
              <span className="text-emerald-400">Ops</span>Oracle AI
            </Link>
            <div className="flex items-center gap-4">
              <Link href="/devops-ai" className="text-sm text-white/60 hover:text-white transition-colors">DevOps AI</Link>
              <Link href="/register" className="btn text-sm py-2 px-5">Try Free</Link>
            </div>
          </div>
        </nav>
      </header>

      <main id="main-content" className="pt-28 pb-24 px-6">
        <div className="mx-auto max-w-3xl">
          <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-xs text-white/30 mb-8">
            <Link href="/" className="hover:text-white transition-colors">Home</Link>
            <span>/</span>
            <Link href="/devops-ai" className="hover:text-white transition-colors">DevOps AI</Link>
            <span>/</span>
            <span className="text-white/60">DORA Metrics Calculator</span>
          </nav>

          <div className="text-center mb-12">
            <p className="text-xs uppercase tracking-widest text-emerald-400/70 mb-3">Free Tool</p>
            <h1 className="text-4xl md:text-5xl font-bold mb-4">DORA Metrics Calculator</h1>
            <p className="text-white/55 text-lg max-w-2xl mx-auto">
              Find your DevOps performance tier in 30 seconds. Enter your four DORA metrics and see whether your team is Elite, High, Medium, or Low — with specific improvement targets.
            </p>
          </div>

          <DORACalculator />

          <section className="mt-20">
            <h2 className="text-2xl font-bold mb-6">DORA metrics benchmarks — the full table</h2>

            <div className="rounded-2xl border border-white/10 overflow-hidden mb-8">
              <div className="grid grid-cols-5 text-xs text-white/40 uppercase tracking-wider bg-white/3 px-4 py-3 border-b border-white/8">
                <span className="col-span-2">Metric</span>
                <span className="text-emerald-400">Elite</span>
                <span className="text-blue-400">High</span>
                <span className="text-amber-400">Medium</span>
              </div>
              {doraTable.map((row, i) => (
                <div key={row.metric} className={`grid grid-cols-5 text-xs px-4 py-3 ${i % 2 === 0 ? "bg-white/2" : ""} border-b border-white/5 last:border-0`}>
                  <span className="col-span-2 text-white/70 font-medium self-center">{row.metric}</span>
                  <span className="text-emerald-400/80 font-mono self-center">{row.elite}</span>
                  <span className="text-blue-400/80 font-mono self-center">{row.high}</span>
                  <span className="text-amber-400/80 font-mono self-center">{row.medium}</span>
                </div>
              ))}
            </div>

            <h2 className="text-2xl font-bold mb-4 mt-12">Frequently asked questions about DORA metrics</h2>
            <div className="space-y-4">
              {faqJsonLd.mainEntity.map((q) => (
                <details key={q.name} className="card cursor-pointer">
                  <summary className="font-semibold text-sm text-white/90 list-none flex items-center justify-between">
                    {q.name}
                    <span className="text-white/30 ml-3 shrink-0">+</span>
                  </summary>
                  <p className="text-white/55 text-sm leading-relaxed mt-3">{q.acceptedAnswer.text}</p>
                </details>
              ))}
            </div>
          </section>
        </div>
      </main>

      <footer className="border-t border-white/8 px-6 py-8">
        <div className="mx-auto max-w-6xl flex flex-col sm:flex-row items-center justify-between gap-4">
          <Link href="/" className="text-sm font-semibold"><span className="text-emerald-400">Ops</span>Oracle AI</Link>
          <div className="flex gap-5 text-sm text-white/40">
            <Link href="/devops-ai" className="hover:text-white transition-colors">DevOps AI</Link>
            <Link href="/manufacturing-ai/oee-calculator" className="hover:text-white transition-colors">OEE Calculator</Link>
            <Link href="/logistics-ai/otif-calculator" className="hover:text-white transition-colors">OTIF Calculator</Link>
            <Link href="/pricing" className="hover:text-white transition-colors">Pricing</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
