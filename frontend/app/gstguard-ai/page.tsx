import type { Metadata } from "next";
import Link from "next/link";
import { PainSolver } from "@/components/PainSolver";

const GSTGUARD_URL = "https://frontend-ten-chi-14.vercel.app";

const GSTGUARD_PAINS = [
  {
    pain: "ASMT-10 arrived today. Demand ₹8,40,000. Reply due in 7 days. Drafting it takes 3 hours.",
    signal: "Notice: ASMT-10 | GSTIN: 27ABCDE1234F1Z5 | Demand: ₹8,40,000 | Issues: 4 | Deadline: 7 days | Draft: not started",
    aiOutput: {
      risk: 85, label: "Reply Due in 7 days", color: "red" as const,
      summary: "ASMT-10 scrutiny notice — 4 issues raised by GSTN. Mismatches in GSTR-2A vs GSTR-3B (ITC claim ₹4,20,000), late filing penalty ₹12,000, and two Section 61 queries.",
      action: "Gather GSTR-2A reconciliation for FY 2022-23, ITC register, and bank statements. Draft reply addresses all 4 issues in sequence with supporting document references.",
      impact: "Avoid ₹8,40,000 demand confirmation — reply by deadline with complete grounds",
    },
  },
  {
    pain: "DRC-01 issued. Your client claims they never received it. Penalty clock is ticking.",
    signal: "Notice: DRC-01 | Section 74 | Tax: ₹2,15,000 | Penalty: ₹2,15,000 | Demand: ₹4,30,000 | Days since issue: 18",
    aiOutput: {
      risk: 92, label: "Urgent — Reply Overdue", color: "red" as const,
      summary: "DRC-01 under Section 74 alleges suppression of facts. Penalty equals tax demanded (100%). 30-day reply window. Response strategy: dispute suppression allegation, provide reconciled turnover data.",
      action: "Reply must rebut 'willful suppression' — gather GSTR-1/3B reconciliation, bank deposit records, and any prior disclosure documents before filing DRC-06 response.",
      impact: "Reduce ₹4,30,000 demand to ₹2,15,000 if suppression allegation is rebutted successfully",
    },
  },
  {
    pain: "10 GST notices this month. Associates spending 30 hours on drafts. Deadlines are overlapping.",
    signal: "Queue: ASMT-10 ×3 | DRC-01 ×2 | DRC-01A ×1 | GSTR-3A ×2 | ADT-01 ×2 | Total demand: ₹28,50,000",
    aiOutput: {
      risk: 78, label: "High Volume — Prioritise", color: "red" as const,
      summary: "10 notices across 7 clients. ASMT-10 and DRC-01 have shortest reply windows. Two notices overlap on Friday deadline. Estimated draft time per notice: 3h manual → 15min with AI.",
      action: "Process ASMT-10 cases first (7-day deadline). GSTGuard AI drafts complete reply for each — CA reviews, signs, and files. Reduce 30h workload to under 5h this week.",
      impact: "Save 25+ hours of associate time this week across the 10-notice queue",
    },
  },
];

const capabilities = [
  {
    title: "Notice Type Detection",
    desc: "Automatically classifies ASMT-10, DRC-01, DRC-01A, DRC-07, GSTR-3A, ADT-01, GSTR mismatch notices and DRC-10 from the uploaded PDF.",
    kpi: "Zero manual classification",
  },
  {
    title: "AI-Drafted Notice Reply",
    desc: "Full-length draft reply covering every issue raised — structured, professional, ready for CA review and signature. In 60 seconds.",
    kpi: "Reply in 60 seconds",
  },
  {
    title: "CA Orientation Briefing",
    desc: "Before the draft: AI prepares a plain-language briefing for the CA — what the notice is actually about, what documents to gather, what the key legal risks are.",
    kpi: "CA prep in seconds",
  },
  {
    title: "Field Transparency",
    desc: "Every extracted field — GSTIN, demand amount, deadline, issues — is tagged as Found (direct from document) or Inferred (AI-derived context). Verify before you rely.",
    kpi: "Know what AI saw vs. inferred",
  },
  {
    title: "AI Grounding Check",
    desc: "After drafting, a second AI pass verifies every claim in the reply traces to evidence from the notice. Unsupported specifics are softened before the CA sees the draft.",
    kpi: "Accuracy layer on every draft",
  },
  {
    title: "Multi-Notice Dashboard",
    desc: "Track all active notices with deadlines, urgency flags, and status. See overdue, critical, and normal notices at a glance. Never miss a reply date.",
    kpi: "No missed deadlines",
  },
];

