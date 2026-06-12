import type { Metadata } from "next";
import Link from "next/link";
import Nav from "@/components/Nav";

export const metadata: Metadata = {
  title: "Logistics Software Mumbai — AI-Powered Operations Analytics | OpsOracle",
  description:
    "OpsOracle AI helps Mumbai logistics companies reduce delays, optimise inventory, and cut costs. JNPT port logistics, Mumbai–Pune corridor, last-mile delivery analytics.",
  alternates: { canonical: "https://nanoneuron.ai/logistics-software-mumbai" },
  openGraph: {
    title: "Logistics Software Mumbai — AI-Powered Operations Analytics | OpsOracle",
    description:
      "OpsOracle AI for Mumbai logistics: JNPT port analytics, Mumbai–Pune corridor optimisation, and last-mile delivery intelligence.",
    url: "https://nanoneuron.ai/logistics-software-mumbai",
  },
  twitter: {
    card: "summary_large_image",
    title: "Logistics Software Mumbai — OpsOracle AI",
    description:
      "AI-powered logistics analytics for Mumbai operations. JNPT port, last-mile suburbs, Dharavi distribution hub.",
  },
};

const breadcrumbJsonLd = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: [
    { "@type": "ListItem", position: 1, name: "Home", item: "https://nanoneuron.ai" },
    {
      "@type": "ListItem",
      position: 2,
      name: "Logistics Software Mumbai",
      item: "https://nanoneuron.ai/logistics-software-mumbai",
    },
  ],
};

const softwareJsonLd = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  name: "OpsOracle AI — Logistics Software Mumbai",
  applicationCategory: "BusinessApplication",
  operatingSystem: "Web",
  offers: { "@type": "Offer", price: "0", priceCurrency: "INR" },
  description:
    "AI-powered logistics and supply chain analytics platform for Mumbai-based operations teams. Covers JNPT port delays, Mumbai–Pune corridor, and last-mile suburb delivery.",
};

const mumbaiPainPoints = [
  {
    title: "JNPT Port Delay Analytics",
    desc: "Jawaharlal Nehru Port Trust handles over 4.5 million TEUs annually and is India's largest container port. OpsOracle AI tracks inbound container dwell times, identifies customs clearance patterns, and flags which import SKUs are consistently delayed — so you can carry the right safety stock for affected lines.",
  },
  {
    title: "Mumbai–Pune Corridor Optimisation",
    desc: "The NH-48 corridor between Mumbai and Pune is one of India's highest-volume freight routes, serving manufacturing clusters at Chakan, Ranjangaon, and Talegaon. Traffic congestion, toll delays at Khopoli, and seasonal bottlenecks during monsoon affect delivery reliability. OpsOracle AI analyses corridor performance by carrier, time of day, and season.",
  },
  {
    title: "Last-Mile to Mumbai Suburbs",
    desc: "Delivering to Mumbai's suburban network — Thane, Navi Mumbai, Kalyan, Mira-Bhayandar, Vasai-Virar — involves navigating dense traffic, building access constraints, and receiver availability windows. OpsOracle AI tracks last-mile OTIF by suburb and identifies the delivery time windows with highest success rates for each zone.",
  },
  {
    title: "Dharavi Distribution Hub Analytics",
    desc: "Dharavi is one of Asia's largest informal distribution and manufacturing clusters, handling significant volumes of leather goods, garments, and plastics. OpsOracle AI tracks inbound and outbound flow from Dharavi-linked suppliers and buyers, surfacing lead time patterns and delivery reliability data.",
  },
];

const mumbaiCompanies = [
  { name: "Mahindra Logistics", desc: "Integrated 3PL and last-mile operations across MMR" },
  { name: "Blue Dart Mumbai Hub", desc: "Express delivery hub serving Greater Mumbai and satellites" },
  { name: "Delhivery Mumbai", desc: "E-commerce fulfilment across Mumbai Metropolitan Region" },
  { name: "TCI Freight", desc: "Full truck load and part load operations on Mumbai corridors" },
];

