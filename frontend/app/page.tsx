import Link from "next/link";
import { PainSolver } from "@/components/PainSolver";
import { LiveDemo } from "@/components/LiveDemo";

const HOMEPAGE_PAINS = [
  {
    pain: "BlueDart keeps missing Delhi deliveries. You find out 4 days late — after the customer calls.",
    signal: "SH-1005 Mumbai→Delhi BlueDart PENDING +3d | SH-1007 PENDING +2d | SH-1009 PENDING +1d | Pattern: 5/5 delayed",
    aiOutput: {
      risk: 82, label: "Act Today", color: "red" as const,
      summary: "BlueDart Mumbai→Delhi route: 100% delay rate across 5 shipments. ₹28,600 at risk. DTDC same corridor shows 0% delay.",
      action: "Re-route SH-1005, SH-1007, SH-1009 to Delhivery before 5pm. Escalate SLA breach to BlueDart key account.",
      impact: "Prevent ₹28,600 cost-in-transit + 3 customer SLA breaches this week",
    },
  },
  {
    pain: "M2-Lathe broke down again. Third time this week. Production is bleeding 360 minutes.",
    signal: "M2-Lathe Morning: 95min downtime | Afternoon: 110min | Night: 155min | Output: 415/900 planned (54%)",
    aiOutput: {
      risk: 88, label: "Critical — Stop the Bleed", color: "red" as const,
      summary: "M2-Lathe downtime escalating shift-over-shift. Not random — mechanical degradation. ₹1,94,000 production value lost this week.",
      action: "Maintenance engineer to inspect spindle bearings before next shift. Schedule 4-hour PM this weekend — do not wait.",
      impact: "Recover 485 lost units/week = ₹1,94,000 weekly production value",
    },
  },
  {
    pain: "Conveyor belt snapped. Production stopped 4 hours. The spare part? Out of stock.",
    signal: "SKU-105 Conveyor Belt 2m: stock=0 | reorder_point=5 | lead_time=21d | last_restock=2026-04-15 (56 days ago)",
    aiOutput: {
      risk: 91, label: "Stockout — Order Now", color: "red" as const,
      summary: "SKU-105 at zero stock for 56 days with 21-day lead time. You've been operating on luck. Every unplanned need = production stop.",
      action: "Raise emergency PO today — request express delivery (2–3 days, accept 30% premium). Set reorder point to 8 units.",
      impact: "Prevent next ₹2,40,000 production stoppage",
    },
  },
];

const industries = [
  { href: "/logistics-ai", label: "Logistics AI", pain: "Delays discovered after the customer calls", kpi: "Predict SLA breaches before they happen" },
  { href: "/manufacturing-ai", label: "Manufacturing AI", pain: "Downtime found after the shift is over", kpi: "Detect machine failures before line stops" },
  { href: "/warehouse-ai", label: "Warehouse AI", pain: "Stockouts found when production stops", kpi: "Flag inventory crises before they hit" },
];