const metrics = [
  { value: "60s", label: "Draft ready in 60 seconds" },
  { value: "8 types", label: "Notice types handled" },
  { value: "CA-ready", label: "Formatted for CA review" },
  { value: "Free trial", label: "No card needed" },
];

const faqJsonLd = {
  "@context": "https://schema.org", "@type": "FAQPage",
  mainEntity: [
    { "@type": "Question", name: "What GST notice types does GSTGuard AI handle?", acceptedAnswer: { "@type": "Answer", text: "GSTGuard AI handles ASMT-10 (scrutiny), DRC-01 (demand under Section 74/73), DRC-01A, DRC-07, GSTR-3A (non-filing), ADT-01 (audit), GSTR mismatch notices, and DRC-10. Upload the PDF and the AI classifies the notice type automatically." } },
    { "@type": "Question", name: "Does the AI draft replace the CA's role?", acceptedAnswer: { "@type": "Answer", text: "No. GSTGuard AI drafts the reply for CA review — it does not replace the CA's professional judgment or signature. Every draft carries a clear watermark that it must be reviewed and signed by a CA before filing. The AI handles the 3-hour drafting work so the CA can focus on the 20-minute review." } },
    { "@type": "Question", name: "How accurate is the extracted data from the notice PDF?", acceptedAnswer: { "@type": "Answer", text: "GSTGuard AI tags every extracted field as 'Found' (directly stated in the PDF) or 'Inferred' (derived from context). You can verify each field against the original document before proceeding. No field is silently assumed." } },
    { "@type": "Question", name: "What is the deadline handling approach?", acceptedAnswer: { "@type": "Answer", text: "GSTGuard AI extracts reply deadlines only when they are explicitly stated in the notice document. It does not compute or assume deadlines. Deadlines are shown as extracted text, not computed dates, to prevent errors." } },
    { "@type": "Question", name: "Is GSTGuard AI suitable for CA firms managing multiple clients?", acceptedAnswer: { "@type": "Answer", text: "Yes. The dashboard shows all notices across clients with urgency flags and deadlines. Process 10 notices per day instead of 1-2. Reply drafts are ready in 60 seconds per notice, reducing associate workload by 80%+." } },
  ],
};

const breadcrumbJsonLd = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: [
    { "@type": "ListItem", position: 1, name: "Home", item: "https://nanoneuron.ai" },
    { "@type": "ListItem", position: 2, name: "GSTGuard AI", item: "https://nanoneuron.ai/gstguard-ai" },
  ],
};

export const metadata: Metadata = {
  title: "GSTGuard AI — AI-Drafted GST Notice Replies for CA Firms",
  description:
    "Upload a GST notice PDF. AI reads ASMT-10, DRC-01, DRC-07, ADT-01 and more — extracts all fields, prepares a CA-orientation briefing, and drafts a complete reply in 60 seconds.",
  alternates: { canonical: "https://nanoneuron.ai/gstguard-ai" },
  openGraph: {
    title: "GSTGuard AI — AI-Drafted GST Notice Replies",
    description: "Stop spending 3 hours per GST notice. Upload the PDF, get a CA-ready draft reply in 60 seconds. Handles ASMT-10, DRC-01, DRC-07, ADT-01 and more.",
    url: "https://nanoneuron.ai/gstguard-ai",
  },
  twitter: {
    card: "summary_large_image",
    title: "GSTGuard AI — AI-Drafted GST Notice Replies for CA Firms",
    description: "Upload GST notice PDF, get CA-ready draft reply in 60 seconds. ASMT-10, DRC-01, DRC-07, ADT-01 handled automatically.",
  },
};

