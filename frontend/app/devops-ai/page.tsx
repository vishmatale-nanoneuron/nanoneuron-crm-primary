import type { Metadata } from "next";
import Link from "next/link";
import { PainSolver } from "@/components/PainSolver";

const DEVOPS_PAINS = [
  {
    pain: "Friday deploy went out. By Monday morning: 3 P1s, 2 rollbacks, on-call engineer missed the whole weekend.",
    signal: "payment-service FAILED 25min | Rollback: YES | INC-004 P1 Payment down | MTTR: 105min | deploy→incident gap: 12min",
    aiOutput: {
      risk: 91, label: "CRITICAL — This Deploy Pattern Kills Weekends", color: "red" as const,
      summary: "payment-service has failed 2 of its last 3 production deploys — both causing P1 incidents within 15 minutes. MTTR averages 105 min vs 60 min DORA Elite target. Change failure rate: 50% (DORA Elite is <15%).",
      action: "Freeze payment-service feature deploys until post-incident review is complete. Enforce staging → canary → production gate with 30-minute soak time before full rollout.",
      impact: "Prevent next P1 incident: estimated $4,200 revenue downtime cost + on-call burden eliminated",
    },
  },
  {
    pain: "We don't know our change failure rate. Half the team thinks deploys are fine. The other half dreads Fridays.",
    signal: "Deploys: 8 total | FAILED: 4 (50%) | Rollbacks: 4 | P1 caused: 3 | P2 caused: 1 | Avg MTTR: 124min",
    aiOutput: {
      risk: 78, label: "HIGH — Measure Before You Fix", color: "red" as const,
      summary: "4 of 8 production deployments failed this week — 50% change failure rate. auth-service, api-gateway, notification-service, and payment-service all had failures. DORA Elite benchmark: <15%. You are 3× over.",
      action: "SRE lead to instrument deployment success/failure tracking per service in your observability stack this week. Target: per-service change failure rate visible in dashboard within 5 days.",
      impact: "Visibility enables you to isolate the 1–2 high-risk services driving 80% of failures",
    },
  },
  {
    pain: "api-gateway went down for 100 minutes. Root cause analysis took 3 days. By then, 2 more deploys had gone out.",
    signal: "api-gateway deploy FAILED | INC-002 P1 502 errors 100pct traffic | MTTR: 100min | Root cause: deploy regression",
    aiOutput: {
      risk: 67, label: "MEDIUM — Fix the RCA Loop", color: "yellow" as const,
      summary: "api-gateway P1 had 100-minute MTTR but 3-day RCA cycle — meaning the signal was visible in deploy logs immediately but not acted on. Two more api-gateway deploys went out before root cause was documented.",
      action: "Platform team to wire deploy failure → automatic 15-min hold on subsequent same-service deploys. Add pre-deploy check: last deploy status must be SUCCESS before new release proceeds.",
      impact: "Prevent cascading failures: next api-gateway P1 caught in 5 min instead of 100 min",
    },
  },
];

export const metadata: Metadata = {
  title: "DevOps AI — Deployment Risk Scoring, DORA Metrics & Incident Correlation",
  description:
    "AI-powered DevOps intelligence. Upload deployment logs, incident reports or CI/CD pipeline data to get change failure rate analysis, DORA metric scoring and deploy-to-incident correlation in under 30 seconds.",
  alternates: { canonical: "https://nanoneuron.ai/devops-ai" },
  openGraph: {
    title: "DevOps AI — Deployment Risk & DORA Metrics Analysis",
    description:
      "Find which deploy caused the incident before the postmortem. OpsOracle AI scores your deployment pipeline health, MTTR trends and change failure rate instantly.",
    url: "https://nanoneuron.ai/devops-ai",
  },
};

const capabilities = [
  {
    title: "DORA Metrics Scoring",
    desc: "Score your deployment data against DORA Elite/High/Medium/Low benchmarks. AI flags which services are dragging down deployment frequency, change failure rate, MTTR and lead time.",
    kpi: "Know your DORA tier",
  },
  {
    title: "Deploy-to-Incident Correlation",
    desc: "Detect which deployments caused incidents by correlating deploy timestamps with incident start times per service. AI names the exact release that triggered each P1 or P2.",
    kpi: "Find the bad deploy fast",
  },
  {
    title: "Change Failure Rate Analysis",
    desc: "Calculate per-service change failure rate from your deploy logs. Identify the top 2–3 high-risk services responsible for most rollbacks so you know where to focus stabilization effort.",
    kpi: "Isolate unstable services",
  },
  {
    title: "MTTR Trend Detection",
    desc: "Track mean time to recovery trends across incidents. AI flags when MTTR is worsening for a service and correlates it with team on-call patterns, deploy volume or infrastructure changes.",
    kpi: "Reduce recovery time",
  },
  {
    title: "Pipeline Health Analysis",
    desc: "Parse CI/CD pipeline data to surface flaky test patterns, slow build stages and recurring failure modes. AI identifies which pipeline steps are blocking deployments most often.",
    kpi: "Unblock your pipeline",
  },
  {
    title: "Deployment Risk Forecasting",
    desc: "Score the risk of each service before it deploys based on recent failure history, change volume and incident correlation. AI recommends canary, full rollout, or hold.",
    kpi: "Gate risky releases",
  },
];

