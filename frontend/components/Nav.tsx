"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function Nav() {
  const router = useRouter();
  const [loggedIn, setLoggedIn] = useState(false);

  useEffect(() => {
    setLoggedIn(!!localStorage.getItem("token"));
  }, []);

  function logout() {
    localStorage.removeItem("token");
    router.push("/login");
  }

  return (
    <nav className="flex items-center justify-between border-b border-white/10 px-8 py-5">
      <Link href="/" className="text-xl font-bold">OpsOracle AI</Link>
      <div className="flex items-center gap-6 text-sm text-white/70">
        {loggedIn ? (
          <>
            <Link href="/dashboard" className="hover:text-white transition-colors">Dashboard</Link>
            <Link href="/upload" className="hover:text-white transition-colors">Upload</Link>
            <Link href="/reports" className="hover:text-white transition-colors">Reports</Link>
            <Link href="/pricing" className="hover:text-white transition-colors">Pricing</Link>
            <button onClick={logout} className="text-white/50 hover:text-white transition-colors">Logout</button>
          </>
        ) : (
          <>
            <Link href="/pricing" className="hover:text-white transition-colors">Pricing</Link>
            <Link href="/login" className="hover:text-white transition-colors">Login</Link>
            <Link href="/register" className="btn !py-2 !px-4 !text-sm">Get Started</Link>
          </>
        )}
      </div>
    </nav>
  );
}
