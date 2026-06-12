import { ImageResponse } from "next/og";
import { VerticalOGImage } from "@/components/og-vertical";

export const runtime = "edge";
export const alt = "Logistics AI — Shipment Delay Prediction & Freight Risk Analysis | OpsOracle";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OG() {
  return new ImageResponse(
    <VerticalOGImage
      name="Logistics AI"
      tagline="Predict shipment delays before they happen."
      subtext="Upload freight CSV → OTIF scores, carrier risk & cost impact in 30 seconds"
      kpis={["OTIF Score", "Delay Rate", "Carrier Failure Rate"]}
    />,
    { width: 1200, height: 630 }
  );
}
