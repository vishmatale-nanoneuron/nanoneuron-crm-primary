"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export default function Login() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    const res = await fetch(`${API}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    setLoading(false);
    if (!res.ok) { setError("Invalid email or password"); return; }
    const data = await res.json();
    localStorage.setItem("token", data.access_token);
    router.push("/dashboard");
  }

  return (
    <main className="mx-auto max-w-md px-6 py-20">
      <h1 className="mb-2 text-3xl font-bold">Login</h1>
      <p className="mb-8 text-white/50">Welcome back to OpsOracle AI</p>
      <form onSubmit={submit} className="card space-y-4">
        <input className="input" type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} required />
        <input className="input" type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} required />
        <button className="btn w-full" disabled={loading}>{loading ? "Logging in..." : "Login"}</button>
        {error && <p className="text-red-400 text-sm">{error}</p>}
      </form>
      <p className="mt-6 text-center text-white/50 text-sm">
        No account? <Link href="/register" className="text-emerald-400 hover:underline">Register free</Link>
      </p>
    </main>
  );
}