export default function Home() {
  return (
    <div className="min-h-screen bg-zinc-950 text-white">
      <nav className="fixed top-0 left-0 right-0 z-50 border-b border-white/8 bg-zinc-950/80 backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <span className="text-lg font-bold tracking-tight">
            <span className="text-emerald-400">Ops</span>Oracle AI
          </span>
          <div className="flex items-center gap-4">
            <Link href="/logistics-ai" className="hidden md:block text-sm text-white/60 hover:text-white transition-colors">Logistics</Link>
            <Link href="/manufacturing-ai" className="hidden md:block text-sm text-white/60 hover:text-white transition-colors">Manufacturing</Link>
            <Link href="/warehouse-ai" className="hidden md:block text-sm text-white/60 hover:text-white transition-colors">Warehouse</Link>
            <Link href="/pricing" className="text-sm text-white/60 hover:text-white transition-colors">Pricing</Link>
            <Link href="/login" className="text-sm text-white/60 hover:text-white transition-colors">Login</Link>
            <Link href="/register" className="btn text-sm py-2 px-5">Try Free</Link>
          </div>
        </div>
      </nav>

      {/* Hero — pain first */}
      <section className="pt-32 pb-20 px-6">
        <div className="mx-auto max-w-5xl">
          <div className="mb-8 inline-flex items-center gap-2 rounded-full border border-red-500/30 bg-red-500/8 px-4 py-1.5 text-sm text-red-400">
            <span className="h-1.5 w-1.5 rounded-full bg-red-400 animate-pulse" />
            Vertical AI for Industrial Operations
          </div>

          {/* Pain signals */}
          <div className="mb-10 space-y-3">
            {[
              { label: "LOGISTICS", signal: "BlueDart Mumbai→Delhi · 5 shipments · 100% delayed · ₹28,600 at risk", color: "border-red-500/30 bg-red-500/5 text-red-300" },
              { label: "MANUFACTURING", signal: "M2-Lathe · 360 min downtime this week · 54% output attainment · escalating", color: "border-red-500/30 bg-red-500/5 text-red-300" },
              { label: "WAREHOUSE", signal: "SKU-105 Conveyor Belt · stock = 0 · lead time 21 days · stockout for 56 days", color: "border-red-500/30 bg-red-500/5 text-red-300" },
            ].map((s) => (
              <div key={s.label} className={`flex items-center gap-3 rounded-xl border ${s.color} px-4 py-3 font-mono text-sm`}>
                <span className="text-xs text-white/30 shrink-0 w-24">{s.label}</span>
                <span className="text-white/60">{s.signal}</span>
                <span className="ml-auto shrink-0 text-xs text-red-400/60">● LIVE</span>
              </div>
            ))}
          </div>

          <h1 className="text-5xl font-bold md:text-6xl leading-tight tracking-tight mb-6">
            These pains are happening<br />
            in your operations <span className="text-white/30">right now.</span><br />
            <span className="text-emerald-400">OpsOracle AI finds them first.</span>
          </h1>
          <p className="max-w-2xl text-lg text-white/55 leading-relaxed mb-10">
            Upload your logistics, warehouse, or manufacturing report. AI reads every row,
            names the specific pain — carrier, machine, SKU — and tells your team exactly
            what to do about it. In under 30 seconds.
          </p>
          <div className="flex flex-col sm:flex-row gap-4">
            <Link href="/register" className="btn text-base px-8 py-4 inline-block">
              Analyze Your Operations Free →
            </Link>
            <Link href="/upload" className="rounded-xl border border-white/15 px-8 py-4 text-base hover:bg-white/5 transition-colors inline-block text-center">
              Try with Sample Data
            </Link>
          </div>
          <p className="mt-4 text-sm text-white/25">14-day Pro trial · No credit card · Results in 30 seconds</p>
        </div>
      </section>

      {/* Stats */}
      <section className="px-6 pb-16">
        <div className="mx-auto max-w-5xl grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { value: "< 30s", label: "Analysis time" },
            { value: "Named", label: "Specific pain, not a score" },
            { value: "₹→$", label: "Financial impact quantified" },
            { value: "Free", label: "14-day Pro trial" },
          ].map((s) => (
            <div key={s.label} className="card text-center">
              <div className="text-2xl font-bold text-emerald-400">{s.value}</div>
              <div className="mt-1 text-sm text-white/50">{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Live AI demo — no login needed */}
      <LiveDemo />

      {/* Real Pain → AI Solves It */}
      <PainSolver pains={HOMEPAGE_PAINS} industry="Operations" />

      {/* How it works */}
      <section className="px-6 py-20 border-t border-white/8">
        <div className="mx-auto max-w-5xl">
          <div className="text-center mb-14">
            <p className="text-sm uppercase tracking-widest text-emerald-400/70 mb-3">How it works</p>
            <h2 className="text-3xl md:text-4xl font-bold">From raw data to named fix in 30 seconds</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              { num: "01", title: "Upload your report", desc: "CSV, Excel, or PDF from your ERP, WMS, or TMS. Any format — no template needed." },
              { num: "02", title: "AI names the pain", desc: "Not 'risk score 78'. It says: M2-Lathe, BlueDart Mumbai-Delhi, SKU-105 — specific, quantified, urgent." },
              { num: "03", title: "Your team acts today", desc: "Three actions: This Week / This Month / Next Quarter. Each names an owner, a task, and the financial impact of fixing it." },
            ].map((s) => (
              <div key={s.num} className="card relative overflow-hidden">
                <div className="text-6xl font-bold text-white/5 absolute -top-2 -right-2 select-none">{s.num}</div>
                <div className="text-emerald-400 text-sm font-mono mb-3">{s.num}</div>
                <h3 className="font-semibold text-lg mb-2">{s.title}</h3>
                <p className="text-white/55 text-sm leading-relaxed">{s.desc}</p>
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
            <h2 className="text-3xl md:text-4xl font-bold">Built for your industry, not a generic chatbot</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-5">
            {industries.map((v) => (
              <Link key={v.href} href={v.href} className="card hover:border-emerald-500/30 hover:bg-white/8 transition-all group">
                <p className="text-xs text-red-400/60 mb-2">The pain you know</p>
                <p className="text-sm text-white/50 mb-4 italic">&ldquo;{v.pain}&rdquo;</p>
                <div className="h-px bg-white/8 mb-4" />
                <p className="text-xs text-emerald-400/70 mb-1">OpsOracle solves it</p>
                <h3 className="font-semibold text-base group-hover:text-emerald-400 transition-colors">{v.kpi} →</h3>
                <p className="text-xs text-white/30 mt-2">{v.label}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="px-6 py-24 border-t border-white/8">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            Stop finding out about<br />
            <span className="text-emerald-400">problems after they cost you.</span>
          </h2>
          <p className="text-white/50 text-lg mb-10 max-w-xl mx-auto">
            Upload your first report now. AI names the pain, quantifies the cost, and gives your team a Monday Morning Action Plan — in 30 seconds.
          </p>
          <Link href="/register" className="btn text-base px-10 py-4 inline-block">
            Start Free — No Card Required
          </Link>
          <p className="mt-4 text-white/25 text-sm">14-day Pro trial included. Cancel anytime.</p>
        </div>
      </section>

      <footer className="border-t border-white/8 px-6 py-10">
        <div className="mx-auto max-w-6xl flex flex-col sm:flex-row items-center justify-between gap-4">
          <span className="text-sm font-semibold"><span className="text-emerald-400">Ops</span>Oracle AI</span>
          <p className="text-sm text-white/30">© {new Date().getFullYear()} OpsOracle AI. All rights reserved.</p>
          <div className="flex gap-6 text-sm text-white/40 flex-wrap justify-center">
            <Link href="/logistics-ai" className="hover:text-white transition-colors">Logistics AI</Link>
            <Link href="/manufacturing-ai" className="hover:text-white transition-colors">Manufacturing AI</Link>
            <Link href="/warehouse-ai" className="hover:text-white transition-colors">Warehouse AI</Link>
            <Link href="/pricing" className="hover:text-white transition-colors">Pricing</Link>
            <Link href="/login" className="hover:text-white transition-colors">Login</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
