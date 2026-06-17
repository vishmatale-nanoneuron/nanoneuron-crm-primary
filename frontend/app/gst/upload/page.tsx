"use client";
import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import Nav from "@/components/Nav";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

type Stage = "idle" | "uploading" | "extracting" | "drafting" | "done" | "error";

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
};

const STAGES: { key: Stage; label: string }[] = [
  { key: "uploading", label: "Uploading file" },
  { key: "extracting", label: "Extracting notice fields (Claude Haiku)" },
  { key: "drafting", label: "Generating draft reply (Claude Sonnet + CAI loop)" },
  { key: "done", label: "Done" },
];

const SOURCE_BADGE: Record<string, string> = {
  found: "bg-emerald-500/20 text-emerald-300",
  inferred: "bg-yellow-500/20 text-yellow-300",
  absent: "bg-white/10 text-white/30",
};

export default function GSTUpload() {
  const router = useRouter();
  const [stage, setStage] = useState<Stage>("idle");
  const [notice, setNotice] = useState<Notice | null>(null);
  const [error, setError] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  async function handleUpload(e: React.FormEvent) {
    e.preventDefault();
    const file = fileRef.current?.files?.[0];
    if (!file) return;
    const token = localStorage.getItem("token");
    if (!token) { router.push("/login"); return; }

    setStage("uploading");
    setError("");

    const form = new FormData();
    form.append("file", file);

    try {
      setStage("extracting");
      const res = await fetch(`${API}/gst/notices/upload`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: form,
      });
      if (res.status === 402) {
        setError("GSTGuard requires a Pro or Enterprise plan. Upgrade to upload notices.");
        setStage("error");
        return;
      }
      if (res.status === 401) { router.push("/login"); return; }
      if (!res.ok) {
        const err = await res.json().catch(() => ({ detail: "Upload failed" }));
        setError(err.detail || "Upload failed");
        setStage("error");
        return;
      }
      setStage("drafting");
      const data: Notice = await res.json();
      // Draft is being generated in background — show notice immediately
      setNotice(data);
      setStage("done");
    } catch {
      setError("Network error — please try again.");
      setStage("error");
    }
  }

  const stageIndex = STAGES.findIndex(s => s.key === stage);
  const isDone = stage === "done";
  const isError = stage === "error";

  return (
    <>
      <Nav />
      <main className="p-8 max-w-3xl mx-auto space-y-8">
        <div>
          <h1 className="text-3xl font-bold">Upload GST Notice</h1>
          <p className="text-white/40 text-sm mt-1">
            Upload a PDF or text copy of the notice. AI extracts all fields and generates a draft reply automatically.
          </p>
        </div>

        {stage === "idle" || isError ? (
          <form onSubmit={handleUpload} className="card space-y-5">
            <div className="space-y-2">
              <label className="block text-sm text-white/60">Notice file (PDF or TXT)</label>
              <input
                ref={fileRef}
                type="file"
                accept=".pdf,.txt,.text"
                className="block w-full text-sm text-white/70 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border file:border-white/20 file:bg-white/5 file:text-white/70 hover:file:bg-white/10 file:cursor-pointer"
                required
              />
              <p className="text-xs text-white/30">Supported: ASMT-10, DRC-01, DRC-01A, DRC-07, GSTR-3A, ADT-01, GSTR_mismatch, DRC-10</p>
            </div>
            {isError && error && <p className="text-red-400 text-sm">{error}</p>}
            <button type="submit" className="btn w-full">
              Upload &amp; Analyze
            </button>
          </form>
        ) : null}

        {/* Progress tracker */}
        {!isDone && !isError && stage !== "idle" && (
          <div className="card space-y-4">
            {STAGES.slice(0, 3).map((s, i) => {
              const done = stageIndex > i;
              const active = stageIndex === i;
              return (
                <div key={s.key} className="flex items-center gap-3">
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${
                    done ? "bg-emerald-500 text-white" :
                    active ? "bg-blue-500 text-white animate-pulse" :
                    "bg-white/10 text-white/30"
                  }`}>
                    {done ? "✓" : i + 1}
                  </div>
                  <span className={`text-sm ${active ? "text-white" : done ? "text-white/50" : "text-white/25"}`}>{s.label}</span>
                  {active && <span className="text-white/30 text-xs animate-pulse">processing…</span>}
                </div>
              );
            })}
          </div>
        )}

        {/* Notice result */}
        {isDone && notice && (
          <div className="space-y-6">
            {/* Fields extracted */}
            <div className="card space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold">Extracted Fields</h2>
                <span className={`rounded-full text-xs px-2 py-0.5 font-semibold ${
                  notice.extraction_confidence === "high" ? "bg-emerald-500/20 text-emerald-300" :
                  notice.extraction_confidence === "medium" ? "bg-yellow-500/20 text-yellow-300" :
                  "bg-red-500/20 text-red-300"
                }`}>
                  {notice.extraction_confidence} confidence
                </span>
              </div>
              <div className="grid grid-cols-2 gap-3 text-sm">
                {[
                  ["Notice Type", notice.notice_type, null],
                  ["GSTIN", notice.gstin, "gstin"],
                  ["Taxpayer", notice.taxpayer_name, "taxpayer_name"],
                  ["Notice No.", notice.notice_number, "notice_number"],
                  ["Notice Date", notice.notice_date, "notice_date"],
                  ["Deadline", notice.deadline, "deadline"],
                  ["Period", notice.period, "period"],
                  ["Demand", notice.demand_amount_inr ? `₹${notice.demand_amount_inr.toLocaleString("en-IN")}` : null, "demand_amount_inr"],
                ].map(([label, val, fsKey]) => (
                  <div key={label as string} className="space-y-0.5">
                    <p className="text-white/40 text-xs uppercase tracking-wide">{label}</p>
                    <p className="text-white/80 font-mono text-sm">{val || <span className="text-white/20">—</span>}</p>
                    {fsKey && notice.field_sources[fsKey as string] && (
                      <span className={`rounded text-xs px-1.5 py-0.5 ${SOURCE_BADGE[notice.field_sources[fsKey as string]] || "bg-white/10 text-white/40"}`}>
                        {notice.field_sources[fsKey as string]}
                      </span>
                    )}
                  </div>
                ))}
              </div>

              {notice.issues.length > 0 && (
                <div className="space-y-2">
                  <p className="text-white/40 text-xs uppercase tracking-wide">Issues Raised</p>
                  <ul className="space-y-1">
                    {notice.issues.map((issue, i) => (
                      <li key={i} className="text-sm text-white/70 flex gap-2">
                        <span className="text-white/30 font-mono">{i + 1}.</span> {issue}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            {/* CA orientation */}
            {notice.ca_orientation && (
              <div className="card border-blue-500/20 bg-blue-500/5 space-y-4">
                <h2 className="text-base font-semibold text-blue-300">CA Briefing</h2>
                <p className="text-sm text-white/70">{notice.ca_orientation.plain_summary}</p>
                {notice.ca_orientation.key_documents_to_gather?.length > 0 && (
                  <div>
                    <p className="text-xs text-white/40 uppercase tracking-wide mb-2">Key Documents to Gather</p>
                    <ul className="space-y-1">
                      {notice.ca_orientation.key_documents_to_gather.map((doc, i) => (
                        <li key={i} className="text-sm text-white/65 flex gap-2"><span className="text-blue-400">•</span> {doc}</li>
                      ))}
                    </ul>
                  </div>
                )}
                {notice.ca_orientation.ca_notes && (
                  <p className="text-xs text-blue-300/70 italic">{notice.ca_orientation.ca_notes}</p>
                )}
              </div>
            )}

            {/* Draft being generated notice */}
            <div className="card border-emerald-500/20 bg-emerald-500/5 space-y-3">
              <p className="text-emerald-300 font-semibold">Draft reply is being generated in the background</p>
              <p className="text-sm text-white/50">Claude Sonnet is drafting a formal reply with the CAI self-critique loop. This takes ~30–60 seconds.</p>
              <a href={`/gst/notices/${notice.id}`} className="btn inline-block !bg-emerald-600 hover:!bg-emerald-500 !py-2 !px-5 !text-sm">
                View Notice &amp; Draft
              </a>
            </div>

            <button
              onClick={() => { setStage("idle"); setNotice(null); setError(""); if (fileRef.current) fileRef.current.value = ""; }}
              className="text-white/30 hover:text-white/60 text-sm transition-colors"
            >
              Upload another notice
            </button>
          </div>
        )}
      </main>
    </>
  );
}
