import type { Metadata } from "next";
import Link from "next/link";
import Nav from "@/components/Nav";

export const metadata: Metadata = {
  title: "What is OTIF? On-Time In-Full Explained — Formula, Benchmark, How to Improve",
  description:
    "OTIF (On-Time In-Full) measures what % of orders are delivered on time and complete. World-class OTIF: ≥ 95%. Learn the formula, benchmarks, and how AI improves OTIF.",
  alternates: { canonical: "https://nanoneuron.ai/guides/what-is-otif" },
  openGraph: {
    title: "What is OTIF? On-Time In-Full Explained — Formula, Benchmark, How to Improve",
    description:
      "OTIF measures what % of orders are delivered on time and complete. World-class OTIF: ≥ 95%. Formula, benchmarks, and improvement strategies.",
    url: "https://nanoneuron.ai/guides/what-is-otif",
  },
  twitter: {
    card: "summary_large_image",
    title: "What is OTIF? Complete Guide — Formula, Benchmarks, Improvement",
    description:
      "OTIF (On-Time In-Full): the definitive guide. Formula, industry benchmarks, and 5 proven ways to improve your rate.",
  },
};

const faqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    {
      "@type": "Question",
      name: "What does OTIF stand for?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "OTIF stands for On-Time In-Full. It is a supply chain KPI that measures the percentage of customer orders that are delivered both on time (by the agreed delivery date) and in full (complete, without short-shipment, damage, or substitution). A shipment must satisfy both conditions to count as an OTIF success. Failure on either criterion — late but complete, or on-time but short — is an OTIF miss.",
      },
    },
    {
      "@type": "Question",
      name: "What is the OTIF formula?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "OTIF % = (Orders delivered on time AND in full ÷ Total orders) × 100. For example, if you shipped 1,000 orders and 930 were both on time and in full, your OTIF is 93%. The key distinction from simpler metrics is the AND condition — both criteria must be satisfied simultaneously for the shipment to count as OTIF compliant.",
      },
    },
    {
      "@type": "Question",
      name: "What is a good OTIF rate by industry?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "World-class OTIF is ≥ 95% across most industries. For grocery and FMCG, top 3PLs target 97–99%. For general retail distribution, 95%+ is world-class and 85–94% is above average. For industrial B2B, 90%+ is considered strong given longer, more complex supply chains. E-commerce last-mile typically targets 95%+ on-time delivery. Major retailers like Walmart and Amazon impose financial chargebacks on suppliers who fall below 95% OTIF consistently.",
      },
    },
    {
      "@type": "Question",
      name: "What causes OTIF failures?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "OTIF failures fall into two categories. Late delivery causes: carrier delays, weather events, incorrect routing, depot dwell time, customs clearance delays, missed collection slots. In-full failures: stockouts at dispatch, picking errors, quality rejects at packing, damage in transit, partial loads due to vehicle constraints. Statistically, carrier performance and stockouts are the most common root causes. AI analysis of OTIF failure data typically finds that 20% of carriers or routes cause 80% of delays.",
      },
    },
    {
      "@type": "Question",
      name: "How does AI improve OTIF performance?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "AI improves OTIF by predicting failures before they happen. Machine learning models trained on historical shipment data, weather forecasts, carrier performance, and demand signals can identify which specific shipments are at risk of late delivery or short-shipment 24–72 hours in advance. This gives operations teams time to intervene: reroute, upgrade carrier service, expedite picking, or proactively communicate to customers. OpsOracle AI analyses shipment patterns to surface the specific carriers, corridors, and product categories responsible for the majority of OTIF misses.",
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
      name: "What is OTIF",
      item: "https://nanoneuron.ai/guides/what-is-otif",
    },
  ],
};

