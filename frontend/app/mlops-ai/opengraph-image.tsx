import { ImageResponse } from "next/og";
import { VerticalOGImage } from "@/components/og-vertical";

export const runtime = "edge";
export const alt = "MLOps AI — Model Drift Detection, Training Pipeline Health & Inference Monitoring | OpsOracle";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OG() {
  return new ImageResponse(
    <VerticalOGImage
      name="MLOps AI"
      tagline="Catch model drift before your customers do."
      subtext="Upload model logs → accuracy drift scores, latency SLA alerts & retraining recommendations in 30s"
      kpis={["Avg Model Accuracy", "P99 Latency", "Drift Score"]}
    />,
    { width: 1200, height: 630 }
  );
}
