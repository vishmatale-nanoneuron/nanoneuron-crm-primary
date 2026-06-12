import { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = "https://nanoneuron.ai";
  const now = new Date();
  return [
    { url: base,                           lastModified: now, changeFrequency: "weekly",  priority: 1.0 },
    { url: `${base}/logistics-ai`,         lastModified: now, changeFrequency: "monthly", priority: 0.9 },
    { url: `${base}/manufacturing-ai`,     lastModified: now, changeFrequency: "monthly", priority: 0.9 },
    { url: `${base}/warehouse-ai`,         lastModified: now, changeFrequency: "monthly", priority: 0.9 },
    { url: `${base}/retail-ai`,            lastModified: now, changeFrequency: "monthly", priority: 0.9 },
    { url: `${base}/supply-chain-ai`,      lastModified: now, changeFrequency: "monthly", priority: 0.9 },
    { url: `${base}/devops-ai`,            lastModified: now, changeFrequency: "monthly", priority: 0.9 },
    { url: `${base}/mlops-ai`,             lastModified: now, changeFrequency: "monthly", priority: 0.9 },
    { url: `${base}/pricing`,                                lastModified: now, changeFrequency: "monthly", priority: 0.8 },
    { url: `${base}/register`,                             lastModified: now, changeFrequency: "monthly", priority: 0.7 },
    { url: `${base}/login`,                                lastModified: now, changeFrequency: "monthly", priority: 0.5 },
    // High-intent tool pages — calculator queries
    { url: `${base}/manufacturing-ai/oee-calculator`,      lastModified: now, changeFrequency: "yearly",  priority: 0.85 },
    { url: `${base}/logistics-ai/otif-calculator`,         lastModified: now, changeFrequency: "yearly",  priority: 0.85 },
    { url: `${base}/devops-ai/dora-metrics-calculator`,    lastModified: now, changeFrequency: "yearly",  priority: 0.85 },
    // Sub-vertical and geo pages
    { url: `${base}/warehouse-ai/ecommerce-fulfillment`,          lastModified: now, changeFrequency: "monthly", priority: 0.85 },
    { url: `${base}/manufacturing-ai/electronics-manufacturing`,   lastModified: now, changeFrequency: "monthly", priority: 0.85 },
    { url: `${base}/india`,                                        lastModified: now, changeFrequency: "monthly", priority: 0.9 },
  ];
}
