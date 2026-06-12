import type { Metadata } from "next";
import Link from "next/link";
import { PainSolver } from "@/components/PainSolver";

export const metadata: Metadata = {
  title: "Electronics Manufacturing AI — OEE, Yield Loss & Supply Chain Risk for PCB & Assembly",
  description:
    "AI-powered operations intelligence for electronics manufacturing. Analyze PCB assembly yield, component supply chain risk, OEE on SMT lines, and defect root causes. Built for contract manufacturers, EMS companies, and Apple/Samsung supplier ecosystem operations.",
  alternates: { canonical: "https://nanoneuron.ai/manufacturing-ai/electronics-manufacturing" },
  openGraph: {
    title: "Electronics Manufacturing AI — Yield Loss, OEE & Supply Chain Risk Analysis",
    description: "AI for electronics manufacturing operations. Detect PCB assembly yield drops, supplier risk on critical components, and SMT line OEE gaps before they impact shipment schedules.",
    url: "https://nanoneuron.ai/manufacturing-ai/electronics-manufacturing",
  },
  twitter: {
    card: "summary_large_image",
    title: "Electronics Manufacturing AI — PCB Assembly, Yield Loss & OEE Analysis",
    description: "AI for electronics contract manufacturing. Predict yield loss, catch supplier risk, optimize SMT line OEE. Upload production data, get analysis in 30 seconds.",
  },
};

const ELECTRONICS_PAINS = [
  {
    pain: "SMT Line 3 yield dropped from 99.1% to 93.4% overnight. No one knows why. Shipment to OEM is in 6 days.",
    signal: "SMT-L3 Yield: 99.1% → 93.4% | Defect type: Solder bridge 68% | Shift: Night | Board: PCB-A12 | Paste printer: PP-02 | Time: 11pm–3am",
    aiOutput: {
      risk: 91, label: "CRITICAL — Yield Crash, OEM Ship at Risk", color: "red" as const,
      summary: "SMT Line 3 dropped 5.7 yield points in 4 hours on PCB-A12. 68% of defects are solder bridges — the signature of paste volume inconsistency or stencil clogging. PP-02 (paste printer) is the common denominator for all affected boards. Night shift changeover at 11pm aligns with defect onset.",
      action: "Quality engineer to inspect PP-02 stencil apertures and squeegee pressure settings immediately — do not run further boards until paste inspection passes. Pull PCB-A12 units from 11pm–3am window for 100% AOI re-inspection before shipment.",
      impact: "Prevent 6.6% yield loss across remaining 2,400-unit OEM run = ₹3,96,000 in scrap and rework cost avoided",
    },
  },
  {
    pain: "IC component from Taiwan supplier has 3-week lead time. We have 5 days of stock. Production will stop.",
    signal: "IC-T77 stock: 420 units | Daily usage: 85 | Days cover: 5d | Lead time: 21d | Supplier: TaiwanSemi | OTD: 71% | Open PO: 1 (placed 12d ago)",
    aiOutput: {
      risk: 88, label: "CRITICAL — Production Stop in 5 Days", color: "red" as const,
      summary: "IC-T77 has 5 days cover against a 21-day lead time. TaiwanSemi OTD is 71% — the open PO placed 12 days ago has a 29% probability of arriving late, which would mean zero stock before replenishment. At 85 units/day, production stops day 6.",
      action: "Procurement to (1) expedite open PO via air freight today — accept 35% premium to secure arrival by day 4. (2) Check spot availability with Avnet, Arrow, or Mouser for emergency quantity. (3) Alert production planning to triage which boards use IC-T77 and prioritise OEM priority orders first.",
      impact: "Prevent production line stop worth ₹12,75,000/day; protect OEM contract delivery schedule",
    },
  },
  {
    pain: "Wave solder line OEE is at 58%. Throughput is 18% below plan. Management wants answers before the board meeting.",
    signal: "Wave Solder OEE: 58% | Availability: 71% | Performance: 84% | Quality: 97% | Top downtime: flux system 38%, conveyor jam 22% | Shift avg: all",
    aiOutput: {
      risk: 67, label: "HIGH — OEE Drag Identified", color: "yellow" as const,
      summary: "Wave solder OEE of 58% is driven almost entirely by Availability losses (71% vs 90% world-class target). Flux system failures account for 38% of downtime and conveyor jams 22% — both are preventable. Performance (84%) and Quality (97%) are acceptable. Fixing Availability alone would take OEE from 58% to 71%.",
      action: "Maintenance to (1) PM flux system fluxer nozzles and reservoir level sensor this weekend — these are the documented failure modes. (2) Inspect conveyor chain tension and guide rails on entry section. Both PMs take under 2 hours each.",
      impact: "Recover 13 OEE points = 18% throughput increase = ₹2,34,000/day additional output at current product mix",
    },
  },
];

