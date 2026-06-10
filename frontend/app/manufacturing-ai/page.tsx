import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Manufacturing AI — OEE Analysis, Downtime Prediction & Production Risk",
  description:
    "AI-powered manufacturing intelligence. Upload shift reports, maintenance logs or production CSVs to get OEE risk scores, downtime root cause analysis and throughput bottleneck detection instantly.",
  alternates: { canonical: "https://nanoneuron.ai/manufacturing-ai" },
  openGraph: {
    title: "Manufacturing AI — OEE & Production Risk Analysis",
    description:
      "Predict equipment downtime and production bottlenecks before they stop your line. OpsOracle AI analyzes shift reports and maintenance logs in under 30 seconds.",
    url: "https://nanoneuron.ai/manufacturing-ai",
  },
};

const capabilities = [
  {
    title: "OEE & Throughput Risk Scoring",
    desc: "Score your production data against OEE targets. AI flags availability losses, performance gaps and quality defects dragging your output below plan.",
    kpi: "Protect production targets",
  },
  {
    title: "Downtime Root Cause Detection",
    desc: "Parse maintenance logs and shift reports to surface recurring failure patterns, MTBF trends and high-risk equipment before unplanned stops cascade.",
    kpi: "Cut unplanned downtime",
  },
  {
    title: "Shift Bottleneck Analysis",
    desc: "Identify which workstations, cells or shifts create the constraint. AI traces throughput restrictions to specific lines and suggests rebalancing actions.",
    kpi: "Maximize line throughput",
  },
  {
    title: "Quality & Scrap Rate Prediction",
    desc: "Detect early defect signals in production data before scrap accumulates. Flag shifts or machines drifting outside quality spec with cost impact estimates.",
    kpi: "Reduce scrap costs",
  },
  {
    title: "Maintenance Schedule Optimization",
    desc: "AI reads PM schedules and actual downtime to identify over-maintained and under-maintained assets — optimize spend without increasing risk.",
    kpi: "Lower maintenance OPEX",
  },
  {
    title: "Production Cost Impact Estimate",
    desc: "Every analysis includes a USD cost impact — translating OEE gaps and downtime risks into financial losses so you can prioritize with numbers.",
    kpi: "Quantify every improvement",
  },
];

const metrics = [
  { value: "< 30s", label: "Analysis time per shift report" },
  { value: "OEE", label: "Availability, Performance, Quality" },
  { value: "6 engines", label: "Calibrated for manufacturing" },
  { value: "Free", label: "No credit card to start" },
];

export default function ManufacturingAI() {
  return (
    <div className="min-h-screen bg-zinc-950 text-white">
      <nav className="fixed top-0 left-0 right-0 z-50 border-b border-white/8 bg-zinc-950/80 backdrop-blur-md">
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

      <section className="pt-32 pb-20 px-6">
        <div className="mx-auto max-w-5xl text-center">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-4 py-1.5 text-sm text-emerald-400">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
            Manufacturing & Plant Operations
          </div>
          <h1 className="text-5xl font-bold md:text-6xl leading-tight tracking-tight">
            AI that detects production<br />
            <span className="text-emerald-400">risks before they stop the line.</span>
          </h1>
          <p className="mx-auto mt-8 max-w-2xl text-lg text-white/60 leading-relaxed">
            Upload shift reports, maintenance logs or production CSVs. OpsOracle AI
            scores OEE risk, detects downtime patterns, flags throughput bottlenecks
            and estimates financial impact — in under 30 seconds.
          </p>
          <div className="mt-10 flex flex-col sm:flex-row justify-center gap-4">
            <Link href="/register" className="btn text-base px-8 py-4">Analyze Your Production Data Free</Link>
            <Link href="/" className="rounded-xl border border-white/15 px-8 py-4 text-base hover:bg-white/5 transition-colors">
              View All Features
            </Link>
          </div>
        </div>
      </section>

      <section className="px-6 pb-16">
        <div className="mx-auto max-w-5xl grid grid-cols-2 md:grid-cols-4 gap-4">
          {metrics.map((m) => (
            <div key={m.label} className="card text-center">
              <div className="text-3xl font-bold text-emerald-400">{m.value}</div>
              <div className="mt-1 text-sm text-white/50">{m.label}</div>
            </div>
          ))}
        </div>
      </section>

      <section className="px-6 py-20 border-t border-white/8">
        <div className="mx-auto max-w-5xl">
          <div className="text-center mb-14">
            <p className="text-sm uppercase tracking-widest text-emerald-400/70 mb-3">Manufacturing AI Capabilities</p>
            <h2 className="text-3xl md:text-4xl font-bold">Built for plant managers and ops engineers</h2>
            <p className="mt-4 text-white/50 max-w-xl mx-auto">
              Not a generic AI. Every engine is calibrated on manufacturing-specific signals — OEE components, MTBF patterns, shift variability.
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

      <section className="px-6 py-20 border-t border-white/8">
        <div className="mx-auto max-w-5xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold">How plant teams use OpsOracle AI</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              { step: "01", title: "Upload your shift report", desc: "Drag your production CSV, maintenance log or shift summary. OpsOracle reads any column layout — no formatting required." },
              { step: "02", title: "AI scores OEE risk", desc: "Availability, performance and quality components scored against target. Downtime root causes and bottleneck cells identified automatically." },
              { step: "03", title: "Act before production stops", desc: "Executive summary + 3 specific maintenance or scheduling actions delivered in under 30 seconds. Ready to share with the plant floor." },
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

      <section className="px-6 py-24 border-t border-white/8">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="text-4xl font-bold mb-6">Stop finding out about downtime after the shift is over.</h2>
          <p className="text-white/55 text-lg mb-10">
            Upload your production report now — OpsOracle AI returns OEE risk scores, bottleneck analysis and cost impact in seconds.
          </p>
          <Link href="/register" className="btn text-base px-10 py-4 inline-block">
            Start Analyzing Free
          </Link>
        </div>
      </section>

      <footer className="border-t border-white/8 px-6 py-10">
        <div className="mx-auto max-w-6xl flex flex-col sm:flex-row items-center justify-between gap-4">
          <Link href="/" className="text-sm font-semibold">
            <span className="text-emerald-400">Ops</span>Oracle AI
          </Link>
          <p className="text-sm text-white/30">© {new Date().getFullYear()} OpsOracle AI. All rights reserved.</p>
          <div className="flex gap-6 text-sm text-white/40">
            <Link href="/logistics-ai" className="hover:text-white transition-colors">Logistics AI</Link>
            <Link href="/warehouse-ai" className="hover:text-white transition-colors">Warehouse AI</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
