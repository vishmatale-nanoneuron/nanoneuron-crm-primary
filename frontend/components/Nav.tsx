import Link from "next/link";

export default function Nav() {
  return (
    <nav className="flex items-center justify-between border-b border-white/10 px-8 py-5">
      <Link href="/" className="text-xl font-bold">OpsOracle AI</Link>
      <div className="flex gap-6 text-sm text-white/70">
        <Link href="/dashboard" className="hover:text-white transition-colors">Dashboard</Link>
        <Link href="/upload" className="hover:text-white transition-colors">Upload</Link>
        <Link href="/reports" className="hover:text-white transition-colors">Reports</Link>
      </div>
    </nav>
  );
}
