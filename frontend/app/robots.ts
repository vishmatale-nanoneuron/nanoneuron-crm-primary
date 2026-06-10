import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: ["/", "/logistics-ai", "/manufacturing-ai", "/warehouse-ai", "/register", "/login"],
        disallow: ["/dashboard", "/upload", "/reports", "/api/"],
      },
    ],
    sitemap: "https://nanoneuron.ai/sitemap.xml",
  };
}
