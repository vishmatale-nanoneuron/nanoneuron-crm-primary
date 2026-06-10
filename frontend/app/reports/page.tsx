"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Nav from "@/components/Nav";
import { api, getToken } from "@/lib/api";
import Link from "next/link";

type Report = { id: string; file_name: string; rows_count: number; created_at: string };

export default function Reports() {
  const router = useRouter();
  const [reports, setReports] = useState<Report[]>([]);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!getToken()) { router.push("/login"); return; }
    api("/reports").then(setReports).catch(() => setError("Failed to load reports."));
  }, [router]);

  return (
    <>
      <Nav />
      <main className="p-8">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold">Reports</h1>
            <p className="mt-1 text-white/50">All your uploaded operational reports</p>
          </div>
          <Link href="/upload" className="btn">Upload New</Link>
        </div>
        {error && <p className="text-red-400">{error}</p>}
        {reports.length === 0 && !error && (
          <div className="card text-center py-12">
            <p className="text-white/40">No reports yet.</p>
            <Link href="/upload" className="mt-4 inline-block text-emerald-400 hover:underline">Upload your first report →</Link>
          </div>
        )}
        <div className="space-y-4">
          {reports.map(r => (
            <div key={r.id} className="card flex items-center justify-between">
              <div>
                <h2 className="font-semibold">{r.file_name}</h2>
                <p className="mt-1 text-white/50 text-sm">{r.rows_count} rows · {new Date(r.created_at).toLocaleString()}</p>
              </div>
              <Link href={`/upload`} className="text-sm text-emerald-400 hover:underline">Analyze again →</Link>
            </div>
          ))}
        </div>
      </main>
    </>
  );
}
