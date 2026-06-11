import type { Metadata } from "next";
import Link from "next/link";
import { PainSolver } from "@/components/PainSolver";

const MLOPS_PAINS = [
  {
    pain: "Fraud model accuracy dropped from 94% to 87%. Found out when a customer complained. Model had been degrading for 3 days.",
    signal: "fraud-detector accuracy: 94.2% → 87.1% | Data drift score: 0.34 | Retraining_Required: YES | Days since last retrain: 18",
    aiOutput: {
      risk: 89, label: "CRITICAL — Model in Production is Wrong", color: "red" as const,
      summary: "fraud-detector has drifted 7.1 percentage points below baseline over 72 hours. Data drift score 0.34 (threshold: 0.20). At 87.1% accuracy, approximately 6.9% of fraud transactions are passing through undetected. Estimated financial exposure: $12,400/day in missed fraud.",
      action: "Trigger emergency retraining on fraud-detector using last 7 days of labeled transactions. Do not wait for weekly retrain schedule. Deploy with shadow mode validation before full traffic switch.",
      impact: "Recover detection accuracy to 93%+, stop $12,400/day fraud bleed within 48 hours",
    },
  },
  {
    pain: "churn-predictor training job failed twice this week. Nobody knows why. The model serving prod is 3 weeks old.",
    signal: "churn-predictor training FAILED | Issue: 38pct null values | 2nd FAILED: Feature store stale 72hr | Serving: v-3wk-old",
    aiOutput: {
      risk: 74, label: "HIGH — Stale Model, Broken Pipeline", color: "red" as const,
      summary: "churn-predictor training has failed twice in 5 days — first due to 38% null values in training data, second due to 72-hour feature store lag. The model serving production is 21 days old. Churn predictions are based on 3-week stale patterns.",
      action: "Data engineering to (1) add null-value validation gate before training jobs run, (2) fix feature store ingestion lag — root cause is upstream pipeline SLA breach. Target: churn-predictor retrained and deployed within 72 hours.",
      impact: "Prevent revenue loss from targeting wrong churn cohort; fix broken pipeline permanently",
    },
  },
  {
    pain: "pricing-model P99 latency is 890ms. SLA is 200ms. Checkout is visibly slow. Nobody flagged it for 2 days.",
    signal: "pricing-model P99: 890ms vs 200ms target | Status: DEGRADED | Data drift: 0.61 | Accuracy: 79.3% vs 88% baseline",
    aiOutput: {
      risk: 82, label: "HIGH — Latency + Accuracy Both Broken", color: "red" as const,
      summary: "pricing-model has two simultaneous failures: P99 latency 4.45× above SLA (890ms vs 200ms) and accuracy 8.7 points below baseline (79.3% vs 88%), with data drift score 0.61. This model is both slow and wrong — every pricing decision it makes is degraded.",
      action: "Platform team to scale pricing-model inference replicas from 2 to 6 immediately (latency fix). ML team to queue emergency retrain with fresher feature data. Add latency SLA alert at 400ms so next breach is caught in minutes not days.",
      impact: "Fix checkout UX degradation, recover pricing accuracy, prevent lost conversions",
    },
  },
];

export const metadata: Metadata = {
  title: "MLOps AI — Model Drift Detection, Training Pipeline Health & Inference Monitoring",
  description:
    "AI-powered MLOps intelligence. Upload model monitoring logs, training run data or inference metrics to get accuracy drift alerts, feature drift scores and training pipeline health analysis in under 30 seconds.",
  alternates: { canonical: "https://nanoneuron.ai/mlops-ai" },
  openGraph: {
    title: "MLOps AI — Model Drift & Training Pipeline Analysis",
    description:
      "Detect model accuracy drift before customers notice. OpsOracle AI monitors training pipeline health, feature drift scores and inference latency SLA breaches automatically.",
    url: "https://nanoneuron.ai/mlops-ai",
  },
};

const capabilities = [
  {
    title: "Model Accuracy Drift Detection",
    desc: "Score model accuracy against your baseline for every inference window. AI flags when a model has drifted beyond threshold and estimates the business impact — missed fraud, wrong churn predictions, bad pricing.",
    kpi: "Catch drift before customers do",
  },
  {
    title: "Feature & Data Drift Scoring",
    desc: "Detect when input feature distributions shift away from training data. AI calculates per-feature drift scores and identifies which upstream data pipeline change caused the distribution shift.",
    kpi: "Find the root cause fast",
  },
  {
    title: "Training Pipeline Health Analysis",
    desc: "Parse training job logs to surface recurring failure patterns — null value spikes, feature store staleness, data schema changes. AI names which pipeline stage is failing and why.",
    kpi: "Stop broken training jobs",
  },
  {
    title: "Inference Latency SLA Monitoring",
    desc: "Track P50/P95/P99 inference latency per model against SLA targets. AI correlates latency spikes with model version changes, traffic volume, or infrastructure events.",
    kpi: "Protect user experience",
  },
  {
    title: "Retraining Cycle Optimization",
    desc: "Analyze retraining frequency vs model decay rate per model. AI recommends the optimal retrain schedule based on observed drift velocity — stop over-retraining cheap models and under-retraining critical ones.",
    kpi: "Right-size retrain cadence",
  },
  {
    title: "ML Incident Cost Quantification",
    desc: "Every model degradation analysis includes a financial impact estimate — fraud slippage, wrong churn cohort costs, pricing error losses. Translates ML metrics into numbers the business cares about.",
    kpi: "Speak the CFO's language",
  },
];

