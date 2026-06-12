import { ImageResponse } from "next/og";
import { VerticalOGImage } from "@/components/og-vertical";

export const runtime = "edge";
export const alt = "Manufacturing AI — OEE Analysis, Downtime Prediction & Production Risk | OpsOracle";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OG() {
  return new ImageResponse(
    <VerticalOGImage
      name="Manufacturing AI"
      tagline="Detect production risks before the line stops."
      subtext="Upload shift reports → OEE scores, downtime root cause & cost impact in 30 seconds"
      kpis={["OEE Score", "Downtime %", "Defect Rate"]}
    />,
    { width: 1200, height: 630 }
  );
}
