import { ImageResponse } from "next/og";
import { VerticalOGImage } from "@/components/og-vertical";

export const runtime = "edge";
export const alt = "Warehouse AI — Inventory Risk Analysis & Stockout Prediction | OpsOracle";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OG() {
  return new ImageResponse(
    <VerticalOGImage
      name="Warehouse AI"
      tagline="Predict inventory crises before they stop production."
      subtext="Upload WMS export → stockout scores, reorder gaps & carrying cost analysis in 30s"
      kpis={["Stockout Rate", "Fill Rate", "Days of Supply"]}
    />,
    { width: 1200, height: 630 }
  );
}