export default function GSTGuardAI() {
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
              <Link href="/login" className="text-sm text-white/60 hover:text-white transition-colors">OpsOracle Login</Link>
              <a href={`${GSTGUARD_URL}/register`} className="rounded-xl border border-amber-500/40 bg-amber-500/10 px-5 py-2 text-sm font-semibold text-amber-400 hover:bg-amber-500/20 transition-colors">
                Try GSTGuard Free →
              </a>
            </div>
          </div>
        </nav>
      </header>

      <main id="main-content">
        {/* Hero */}
        <section aria-label="Hero" className="pt-32 pb-20 px-6">
          <div className="mx-auto max-w-5xl text-center">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-amber-500/30 bg-amber-500/10 px-4 py-1.5 text-sm text-amber-400">
              <span aria-hidden="true" className="h-1.5 w-1.5 rounded-full bg-amber-400 animate-pulse" />
              GST Compliance AI · Built for CA Firms
            </div>
            <h1 className="text-5xl font-bold md:text-6xl leading-tight tracking-tight">
              GST notice reply drafted<br />
              <span className="text-amber-400">in 60 seconds.</span>
            </h1>
            <p className="mx-auto mt-8 max-w-2xl text-lg text-white/60 leading-relaxed">
              Upload the notice PDF. AI reads ASMT-10, DRC-01, DRC-07, ADT-01 and more — extracts
              every field, prepares a CA orientation briefing, and drafts a complete, structured
              reply ready for your review and signature.
            </p>

            {/* Notice type chips */}
            <div className="mt-8 flex flex-wrap justify-center gap-2">
              {["ASMT-10", "DRC-01", "DRC-01A", "DRC-07", "GSTR-3A", "ADT-01", "GSTR Mismatch", "DRC-10"].map((t) => (
                <span key={t} className="rounded-full border border-amber-500/20 bg-amber-500/8 px-3 py-1 text-xs font-mono text-amber-400/80">
                  {t}
                </span>
              ))}
            </div>

            <div className="mt-10 flex flex-col sm:flex-row justify-center gap-4">
              <a href={`${GSTGUARD_URL}/register`} className="btn bg-amber-500 hover:bg-amber-400 text-black font-bold text-base px-8 py-4 rounded-xl transition-colors inline-block">
                Try GSTGuard AI Free →
              </a>
              <a href={`${GSTGUARD_URL}/login`} className="rounded-xl border border-white/15 px-8 py-4 text-base hover:bg-white/5 transition-colors inline-block text-center">
                Sign In
              </a>
            </div>
            <p className="mt-4 text-sm text-white/25">Free trial · No credit card · Draft in 60 seconds</p>
          </div>
        </section>

        {/* Metrics */}
        <section aria-label="Key metrics" className="px-6 pb-16">
          <div className="mx-auto max-w-5xl grid grid-cols-2 md:grid-cols-4 gap-4">
            {metrics.map((m) => (
              <div key={m.label} className="card text-center">
                <div className="text-3xl font-bold text-amber-400">{m.value}</div>
                <div className="mt-1 text-sm text-white/50">{m.label}</div>
              </div>
            ))}
          </div>
        </section>

        {/* How it works */}
        <section aria-label="How it works" className="px-6 py-20 border-t border-white/8">
          <div className="mx-auto max-w-5xl">
            <div className="text-center mb-12">
              <p className="text-sm uppercase tracking-widest text-amber-400/70 mb-3">How GSTGuard AI works</p>
              <h2 className="text-3xl md:text-4xl font-bold">From PDF to CA-ready draft in 60 seconds</h2>
            </div>
            <div className="grid md:grid-cols-4 gap-5">
              {[
                { n: "01", title: "Upload notice PDF", desc: "Drop the GST notice PDF — ASMT-10, DRC-01, DRC-07, or any notice type. Any format from the GST portal." },
                { n: "02", title: "AI extracts & classifies", desc: "AI reads notice type, GSTIN, demand amount, issues raised, and deadline. Every field tagged Found or Inferred." },
                { n: "03", title: "CA orientation briefing", desc: "Before the draft: plain-language briefing of what's at stake, which documents to gather, and key risk areas." },
                { n: "04", title: "Draft reply ready", desc: "Complete structured reply covering all issues. AI grounding-checked. CA reviews, signs, and files — done." },
              ].map((s) => (
                <div key={s.n} className="card relative overflow-hidden">
                  <div aria-hidden="true" className="text-5xl font-bold text-white/5 absolute -top-2 -right-2 select-none">{s.n}</div>
                  <div className="text-amber-400 text-sm font-mono mb-3">{s.n}</div>
                  <h3 className="font-semibold text-base mb-2">{s.title}</h3>
                  <p className="text-white/55 text-sm leading-relaxed">{s.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* AI-drafted reply preview */}
        <section aria-label="Sample AI output" className="px-6 py-20 border-t border-white/8">
          <div className="mx-auto max-w-5xl">
            <div className="text-center mb-12">
              <p className="text-sm uppercase tracking-widest text-amber-400/70 mb-3">Sample Output</p>
              <h2 className="text-3xl font-bold">What GSTGuard AI produces</h2>
            </div>
            <div className="grid md:grid-cols-2 gap-6">
              {/* Field extraction panel */}
              <div className="rounded-xl border border-white/10 bg-white/3 p-5">
                <div className="flex items-center gap-2 mb-4">
                  <p className="text-xs text-white/40 uppercase tracking-wider">Extracted Notice Fields</p>
                  <span className="rounded-full bg-amber-500/15 px-2 py-0.5 text-[10px] font-semibold text-amber-400">AI Extracted</span>
                </div>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  {[
                    { label: "Notice Type", value: "ASMT-10", tag: "Found" },
                    { label: "GSTIN", value: "27ABCDE1234F1Z5", tag: "Found" },
                    { label: "Demand Amount", value: "₹8,40,000", tag: "Found" },
                    { label: "Reply Deadline", value: "19-Jun-2026", tag: "Found" },
                    { label: "Tax Period", value: "FY 2022-23", tag: "Found" },
                    { label: "Issues Raised", value: "4 issues", tag: "Inferred" },
                  ].map((f) => (
                    <div key={f.label}>
                      <p className="text-xs text-white/30 mb-0.5 flex items-center gap-1">
                        {f.label}
                        <span className={`rounded-full px-1.5 py-0.5 text-[9px] font-semibold ${f.tag === "Found" ? "bg-emerald-500/15 text-emerald-400/70" : "bg-yellow-500/15 text-yellow-400"}`}>
                          {f.tag}
                        </span>
                      </p>
                      <p className="text-sm font-medium font-mono">{f.value}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* CA Orientation panel */}
              <div className="rounded-xl border border-blue-500/15 bg-blue-500/5 p-5">
                <div className="flex items-center gap-2 mb-3">
                  <p className="text-xs text-white/40 uppercase tracking-wider">CA Orientation Briefing</p>
                  <span className="rounded-full bg-blue-500/15 px-2 py-0.5 text-[10px] font-semibold text-blue-400">AI Briefing</span>
                </div>
                <p className="text-sm text-white/75 leading-relaxed mb-4">
                  ASMT-10 scrutiny notice for FY 2022-23 — GST officer has identified 4 mismatches between GSTR-2A and GSTR-3B. Primary risk is ₹4,20,000 disputed ITC claim. This is pre-demand — a well-documented reply can prevent demand confirmation.
                </p>
                <p className="text-xs text-white/40 uppercase tracking-wider mb-2">Documents to gather</p>
                <ul className="space-y-1.5 text-sm text-white/65">
                  {["GSTR-2A reconciliation for FY 2022-23", "ITC register with vendor invoices", "GSTR-3B filings for the disputed period", "Bank statements for payment reconciliation"].map((d) => (
                    <li key={d} className="flex items-start gap-2">
                      <span className="text-white/25 shrink-0 mt-0.5 font-mono text-xs">□</span>
                      {d}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Draft reply excerpt */}
            <div className="mt-6 rounded-xl border border-amber-500/20 bg-amber-500/5 p-5">
              <div className="flex items-center gap-2 mb-3">
                <p className="text-xs text-amber-400/70 uppercase tracking-wider font-semibold">Draft Reply — AI Generated · For CA Review</p>
                <span className="rounded-full border border-emerald-500/20 bg-emerald-500/5 px-2 py-0.5 text-[10px] font-semibold text-emerald-400/70 ml-auto">All claims grounded</span>
              </div>
              <pre className="whitespace-pre-wrap font-mono text-xs text-white/65 leading-relaxed">
{`To,
The Assessing Officer,
GST Division — Mumbai South

Subject: Reply to Notice ASMT-10 dated 12-Jun-2026
         GSTIN: 27ABCDE1234F1Z5 | FY: 2022-23

Respected Sir/Madam,

With reference to the above-mentioned scrutiny notice,
we hereby submit our reply to the observations raised:

Issue 1: ITC mismatch — GSTR-2A vs GSTR-3B (₹4,20,000)
We submit that the ITC availed in GSTR-3B is fully
supported by tax invoices as enclosed in Annexure-A.
The difference in GSTR-2A reflects late filing by
vendors which was subsequently reconciled...

[Reply continues for all 4 issues]

PREPARED FOR CA REVIEW — Not valid without CA signature.`}
              </pre>
            </div>
          </div>
        </section>

        {/* Pain scenarios */}
        <PainSolver pains={GSTGUARD_PAINS} industry="GST Compliance" />

        {/* Capabilities */}
        <section aria-label="Capabilities" className="px-6 py-20 border-t border-white/8">
          <div className="mx-auto max-w-5xl">
            <div className="text-center mb-14">
              <p className="text-sm uppercase tracking-widest text-amber-400/70 mb-3">GSTGuard AI Capabilities</p>
              <h2 className="text-3xl md:text-4xl font-bold">Everything a CA needs to reply faster</h2>
              <p className="mt-4 text-white/50 max-w-xl mx-auto">
                Built for Indian GST compliance — not a generic AI assistant.
              </p>
            </div>
            <div className="grid md:grid-cols-3 gap-5">
              {capabilities.map((c) => (
                <div key={c.title} className="card hover:border-amber-500/30 hover:bg-white/8 transition-all">
                  <div className="text-xs text-amber-400/70 font-mono uppercase tracking-wider mb-2">{c.kpi}</div>
                  <h3 className="font-semibold text-base mb-2">{c.title}</h3>
                  <p className="text-white/55 text-sm leading-relaxed">{c.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section aria-label="Frequently asked questions" className="px-6 py-20 border-t border-white/8">
          <div className="mx-auto max-w-3xl">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold">Common questions</h2>
            </div>
            <div className="space-y-5">
              {faqJsonLd.mainEntity.map((q) => (
                <div key={q.name} className="card">
                  <h3 className="font-semibold text-base mb-2">{q.name}</h3>
                  <p className="text-white/55 text-sm leading-relaxed">{q.acceptedAnswer.text}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section aria-label="Get started" className="px-6 py-24 border-t border-white/8">
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              Stop spending 3 hours<br />
              <span className="text-amber-400">on every GST notice.</span>
            </h2>
            <p className="text-white/50 text-lg mb-10 max-w-xl mx-auto">
              Upload your first notice now. GSTGuard AI reads the PDF, extracts all fields,
              prepares your CA orientation briefing, and drafts the complete reply — in 60 seconds.
            </p>
            <a href={`${GSTGUARD_URL}/register`} className="btn bg-amber-500 hover:bg-amber-400 text-black font-bold text-base px-10 py-4 rounded-xl transition-colors inline-block">
              Try GSTGuard AI Free →
            </a>
            <p className="mt-4 text-white/25 text-sm">Free trial · No card required · Draft in 60 seconds</p>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer aria-label="Site footer" className="border-t border-white/8 px-6 py-10">
        <div className="mx-auto max-w-6xl flex flex-col sm:flex-row items-center justify-between gap-4">
          <Link href="/" className="text-sm font-semibold"><span className="text-emerald-400">Ops</span>Oracle AI</Link>
          <p className="text-sm text-white/30">© {new Date().getFullYear()} OpsOracle AI. All rights reserved.</p>
          <div className="flex gap-6 text-sm text-white/40 flex-wrap justify-center">
            <Link href="/logistics-ai" className="hover:text-white transition-colors">Logistics AI</Link>
            <Link href="/manufacturing-ai" className="hover:text-white transition-colors">Manufacturing AI</Link>
            <Link href="/devops-ai" className="hover:text-white transition-colors">DevOps AI</Link>
            <Link href="/gstguard-ai" className="hover:text-amber-400 transition-colors">GSTGuard AI</Link>
            <Link href="/pricing" className="hover:text-white transition-colors">Pricing</Link>
            <Link href="/login" className="hover:text-white transition-colors">Login</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
