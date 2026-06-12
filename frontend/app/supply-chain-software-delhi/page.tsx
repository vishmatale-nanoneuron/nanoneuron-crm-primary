import type { Metadata } from "next";
import Link from "next/link";
import Nav from "@/components/Nav";

export const metadata: Metadata = {
  title: "Supply Chain Software Delhi NCR — AI Analytics for North India | OpsOracle",
  description:
    "OpsOracle AI for Delhi NCR supply chains: Gurgaon manufacturing, Noida electronics, Delhi wholesale markets, NH-48 corridor. AI risk scoring for North India operations.",
  alternates: { canonical: "https://nanoneuron.ai/supply-chain-software-delhi" },
  openGraph: {
    title: "Supply Chain Software Delhi NCR — AI Analytics for North India | OpsOracle",
    description:
      "OpsOracle AI for Delhi NCR: Gurgaon manufacturing, Noida electronics, ICD Tughlakabad, NH-48 corridor supply chain analytics.",
    url: "https://nanoneuron.ai/supply-chain-software-delhi",
  },
  twitter: {
    card: "summary_large_image",
    title: "Supply Chain Software Delhi NCR — OpsOracle AI",
    description:
      "AI supply chain analytics for Delhi NCR: Gurgaon, Noida, ICD Tughlakabad, and the NH-48 corridor.",
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
      name: "Supply Chain Software Delhi NCR",
      item: "https://nanoneuron.ai/supply-chain-software-delhi",
    },
  ],
};

const softwareJsonLd = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  name: "OpsOracle AI — Supply Chain Software Delhi NCR",
  applicationCategory: "BusinessApplication",
  operatingSystem: "Web",
  offers: { "@type": "Offer", price: "0", priceCurrency: "INR" },
  description:
    "AI-powered supply chain analytics platform for Delhi NCR operations. Covers Gurgaon manufacturing, Noida electronics, ICD Tughlakabad, and NH-48 corridor performance.",
};

const delhiPainPoints = [
  {
    title: "Gurgaon Manufacturing & Auto Supply Chain",
    desc: "Gurgaon (Gurugram) is home to India's largest auto manufacturing cluster, with Maruti Suzuki's Manesar plant and hundreds of Tier-1 and Tier-2 auto component suppliers. Just-in-time supply chain management is critical. OpsOracle AI tracks component delivery reliability, supplier OTIF, and identifies which supply links are closest to disruption threshold.",
  },
  {
    title: "Noida Electronics & ESDM Supply Chain",
    desc: "Noida houses India's largest concentration of electronics and ESDM (Electronic System Design & Manufacturing) companies, including major smartphone assembly for Samsung and domestic brands. Component supply chains involve complex global sourcing from China, Taiwan, and South Korea. OpsOracle AI monitors import lead times, safety stock adequacy, and customs clearance performance at Inland Container Depot (ICD) Tughlakabad.",
  },
  {
    title: "ICD Tughlakabad — Customs Analytics",
    desc: "ICD Tughlakabad is North India's largest inland container depot and a critical gateway for Delhi NCR's import supply chains. Container dwell time, customs examination frequency, and documentation clearance time directly impact inventory availability for hundreds of importers. OpsOracle AI tracks patterns in customs clearance duration by commodity, identifying which SKU categories consistently face the longest delays.",
  },
  {
    title: "NH-48 Corridor — Delhi to Mumbai",
    desc: "NH-48 is India's busiest national highway, connecting Delhi's Gurgaon cluster to Jaipur, Ahmedabad, and Mumbai. It is the primary road freight artery for North India's consumer goods, automotive, and FMCG distribution. OpsOracle AI analyses carrier performance on NH-48 lane segments, flagging congestion patterns around Rewari, Kishangarh, and Vadodara that consistently cause transit time overruns.",
  },
  {
    title: "Delhi Wholesale Markets Distribution",
    desc: "Delhi's wholesale markets — Sadar Bazar, Chandni Chowk, Gandhi Nagar, Tilak Nagar, and Azadpur mandi — are distribution hubs for pan-India supply chains in FMCG, garments, electronics, and fresh produce. OpsOracle AI tracks outbound distribution reliability from wholesale hub suppliers and benchmarks lead times to tier-2 cities across North India.",
  },
  {
    title: "North India Regional Distribution Network",
    desc: "Delhi NCR is the hub of a radial distribution network serving Rajasthan, UP, Uttarakhand, Punjab, Haryana, and J&K. Managing secondary and tertiary distribution across this network — with diverse road quality, seasonal disruptions (winter fog, monsoon flooding), and state-specific regulatory requirements — requires sophisticated performance analytics.",
  },
];

const delhiStats = [
  { stat: "₹8L Cr", label: "Delhi NCR economic output annually" },
  { stat: "2,000+", label: "Auto component manufacturers in Gurgaon" },
  { stat: "ICD #1", label: "Tughlakabad: North India's largest inland port" },
  { stat: "NH-48", label: "India's highest-volume freight corridor" },
];

