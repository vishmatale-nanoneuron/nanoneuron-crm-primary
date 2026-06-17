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
  { href: "/devops-ai", label: "DevOps AI", pain: "P1 incident at 2am — deploy caused it, nobody knows which", kpi: "Find the deploy that caused the incident" },
  { href: "/mlops-ai", label: "MLOps AI", pain: "Model accuracy dropped 15%. Team finds out from a customer complaint.", kpi: "Detect model drift before it costs you" },
  { href: "/retail-ai", label: "Retail AI", pain: "3 top-selling SKUs out of stock. Dead inventory worth ₹4L sitting unsold.", kpi: "Flag stockouts and dead stock before revenue bleeds" },
  { href: "/supply-chain-ai", label: "Supply Chain AI", pain: "Critical supplier at 38% on-time delivery. Production stopped waiting for parts.", kpi: "Identify supplier risk before it stops the line" },
  { href: "/gstguard-ai", label: "GSTGuard AI", pain: "ASMT-10 arrived. Demand ₹8,40,000. Reply due in 7 days. Draft takes 3 hours.", kpi: "AI-drafted GST notice reply in 60 seconds" },
];

export default function Home() {
  return (
    <div className="min-h-screen bg-zinc-950 text-white">
      <header>
      <nav aria-label="Main navigation" className="fixed top-0 left-0 right-0 z-50 border-b border-white/8 bg-zinc-950/80 backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <Link href="/" className="text-lg font-bold tracking-tight" aria-label="OpsOracle AI home">
            <span className="text-emerald-400">Ops</span>Oracle AI
          </Link>
          <div className="flex items-center gap-4">
            <Link href="/logistics-ai" className="hidden md:block text-sm text-white/60 hover:text-white transition-colors">Logistics</Link>
            <Link href="/manufacturing-ai" className="hidden md:block text-sm text-white/60 hover:text-white transition-colors">Manufacturing</Link>
            <Link href="/warehouse-ai" className="hidden md:block text-sm text-white/60 hover:text-white transition-colors">Warehouse</Link>
            <Link href="/devops-ai" className="hidden md:block text-sm text-white/60 hover:text-white transition-colors">DevOps</Link>
            <Link href="/mlops-ai" className="hidden md:block text-sm text-white/60 hover:text-white transition-colors">MLOps</Link>
            <Link href="/retail-ai" className="hidden lg:block text-sm text-white/60 hover:text-white transition-colors">Retail</Link>
            <Link href="/supply-chain-ai" className="hidden lg:block text-sm text-white/60 hover:text-white transition-colors">Supply Chain</Link>
            <Link href="/gstguard-ai" className="hidden lg:block text-sm text-amber-400/80 hover:text-amber-400 transition-colors">GSTGuard</Link>
            <Link href="/pricing" className="text-sm text-white/60 hover:text-white transition-colors">Pricing</Link>
            <Link href="/login" className="text-sm text-white/60 hover:text-white transition-colors">Login</Link>
            <Link href="/register" className="btn text-sm py-2 px-5">Try Free</Link>
          </div>
        </div>
      </nav>
      </header>

      <main id="main-content">
      {/* Hero — pain first */}
      <section aria-label="Hero" className="pt-32 pb-20 px-6">
        <div className="mx-auto max-w-5xl">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-violet-500/30 bg-violet-500/8 px-4 py-1.5 text-sm text-violet-400">
            <span aria-hidden="true" className="h-1.5 w-1.5 rounded-full bg-violet-400 animate-pulse" />
            Vertical AGI — Reasoning Engine for Industrial Operations
          </div>

          {/* Pain signals */}
          <div className="mb-10 space-y-3">
            {[
              { label: "LOGISTICS", signal: "BlueDart Mumbai→Delhi · 5 shipments · 100% delayed · ₹28,600 at risk", color: "border-red-500/30 bg-red-500/5 text-red-300" },
              { label: "MANUFACTURING", signal: "M2-Lathe · 360 min downtime this week · 54% output attainment · escalating", color: "border-red-500/30 bg-red-500/5 text-red-300" },
              { label: "WAREHOUSE", signal: "SKU-105 Conveyor Belt · stock = 0 · lead time 21 days · stockout for 56 days", color: "border-red-500/30 bg-red-500/5 text-red-300" },
              { label: "DEVOPS", signal: "payment-service · 2 failed deploys in 6 days · P1 incident · MTTR 105 min", color: "border-red-500/30 bg-red-500/5 text-red-300" },
              { label: "MLOPS", signal: "fraud-detector · accuracy 94% → 87% · data drift 0.34 · retraining overdue", color: "border-red-500/30 bg-red-500/5 text-red-300" },
              { label: "RETAIL", signal: "SKU-202 · stock = 0 · 28 units/week demand · ₹46,200 stockout loss this week", color: "border-red-500/30 bg-red-500/5 text-red-300" },
              { label: "SUPPLY CHAIN", signal: "ImportComp China · Sensor-F6 · stock=2 · lead time 45d · 38% OTD · CRITICAL", color: "border-red-500/30 bg-red-500/5 text-red-300" },
              { label: "GST NOTICE", signal: "ASMT-10 · GSTIN 27ABCDE1234F1Z5 · Demand ₹8,40,000 · 4 issues · Reply due 7 days · Draft not started", color: "border-amber-500/30 bg-amber-500/5 text-amber-300" },
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
            Upload your logistics, warehouse, manufacturing, or DevOps report. AI reads every row,
            names the specific pain — carrier, machine, SKU, or service — and tells your team exactly
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
      <section aria-label="Key metrics" className="px-6 pb-16">
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
      <section aria-label="How it works" className="px-6 py-20 border-t border-white/8">
        <div className="mx-auto max-w-5xl">
          <div className="text-center mb-14">
            <p className="text-sm uppercase tracking-widest text-emerald-400/70 mb-3">How it works</p>
            <h2 className="text-3xl md:text-4xl font-bold">From raw data to named fix in 30 seconds</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              { num: "01", title: "Upload your report", desc: "CSV, Excel, or PDF from your ERP, WMS, or TMS. Any format — no template needed." },
              { num: "02", title: "AGI reasons, names the pain", desc: "Not 'risk score 78'. It shows 5 reasoning steps: classifies the sub-vertical, identifies critical rows, detects patterns, calculates exposure, and names the fix — M2-Lathe, BlueDart Mumbai–Delhi, SKU-105." },
              { num: "03", title: "Your team acts today", desc: "Three actions: This Week / This Month / Next Quarter. Each names an owner, a task, and the financial impact of fixing it." },
            ].map((s) => (
              <div key={s.num} className="card relative overflow-hidden">
                <div aria-hidden="true" className="text-6xl font-bold text-white/5 absolute -top-2 -right-2 select-none">{s.num}</div>
                <div className="text-emerald-400 text-sm font-mono mb-3">{s.num}</div>
                <h3 className="font-semibold text-lg mb-2">{s.title}</h3>
                <p className="text-white/55 text-sm leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* AGI Reasoning Engine showcase */}
      <section aria-label="AGI reasoning engine" className="px-6 py-20 border-t border-white/8">
        <div className="mx-auto max-w-5xl">
          <div className="text-center mb-14">
            <p className="text-sm uppercase tracking-widest text-violet-400/70 mb-3">AGI Reasoning Engine</p>
            <h2 className="text-3xl md:text-4xl font-bold">Not a chatbot. A reasoning engine that shows its work.</h2>
            <p className="mt-4 max-w-2xl mx-auto text-white/50 text-lg leading-relaxed">
              Every analysis exposes the full chain of thought — which data it read, what pattern it found, why it&apos;s recommending this exact action.
            </p>
          </div>

          <div className="rounded-xl border border-violet-500/20 bg-violet-500/5 overflow-hidden">
            <div className="border-b border-violet-500/15 px-5 py-3 flex items-center justify-between">
              <span className="text-xs text-violet-400/70 uppercase tracking-wider font-semibold">Live reasoning chain — Manufacturing report</span>
              <span className="rounded-full bg-violet-500/20 border border-violet-500/30 px-2.5 py-1 text-xs text-violet-400 font-semibold">
                ⚡ Vertical AGI
              </span>
            </div>
            <div className="p-5 space-y-4">
              {[
                { n: 1, step: "Classified as manufacturing / discrete — CNC, lathe, press, shift keywords in 3+ columns. Sub-vertical: discrete manufacturing." },
                { n: 2, step: "Isolated 3 critical rows: M2-Lathe Morning (95 min downtime), M2-Lathe Afternoon (110 min), M2-Lathe Night (155 min) — same machine, three consecutive shifts." },
                { n: 3, step: "Pattern is escalating mechanical failure — not random. Downtime rising each shift: +15 min, then +45 min. Every other machine (M1, M3, M4, M5) shows zero breakdown pattern." },
                { n: 4, step: "Financial exposure: 415 lost units × ₹468/unit standard cost = ₹1,94,220 at risk this week alone. Annualized at current trend: ₹1.01 Cr." },
                { n: 5, step: "Root cause: escalating downtime on single machine across shifts matches spindle bearing wear lifecycle. Emergency maintenance before next shift prevents full breakdown and 72-hr repair stoppage." },
              ].map(({ n, step }) => (
                <div key={n} className="flex items-start gap-3">
                  <span
                    aria-hidden="true"
                    className="shrink-0 w-6 h-6 rounded-full bg-violet-500/20 border border-violet-500/30 text-violet-400 text-xs font-bold flex items-center justify-center mt-0.5"
                  >
                    {n}
                  </span>
                  <span className="text-sm text-white/65 font-mono leading-relaxed">{step}</span>
                </div>
              ))}
              <div className="mt-2 pt-4 border-t border-violet-500/15 flex items-start gap-3">
                <span className="text-emerald-400 font-semibold text-sm shrink-0 mt-0.5">→ Verdict:</span>
                <span className="text-sm text-white/75 leading-relaxed">
                  Maintenance engineer inspects spindle bearings before next shift. Schedule 4-hour PM this weekend — do not wait for full breakdown. Cost: ₹8,000 PM. Risk avoided: ₹1,94,220 this week.
                </span>
              </div>
            </div>
          </div>

          <div className="mt-6 grid md:grid-cols-3 gap-4">
            {[
              { label: "5-step chain-of-thought", desc: "Every analysis shows the full reasoning — not just the answer" },
              { label: "Evidence-first", desc: "Each finding cites the specific rows that drove the conclusion" },
              { label: "Honest uncertainty", desc: "When data is sparse, the AI says so — no fake confidence" },
            ].map((f) => (
              <div key={f.label} className="rounded-xl border border-white/8 bg-white/3 px-4 py-4">
                <p className="font-semibold text-sm text-violet-400 mb-1">{f.label}</p>
                <p className="text-xs text-white/45 leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Industry verticals */}
      <section aria-label="Industry solutions" className="px-6 py-20 border-t border-white/8">
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

      {/* Pricing strip */}
      <section aria-label="Pricing" className="px-6 py-16 border-t border-white/8">
        <div className="mx-auto max-w-5xl">
          <div className="text-center mb-10">
            <p className="text-sm uppercase tracking-widest text-emerald-400/70 mb-2">Simple Pricing</p>
            <h2 className="text-2xl md:text-3xl font-bold">Pay via UPI — no card required</h2>
            <p className="text-white/40 text-sm mt-2">PhonePe · GPay · Paytm · BHIM · direct bank transfer</p>
          </div>
          <div className="grid md:grid-cols-3 gap-5">
            {[
              { name: "Free", price: "₹0", period: "forever", features: ["3 report analyses/day", "Logistics + Manufacturing + Warehouse AI", "AGI reasoning chain", "Monday Morning Action Plan"], cta: "Start Free", href: "/register", highlight: false },
              { name: "Pro", price: "₹999", period: "/month", features: ["Unlimited analyses", "GSTGuard AI (GST notice drafts)", "Benchmark comparisons", "Industry KPI tracking", "Email digest"], cta: "Pay via UPI", href: "/pricing", highlight: true },
              { name: "Enterprise", price: "₹4,999", period: "/month", features: ["Everything in Pro", "Cross-vertical AGI brief", "Priority support", "Annual plan: ₹39,999"], cta: "Pay via UPI", href: "/pricing", highlight: false },
            ].map((plan) => (
              <div key={plan.name} className={`rounded-2xl border p-6 flex flex-col gap-4 ${plan.highlight ? "border-emerald-500/40 bg-emerald-500/5" : "border-white/10 bg-white/3"}`}>
                <div>
                  <p className="text-xs uppercase tracking-widest text-white/40 mb-1">{plan.name}</p>
                  <p className="text-3xl font-bold">{plan.price}<span className="text-base font-normal text-white/40">{plan.period}</span></p>
                </div>
                <ul className="space-y-2 flex-1">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-start gap-2 text-sm text-white/60">
                      <span className="text-emerald-400 mt-0.5 shrink-0">✓</span>{f}
                    </li>
                  ))}
                </ul>
                <Link href={plan.href} className={`block text-center rounded-lg py-2.5 text-sm font-semibold transition-colors ${plan.highlight ? "bg-emerald-600 hover:bg-emerald-500 text-white" : "border border-white/20 hover:bg-white/8 text-white/70 hover:text-white"}`}>
                  {plan.cta}
                </Link>
              </div>
            ))}
          </div>
          <p className="text-center text-xs text-white/25 mt-6">UPI ID: vish.matale-4@okaxis · Instant activation on payment confirmation</p>
        </div>
      </section>

      {/* CTA */}
      <section aria-label="Get started" className="px-6 py-24 border-t border-white/8">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            Stop finding out about<br />
            <span className="text-emerald-400">problems after they cost you.</span>
          </h2>
          <p className="text-white/50 text-lg mb-10 max-w-xl mx-auto">
            Upload your first report now. The AGI reasoning engine reads every row, names the specific pain, shows exactly how it reached that conclusion, and gives your team a Monday Morning Action Plan — in 30 seconds.
          </p>
          <Link href="/register" className="btn text-base px-10 py-4 inline-block">
            Start Free — No Card Required
          </Link>
          <p className="mt-4 text-white/25 text-sm">Pro plan: ₹999/month via UPI · GSTGuard: draft GST notices in 60 seconds</p>
        </div>
      </section>

      </main>
      <footer aria-label="Site footer" className="border-t border-white/8 px-6 py-10">
        <div className="mx-auto max-w-6xl flex flex-col sm:flex-row items-center justify-between gap-4">
          <span className="text-sm font-semibold"><span className="text-emerald-400">Ops</span>Oracle AI</span>
          <p className="text-sm text-white/30">© {new Date().getFullYear()} OpsOracle AI. All rights reserved.</p>
          <div className="flex gap-6 text-sm text-white/40 flex-wrap justify-center">
            <Link href="/logistics-ai" className="hover:text-white transition-colors">Logistics AI</Link>
            <Link href="/manufacturing-ai" className="hover:text-white transition-colors">Manufacturing AI</Link>
            <Link href="/warehouse-ai" className="hover:text-white transition-colors">Warehouse AI</Link>
            <Link href="/devops-ai" className="hover:text-white transition-colors">DevOps AI</Link>
            <Link href="/mlops-ai" className="hover:text-white transition-colors">MLOps AI</Link>
            <Link href="/retail-ai" className="hover:text-white transition-colors">Retail AI</Link>
            <Link href="/supply-chain-ai" className="hover:text-white transition-colors">Supply Chain AI</Link>
            <Link href="/gstguard-ai" className="hover:text-amber-400 transition-colors">GSTGuard AI</Link>
            <Link href="/pricing" className="hover:text-white transition-colors">Pricing</Link>
            <Link href="/login" className="hover:text-white transition-colors">Login</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
