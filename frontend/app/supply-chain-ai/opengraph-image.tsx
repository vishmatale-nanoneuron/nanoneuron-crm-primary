import { ImageResponse } from "next/og";
import { VerticalOGImage } from "@/components/og-vertical";

export const runtime = "edge";
export const alt = "Supply Chain AI — Supplier Risk Scoring & Procurement Intelligence | OpsOracle";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OG() {
  return new ImageResponse(
    <VerticalOGImage
      name="Supply Chain AI"
      tagline="Find the supplier risk before production stops."
      subtext="Upload PO data → OTD scores, critical path alerts & supplier risk ranking in 30 seconds"
      kpis={["Supplier OTD", "Lead Time Variance", "Critical Risk %"]}
    />,
    { width: 1200, height: 630 }
  );
}