export default function SupplyChainSoftwareDelhiPage() {
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
            <span className="text-white/60">Supply Chain Software Delhi NCR</span>
          </nav>

          <div className="mb-14">
            <p className="text-xs uppercase tracking-widest text-emerald-400/70 mb-3">Delhi NCR, North India</p>
            <h1 className="text-4xl md:text-5xl font-bold mb-5 leading-tight">
              Supply Chain Software for Delhi NCR Operations Teams
            </h1>
            <p className="text-white/55 text-lg leading-relaxed max-w-2xl">
              OpsOracle AI delivers AI-powered supply chain analytics for Delhi NCR&rsquo;s complex
              operations: Gurgaon auto manufacturing, Noida electronics, ICD Tughlakabad imports,
              and the NH-48 corridor connecting North India to national distribution networks.
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

          <section className="mb-14">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {delhiStats.map((item) => (
                <div key={item.label} className="border border-white/10 bg-white/3 rounded-2xl p-5 text-center">
                  <p className="text-2xl font-bold text-emerald-400">{item.stat}</p>
                  <p className="text-white/40 text-xs mt-1 leading-snug">{item.label}</p>
                </div>
              ))}
            </div>
          </section>

          <section className="mb-14">
            <h2 className="text-2xl font-bold mb-6">Delhi NCR Supply Chain Challenges We Solve</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {delhiPainPoints.map((point) => (
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
            <h2 className="text-2xl font-bold mb-5">Delhi NCR&rsquo;s Supply Chain Infrastructure</h2>
            <div className="space-y-4 text-white/60 leading-relaxed">
              <p>
                Delhi NCR is North India&rsquo;s supply chain command centre, encompassing Delhi,
                Gurugram, Noida, Faridabad, and Ghaziabad — a combined economic region of 46 million
                people that accounts for a disproportionate share of India&rsquo;s manufacturing output
                and consumer demand.
              </p>
              <p>
                Indira Gandhi International Airport (IGIA) is India&rsquo;s largest air cargo gateway,
                handling over 1 million metric tonnes of cargo annually. ICD Tughlakabad, connected
                to all major Indian ports by rail, processes over 400,000 TEUs of import and export
                containers per year. The Delhi–Mumbai Industrial Corridor (DMIC) runs through the
                NCR region, anchoring future manufacturing and logistics investment.
              </p>
              <p>
                Warehousing has expanded significantly in Kundli–Manesar–Palwal (KMP) Expressway
                zone, IMT Manesar, Noida Phase 2, and Greater Noida. These modern logistics parks
                house national distribution centres for India&rsquo;s largest FMCG, retail, and
                e-commerce companies.
              </p>
              <p>
                Seasonal disruptions are a major operational challenge in Delhi NCR. Winter fog
                (December–February) regularly causes 4–8 hour flight delays at IGIA and reduces
                road freight speed on NH-48 and NH-44. Summer heat can affect certain perishable
                and pharmaceutical supply chains. Operations teams need AI tools that adapt
                safety stock and risk scoring to these seasonal patterns.
              </p>
            </div>
          </section>

          <section className="mb-14">
            <h2 className="text-2xl font-bold mb-5">
              What OpsOracle AI Delivers for Delhi NCR Teams
            </h2>
            <div className="space-y-3">
              {[
                "Supplier OTIF tracking across Gurgaon, Noida, and Faridabad — identify which auto and electronics component suppliers are most reliable",
                "ICD Tughlakabad customs clearance time analysis — benchmark your import dwell times and identify clearance outliers",
                "NH-48 corridor performance by carrier — which logistics partners deliver the most reliably on Delhi–Jaipur–Mumbai routes",
                "Seasonal risk scoring — automated safety stock adjustments for winter fog and monsoon disruption periods",
                "Noida electronics component inventory optimisation — safety stock recommendations for high-variability imported components",
                "North India secondary distribution OTIF — track delivery performance to tier-2 cities in UP, Rajasthan, and Haryana",
                "Supply chain cost as % of revenue benchmark — compare your Delhi NCR operations against Gartner world-class targets",
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
              Start analysing your Delhi NCR supply chain data today
            </h2>
            <p className="text-white/55 text-sm max-w-lg mx-auto mb-6">
              Upload your shipment and purchase order data. OpsOracle AI calculates your OTIF,
              lead time reliability, supplier performance, and supply chain cost — compared to
              world-class benchmarks — in under 5 minutes.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link
                href="/register"
                className="bg-emerald-500 hover:bg-emerald-400 text-black font-semibold text-sm px-6 py-3 rounded-xl transition-colors"
              >
                Try OpsOracle AI Free
              </Link>
              <Link
                href="/tools/supply-chain-cost-calculator"
                className="border border-white/20 hover:border-white/40 text-white/70 hover:text-white font-semibold text-sm px-6 py-3 rounded-xl transition-colors"
              >
                Free Supply Chain Cost Calculator
              </Link>
            </div>
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
            <Link href="/logistics-software-bangalore" className="hover:text-white transition-colors">Bangalore</Link>
            <Link href="/tools" className="hover:text-white transition-colors">Free Calculators</Link>
            <Link href="/pricing" className="hover:text-white transition-colors">Pricing</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
