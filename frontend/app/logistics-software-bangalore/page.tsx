import type { Metadata } from "next";
import Link from "next/link";
import Nav from "@/components/Nav";

export const metadata: Metadata = {
  title: "Logistics Software Bangalore — AI Operations Analytics for Tech Hubs | OpsOracle",
  description:
    "OpsOracle AI for Bangalore logistics: electronics supply chain, e-commerce fulfilment, IT hardware distribution. Whitefield, Electronic City, Peenya industrial corridor analytics.",
  alternates: { canonical: "https://nanoneuron.ai/logistics-software-bangalore" },
  openGraph: {
    title: "Logistics Software Bangalore — AI Operations Analytics for Tech Hubs | OpsOracle",
    description:
      "OpsOracle AI for Bangalore logistics: electronics supply chain, Peenya industrial corridor, Flipkart/Amazon fulfilment analytics.",
    url: "https://nanoneuron.ai/logistics-software-bangalore",
  },
  twitter: {
    card: "summary_large_image",
    title: "Logistics Software Bangalore — OpsOracle AI",
    description:
      "AI logistics analytics for Bangalore: tech hardware supply chain, e-commerce fulfilment, Peenya industrial corridor.",
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
      name: "Logistics Software Bangalore",
      item: "https://nanoneuron.ai/logistics-software-bangalore",
    },
  ],
};

const softwareJsonLd = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  name: "OpsOracle AI — Logistics Software Bangalore",
  applicationCategory: "BusinessApplication",
  operatingSystem: "Web",
  offers: { "@type": "Offer", price: "0", priceCurrency: "INR" },
  description:
    "AI-powered logistics and supply chain analytics platform for Bangalore-based operations. Covers electronics supply chain, e-commerce fulfilment, and Peenya industrial corridor performance.",
};

const bangalorePainPoints = [
  {
    title: "Electronics & IT Hardware Supply Chain",
    desc: "Bangalore is India's Silicon Valley, with major IT hardware assembly and distribution operations in Electronic City and Whitefield. Supply chains for components — semiconductors, PCBs, server hardware — involve complex global sourcing with long ocean lead times from Taiwan and China. OpsOracle AI tracks component lead times, stockout risk, and safety stock adequacy across these high-value, high-velocity SKUs.",
  },
  {
    title: "Peenya Industrial Corridor Analytics",
    desc: "Peenya is one of Asia's largest industrial areas, housing 15,000+ manufacturing units producing machine tools, garments, electronics, and processed foods. Logistics flows from Peenya to national distribution are a critical supply chain artery. OpsOracle AI tracks outbound carrier performance, corridor delays on NH-48 toward Chennai and Mumbai, and inbound raw material reliability.",
  },
  {
    title: "E-commerce Fulfilment: Flipkart & Amazon Hubs",
    desc: "Bangalore hosts major fulfilment centres for Flipkart (headquartered in the city) and Amazon, serving South India's e-commerce demand. Peak-season surge (Big Billion Days, Great Indian Festival) creates extreme demand variability requiring sophisticated inventory positioning. OpsOracle AI analyses OTIF performance during peak periods and identifies which product categories generate the most return and delay events.",
  },
  {
    title: "Tech Hardware Distribution: Whitefield & Electronic City",
    desc: "OEMs and distribution companies serving Bangalore's 1,700+ technology firms face unique last-mile challenges: large office campuses with complex delivery procedures, just-in-time delivery requirements for production lines, and high-value goods requiring chain-of-custody tracking. OpsOracle AI monitors delivery performance to major tech park zones and flags patterns in failed first-attempt deliveries.",
  },
];

const bangaloreContext = [
  { stat: "1,700+", label: "Tech companies in Bangalore" },
  { stat: "12M+", label: "Population driving e-commerce demand" },
  { stat: "15,000+", label: "Manufacturing units in Peenya alone" },
  { stat: "3 major", label: "Freight corridors: NH-48, NH-44, NH-75" },
];

