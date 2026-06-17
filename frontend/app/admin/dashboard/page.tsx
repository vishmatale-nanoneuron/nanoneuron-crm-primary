"use client";
import { useEffect, useState, useCallback } from "react";
import Nav from "@/components/Nav";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

type Stats = {
  users: { total: number; today: number; this_week: number };
  reports: { total: number; today: number; this_week: number };
  subscriptions: { active: number; trial: number };
  revenue: { this_month_inr: number; total_inr: number };
  pending_payments: number;
  avg_risk_score_7d: number | null;
  generated_at: string;
};

type PendingPayment = {
  id: string;
  user_email: string;
  company_name: string;
  plan_tier: string;
  amount_inr: number;
  utr_reference: string;
  transfer_method: string;
  notes: string;
  created_at: string;
};

type RecentUser = {
  email: string;
  company: string;
  plan: string;
  joined: string;
};

export default function AdminDashboard() {
  const [secret, setSecret] = useState("");
  const [authed, setAuthed] = useState(false);
  const [stats, setStats] = useState<Stats | null>(null);
  const [pending, setPending] = useState<PendingPayment[]>([]);
  const [recentUsers, setRecentUsers] = useState<RecentUser[]>([]);
  const [error, setError] = useState("");
  const [approving, setApproving] = useState<string | null>(null);
  const [lastRefresh, setLastRefresh] = useState<Date | null>(null);

  const fetchAll = useCallback(async (s: string) => {
    const [statsRes, pendingRes, usersRes] = await Promise.all([
      fetch(`${API}/admin/stats?secret=${encodeURIComponent(s)}`),
      fetch(`${API}/admin/pending-payments?secret=${encodeURIComponent(s)}`),
      fetch(`${API}/admin/recent-signups?secret=${encodeURIComponent(s)}&limit=10`),
    ]);
    if (statsRes.status === 403) { setError("Invalid admin secret."); setAuthed(false); return; }
    if (!statsRes.ok) { setError("Failed to load stats."); return; }
    setStats(await statsRes.json());
    if (pendingRes.ok) setPending(await pendingRes.json());
    if (usersRes.ok) setRecentUsers(await usersRes.json());
    setLastRefresh(new Date());
    setError("");
  }, []);

  useEffect(() => {
    if (!authed) return;
    fetchAll(secret);
    const id = setInterval(() => fetchAll(secret), 30000);
    return () => clearInterval(id);
  }, [authed, secret, fetchAll]);

  async function approve(paymentId: string) {
    setApproving(paymentId);
    const res = await fetch(`${API}/admin/payments/${paymentId}/approve?secret=${encodeURIComponent(secret)}`, { method: "POST" });
    setApproving(null);
    if (res.ok) {
      setPending(prev => prev.filter(p => p.id !== paymentId));
      fetchAll(secret);
    }
  }

  async function reject(paymentId: string) {
    const reason = prompt("Rejection reason:");
    if (!reason) return;
    const res = await fetch(
      `${API}/admin/payments/${paymentId}/reject?secret=${encodeURIComponent(secret)}&reason=${encodeURIComponent(reason)}`,
      { method: "POST" },
    );
    if (res.ok) setPending(prev => prev.filter(p => p.id !== paymentId));
  }

  if (!authed) {
    return (
      <>
        <Nav />
        <main className="p-8 flex items-center justify-center min-h-[60vh]">
          <div className="card max-w-sm w-full space-y-4">
            <h1 className="text-xl font-bold">Admin Dashboard</h1>
            <div className="space-y-1">
              <label htmlFor="admin-secret" className="block text-sm text-white/60">Admin Secret</label>
              <input
                id="admin-secret"
                type="password"
                className="input w-full"
                value={secret}
                onChange={e => setSecret(e.target.value)}
                onKeyDown={e => { if (e.key === "Enter") { setAuthed(true); } }}
                placeholder="Enter admin secret"
              />
            </div>
            {error && <p className="text-red-400 text-sm">{error}</p>}
            <button onClick={() => setAuthed(true)} className="btn w-full">Access Dashboard</button>
          </div>
        </main>
      </>
    );
  }

  return (
    <>
      <Nav />
      <main className="p-8 space-y-8">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-3xl font-bold">Admin Dashboard</h1>
            {lastRefresh && (
              <p className="text-white/30 text-xs mt-1">Last updated {lastRefresh.toLocaleTimeString()} · auto-refreshes every 30s</p>
            )}
          </div>
          <button onClick={() => fetchAll(secret)} className="rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-white/60 hover:text-white hover:bg-white/10 transition-colors">
            Refresh now
          </button>
        </div>

        {error && <p className="text-red-400 text-sm">{error}</p>}

        {/* Metric cards */}
        {stats && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <MetricCard label="Total Users" value={stats.users.total} sub={`+${stats.users.today} today · +${stats.users.this_week} this week`} />
            <MetricCard label="Reports Analyzed" value={stats.reports.total} sub={`+${stats.reports.today} today · +${stats.reports.this_week} this week`} />
            <MetricCard label="Active Subscriptions" value={stats.subscriptions.active} sub={`${stats.subscriptions.trial} on trial`} color="emerald" />
            <MetricCard label="Revenue This Month" value={`₹${stats.revenue.this_month_inr.toLocaleString("en-IN")}`} sub={`₹${stats.revenue.total_inr.toLocaleString("en-IN")} all time`} color="emerald" />
            {stats.avg_risk_score_7d !== null && (
              <MetricCard label="Avg Risk Score (7d)" value={stats.avg_risk_score_7d} sub="across all users" color={stats.avg_risk_score_7d > 60 ? "red" : "blue"} />
            )}
            <MetricCard label="Pending Payments" value={stats.pending_payments} sub="awaiting approval" color={stats.pending_payments > 0 ? "yellow" : undefined} />
          </div>
        )}

        {/* Pending payments */}
        <section>
          <h2 className="text-lg font-semibold mb-3 flex items-center gap-2">
            Pending Payments
            {pending.length > 0 && (
              <span className="rounded-full bg-yellow-500/20 text-yellow-400 text-xs px-2 py-0.5">{pending.length}</span>
            )}
          </h2>
          {pending.length === 0 ? (
            <p className="text-white/30 text-sm">No pending payments.</p>
          ) : (
            <div className="space-y-3">
              {pending.map(p => (
                <div key={p.id} className="card border-yellow-500/20 bg-yellow-500/5">
                  <div className="flex items-start justify-between gap-4 flex-wrap">
                    <div className="space-y-1">
                      <p className="font-medium">{p.user_email} {p.company_name && <span className="text-white/50 text-sm">· {p.company_name}</span>}</p>
                      <p className="text-sm text-white/60">
                        <span className="capitalize font-semibold text-emerald-400">{p.plan_tier}</span> · ₹{p.amount_inr.toLocaleString("en-IN")} · {p.transfer_method.toUpperCase()}
                      </p>
                      <p className="text-xs text-white/40">UTR: <span className="font-mono text-white/70">{p.utr_reference}</span></p>
                      {p.notes && <p className="text-xs text-white/40">Note: {p.notes}</p>}
                      <p className="text-xs text-white/30">{new Date(p.created_at).toLocaleString()}</p>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => approve(p.id)}
                        disabled={approving === p.id}
                        className="rounded-lg bg-emerald-500 hover:bg-emerald-400 px-4 py-2 text-sm font-semibold text-white transition-colors disabled:opacity-50"
                      >
                        {approving === p.id ? "Approving..." : "Approve"}
                      </button>
                      <button
                        onClick={() => reject(p.id)}
                        className="rounded-lg border border-red-500/30 bg-red-500/10 hover:bg-red-500/20 px-4 py-2 text-sm font-semibold text-red-400 transition-colors"
                      >
                        Reject
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Recent signups */}
        <section>
          <h2 className="text-lg font-semibold mb-3">Recent Signups</h2>
          {recentUsers.length === 0 ? (
            <p className="text-white/30 text-sm">No users yet.</p>
          ) : (
            <div className="card overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-white/40 text-xs uppercase tracking-wider border-b border-white/10">
                    <th className="text-left pb-2 pr-4">Email</th>
                    <th className="text-left pb-2 pr-4">Company</th>
                    <th className="text-left pb-2 pr-4">Plan</th>
                    <th className="text-left pb-2">Joined</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {recentUsers.map((u, i) => (
                    <tr key={i}>
                      <td className="py-2 pr-4 text-white/80">{u.email}</td>
                      <td className="py-2 pr-4 text-white/50">{u.company || "—"}</td>
                      <td className="py-2 pr-4">
                        <span className={`text-xs font-semibold ${
                          u.plan === "free" ? "text-white/40" :
                          u.plan === "trial" ? "text-yellow-400" :
                          "text-emerald-400"
                        }`}>{u.plan}</span>
                      </td>
                      <td className="py-2 text-white/30 text-xs">{u.joined ? new Date(u.joined).toLocaleString() : "—"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </main>
    </>
  );
}

function MetricCard({
  label, value, sub, color,
}: { label: string; value: string | number; sub?: string; color?: "emerald" | "yellow" | "red" | "blue" }) {
  const colors = {
    emerald: "border-emerald-500/20 bg-emerald-500/5",
    yellow: "border-yellow-500/20 bg-yellow-500/5",
    red: "border-red-500/20 bg-red-500/5",
    blue: "border-blue-500/20 bg-blue-500/5",
  };
  const valueColors = {
    emerald: "text-emerald-400",
    yellow: "text-yellow-400",
    red: "text-red-400",
    blue: "text-blue-400",
  };
  return (
    <div className={`card ${color ? colors[color] : "border-white/10 bg-white/5"}`}>
      <p className="text-xs uppercase tracking-wider text-white/40 mb-1">{label}</p>
      <p className={`text-2xl font-bold ${color ? valueColors[color] : "text-white"}`}>{value}</p>
      {sub && <p className="text-xs text-white/30 mt-1">{sub}</p>}
    </div>
  );
}