export default function LogisticsSoftwareMumbaiPage() {
  return (
    <div className="min-h-screen bg-zinc-950 text-white">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(softwareJsonLd) }}
      />

      <Nav />

      <main id="main-content" className="pt-28 pb-24 px-6">
        <div className="mx-auto max-w-4xl">
          <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-xs text-white/30 mb-8">
            <Link href="/" className="hover:text-white transition-colors">Home</Link>
            <span>/</span>
            <span className="text-white/60">Logistics Software Mumbai</span>
          </nav>

          <div className="mb-14">
            <p className="text-xs uppercase tracking-widest text-emerald-400/70 mb-3">Mumbai, Maharashtra</p>
            <h1 className="text-4xl md:text-5xl font-bold mb-5 leading-tight">
              Logistics Software for Mumbai Operations Teams
            </h1>
            <p className="text-white/55 text-lg leading-relaxed max-w-2xl">
              OpsOracle AI helps Mumbai logistics companies reduce JNPT port delays, optimise
              the Mumbai–Pune corridor, and improve last-mile delivery to all MMR suburbs.
              AI-powered analytics built for the complexity of India&rsquo;s commercial capital.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 mt-8">
              <Link
                href="/register"
                className="inline-block bg-emerald-500 hover:bg-emerald-400 text-black font-semibold text-sm px-6 py-3 rounded-xl transition-colors"
              >
                Start Free — No Credit Card
              </Link>
              <Link
                href="/logistics-ai/otif-calculator"
                className="inline-block border border-white/20 hover:border-white/40 text-white/70 hover:text-white font-semibold text-sm px-6 py-3 rounded-xl transition-colors"
              >
                Free OTIF Calculator
              </Link>
            </div>
          </div>

          <section className="mb-14">
            <h2 className="text-2xl font-bold mb-6">Mumbai Logistics Challenges We Solve</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {mumbaiPainPoints.map((point) => (
                <div
                  key={point.title}
                  className="border border-white/10 bg-white/[0.03] rounded-2xl p-6"
                >
                  <h3 className="font-semibold text-base mb-3 text-white">{point.title}</h3>
                  <p className="text-white/50 text-sm leading-relaxed">{point.desc}</p>
                </div>
              ))}
            </div>
          </section>

          <section className="mb-14">
            <h2 className="text-2xl font-bold mb-6">Mumbai&rsquo;s Logistics Landscape</h2>
            <div className="space-y-4 text-white/60 leading-relaxed">
              <p>
                Mumbai is the logistics nerve centre of Western India, anchored by JNPT — India&rsquo;s
                largest container port — and Chhatrapati Shivaji Maharaj International Airport
                (CSIA), one of India&rsquo;s busiest air cargo hubs. The city handles an outsized share
                of India&rsquo;s import and export trade, with particular strength in pharmaceuticals,
                textiles, electronics, and FMCG goods.
              </p>
              <p>
                The Mumbai Metropolitan Region (MMR) is served by a dense network of road freight
                corridors: the Western Express Highway to Surat and Gujarat, the Eastern Express
                Highway to Thane and Nashik, and NH-48 to Pune and Bengaluru. Rail freight through
                Mumbai Central and Kurla yards connects to pan-India distribution networks.
              </p>
              <p>
                Key logistics clusters include the Bhiwandi warehousing belt (India&rsquo;s largest
                organised warehousing hub outside Delhi NCR), Navi Mumbai&rsquo;s APMC and industrial
                areas, and the Thane–Belapur Road industrial corridor. Last-mile complexity is
                amplified by dense urban geography, limited parking for delivery vehicles in South
                Mumbai, and the island city&rsquo;s unique access constraints.
              </p>
            </div>
          </section>

          <section className="mb-14">
            <h2 className="text-2xl font-bold mb-6">Companies Using AI Logistics Analytics in Mumbai</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {mumbaiCompanies.map((co) => (
                <div key={co.name} className="border border-white/10 bg-white/[0.03] rounded-2xl p-5">
                  <h3 className="font-semibold text-sm text-white mb-1">{co.name}</h3>
                  <p className="text-white/45 text-sm">{co.desc}</p>
                </div>
              ))}
            </div>
          </section>

          <section className="mb-14">
            <h2 className="text-2xl font-bold mb-5">What OpsOracle AI Delivers for Mumbai Teams</h2>
            <div className="space-y-3">
              {[
                "OTIF tracking by carrier, lane, and suburb — see exactly which zones and providers are dragging down your on-time rate",
                "JNPT import delay analysis — which SKU categories and carrier lines experience the longest customs dwell times",
                "Safety stock recommendations per SKU based on actual lead time variability from your Mumbai suppliers",
                "Mumbai–Pune corridor performance benchmarking — identify which time windows and carrier choices deliver the most reliably on NH-48",
                "Automatic flagging of high-delay-risk shipments up to 48 hours in advance, based on pattern analysis",
                "Supply chain cost breakdown — transportation, warehousing, and inventory carrying costs as % of revenue vs world-class benchmarks",
              ].map((item) => (
                <div key={item} className="flex gap-3 text-sm text-white/60">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 mt-1.5 shrink-0" />
                  {item}
                </div>
              ))}
            </div>
          </section>

          <div className="border border-emerald-500/20 bg-emerald-500/5 rounded-2xl p-8 text-center">
            <h2 className="text-xl font-bold mb-3">
              Start analysing your Mumbai logistics data today
            </h2>
            <p className="text-white/55 text-sm max-w-lg mx-auto mb-6">
              Upload your shipment CSV or connect your TMS. OpsOracle AI delivers OTIF analysis,
              delay root cause, and cost benchmarking in under 5 minutes. No setup fee.
              No long-term contract.
            </p>
            <Link
              href="/register"
              className="inline-block bg-emerald-500 hover:bg-emerald-400 text-black font-semibold text-sm px-6 py-3 rounded-xl transition-colors"
            >
              Try OpsOracle AI Free
            </Link>
          </div>
        </div>
      </main>

      <footer className="border-t border-white/8 px-6 py-8">
        <div className="mx-auto max-w-6xl flex flex-col sm:flex-row items-center justify-between gap-4">
          <Link href="/" className="text-sm font-semibold">
            <span className="text-emerald-400">Ops</span>Oracle AI
          </Link>
          <div className="flex flex-wrap gap-5 text-sm text-white/40 justify-center">
            <Link href="/logistics-software-bangalore" className="hover:text-white transition-colors">Bangalore</Link>
            <Link href="/supply-chain-software-delhi" className="hover:text-white transition-colors">Delhi NCR</Link>
            <Link href="/tools" className="hover:text-white transition-colors">Free Calculators</Link>
            <Link href="/pricing" className="hover:text-white transition-colors">Pricing</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
