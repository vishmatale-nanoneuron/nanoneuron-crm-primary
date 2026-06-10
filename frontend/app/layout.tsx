import "./globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "OpsOracle AI — Predictive Operations Intelligence",
  description: "AI predicts operational problems before they become expensive. Upload CSV, Excel, or PDF reports to detect delays, bottlenecks, and inventory risks.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