export default function LogisticsSoftwareBangalorePage() {
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
            <span className="text-white/60">Logistics Software Bangalore</span>
          </nav>

          <div className="mb-14">
            <p className="text-xs uppercase tracking-widest text-emerald-400/70 mb-3">Bengaluru, Karnataka</p>
            <h1 className="text-4xl md:text-5xl font-bold mb-5 leading-tight">
              Logistics Software for Bangalore Operations Teams
            </h1>
            <p className="text-white/55 text-lg leading-relaxed max-w-2xl">
              OpsOracle AI is built for Bangalore&rsquo;s unique logistics mix: electronics and IT
              hardware supply chains, e-commerce fulfilment, and industrial distribution across
              Peenya, Electronic City, and Whitefield corridors.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 mt-8">
              <Link
                href="/register"
                className="inline-block bg-emerald-500 hover:bg-emerald-400 text-black font-semibold text-sm px-6 py-3 rounded-xl transition-colors"
              >
                Start Free — No Credit Card
              </Link>
              <Link
                href="/tools"
                className="inline-block border border-white/20 hover:border-white/40 text-white/70 hover:text-white font-semibold text-sm px-6 py-3 rounded-xl transition-colors"
              >
                Free Supply Chain Calculators
              </Link>
            </div>
          </div>

          <section className="mb-10">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-14">
              {bangaloreContext.map((item) => (
                <div key={item.label} className="border border-white/10 bg-white/3 rounded-2xl p-5 text-center">
                  <p className="text-2xl font-bold text-emerald-400">{item.stat}</p>
                  <p className="text-white/40 text-xs mt-1 leading-snug">{item.label}</p>
                </div>
              ))}
            </div>
          </section>

          <section className="mb-14">
            <h2 className="text-2xl font-bold mb-6">Bangalore Logistics Challenges We Solve</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {bangalorePainPoints.map((point) => (
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
            <h2 className="text-2xl font-bold mb-5">Bangalore&rsquo;s Logistics Infrastructure</h2>
            <div className="space-y-4 text-white/60 leading-relaxed">
              <p>
                Bangalore (officially Bengaluru) is the anchor city of South India&rsquo;s technology
                and manufacturing economy. Kempegowda International Airport (KIA) at Devanahalli
                is a growing air cargo hub with significant capacity for high-value IT hardware,
                pharmaceuticals, and perishables exports. The city is connected to Chennai (NH-44),
                Mumbai (NH-48), and Hyderabad (NH-44) by major national highway corridors.
              </p>
              <p>
                The warehousing ecosystem has expanded significantly around the Outer Ring Road,
                Hoskote, Nelamangala (the Mumbai road junction), and Attibele (Chennai corridor).
                These zones host major 3PL facilities, e-commerce dark stores, and cold chain
                warehousing for the city&rsquo;s 12 million+ population.
              </p>
              <p>
                Bangalore&rsquo;s logistics complexity is amplified by severe urban traffic congestion,
                particularly on the Outer Ring Road and in the CBD, making delivery time-window
                management critical. Companies operating last-mile delivery here report some of
                India&rsquo;s highest first-attempt failure rates, requiring sophisticated re-delivery
                and customer communication systems.
              </p>
            </div>
          </section>

          <section className="mb-14">
            <h2 className="text-2xl font-bold mb-5">
              What OpsOracle AI Delivers for Bangalore Teams
            </h2>
            <div className="space-y-3">
              {[
                "Electronics and IT hardware lead time tracking — monitor component delivery reliability from global and domestic suppliers",
                "E-commerce peak OTIF analysis — compare your Q4 peak delivery performance against off-peak baseline",
                "Peenya industrial corridor carrier benchmarking — which carriers perform best on the NH-48 and NH-44 corridors",
                "Inventory turnover analysis by product category — identify which tech hardware SKUs are consuming working capital",
                "Safety stock recommendations for high-variability electronics components",
                "Last-mile zone analytics — which Bangalore pin codes have the worst first-attempt delivery rates",
                "Return rate analysis — which product categories and sellers generate above-average e-commerce returns",
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
              Analyse your Bangalore logistics data in minutes
            </h2>
            <p className="text-white/55 text-sm max-w-lg mx-auto mb-6">
              Upload your shipment data and OpsOracle AI delivers OTIF analysis, lead time
              tracking, and supply chain cost benchmarking — tailored to Bangalore&rsquo;s
              logistics landscape.
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
            <Link href="/logistics-software-mumbai" className="hover:text-white transition-colors">Mumbai</Link>
            <Link href="/supply-chain-software-delhi" className="hover:text-white transition-colors">Delhi NCR</Link>
            <Link href="/tools" className="hover:text-white transition-colors">Free Calculators</Link>
            <Link href="/pricing" className="hover:text-white transition-colors">Pricing</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
