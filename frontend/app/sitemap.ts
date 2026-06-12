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
    // Free calculators hub + 6 new tools
    { url: `${base}/tools`,                                               lastModified: now, changeFrequency: "monthly", priority: 0.9 },
    { url: `${base}/tools/safety-stock-calculator`,                       lastModified: now, changeFrequency: "yearly",  priority: 0.88 },
    { url: `${base}/tools/inventory-turnover-calculator`,                 lastModified: now, changeFrequency: "yearly",  priority: 0.88 },
    { url: `${base}/tools/reorder-point-calculator`,                      lastModified: now, changeFrequency: "yearly",  priority: 0.88 },
    { url: `${base}/tools/supply-chain-cost-calculator`,                  lastModified: now, changeFrequency: "yearly",  priority: 0.88 },
    { url: `${base}/tools/warehouse-utilization-calculator`,              lastModified: now, changeFrequency: "yearly",  priority: 0.88 },
    { url: `${base}/tools/lead-time-calculator`,                          lastModified: now, changeFrequency: "yearly",  priority: 0.88 },
    // Guides — high-volume informational queries
    { url: `${base}/guides/what-is-otif`,                                 lastModified: now, changeFrequency: "monthly", priority: 0.87 },
    { url: `${base}/guides/supply-chain-kpis`,                            lastModified: now, changeFrequency: "monthly", priority: 0.87 },
    { url: `${base}/guides/reduce-logistics-delays`,                      lastModified: now, changeFrequency: "monthly", priority: 0.87 },
    // City landing pages — India commercial intent
    { url: `${base}/logistics-software-mumbai`,                           lastModified: now, changeFrequency: "monthly", priority: 0.86 },
    { url: `${base}/logistics-software-bangalore`,                        lastModified: now, changeFrequency: "monthly", priority: 0.86 },
    { url: `${base}/supply-chain-software-delhi`,                         lastModified: now, changeFrequency: "monthly", priority: 0.86 },
  ];
}
