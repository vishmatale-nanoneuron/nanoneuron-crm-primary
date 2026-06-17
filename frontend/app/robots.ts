import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/dashboard", "/upload", "/reports", "/api/", "/admin/", "/payment/"],
      },
      { userAgent: "GPTBot",             allow: "/" },
      { userAgent: "OAI-SearchBot",      allow: "/" },
      { userAgent: "ChatGPT-User",       allow: "/" },
      { userAgent: "ClaudeBot",          allow: "/" },
      { userAgent: "Claude-Web",         allow: "/" },
      { userAgent: "anthropic-ai",       allow: "/" },
      { userAgent: "PerplexityBot",      allow: "/" },
      { userAgent: "Perplexity-User",    allow: "/" },
      { userAgent: "Google-Extended",    allow: "/" },
      { userAgent: "GoogleOther",        allow: "/" },
    ],
    sitemap: "https://nanoneuron.ai/sitemap.xml",
    host: "https://nanoneuron.ai",
  };
}
