import Link from "next/link";
import Nav from "@/components/Nav";

export default function Dashboard() {
  return (
    <>
      <Nav />
      <main className="p-8">
        <h1 className="mb-2 text-4xl font-bold">Predictive Operations Dashboard</h1>
        <p className="mb-8 text-white/50">Upload a report to see live AI risk scores</p>
        <div className="grid gap-6 md:grid-cols-4">
          {[
            { label: "Risk Score", value: "--" },
            { label: "Delay Probability", value: "--" },
            { label: "Inventory Risk", value: "--" },
            { label: "Reports Analyzed", value: "--" },
          ].map(m => (
            <div key={m.label} className="card">
              <p className="text-white/50 text-sm">{m.label}</p>
              <h2 className="mt-1 text-4xl font-bold">{m.value}</h2>
            </div>
          ))}
        </div>
        <section className="card mt-8 flex flex-col items-start gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-xl font-semibold">Analyze Your First Report</h2>
            <p className="mt-1 text-white/60 text-sm">Upload CSV, Excel, or PDF operational data to get instant AI predictions.</p>
          </div>
          <Link href="/upload" className="btn shrink-0">Upload Report</Link>
        </section>
        <section className="card mt-6">
          <h2 className="mb-3 text-lg font-semibold">Recent Reports</h2>
          <p className="text-white/40 text-sm">No reports yet. <Link href="/upload" className="text-emerald-400 hover:underline">Upload your first report →</Link></p>
        </section>
      </main>
    </>
  );
}
