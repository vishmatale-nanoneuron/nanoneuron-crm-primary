import Link from "next/link";

type Pain = {
  pain: string;
  signal: string;
  aiOutput: {
    risk: number;
    label: string;
    color: "red" | "yellow" | "emerald";
    summary: string;
    action: string;
    impact: string;
  };
};

const colorMap = {
  red: { bar: "bg-red-500", text: "text-red-400", border: "border-red-500/20", bg: "bg-red-500/8" },
  yellow: { bar: "bg-yellow-500", text: "text-yellow-400", border: "border-yellow-500/20", bg: "bg-yellow-500/8" },
  emerald: { bar: "bg-emerald-500", text: "text-emerald-400", border: "border-emerald-500/20", bg: "bg-emerald-500/8" },
};

export function PainSolver({ pains, industry }: { pains: Pain[]; industry: string }) {
  return (
    <section className="px-6 py-20 border-t border-white/8">
      <div className="mx-auto max-w-5xl">
        <div className="text-center mb-14">
          <p className="text-xs uppercase tracking-widest text-red-400/70 mb-3">Real Pain → AI Solves It</p>
          <h2 className="text-3xl md:text-4xl font-bold">
            Your team faces these every week.
            <br />
            <span className="text-emerald-400">OpsOracle names them and fixes them.</span>
          </h2>
          <p className="mt-4 text-white/40 text-sm max-w-xl mx-auto">
            Actual AI output from real {industry} data. Upload your report and get this analysis in under 30 seconds.
          </p>
        </div>

        <div className="space-y-6">
          {pains.map((p, i) => {
            const c = colorMap[p.aiOutput.color];
            return (
              <div key={i} className="grid md:grid-cols-2 gap-0 rounded-2xl overflow-hidden border border-white/10">
                {/* Pain side */}
                <div className="bg-white/3 p-6 border-r border-white/8">
                  <p className="text-xs uppercase tracking-wider text-red-400/60 mb-2">The Pain</p>
                  <p className="font-semibold text-base mb-3 text-white/90">{p.pain}</p>
                  <div className="rounded-xl bg-white/5 border border-white/8 px-4 py-3">
                    <p className="text-xs text-white/30 font-mono mb-1">Raw data signal</p>
                    <p className="text-sm text-white/60 font-mono">{p.signal}</p>
                  </div>
                </div>

                {/* AI Output side */}
                <div className="bg-emerald-500/3 p-6">
                  <p className="text-xs uppercase tracking-wider text-emerald-400/60 mb-2">OpsOracle AI Output</p>
                  <div className="flex items-center gap-3 mb-3">
                    <div className={`rounded-full ${c.bg} border ${c.border} px-3 py-1`}>
                      <span className={`text-xs font-bold ${c.text}`}>{p.aiOutput.risk}% Risk — {p.aiOutput.label}</span>
                    </div>
                  </div>
                  <p className="text-sm text-white/70 mb-3 leading-relaxed">{p.aiOutput.summary}</p>
                  <div className={`rounded-xl ${c.bg} border ${c.border} px-4 py-3`}>
                    <p className="text-xs text-white/40 mb-1">[THIS WEEK] Action</p>
                    <p className={`text-sm font-semibold ${c.text}`}>{p.aiOutput.action}</p>
                    <p className="text-xs text-white/40 mt-1">Expected impact: {p.aiOutput.impact}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-10 text-center">
          <Link href="/register" className="btn px-8 py-4 text-base inline-block">
            Analyze Your {industry} Data Free →
          </Link>
          <p className="mt-3 text-white/30 text-sm">14-day Pro trial · No credit card · Results in 30 seconds</p>
        </div>
      </div>
    </section>
  );
}
