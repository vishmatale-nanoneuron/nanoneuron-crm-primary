import { ImageResponse } from "next/og";
import { VerticalOGImage } from "@/components/og-vertical";

export const runtime = "edge";
export const alt = "Retail AI — Stockout Prevention, Dead Inventory Detection & Demand Forecasting | OpsOracle";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OG() {
  return new ImageResponse(
    <VerticalOGImage
      name="Retail AI"
      tagline="Find the stockout before your customer does."
      subtext="Upload store inventory → stockout alerts, dead stock & sell-through scores in 30 seconds"
      kpis={["Sell-Through Rate", "Stockout Rate", "Return Rate"]}
    />,
    { width: 1200, height: 630 }
  );
}
