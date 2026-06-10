import Link from "next/link";

const features = [
  {
    icon: "📦",
    title: "Shipment Delay Detection",
    desc: "Upload logistics CSV/Excel and get delay probability scored for every shipment line — instantly.",
  },
  {
    icon: "🏭",
    title: "Inventory Risk Alerts",
    desc: "Catch stockout patterns, slow-moving SKUs, and reorder gaps before they stop production.",
  },
  {
    icon: "📊",
    title: "Executive AI Summary",
    desc: "Auto-generated PDF-ready report your ops team and C-suite can act on today — no analyst needed.",
  },
  {
    icon: "🚛",
    title: "Logistics Intelligence",
    desc: "Route cost analysis, carrier performance ranking, and SLA breach prediction from raw dispatch data.",
  },
  {
    icon: "⚙️",
    title: "Manufacturing Diagnostics",
    desc: "Parse shift reports and maintenance logs to surface downtime drivers and throughput bottlenecks.",
  },
  {
    icon: "🔮",
    title: "Predictive Forecasting",
    desc: "AI demand signals trained on your historical ops data — not generic models, your data, your patterns.",
  },
];

const steps = [
  { num: "01", title: "Upload your report", desc: "CSV, Excel, or PDF — any format your team already uses." },
  { num: "02", title: "AI analyzes instantly", desc: "Vertical AI reads every row, flags anomalies, and scores industry-specific risks in seconds." },
  { num: "03", title: "Act on insights", desc: "Clear recommendations delivered — no data science background required." },
];

const stats = [
  { value: "< 30s", label: "Average analysis time" },
  { value: "3 formats", label: "CSV, Excel, PDF" },
  { value: "6 AI engines", label: "Specialized for ops" },
  { value: "Free to start", label: "No credit card" },
];