const capabilities = [
  { kpi: "Yield loss detection", title: "PCB Assembly Yield Analysis", desc: "Score yield per line, shift, and board type. AI identifies the specific process step (paste printing, placement, reflow, wave solder) causing the yield drop — with defect type correlation to root cause." },
  { kpi: "Component supply chain", title: "Component Supply Risk Scoring", desc: "Flag every component at risk of stockout given actual (not promised) supplier lead times. AI identifies single-source ICs, long-lead passives, and packaging materials at critical path risk." },
  { kpi: "SMT line OEE", title: "SMT & Wave Solder OEE", desc: "Score Availability, Performance, and Quality per production line. AI identifies whether your OEE gap is from machine downtime, speed losses, or yield — and names the specific equipment causing the drag." },
  { kpi: "AOI & ICT defect patterns", title: "Defect Pattern Recognition", desc: "Analyse AOI, ICT, and final test failure data to surface recurring defect signatures. AI correlates defect patterns with specific materials, operators, stencil age, or environmental conditions." },
  { kpi: "OEM schedule risk", title: "Shipment Schedule Risk", desc: "Score every open customer order for on-time shipment risk given current yield, component stock, and line capacity. Flag OEM contracts at risk of missing delivery before it is too late to expedite." },
  { kpi: "EMS cost modelling", title: "Production Cost Impact Estimate", desc: "Every analysis includes cost impact — yield loss translated to scrap value, supplier delays translated to expedite premiums, OEE gaps translated to daily throughput loss in rupees." },
];

const metrics = [
  { value: "< 30s", label: "Analysis per production report" },
  { value: "99%+", label: "Target yield for electronics" },
  { value: "6 engines", label: "Calibrated for EMS / PCBA" },
  { value: "Free", label: "No credit card to start" },
];

const faqJsonLd = {
  "@context": "https://schema.org", "@type": "FAQPage",
  mainEntity: [
    { "@type": "Question", name: "How does AI help electronics manufacturing operations?", acceptedAnswer: { "@type": "Answer", text: "AI analyzes your production data to detect yield drops before they impact shipment schedules, flags component supply chain risks before production stops, and identifies OEE losses on SMT and wave solder lines before they accumulate. OpsOracle reads your shift reports, AOI data, and inventory exports to give you specific root cause diagnosis and recommended actions in under 30 seconds." } },
    { "@type": "Question", name: "What is a good OEE for electronics manufacturing?", acceptedAnswer: { "@type": "Answer", text: "World-class OEE for electronics manufacturing (SMT assembly) is 85% or higher. High-volume electronics manufacturers typically target 80-90% OEE on automated SMT lines. Wave solder and through-hole lines often run at 65-75% OEE due to higher changeover frequency. Any SMT line below 70% OEE has significant improvement potential — usually in Availability (downtime reduction) rather than Performance or Quality." } },
    { "@type": "Question", name: "What causes yield loss in PCB assembly?", acceptedAnswer: { "@type": "Answer", text: "The most common causes of PCB assembly yield loss are: solder paste volume inconsistency (stencil clogging, squeegee wear), component placement offset (feeder calibration, vision system issues), reflow profile deviation (temperature zone drift), and incoming component quality issues (lead coplanarity, oxidation). AI analysis of your AOI defect data can identify which of these root causes is responsible for a specific yield drop." } },
    { "@type": "Question", name: "How can AI reduce electronics component supply chain risk?", acceptedAnswer: { "@type": "Answer", text: "OpsOracle calculates days-of-cover per component against actual supplier lead times (not promised lead times) and flags components that will hit zero before the next confirmed delivery. It scores each supplier's on-time delivery rate and identifies single-source dependencies on critical path ICs or passives — so procurement can expedite or dual-source before production is affected." } },
    { "@type": "Question", name: "Is OpsOracle AI suitable for Apple and Samsung supplier ecosystem manufacturers?", acceptedAnswer: { "@type": "Answer", text: "Yes. OpsOracle is designed for high-precision electronics manufacturing operations including PCB assembly, final assembly, and EMS/contract manufacturing environments. It is used by manufacturers supplying global OEMs across India, including those operating under Apple PLI scheme requirements and Samsung supplier quality standards." } },
  ],
};

