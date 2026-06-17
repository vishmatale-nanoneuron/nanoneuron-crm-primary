"use client";
import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import Nav from "@/components/Nav";
import { useRouter } from "next/navigation";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

type Notice = {
  id: string;
  file_name: string;
  notice_type: string | null;
  gstin: string | null;
  taxpayer_name: string | null;
  notice_number: string | null;
  notice_date: string | null;
  deadline: string | null;
  days_left: number | null;
  urgency: "overdue" | "critical" | "warning" | "normal";
  demand_amount_inr: number | null;
  period: string | null;
  status: "draft" | "reviewed" | "filed";
  created_at: string | null;
};

const URGENCY_STYLES = {
  overdue: "border-red-500/40 bg-red-500/10",
  critical: "border-orange-500/40 bg-orange-500/10",
  warning: "border-yellow-500/30 bg-yellow-500/5",
  normal: "border-white/10 bg-white/5",
};

const STATUS_BADGE = {
  draft: "bg-white/10 text-white/50",
  reviewed: "bg-blue-500/20 text-blue-300",
  filed: "bg-emerald-500/20 text-emerald-300",
};

export default function GSTDashboard() {
  const router = useRouter();
  const [notices, setNotices] = useState<Notice[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchNotices = useCallback(async () => {
    const token = localStorage.getItem("token");
    if (!token) { router.push("/login"); return; }
    try {
      const res = await fetch(`${API}/gst/notices`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.status === 401) { router.push("/login"); return; }
      if (res.status === 402) {
        setError("GSTGuard requires a Pro or Enterprise plan.");
        setLoading(false);
        return;
      }
      if (!res.ok) { setError("Failed to load notices."); setLoading(false); return; }
      setNotices(await res.json());
    } catch {
      setError("Network error.");
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => { fetchNotices(); }, [fetchNotices]);

  const markFiled = async (id: string) => {
    const token = localStorage.getItem("token");
    await fetch(`${API}/gst/notices/${id}/mark-filed`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
    });
    setNotices(prev => prev.map(n => n.id === id ? { ...n, status: "filed" } : n));
  };

  const overdue = notices.filter(n => n.urgency === "overdue").length;
  const critical = notices.filter(n => n.urgency === "critical").length;
  const pending = notices.filter(n => n.status !== "filed").length;

  return (
    <>
      <Nav />
      <main className="p-8 max-w-5xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-3xl font-bold">GSTGuard</h1>
            <p className="text-white/40 text-sm mt-1">AI-powered GST notice management for CA firms</p>
          </div>
          <Link href="/gst/upload" className="btn">Upload Notice</Link>
        </div>

        {/* Summary chips */}
        {!loading && !error && notices.length > 0 && (
          <div className="flex gap-3 flex-wrap">
            {overdue > 0 && <span className="rounded-full bg-red-500/20 text-red-300 text-xs px-3 py-1 font-semibold">{overdue} overdue</span>}
            {critical > 0 && <span className="rounded-full bg-orange-500/20 text-orange-300 text-xs px-3 py-1 font-semibold">{critical} critical (≤3 days)</span>}
            <span className="rounded-full bg-white/10 text-white/50 text-xs px-3 py-1">{pending} pending action</span>
            <span className="rounded-full bg-emerald-500/10 text-emerald-400 text-xs px-3 py-1">{notices.filter(n => n.status === "filed").length} filed</span>
          </div>
        )}

        {loading && <p className="text-white/40">Loading notices…</p>}
        {error && (
          <div className="card border-red-500/30 bg-red-500/10 space-y-3">
            <p className="text-red-300">{error}</p>
            {error.includes("Pro") && (
              <Link href="/pricing" className="btn !py-2 !px-4 !text-sm inline-block">Upgrade Plan</Link>
            )}
          </div>
        )}

        {!loading && !error && notices.length === 0 && (
          <div className="card text-center py-16 space-y-4">
            <p className="text-white/30 text-lg">No GST notices yet</p>
            <Link href="/gst/upload" className="btn inline-block">Upload your first notice</Link>
          </div>
        )}

        {/* Notice cards */}
        <div className="space-y-4">
          {notices.map(n => (
            <div key={n.id} className={`card ${URGENCY_STYLES[n.urgency]} space-y-3`}>
              <div className="flex items-start justify-between gap-4 flex-wrap">
                <div className="space-y-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-semibold text-white/90">{n.notice_type || "Unknown type"}</span>
                    {n.notice_number && <span className="text-white/40 text-sm">#{n.notice_number}</span>}
                    <span className={`rounded-full text-xs px-2 py-0.5 font-semibold ${STATUS_BADGE[n.status]}`}>{n.status}</span>
                    {n.urgency !== "normal" && (
                      <span className={`rounded-full text-xs px-2 py-0.5 font-bold ${
                        n.urgency === "overdue" ? "bg-red-500 text-white" :
                        n.urgency === "critical" ? "bg-orange-500 text-white" :
                        "bg-yellow-500/30 text-yellow-300"
                      }`}>
                        {n.urgency === "overdue" ? "OVERDUE" :
                         n.urgency === "critical" ? `${n.days_left}d left` :
                         `${n.days_left}d`}
                      </span>
                    )}
                  </div>
                  {n.taxpayer_name && <p className="text-sm text-white/70">{n.taxpayer_name}</p>}
                  <div className="flex flex-wrap gap-x-4 gap-y-0.5 text-xs text-white/40">
                    {n.gstin && <span>GSTIN: <span className="font-mono text-white/60">{n.gstin}</span></span>}
                    {n.period && <span>Period: {n.period}</span>}
                    {n.demand_amount_inr && <span className="text-yellow-300 font-semibold">₹{n.demand_amount_inr.toLocaleString("en-IN")}</span>}
                    {n.deadline && <span>Reply by: <span className={n.urgency === "overdue" ? "text-red-400 font-semibold" : "text-white/60"}>{n.deadline}</span></span>}
                  </div>
                </div>
                <div className="flex gap-2">
                  <Link
                    href={`/gst/notices/${n.id}`}
                    className="rounded-lg border border-white/20 bg-white/5 hover:bg-white/10 px-3 py-1.5 text-sm text-white/70 hover:text-white transition-colors"
                  >
                    View Draft
                  </Link>
                  {n.status !== "filed" && (
                    <button
                      onClick={() => markFiled(n.id)}
                      className="rounded-lg border border-emerald-500/30 bg-emerald-500/10 hover:bg-emerald-500/20 px-3 py-1.5 text-sm text-emerald-400 transition-colors"
                    >
                      Mark Filed
                    </button>
                  )}
                </div>
              </div>
              <p className="text-xs text-white/25">{n.file_name} · {n.created_at ? new Date(n.created_at).toLocaleString() : ""}</p>
            </div>
          ))}
        </div>
      </main>
    </>
  );
}
