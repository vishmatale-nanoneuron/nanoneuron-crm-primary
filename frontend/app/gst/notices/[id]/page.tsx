"use client";
import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import Nav from "@/components/Nav";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

type DraftFigure = { figure: string; type: string; status: "verified" | "unverified"; note: string };
type Draft = {
  id: string;
  version: number;
  draft_text: string;
  accepted: boolean;
  cai_revised: boolean;
  cai_notes: string | null;
  draft_figures: DraftFigure[];
  created_at: string | null;
};

type Notice = {
  id: string;
  notice_type: string | null;
  gstin: string | null;
  taxpayer_name: string | null;
  notice_number: string | null;
  notice_date: string | null;
  deadline: string | null;
  days_left: number | null;
  urgency: string;
  demand_amount_inr: number | null;
  period: string | null;
  issues: string[];
  extraction_confidence: string;
  field_sources: Record<string, string>;
  ca_orientation: { plain_summary: string; key_documents_to_gather: string[]; ca_notes: string } | null;
  status: string;
  drafts: Draft[];
};

export default function NoticeDetail() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [notice, setNotice] = useState<Notice | null>(null);
  const [loading, setLoading] = useState(true);
  const [regenerating, setRegenerating] = useState(false);
  const [accepting, setAccepting] = useState<string | null>(null);
  const [selectedDraft, setSelectedDraft] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState("");

  const fetchNotice = useCallback(async () => {
    const token = localStorage.getItem("token");
    if (!token) { router.push("/login"); return; }
    const res = await fetch(`${API}/gst/notices/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (res.status === 401) { router.push("/login"); return; }
    if (!res.ok) { setError("Failed to load notice."); setLoading(false); return; }
    const data: Notice = await res.json();
    setNotice(data);
    if (data.drafts.length > 0) setSelectedDraft(data.drafts[0].id);
    setLoading(false);
  }, [id, router]);

  useEffect(() => { fetchNotice(); }, [fetchNotice]);

  // Poll if no drafts yet — background generation may still be in progress (max 60s)
  useEffect(() => {
    if (!notice || notice.drafts.length > 0) return;
    let polls = 0;
    const MAX_POLLS = 15;
    const poll = setInterval(async () => {
      polls++;
      if (polls >= MAX_POLLS) {
        clearInterval(poll);
        setError("Draft generation timed out. Click Regenerate to retry.");
        return;
      }
      const token = localStorage.getItem("token");
      if (!token) return;
      const res = await fetch(`${API}/gst/notices/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) return;
      const data: Notice = await res.json();
      if (data.drafts.length > 0) {
        setNotice(data);
        setSelectedDraft(data.drafts[0].id);
        clearInterval(poll);
      }
    }, 4000);
    return () => clearInterval(poll);
  }, [notice, id]);

  const regenerate = async () => {
    const token = localStorage.getItem("token");
    setRegenerating(true);
    try {
      const res = await fetch(`${API}/gst/notices/${id}/regenerate-draft`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const draft = await res.json();
        setNotice(prev => prev ? { ...prev, drafts: [draft, ...prev.drafts] } : prev);
        setSelectedDraft(draft.id);
      }
    } finally {
      setRegenerating(false);
    }
  };

  const acceptDraft = async (draftId: string) => {
    const token = localStorage.getItem("token");
    setAccepting(draftId);
    const res = await fetch(`${API}/gst/notices/${id}/accept-draft/${draftId}`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
    });
    if (res.ok) {
      setNotice(prev => prev ? {
        ...prev,
        status: "reviewed",
        drafts: prev.drafts.map(d => ({ ...d, accepted: d.id === draftId })),
      } : prev);
    }
    setAccepting(null);
  };

  const markFiled = async () => {
    const token = localStorage.getItem("token");
    await fetch(`${API}/gst/notices/${id}/mark-filed`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
    });
    setNotice(prev => prev ? { ...prev, status: "filed" } : prev);
  };

  const copyDraft = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const activeDraft = notice?.drafts.find(d => d.id === selectedDraft);

  if (loading) return <><Nav /><main className="p-8"><p className="text-white/40">Loading…</p></main></>;
  if (error || !notice) return <><Nav /><main className="p-8"><p className="text-red-400">{error || "Notice not found."}</p></main></>;

  const urgencyColor = {
    overdue: "text-red-400", critical: "text-orange-400", warning: "text-yellow-400", normal: "text-white/60",
  }[notice.urgency] || "text-white/60";

  return (
    <>
      <Nav />
      <main className="p-8 max-w-5xl mx-auto space-y-8">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-white/40">
          <Link href="/gst" className="hover:text-white/70">GSTGuard</Link>
          <span>/</span>
          <span className="text-white/70">{notice.notice_type || "Notice"}</span>
        </div>

        {/* Notice header */}
        <div className="card space-y-4">
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div className="space-y-1">
              <h1 className="text-2xl font-bold">{notice.notice_type || "GST Notice"}</h1>
              {notice.notice_number && <p className="text-white/40 text-sm">No. {notice.notice_number}</p>}
            </div>
            <div className="flex gap-2 flex-wrap">
              {notice.status !== "filed" && (
                <button onClick={markFiled} className="rounded-lg border border-emerald-500/30 bg-emerald-500/10 hover:bg-emerald-500/20 px-3 py-1.5 text-sm text-emerald-400">
                  Mark as Filed
                </button>
              )}
              <span className={`rounded-full text-xs px-2 py-1 font-semibold ${
                notice.status === "filed" ? "bg-emerald-500/20 text-emerald-300" :
                notice.status === "reviewed" ? "bg-blue-500/20 text-blue-300" :
                "bg-white/10 text-white/50"
              }`}>{notice.status}</span>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
            {[
              ["GSTIN", notice.gstin, "font-mono"],
              ["Taxpayer", notice.taxpayer_name, ""],
              ["Period", notice.period, ""],
              ["Demand", notice.demand_amount_inr ? `₹${notice.demand_amount_inr.toLocaleString("en-IN")}` : null, "text-yellow-300 font-semibold"],
              ["Notice Date", notice.notice_date, ""],
              ["Deadline", notice.deadline, urgencyColor + " font-semibold"],
              ["Days Left", notice.days_left !== null ? `${notice.days_left}d` : null, urgencyColor],
              ["Confidence", notice.extraction_confidence, notice.extraction_confidence === "high" ? "text-emerald-400" : "text-yellow-400"],
            ].map(([label, val, cls]) => (
              <div key={label as string} className="space-y-0.5">
                <p className="text-white/30 text-xs uppercase">{label}</p>
                <p className={`text-sm ${cls || "text-white/70"}`}>{val || <span className="text-white/20">—</span>}</p>
              </div>
            ))}
          </div>

          {notice.issues.length > 0 && (
            <div className="space-y-2 pt-2 border-t border-white/10">
              <p className="text-xs uppercase tracking-wide text-white/30">Issues Raised</p>
              <ol className="space-y-1">
                {notice.issues.map((iss, i) => (
                  <li key={i} className="text-sm text-white/65 flex gap-2"><span className="text-white/25 font-mono">{i+1}.</span>{iss}</li>
                ))}
              </ol>
            </div>
          )}
        </div>

        {/* CA Orientation */}
        {notice.ca_orientation && (
          <div className="card border-blue-500/20 bg-blue-500/5 space-y-3">
            <h2 className="text-sm font-semibold text-blue-300 uppercase tracking-wide">CA Briefing</h2>
            <p className="text-sm text-white/70">{notice.ca_orientation.plain_summary}</p>
            {notice.ca_orientation.key_documents_to_gather?.length > 0 && (
              <ul className="space-y-1">
                {notice.ca_orientation.key_documents_to_gather.map((doc, i) => (
                  <li key={i} className="text-sm text-white/60 flex gap-2"><span className="text-blue-400">•</span>{doc}</li>
                ))}
              </ul>
            )}
            {notice.ca_orientation.ca_notes && (
              <p className="text-xs text-blue-300/60 italic">{notice.ca_orientation.ca_notes}</p>
            )}
          </div>
        )}

        {/* Draft reply section */}
        <div className="space-y-4">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <h2 className="text-lg font-semibold">Draft Reply</h2>
            <div className="flex gap-2">
              {notice.drafts.length > 1 && (
                <select
                  value={selectedDraft || ""}
                  onChange={e => setSelectedDraft(e.target.value)}
                  className="rounded-lg border border-white/20 bg-white/5 px-3 py-1.5 text-sm text-white/70 focus:outline-none"
                >
                  {notice.drafts.map(d => (
                    <option key={d.id} value={d.id}>v{d.version} {d.accepted ? "(accepted)" : ""} {d.cai_revised ? "· CAI revised" : ""}</option>
                  ))}
                </select>
              )}
              <button
                onClick={regenerate}
                disabled={regenerating}
                className="rounded-lg border border-white/20 bg-white/5 hover:bg-white/10 px-3 py-1.5 text-sm text-white/70 hover:text-white transition-colors disabled:opacity-50"
              >
                {regenerating ? "Generating…" : "Regenerate"}
              </button>
            </div>
          </div>

          {notice.drafts.length === 0 ? (
            <div className="card text-center py-8 space-y-3">
              {error ? (
                <>
                  <p className="text-red-400 text-sm">{error}</p>
                  <button onClick={regenerate} disabled={regenerating} className="btn !py-2 !px-5 !text-sm">
                    {regenerating ? "Generating…" : "Regenerate Draft"}
                  </button>
                </>
              ) : (
                <>
                  <p className="text-white/40 animate-pulse">Draft being generated…</p>
                  <p className="text-xs text-white/25">This page auto-refreshes every 4 seconds.</p>
                </>
              )}
            </div>
          ) : activeDraft ? (
            <div className="card space-y-4">
              {/* CAI badge */}
              <div className="flex items-center gap-3 flex-wrap">
                {activeDraft.cai_revised ? (
                  <span className="rounded-full bg-blue-500/20 text-blue-300 text-xs px-2 py-0.5 font-semibold">CAI revised</span>
                ) : (
                  <span className="rounded-full bg-emerald-500/20 text-emerald-300 text-xs px-2 py-0.5">CAI approved</span>
                )}
                {activeDraft.cai_notes && (
                  <span className="text-xs text-white/30">"{activeDraft.cai_notes}"</span>
                )}
              </div>

              {/* Draft text */}
              <pre className="whitespace-pre-wrap font-mono text-xs text-white/70 bg-black/20 rounded-lg p-4 overflow-auto max-h-[500px] border border-white/10">
                {activeDraft.draft_text}
              </pre>

              {/* Figure verification */}
              {activeDraft.draft_figures.length > 0 && (
                <div className="space-y-2">
                  <p className="text-xs uppercase tracking-wide text-white/30">Figure Verification (CA to confirm)</p>
                  <div className="flex flex-wrap gap-2">
                    {activeDraft.draft_figures.map((f, i) => (
                      <span key={i} className={`rounded text-xs px-2 py-0.5 font-mono ${f.status === "verified" ? "bg-emerald-500/20 text-emerald-300" : "bg-yellow-500/20 text-yellow-300"}`} title={f.note}>
                        {f.figure} {f.status === "verified" ? "✓" : "?"}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              <p className="text-xs text-white/20 italic border-t border-white/5 pt-3">
                PREPARED FOR CA REVIEW — Not valid without CA signature and filing on the GST portal.
              </p>

              <div className="flex gap-3 flex-wrap">
                <button
                  onClick={() => copyDraft(activeDraft.draft_text)}
                  className="rounded-lg border border-white/20 bg-white/5 hover:bg-white/10 px-4 py-2 text-sm text-white/70 hover:text-white transition-colors"
                >
                  {copied ? "Copied!" : "Copy Draft"}
                </button>
                {!activeDraft.accepted && (
                  <button
                    onClick={() => acceptDraft(activeDraft.id)}
                    disabled={accepting === activeDraft.id}
                    className="rounded-lg bg-emerald-600 hover:bg-emerald-500 px-4 py-2 text-sm font-semibold text-white transition-colors disabled:opacity-50"
                  >
                    {accepting === activeDraft.id ? "Accepting…" : "Accept Draft"}
                  </button>
                )}
                {activeDraft.accepted && (
                  <span className="rounded-lg bg-emerald-500/20 text-emerald-300 px-4 py-2 text-sm font-semibold">Accepted</span>
                )}
              </div>
            </div>
          ) : null}
        </div>
      </main>
    </>
  );
}