const breadcrumbJsonLd = {
  "@context": "https://schema.org", "@type": "BreadcrumbList",
  itemListElement: [
    { "@type": "ListItem", position: 1, name: "Home", item: "https://nanoneuron.ai" },
    { "@type": "ListItem", position: 2, name: "Manufacturing AI", item: "https://nanoneuron.ai/manufacturing-ai" },
    { "@type": "ListItem", position: 3, name: "Electronics Manufacturing", item: "https://nanoneuron.ai/manufacturing-ai/electronics-manufacturing" },
  ],
};

const targetOperations = [
  "PCB & PCBA contract manufacturers", "EMS (Electronics Manufacturing Services)",
  "Apple PLI scheme manufacturers (India)", "Samsung & global OEM supplier factories",
  "Semiconductor packaging & test facilities", "Consumer electronics assembly plants",
];

export default function ElectronicsManufacturingPage() {
  return (
    <div className="min-h-screen bg-zinc-950 text-white">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }} />

      <header>
        <nav aria-label="Main navigation" className="fixed top-0 left-0 right-0 z-50 border-b border-white/8 bg-zinc-950/80 backdrop-blur-md">
          <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
            <Link href="/" className="text-lg font-bold tracking-tight"><span className="text-emerald-400">Ops</span>Oracle AI</Link>
            <div className="flex items-center gap-4">
              <Link href="/manufacturing-ai" className="text-sm text-white/60 hover:text-white transition-colors">Manufacturing AI</Link>
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
              <Link href="/manufacturing-ai" className="hover:text-white transition-colors">Manufacturing AI</Link>
              <span>/</span>
              <span className="text-white/60">Electronics Manufacturing</span>
            </nav>
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-4 py-1.5 text-sm text-emerald-400">
              <span aria-hidden="true" className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
              Electronics Manufacturing & PCB Assembly
            </div>
            <h1 className="text-5xl font-bold md:text-6xl leading-tight tracking-tight">
              AI for electronics manufacturing —<br />
              <span className="text-emerald-400">yield, OEE, and supply chain risk.</span>
            </h1>
            <p className="mx-auto mt-8 max-w-2xl text-lg text-white/60 leading-relaxed">
              Upload SMT production reports, AOI defect logs, or component inventory exports.
              OpsOracle AI identifies yield drop root causes, flags component supply chain risk
              before production stops, and diagnoses OEE losses on your assembly lines — in under 30 seconds.
            </p>
            <div className="mt-10 flex flex-col sm:flex-row justify-center gap-4">
              <Link href="/register" className="btn text-base px-8 py-4">Analyze Your Production Data Free</Link>
              <Link href="/manufacturing-ai" className="rounded-xl border border-white/15 px-8 py-4 text-base hover:bg-white/5 transition-colors">All Manufacturing Features</Link>
            </div>
          </div>
        </section>

        <section aria-label="Target operations" className="px-6 pb-16">
          <div className="mx-auto max-w-5xl">
            <p className="text-xs uppercase tracking-widest text-white/30 text-center mb-6">Built for</p>
            <div className="flex flex-wrap justify-center gap-3">
              {targetOperations.map((b) => (
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
              <p className="text-sm uppercase tracking-widest text-emerald-400/70 mb-3">Electronics Manufacturing AI</p>
              <h2 className="text-3xl md:text-4xl font-bold">Built for PCB assembly and EMS operations</h2>
              <p className="mt-4 text-white/50 max-w-xl mx-auto">
                Not a generic manufacturing tool. Every engine is calibrated on electronics-specific signals — solder defect patterns, SMT line OEE, IC supply lead times, OEM schedule risk.
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

        <PainSolver pains={ELECTRONICS_PAINS} industry="Electronics Manufacturing" />

        <section aria-label="Get started" className="px-6 py-24 border-t border-white/8">
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="text-4xl font-bold mb-6">Stop discovering yield loss after the OEM ship date has passed.</h2>
            <p className="text-white/55 text-lg mb-10">
              Upload your production report now — OpsOracle AI returns yield root cause analysis, component risk flags and OEE diagnosis in seconds.
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
            <Link href="/manufacturing-ai" className="hover:text-white transition-colors">Manufacturing AI</Link>
            <Link href="/supply-chain-ai" className="hover:text-white transition-colors">Supply Chain AI</Link>
            <Link href="/manufacturing-ai/oee-calculator" className="hover:text-white transition-colors">OEE Calculator</Link>
            <Link href="/pricing" className="hover:text-white transition-colors">Pricing</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