export default function Home() {
  return (
    <div className="min-h-screen bg-zinc-950 text-white">
      {/* Navbar */}
      <nav className="fixed top-0 left-0 right-0 z-50 border-b border-white/8 bg-zinc-950/80 backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <span className="text-lg font-bold tracking-tight">
            <span className="text-emerald-400">Ops</span>Oracle AI
          </span>
          <div className="flex items-center gap-4">
            <Link href="/login" className="text-sm text-white/60 hover:text-white transition-colors">
              Login
            </Link>
            <Link href="/register" className="btn text-sm py-2 px-5">
              Get Started Free
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="pt-32 pb-24 px-6">
        <div className="mx-auto max-w-5xl text-center">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-4 py-1.5 text-sm text-emerald-400">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
            Vertical AI for Industrial Operations
          </div>
          <h1 className="text-5xl font-bold md:text-7xl leading-[1.08] tracking-tight">
            Predict operational<br />
            <span className="text-emerald-400">problems</span> before they<br />
            become expensive.
          </h1>
          <p className="mx-auto mt-8 max-w-2xl text-lg text-white/60 leading-relaxed">
            Upload your logistics, warehouse, or manufacturing reports. OpsOracle AI
            detects delays, bottlenecks, and inventory risks — and delivers executive-ready
            insights in under 30 seconds.
          </p>
          <div className="mt-10 flex flex-col sm:flex-row justify-center gap-4">
            <Link href="/register" className="btn text-base px-8 py-4">
              Start Free — No Card Required
            </Link>
            <Link
              href="/login"
              className="rounded-xl border border-white/15 px-8 py-4 text-base hover:bg-white/5 transition-colors"
            >
              Sign In
            </Link>
          </div>
          <p className="mt-4 text-sm text-white/30">Upload your first report in 60 seconds.</p>
        </div>
      </section>

      {/* Stats */}
      <section className="px-6 pb-20">
        <div className="mx-auto max-w-5xl grid grid-cols-2 md:grid-cols-4 gap-4">
          {stats.map((s) => (
            <div key={s.label} className="card text-center">
              <div className="text-3xl font-bold text-emerald-400">{s.value}</div>
              <div className="mt-1 text-sm text-white/50">{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section className="px-6 py-20 border-t border-white/8">
        <div className="mx-auto max-w-5xl">
          <div className="text-center mb-14">
            <p className="text-sm uppercase tracking-widest text-emerald-400/70 mb-3">How it works</p>
            <h2 className="text-3xl md:text-4xl font-bold">Three steps to operational clarity</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {steps.map((s) => (
              <div key={s.num} className="card relative overflow-hidden">
                <div className="text-6xl font-bold text-white/5 absolute -top-2 -right-2 select-none">
                  {s.num}
                </div>
                <div className="text-emerald-400 text-sm font-mono mb-3">{s.num}</div>
                <h3 className="font-semibold text-lg mb-2">{s.title}</h3>
                <p className="text-white/55 text-sm leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="px-6 py-20 border-t border-white/8">
        <div className="mx-auto max-w-5xl">
          <div className="text-center mb-14">
            <p className="text-sm uppercase tracking-widest text-emerald-400/70 mb-3">Capabilities</p>
            <h2 className="text-3xl md:text-4xl font-bold">Everything ops teams need</h2>
            <p className="mt-4 text-white/50 max-w-xl mx-auto">
              Six specialized AI engines built for logistics, inventory, and manufacturing — not generic chatbots.
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-5">
            {features.map((f) => (
              <div key={f.title} className="card hover:border-emerald-500/30 hover:bg-white/8 transition-all">
                <div className="text-2xl mb-3">{f.icon}</div>
                <h3 className="font-semibold text-base mb-2">{f.title}</h3>
                <p className="text-white/55 text-sm leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="px-6 py-24 border-t border-white/8">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            Stop finding out about<br />problems after they happen.
          </h2>
          <p className="text-white/55 text-lg mb-10">
            Join operations teams using OpsOracle AI to get ahead of delays, stockouts, and downtime.
          </p>
          <Link href="/register" className="btn text-base px-10 py-4 inline-block">
            Upload Your First Report Free
          </Link>
        </div>
      </section>

      {/* Kai-Fu Lee AI Formula */}
      <section className="px-6 py-20 border-t border-white/8">
        <div className="mx-auto max-w-5xl">
          <div className="text-center mb-12">
            <p className="text-sm uppercase tracking-widest text-emerald-400/70 mb-3">The AI Formula</p>
            <h2 className="text-3xl md:text-4xl font-bold">Why vertical AI beats general AI</h2>
            <p className="mt-4 text-white/50 max-w-2xl mx-auto">
              AI value compounds multiplicatively — not additively. A generalist AI is limited in every factor.
              OpsOracle AI maximizes all four by focusing exclusively on industrial operations.
            </p>
          </div>
          <div className="card mb-8 text-center py-8">
            <p className="text-white/40 text-sm mb-3 font-mono uppercase tracking-widest">Vertical AI Value Formula</p>
            <div className="flex flex-wrap items-center justify-center gap-2 text-lg md:text-2xl font-bold">
              <span className="text-white">Value</span>
              <span className="text-white/30">=</span>
              <span className="text-emerald-400">Domain Expertise</span>
              <span className="text-white/30">×</span>
              <span className="text-blue-400">Data Quality</span>
              <span className="text-white/30">×</span>
              <span className="text-yellow-400">Model Confidence</span>
              <span className="text-white/30">×</span>
              <span className="text-purple-400">Industry Depth</span>
            </div>
            <p className="mt-4 text-white/30 text-sm">
              Each factor multiplies the others. OpsOracle AI scores every analysis on all four dimensions.
            </p>
          </div>
          <div className="grid md:grid-cols-4 gap-4">
            {[
              {
                label: "Domain Expertise",
                color: "text-emerald-400",
                border: "border-emerald-500/20",
                bg: "bg-emerald-500/5",
                desc: "Industry-specific signals detected in your data — logistics, manufacturing, warehouse or supply chain terminology that shapes the AI's analysis.",
              },
              {
                label: "Data Quality",
                color: "text-blue-400",
                border: "border-blue-500/20",
                bg: "bg-blue-500/5",
                desc: "Row count, structure density and column variety. More structured operational data = higher confidence in risk scores.",
              },
              {
                label: "Model Confidence",
                color: "text-yellow-400",
                border: "border-yellow-500/20",
                bg: "bg-yellow-500/5",
                desc: "How decisive the AI's risk prediction is. Extreme scores (very high or very low risk) reflect clearer signal patterns in your data.",
              },
              {
                label: "Industry Depth",
                color: "text-purple-400",
                border: "border-purple-500/20",
                bg: "bg-purple-500/5",
                desc: "Vertical-specific calibration vs generic analysis. OpsOracle AI uses industry benchmarks from all users to improve every prediction.",
              },
            ].map((f) => (
              <div key={f.label} className={`rounded-xl border ${f.border} ${f.bg} p-5`}>
                <div className={`text-sm font-semibold mb-2 ${f.color}`}>{f.label}</div>
                <p className="text-white/55 text-xs leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Industry verticals */}
      <section className="px-6 py-20 border-t border-white/8">
        <div className="mx-auto max-w-5xl">
          <div className="text-center mb-12">
            <p className="text-sm uppercase tracking-widest text-emerald-400/70 mb-3">Industry Solutions</p>
            <h2 className="text-3xl md:text-4xl font-bold">Deep expertise, not a generalist chatbot</h2>
            <p className="mt-4 text-white/50 max-w-xl mx-auto">
              Each vertical gets AI engines calibrated on domain-specific signals — not generic pattern matching.
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-5">
            {[
              {
                href: "/logistics-ai",
                label: "Logistics AI",
                desc: "Shipment delay prediction, carrier SLA scoring, route cost anomaly detection and last-mile risk analysis.",
                kpi: "Reduce SLA breaches",
              },
              {
                href: "/manufacturing-ai",
                label: "Manufacturing AI",
                desc: "OEE risk scoring, downtime root cause detection, throughput bottleneck analysis and production cost impact.",
                kpi: "Cut unplanned downtime",
              },
              {
                href: "/warehouse-ai",
                label: "Warehouse AI",
                desc: "Stockout risk scoring, slow-mover detection, reorder gap alerts and order fill rate risk analysis.",
                kpi: "Prevent inventory crises",
              },
            ].map((v) => (
              <Link key={v.href} href={v.href} className="card hover:border-emerald-500/30 hover:bg-white/8 transition-all group">
                <div className="text-xs text-emerald-400/70 font-mono uppercase tracking-wider mb-2">{v.kpi}</div>
                <h3 className="font-semibold text-base mb-2 group-hover:text-emerald-400 transition-colors">{v.label} →</h3>
                <p className="text-white/55 text-sm leading-relaxed">{v.desc}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/8 px-6 py-10">
        <div className="mx-auto max-w-6xl flex flex-col sm:flex-row items-center justify-between gap-4">
          <span className="text-sm font-semibold">
            <span className="text-emerald-400">Ops</span>Oracle AI
          </span>
          <p className="text-sm text-white/30">© {new Date().getFullYear()} OpsOracle AI. All rights reserved.</p>
          <div className="flex gap-6 text-sm text-white/40">
            <Link href="/logistics-ai" className="hover:text-white transition-colors">Logistics</Link>
            <Link href="/manufacturing-ai" className="hover:text-white transition-colors">Manufacturing</Link>
            <Link href="/warehouse-ai" className="hover:text-white transition-colors">Warehouse</Link>
            <Link href="/login" className="hover:text-white transition-colors">Login</Link>
            <Link href="/register" className="hover:text-white transition-colors">Register</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
