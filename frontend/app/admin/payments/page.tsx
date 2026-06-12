"use client";
import { useState, useEffect, useCallback } from "react";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

interface PendingPayment {
  id: string;
  user_email: string;
  company_name: string;
  plan_tier: string;
  amount_inr: number;
  utr_reference: string;
  transfer_method: string;
  notes: string;
  status: string;
  created_at: string;
}

export default function AdminPayments() {
  const [secret, setSecret] = useState("");
  const [authed, setAuthed] = useState(false);
  const [payments, setPayments] = useState<PendingPayment[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState<Record<string, string>>({});
  const [showReject, setShowReject] = useState<string | null>(null);

  const fetchPending = useCallback(async (s: string) => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`${API}/payments/bank-transfer/pending?secret=${encodeURIComponent(s)}`);
      if (res.status === 403) throw new Error("Invalid admin secret.");
      if (!res.ok) throw new Error("Failed to fetch payments.");
      const d = await res.json();
      setPayments(d);
      setAuthed(true);
      sessionStorage.setItem("ops_admin_secret", s);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Error fetching payments.");
      setAuthed(false);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const saved = sessionStorage.getItem("ops_admin_secret");
    if (saved) { setSecret(saved); fetchPending(saved); }
  }, [fetchPending]);

  async function approve(id: string) {
    setActionLoading(id);
    setError("");
    try {
      const res = await fetch(`${API}/payments/bank-transfer/${id}/approve?secret=${encodeURIComponent(secret)}`, {
        method: "POST",
      });
      if (!res.ok) { const e = await res.json(); throw new Error(e.detail || "Approval failed."); }
      setPayments((prev) => prev.filter((p) => p.id !== id));
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Approval failed.");
    } finally {
      setActionLoading(null);
    }
  }

  async function reject(id: string) {
    const reason = rejectReason[id]?.trim() || "Payment could not be verified";
    setActionLoading(id);
    setError("");
    try {
      const res = await fetch(
        `${API}/payments/bank-transfer/${id}/reject?secret=${encodeURIComponent(secret)}&reason=${encodeURIComponent(reason)}`,
        { method: "POST" }
      );
      if (!res.ok) { const e = await res.json(); throw new Error(e.detail || "Rejection failed."); }
      setPayments((prev) => prev.filter((p) => p.id !== id));
      setShowReject(null);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Rejection failed.");
    } finally {
      setActionLoading(null);
    }
  }

  if (!authed) {
    return (
      <main className="min-h-screen bg-zinc-950 text-white flex items-center justify-center px-6">
        <div className="w-full max-w-md">
          <h1 className="text-2xl font-bold mb-2">Admin — Bank Transfers</h1>
          <p className="text-white/40 text-sm mb-8">Enter your ADMIN_SECRET to view and action pending payments.</p>
          {error && <p className="text-red-400 text-sm mb-4">{error}</p>}
          <form
            onSubmit={(e) => { e.preventDefault(); fetchPending(secret); }}
            className="space-y-4"
          >
            <input
              type="password"
              value={secret}
              onChange={(e) => setSecret(e.target.value)}
              placeholder="ADMIN_SECRET"
              required
              className="w-full rounded-xl border border-white/15 bg-white/5 px-4 py-3 text-sm text-white placeholder-white/20 focus:border-emerald-500/40 focus:outline-none"
            />
            <button
              type="submit"
              disabled={loading || !secret}
              className="w-full rounded-xl bg-emerald-500 hover:bg-emerald-400 text-white px-6 py-3 text-sm font-semibold transition-colors disabled:opacity-50"
            >
              {loading ? "Loading…" : "Access Admin Panel"}
            </button>
          </form>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-zinc-950 text-white px-6 py-12">
      <div className="mx-auto max-w-5xl">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold">Bank Transfer Approvals</h1>
            <p className="text-white/40 text-sm mt-1">{payments.length} pending payment{payments.length !== 1 ? "s" : ""}</p>
          </div>
          <button
            onClick={() => fetchPending(secret)}
            disabled={loading}
            className="rounded-xl border border-white/15 px-4 py-2 text-sm text-white/60 hover:text-white hover:bg-white/5 transition-colors disabled:opacity-50"
          >
            {loading ? "Refreshing…" : "Refresh"}
          </button>
        </div>

        {error && (
          <div className="mb-6 rounded-xl border border-red-500/30 bg-red-500/10 px-5 py-4 text-red-400 text-sm">
            {error}
          </div>
        )}

        {payments.length === 0 ? (
          <div className="rounded-2xl border border-white/10 bg-white/3 py-16 text-center text-white/30 text-sm">
            No pending bank transfers.
          </div>
        ) : (
          <div className="space-y-4">
            {payments.map((p) => (
              <div key={p.id} className="rounded-2xl border border-white/10 bg-white/3 p-6">
                <div className="flex flex-wrap items-start gap-4 justify-between mb-4">
                  <div>
                    <p className="font-semibold text-white">{p.user_email}</p>
                    {p.company_name && <p className="text-sm text-white/40">{p.company_name}</p>}
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-emerald-400 text-lg">₹{p.amount_inr.toLocaleString("en-IN")}</p>
                    <p className="text-xs text-white/40 capitalize">{p.plan_tier.replace("_", " ")}</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4 text-sm">
                  <div>
                    <p className="text-xs text-white/30 mb-0.5">UTR / Ref</p>
                    <p className="font-mono text-white">{p.utr_reference}</p>
                  </div>
                  <div>
                    <p className="text-xs text-white/30 mb-0.5">Method</p>
                    <p className="text-white uppercase">{p.transfer_method}</p>
                  </div>
                  <div>
                    <p className="text-xs text-white/30 mb-0.5">Submitted</p>
                    <p className="text-white/70">{new Date(p.created_at).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" })}</p>
                  </div>
                  {p.notes && (
                    <div>
                      <p className="text-xs text-white/30 mb-0.5">Notes</p>
                      <p className="text-white/60 truncate">{p.notes}</p>
                    </div>
                  )}
                </div>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => approve(p.id)}
                    disabled={actionLoading === p.id}
                    className="rounded-xl bg-emerald-500 hover:bg-emerald-400 text-white px-5 py-2 text-sm font-semibold transition-colors disabled:opacity-50"
                  >
                    {actionLoading === p.id ? "Processing…" : "Approve & Activate"}
                  </button>
                  <button
                    onClick={() => setShowReject(showReject === p.id ? null : p.id)}
                    disabled={actionLoading === p.id}
                    className="rounded-xl border border-red-500/30 bg-red-500/10 text-red-400 hover:bg-red-500/20 px-5 py-2 text-sm font-medium transition-colors disabled:opacity-50"
                  >
                    Reject
                  </button>
                </div>
                {showReject === p.id && (
                  <div className="mt-3 flex gap-2">
                    <input
                      type="text"
                      value={rejectReason[p.id] || ""}
                      onChange={(e) => setRejectReason((prev) => ({ ...prev, [p.id]: e.target.value }))}
                      placeholder="Rejection reason (optional)"
                      className="flex-1 rounded-xl border border-white/15 bg-white/5 px-4 py-2 text-sm text-white placeholder-white/20 focus:border-red-500/40 focus:outline-none"
                    />
                    <button
                      onClick={() => reject(p.id)}
                      disabled={actionLoading === p.id}
                      className="rounded-xl bg-red-500 hover:bg-red-400 text-white px-4 py-2 text-sm font-semibold transition-colors disabled:opacity-50"
                    >
                      Confirm
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
