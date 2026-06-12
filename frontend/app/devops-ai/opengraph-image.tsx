import { ImageResponse } from "next/og";
import { VerticalOGImage } from "@/components/og-vertical";

export const runtime = "edge";
export const alt = "DevOps AI — DORA Metrics, Deployment Risk Scoring & Incident Correlation | OpsOracle";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OG() {
  return new ImageResponse(
    <VerticalOGImage
      name="DevOps AI"
      tagline="Find the deploy that caused the incident."
      subtext="Upload pipeline logs → DORA scores, change failure rate & deploy-to-incident correlation in 30s"
      kpis={["Deploy Success Rate", "MTTR", "Change Failure Rate"]}
    />,
    { width: 1200, height: 630 }
  );
}
