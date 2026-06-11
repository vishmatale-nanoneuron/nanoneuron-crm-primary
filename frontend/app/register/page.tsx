"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export default function Register() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [company, setCompany] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    const res = await fetch(`${API}/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password, company_name: company }),
    });
    setLoading(false);
    if (!res.ok) { const d = await res.json(); setError(d.detail || "Registration failed"); return; }
    router.push("/login");
  }

  return (
    <main className="mx-auto max-w-md px-6 py-20">
      <h1 className="mb-2 text-3xl font-bold">Create Account</h1>
      <p className="mb-8 text-white/50">Start predicting operational risks today</p>
      <form onSubmit={submit} className="card space-y-4">
        <div className="space-y-1">
          <label htmlFor="reg-email" className="block text-sm text-white/60">Work Email</label>
          <input id="reg-email" className="input" type="email" placeholder="you@company.com" value={email} onChange={e => setEmail(e.target.value)} required autoComplete="email" />
        </div>
        <div className="space-y-1">
          <label htmlFor="reg-company" className="block text-sm text-white/60">Company Name</label>
          <input id="reg-company" className="input" placeholder="Acme Corp" value={company} onChange={e => setCompany(e.target.value)} required autoComplete="organization" />
        </div>
        <div className="space-y-1">
          <label htmlFor="reg-password" className="block text-sm text-white/60">Password</label>
          <input id="reg-password" className="input" type="password" placeholder="Min. 8 characters" value={password} onChange={e => setPassword(e.target.value)} required autoComplete="new-password" />
        </div>
        <button className="btn w-full" disabled={loading}>{loading ? "Creating account..." : "Create Account"}</button>
        {error && <p role="alert" className="text-red-400 text-sm">{error}</p>}
      </form>
      <p className="mt-6 text-center text-white/50 text-sm">
        Have an account? <Link href="/login" className="text-emerald-400 hover:underline">Login</Link>
      </p>
    </main>
  );
}