export default function WhatIsOTIFPage() {
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
            <Link href="/guides" className="hover:text-white transition-colors">Guides</Link>
            <span>/</span>
            <span className="text-white/60">What is OTIF</span>
          </nav>

          <div className="mb-12">
            <p className="text-xs uppercase tracking-widest text-emerald-400/70 mb-3">Supply Chain Guide</p>
            <h1 className="text-4xl md:text-5xl font-bold mb-5 leading-tight">
              What is OTIF? On-Time In-Full Explained
            </h1>
            <p className="text-white/55 text-lg leading-relaxed">
              OTIF (On-Time In-Full) is the definitive measure of logistics execution quality.
              World-class operations achieve 95%+. This guide covers the formula, industry
              benchmarks, root causes of failure, and how AI is changing the way teams improve it.
            </p>
          </div>

          <div className="space-y-12">
            <section>
              <h2 className="text-2xl font-bold mb-4">What is OTIF?</h2>
              <p className="text-white/60 leading-relaxed mb-4">
                OTIF stands for <strong className="text-white">On-Time In-Full</strong>. It measures
                the percentage of customer orders that are delivered both on schedule and complete —
                no short-shipments, no damage, no substitutions.
              </p>
              <p className="text-white/60 leading-relaxed">
                Unlike simpler metrics such as &ldquo;on-time delivery rate,&rdquo; OTIF requires
                both conditions to be true simultaneously. A shipment that arrives on time but is
                missing 3 of 10 ordered cases is an OTIF failure. A shipment that is complete but
                arrives one day late is also an OTIF failure.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4">OTIF Formula</h2>
              <div className="border border-white/10 bg-white/3 rounded-2xl p-6 mb-4">
                <div className="rounded-xl bg-white/4 border border-white/8 p-4 font-mono text-sm text-emerald-400">
                  OTIF % = (Orders on time AND in full ÷ Total orders) × 100
                </div>
              </div>
              <p className="text-white/60 leading-relaxed">
                Calculate OTIF by dividing the count of shipments that satisfied both the on-time
                and in-full criteria by the total number of shipments in the period, then multiplying
                by 100. Measure it weekly for operational visibility, monthly for strategic reviews.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4">OTIF Benchmarks by Industry</h2>
              <div className="border border-white/10 bg-white/3 rounded-2xl p-6">
                <div className="space-y-3">
                  {[
                    { industry: "Grocery / FMCG", worldClass: "97–99%", average: "88–93%" },
                    { industry: "General Retail", worldClass: "95–97%", average: "82–90%" },
                    { industry: "E-commerce", worldClass: "95–98%", average: "85–92%" },
                    { industry: "Pharma / Healthcare", worldClass: "98–99%", average: "90–95%" },
                    { industry: "Industrial B2B", worldClass: "90–95%", average: "78–86%" },
                    { industry: "3PL / Logistics", worldClass: "95–97%", average: "84–92%" },
                  ].map((row) => (
                    <div key={row.industry} className="flex items-center gap-4 text-sm">
                      <span className="w-44 shrink-0 text-white/70">{row.industry}</span>
                      <span className="text-emerald-400 font-mono w-20 shrink-0">{row.worldClass}</span>
                      <span className="text-white/40 font-mono">{row.average}</span>
                    </div>
                  ))}
                  <div className="flex gap-4 text-xs text-white/30 pt-2 border-t border-white/10">
                    <span className="w-44 shrink-0" />
                    <span className="text-emerald-400/60 w-20 shrink-0">World Class</span>
                    <span>Industry Average</span>
                  </div>
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4">Why OTIF Matters</h2>
              <p className="text-white/60 leading-relaxed mb-4">
                Poor OTIF has compounding business consequences beyond the immediate shipment:
              </p>
              <ul className="space-y-3">
                {[
                  "Retailer and marketplace chargebacks — Walmart, Amazon, and major retailers impose financial penalties of 1–3% of invoice value for OTIF failures below their supplier SLA thresholds.",
                  "Customer churn — B2B customers experiencing repeated delivery failures have 3–5x higher churn rates than those receiving consistent on-time deliveries.",
                  "Lost shelf availability — in retail, an out-of-stock caused by an OTIF failure costs an average of 4.1% in lost sales at that location during the stockout period.",
                  "Emergency freight costs — teams compensating for OTIF failures often resort to air freight or express services, which can cost 5–10x standard ocean rates.",
                  "Customer service overload — OTIF failures drive inbound enquiries, claims, and escalation management that consume significant operations resource.",
                ].map((point) => (
                  <li key={point} className="flex gap-3 text-white/60 text-sm leading-relaxed">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 mt-1.5 shrink-0" />
                    {point}
                  </li>
                ))}
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4">5 Ways to Improve OTIF</h2>
              <div className="space-y-4">
                {[
                  {
                    num: "01",
                    title: "Diagnose failures by carrier and corridor first",
                    body: "Before implementing any change, analyse your OTIF failure data to understand whether failures are coming from late delivery or short-shipments — and which specific carriers, routes, or product categories are responsible. In most operations, 3–5 carriers or lanes account for 70%+ of all delays.",
                  },
                  {
                    num: "02",
                    title: "Fix inventory availability at dispatch",
                    body: "If short-shipments are the primary OTIF failure mode, the root cause is typically stockouts or inaccurate inventory records. Implement cycle counting, improve safety stock calculations, and set up real-time inventory visibility across your distribution network.",
                  },
                  {
                    num: "03",
                    title: "Carrier diversification and performance management",
                    body: "Single-carrier dependency is a concentration risk. Introduce a secondary carrier on your highest-volume lanes and use performance data to route shipments to carriers with demonstrated on-time reliability on each corridor.",
                  },
                  {
                    num: "04",
                    title: "Real-time shipment visibility",
                    body: "You cannot manage what you cannot see. Implement GPS or event-based shipment tracking to get departure confirmations, transit milestones, and ETA updates. Early warning of a delayed shipment gives you 24–48 hours to intervene or communicate to the customer.",
                  },
                  {
                    num: "05",
                    title: "Optimise safety stock for critical SKUs",
                    body: "Many OTIF in-full failures trace back to insufficient safety stock on fast-moving or high-variability SKUs. Use the safety stock formula with accurate demand standard deviation and lead time data. AI-powered inventory optimisation can reduce safety stock requirements by 15–30% while improving fill rates.",
                  },
                ].map((item) => (
                  <div key={item.num} className="border border-white/10 bg-white/3 rounded-2xl p-6">
                    <div className="flex gap-4">
                      <span className="text-2xl font-bold text-emerald-500/30 font-mono shrink-0">{item.num}</span>
                      <div>
                        <h3 className="font-semibold text-base mb-2">{item.title}</h3>
                        <p className="text-white/55 text-sm leading-relaxed">{item.body}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4">How AI Helps Improve OTIF</h2>
              <p className="text-white/60 leading-relaxed mb-4">
                Traditional OTIF management is reactive: you discover a failure after the delivery
                window has passed. AI transforms OTIF management from reactive to predictive.
              </p>
              <p className="text-white/60 leading-relaxed mb-4">
                Machine learning models trained on historical shipment data, carrier performance,
                weather, and demand patterns can predict which specific in-transit shipments are at
                risk of late delivery up to 72 hours before the expected delivery date. This advance
                warning window allows teams to reroute, expedite, communicate proactively, and
                prevent the OTIF failure before it occurs.
              </p>
              <p className="text-white/60 leading-relaxed">
                AI also automates OTIF root-cause analysis — surfacing which carriers, depots,
                corridors, and product categories contribute most to failures — a task that
                previously required manual data analysis over days or weeks.
              </p>
            </section>

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
              <h2 className="text-xl font-bold mb-3">Calculate your OTIF rate now</h2>
              <p className="text-white/55 text-sm max-w-lg mx-auto mb-6">
                Use our free OTIF calculator to measure your current performance, then try
                OpsOracle AI to identify exactly which carriers and routes are responsible for
                your failures.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                <Link
                  href="/logistics-ai/otif-calculator"
                  className="bg-emerald-500 hover:bg-emerald-400 text-black font-semibold text-sm px-6 py-3 rounded-xl transition-colors"
                >
                  Free OTIF Calculator
                </Link>
                <Link
                  href="/register"
                  className="border border-white/20 hover:border-white/40 text-white/70 hover:text-white font-semibold text-sm px-6 py-3 rounded-xl transition-colors"
                >
                  Try OpsOracle AI
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
            <Link href="/logistics-ai/otif-calculator" className="hover:text-white transition-colors">OTIF Calculator</Link>
            <Link href="/guides/supply-chain-kpis" className="hover:text-white transition-colors">Supply Chain KPIs</Link>
            <Link href="/guides/reduce-logistics-delays" className="hover:text-white transition-colors">Reduce Delays</Link>
            <Link href="/pricing" className="hover:text-white transition-colors">Pricing</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