const metrics = [
  { value: "< 30s", label: "Drift analysis per model log" },
  { value: "DORA", label: "ML equivalent metrics" },
  { value: "6 engines", label: "Calibrated for MLOps signals" },
  { value: "Free", label: "No credit card to start" },
];

const faqJsonLd = {
  "@context": "https://schema.org", "@type": "FAQPage",
  mainEntity: [
    { "@type": "Question", name: "How does OpsOracle detect machine learning model drift?", acceptedAnswer: { "@type": "Answer", text: "OpsOracle reads your model monitoring logs and compares current accuracy, precision and recall against your baseline metrics. It calculates a data drift score by measuring feature distribution shift and flags models where drift exceeds your configured threshold." } },
    { "@type": "Question", name: "What MLOps data can I upload to OpsOracle?", acceptedAnswer: { "@type": "Answer", text: "Upload model monitoring logs, training run histories, inference metrics or feature store health reports as CSV. Any export from MLflow, Weights and Biases, SageMaker Model Monitor or custom logging works." } },
    { "@type": "Question", name: "How do I know when to retrain a machine learning model?", acceptedAnswer: { "@type": "Answer", text: "OpsOracle tracks your model's accuracy trend over time and flags when it drops below your baseline threshold. It also detects feature drift scores that predict accuracy degradation before it is visible in output metrics, recommending proactive retraining." } },
    { "@type": "Question", name: "What causes machine learning model degradation in production?", acceptedAnswer: { "@type": "Answer", text: "Common causes include data drift (input feature distributions shifting from training data), concept drift (the relationship between features and labels changing), training pipeline failures, feature store staleness and infrastructure changes. OpsOracle diagnoses which cause is most likely from your monitoring logs." } },
    { "@type": "Question", name: "How do I monitor inference latency for ML models?", acceptedAnswer: { "@type": "Answer", text: "OpsOracle tracks P50, P95 and P99 inference latency per model against your SLA targets. It flags breaches and correlates latency spikes with model version deployments or traffic volume changes to identify the root cause." } },
  ],
};

export default function MLOpsAI() {
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
            <span aria-hidden="true" className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
            ML Engineering & Model Operations
          </div>
          <h1 className="text-5xl font-bold md:text-6xl leading-tight tracking-tight">
            AI that catches model drift<br />
            <span className="text-emerald-400">before your customers do.</span>
          </h1>
          <p className="mx-auto mt-8 max-w-2xl text-lg text-white/60 leading-relaxed">
            Upload model monitoring logs, training run data or inference metrics. OpsOracle AI
            scores accuracy drift, detects feature distribution shifts, flags broken training
            pipelines and quantifies the business cost — in under 30 seconds.
          </p>
          <div className="mt-10 flex flex-col sm:flex-row justify-center gap-4">
            <Link href="/register" className="btn text-base px-8 py-4">Analyze Your Models Free</Link>
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
            <p className="text-sm uppercase tracking-widest text-emerald-400/70 mb-3">MLOps AI Capabilities</p>
            <h2 className="text-3xl md:text-4xl font-bold">Built for ML engineers and data scientists</h2>
            <p className="mt-4 text-white/50 max-w-xl mx-auto">
              Not a generic AI. Every engine is calibrated on MLOps signals — model drift thresholds, feature store patterns, training pipeline failure modes.
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

      <PainSolver pains={MLOPS_PAINS} industry="MLOps" />

      <section aria-label="How it works" className="px-6 py-20 border-t border-white/8">
        <div className="mx-auto max-w-5xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold">How ML teams use OpsOracle AI</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              { step: "01", title: "Upload model logs or monitoring data", desc: "Export your model monitoring dashboard, training run history or inference metrics as CSV. OpsOracle reads any schema — no template needed." },
              { step: "02", title: "AI scores drift and pipeline health", desc: "Accuracy drift vs baseline, feature drift scores, training failure patterns and latency SLA breaches identified per model. Business cost estimated automatically." },
              { step: "03", title: "Act before the next model incident", desc: "Three specific actions — emergency retrain, pipeline fix, infrastructure scale — each names the model, the root cause, and the revenue impact of fixing it." },
            ].map((s) => (
              <div key={s.step} className="card relative overflow-hidden">
                <div aria-hidden="true" className="text-6xl font-bold text-white/5 absolute -top-2 -right-2 select-none">{s.step}</div>
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
          <h2 className="text-4xl font-bold mb-6">Stop finding out about model degradation from customer complaints.</h2>
          <p className="text-white/55 text-lg mb-10">
            Upload your model monitoring log now — OpsOracle AI returns accuracy drift analysis, training pipeline health and business impact in seconds.
          </p>
          <Link href="/register" className="btn text-base px-10 py-4 inline-block">
            Start Analyzing Free
          </Link>
        </div>
      </section>

      </main>
      <footer aria-label="Site footer" className="border-t border-white/8 px-6 py-10">
        <div className="mx-auto max-w-6xl flex flex-col sm:flex-row items-center justify-between gap-4">
          <Link href="/" className="text-sm font-semibold">
            <span className="text-emerald-400">Ops</span>Oracle AI
          </Link>
          <p className="text-sm text-white/30">© {new Date().getFullYear()} OpsOracle AI. All rights reserved.</p>
          <div className="flex gap-6 text-sm text-white/40 flex-wrap justify-center">
            <Link href="/logistics-ai" className="hover:text-white transition-colors">Logistics AI</Link>
            <Link href="/manufacturing-ai" className="hover:text-white transition-colors">Manufacturing AI</Link>
            <Link href="/warehouse-ai" className="hover:text-white transition-colors">Warehouse AI</Link>
            <Link href="/devops-ai" className="hover:text-white transition-colors">DevOps AI</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
