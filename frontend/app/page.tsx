import Link from "next/link";

export default function Home() {
  return (
    <main className="min-h-screen px-8 py-20">
      <section className="mx-auto max-w-5xl text-center">
        <p className="mb-4 text-sm uppercase tracking-[0.3em] text-white/50">Vertical AI for Industrial Operations</p>
        <h1 className="text-5xl font-bold md:text-7xl leading-tight">
          Predict operational problems<br />before they become expensive.
        </h1>
        <p className="mx-auto mt-6 max-w-2xl text-lg text-white/70">
          OpsOracle AI analyzes logistics, warehouse, and manufacturing reports to detect delays,
          bottlenecks, inventory risks, and give executive-ready insights.
        </p>
        <div className="mt-10 flex justify-center gap-4">
          <Link className="btn" href="/register">Start Free</Link>
          <Link className="rounded-xl border border-white/15 px-6 py-3 hover:bg-white/5 transition-colors" href="/login">Login</Link>
        </div>
        <div className="mt-20 grid gap-6 md:grid-cols-3 text-left">
          {[
            { title: "Shipment Delay Detection", desc: "Upload your logistics CSV and get delay probability scored instantly." },
            { title: "Inventory Risk Alerts", desc: "Catch stockout risks and shortage patterns before they disrupt production." },
            { title: "Executive AI Summary", desc: "One-click AI report your ops team and leadership can act on today." },
          ].map((f) => (
            <div key={f.title} className="card">
              <h3 className="font-semibold text-lg">{f.title}</h3>
              <p className="mt-2 text-white/60 text-sm">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
