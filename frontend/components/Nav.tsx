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
    <header>
      <nav aria-label="Main navigation" className="flex items-center justify-between border-b border-white/10 px-8 py-5">
        <Link href="/" className="text-xl font-bold" aria-label="OpsOracle AI home">OpsOracle AI</Link>
        <ul className="flex items-center gap-6 text-sm text-white/70 list-none m-0 p-0">
          {loggedIn ? (
            <>
              <li><Link href="/dashboard" className="hover:text-white transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-emerald-400 rounded">Dashboard</Link></li>
              <li><Link href="/upload" className="hover:text-white transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-emerald-400 rounded">Upload</Link></li>
              <li><Link href="/reports" className="hover:text-white transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-emerald-400 rounded">Reports</Link></li>
              <li><Link href="/pricing" className="hover:text-white transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-emerald-400 rounded">Pricing</Link></li>
              <li><button onClick={logout} className="text-white/50 hover:text-white transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-emerald-400 rounded">Logout</button></li>
            </>
          ) : (
            <>
              <li><Link href="/pricing" className="hover:text-white transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-emerald-400 rounded">Pricing</Link></li>
              <li><Link href="/login" className="hover:text-white transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-emerald-400 rounded">Login</Link></li>
              <li><Link href="/register" className="btn !py-2 !px-4 !text-sm">Get Started</Link></li>
            </>
          )}
        </ul>
      </nav>
    </header>
  );
}
