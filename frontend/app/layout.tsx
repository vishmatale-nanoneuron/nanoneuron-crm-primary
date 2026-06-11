import "./globals.css";
import type { Metadata } from "next";
import Script from "next/script";

export const metadata: Metadata = {
  title: {
    default: "OpsOracle AI — Predictive Operations Intelligence",
    template: "%s | OpsOracle AI",
  },
  description:
    "Vertical AI for logistics, manufacturing, warehouse, retail, supply chain, DevOps and MLOps teams. Upload CSV, Excel or PDF reports — get AI-powered risk scores, delay predictions and executive summaries in under 30 seconds.",
  metadataBase: new URL("https://nanoneuron.ai"),
  keywords: [
    "operations AI",
    "logistics AI software India",
    "manufacturing AI analytics",
    "supply chain AI",
    "inventory risk prediction",
    "shipment delay prediction",
    "warehouse AI analytics",
    "operational intelligence software",
    "predictive operations",
    "OEE AI manufacturing",
    "supply chain risk management India",
    "DevOps AI DORA metrics",
    "MLOps model monitoring",
    "retail stockout prediction",
    "supplier risk scoring",
    "industrial AI platform",
    "AI for operations teams",
    "deployment risk analysis",
    "model drift detection",
    "procurement AI",
  ],
  authors: [{ name: "OpsOracle AI", url: "https://nanoneuron.ai" }],
  creator: "OpsOracle AI",
  publisher: "OpsOracle AI",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://nanoneuron.ai",
    siteName: "OpsOracle AI",
    title: "OpsOracle AI — Predictive Operations Intelligence",
    description:
      "AI predicts operational problems before they become expensive. Built for logistics, manufacturing and warehouse teams.",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "OpsOracle AI — Predictive Operations Intelligence",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "OpsOracle AI — Predictive Operations Intelligence",
    description:
      "Vertical AI for operations teams. Upload reports, get AI risk analysis in 30 seconds.",
    images: ["/og-image.png"],
    creator: "@opsoracleai",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  alternates: {
    canonical: "https://nanoneuron.ai",
  },
  category: "technology",
};

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "SoftwareApplication",
      "@id": "https://nanoneuron.ai/#software",
      name: "OpsOracle AI",
      applicationCategory: "BusinessApplication",
      applicationSubCategory: "Operations Intelligence",
      description:
        "Vertical AI platform for logistics, manufacturing and warehouse operations. Predicts delays, inventory risks and bottlenecks from uploaded operational reports.",
      url: "https://nanoneuron.ai",
      operatingSystem: "Web",
      offers: {
        "@type": "Offer",
        price: "0",
        priceCurrency: "USD",
        availability: "https://schema.org/InStock",
      },
      featureList: [
        "Shipment delay prediction",
        "Inventory risk analysis",
        "Manufacturing OEE bottleneck detection",
        "AI executive summaries",
        "Industry benchmark comparison",
        "Cost impact estimation",
        "CSV, Excel and PDF support",
        "Retail stockout detection",
        "Supplier risk scoring",
        "DevOps DORA metrics analysis",
        "MLOps model drift detection",
        "Supply chain lead time variance analysis",
      ],
    },
    {
      "@type": "Organization",
      "@id": "https://nanoneuron.ai/#organization",
      name: "OpsOracle AI",
      url: "https://nanoneuron.ai",
      description: "Vertical AI for industrial operations teams",
    },
    {
      "@type": "WebSite",
      "@id": "https://nanoneuron.ai/#website",
      url: "https://nanoneuron.ai",
      name: "OpsOracle AI",
      description: "Predictive operations intelligence powered by AI",
      publisher: { "@id": "https://nanoneuron.ai/#organization" },
    },
  ],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <meta name="theme-color" content="#09090b" />
        <Script
          id="json-ld"
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
          strategy="beforeInteractive"
        />
      </head>
      <body>
        <a href="#main-content" className="skip-nav">Skip to main content</a>
        {children}
      </body>
    </html>
  );
}
