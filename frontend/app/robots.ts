import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: ["/", "/logistics-ai", "/manufacturing-ai", "/warehouse-ai", "/retail-ai", "/supply-chain-ai", "/devops-ai", "/mlops-ai", "/pricing", "/register", "/login"],
        disallow: ["/dashboard", "/upload", "/reports", "/api/"],
      },
    ],
    sitemap: "https://nanoneuron.ai/sitemap.xml",
  };
}