const metrics = [
  { value: "< 30s", label: "DORA analysis per deploy log" },
  { value: "DORA", label: "Elite / High / Medium / Low tier" },
  { value: "6 engines", label: "Calibrated for DevOps signals" },
  { value: "Free", label: "No credit card to start" },
];

const faqJsonLd = {
  "@context": "https://schema.org", "@type": "FAQPage",
  mainEntity: [
    { "@type": "Question", name: "What DORA metrics does OpsOracle AI analyze?", acceptedAnswer: { "@type": "Answer", text: "OpsOracle scores all four DORA metrics from your deployment logs: deployment frequency, lead time for changes, change failure rate, and mean time to recovery (MTTR). It benchmarks your scores against DORA Elite, High, Medium and Low tiers." } },
    { "@type": "Question", name: "How does OpsOracle correlate deployments to incidents?", acceptedAnswer: { "@type": "Answer", text: "OpsOracle matches deployment timestamps against incident start times per service. When a deployment is followed by an incident on the same service within a configurable window, it flags the deploy as the probable cause and includes it in the change failure rate calculation." } },
    { "@type": "Question", name: "What DevOps data formats can I upload to OpsOracle?", acceptedAnswer: { "@type": "Answer", text: "Upload deployment logs, CI/CD pipeline exports, incident reports or on-call event history as CSV. Any export from Jenkins, GitHub Actions, GitLab CI, PagerDuty or Jira works — no specific format required." } },
    { "@type": "Question", name: "How can I reduce my change failure rate with AI?", acceptedAnswer: { "@type": "Answer", text: "OpsOracle identifies the specific services with the highest rollback rates and correlates them with deployment patterns. It recommends which services need canary deployments, better test coverage, or staging gates — giving your platform team a prioritized fix list." } },
    { "@type": "Question", name: "What is a good DORA metric score for a DevOps team?", acceptedAnswer: { "@type": "Answer", text: "DORA Elite performers deploy multiple times per day, have change failure rates below 15%, and recover from incidents in under one hour. OpsOracle scores your team against these benchmarks and shows you exactly which metric is dragging your tier down." } },
  ],
};

export default function DevOpsAI() {
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
            DevOps & Site Reliability Engineering
          </div>
          <h1 className="text-5xl font-bold md:text-6xl leading-tight tracking-tight">
            AI that finds the deploy<br />
            <span className="text-emerald-400">that caused the incident.</span>
          </h1>
          <p className="mx-auto mt-8 max-w-2xl text-lg text-white/60 leading-relaxed">
            Upload deployment logs, incident reports or CI/CD pipeline data. OpsOracle AI
            scores your DORA metrics, correlates deployments to incidents, flags your
            highest-risk services — and tells your team exactly what to fix. In under 30 seconds.
          </p>
          <div className="mt-10 flex flex-col sm:flex-row justify-center gap-4">
            <Link href="/register" className="btn text-base px-8 py-4">Analyze Your Pipeline Free</Link>
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
            <p className="text-sm uppercase tracking-widest text-emerald-400/70 mb-3">DevOps AI Capabilities</p>
            <h2 className="text-3xl md:text-4xl font-bold">Built for SREs and platform engineers</h2>
            <p className="mt-4 text-white/50 max-w-xl mx-auto">
              Not a generic AI. Every engine is calibrated on DevOps signals — DORA benchmarks, deploy-to-incident patterns, rollback frequencies.
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

      <PainSolver pains={DEVOPS_PAINS} industry="DevOps" />

      <section aria-label="How it works" className="px-6 py-20 border-t border-white/8">
        <div className="mx-auto max-w-5xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold">How DevOps teams use OpsOracle AI</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              { step: "01", title: "Upload deploy logs or pipeline data", desc: "Export your CI/CD pipeline history, deployment events, or incident log as CSV. OpsOracle reads any format — no schema required." },
              { step: "02", title: "AI scores DORA metrics and risk", desc: "Change failure rate, MTTR, deployment frequency and lead time scored per service against DORA benchmarks. Deploy-to-incident correlation mapped automatically." },
              { step: "03", title: "Act before the next Friday deploy", desc: "Three specific actions — THIS WEEK / THIS MONTH / NEXT QUARTER — each naming the service, the change, and the dollar cost of fixing it." },
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
          <h2 className="text-4xl font-bold mb-6">Stop doing postmortems. Start preventing incidents.</h2>
          <p className="text-white/55 text-lg mb-10">
            Upload your deployment log now — OpsOracle AI returns DORA scores, deploy-to-incident correlation and change failure analysis in seconds.
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
            <Link href="/manufacturing-ai" className="hover:text-white transition-colors">Manufacturing AI</Link>
            <Link href="/warehouse-ai" className="hover:text-white transition-colors">Warehouse AI</Link>
            <Link href="/mlops-ai" className="hover:text-white transition-colors">MLOps AI</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
