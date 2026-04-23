import NCRRealty from '@/components/NCRRealty';

const BASE = process.env.NEXT_PUBLIC_APP_URL || 'https://delhincr-rents.com';

// ── Structured data ───────────────────────────────────────────────────────────
const websiteSchema = {
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  name: 'NCR Realty',
  url: BASE,
  description:
    'Community-driven rent and property price transparency platform for Delhi NCR. Real data submitted anonymously by residents.',
  potentialAction: {
    '@type': 'SearchAction',
    target: { '@type': 'EntryPoint', urlTemplate: `${BASE}/?q={search_term_string}` },
    'query-input': 'required name=search_term_string',
  },
};

const faqSchema = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: 'What is the average rent in Delhi in 2025?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Based on community data, average rents in Delhi range from ₹10,000–₹18,000/month in West Delhi areas like Dwarka and Uttam Nagar, to ₹25,000–₹50,000/month in South Delhi localities like Hauz Khas, Greater Kailash, and Saket. A 2BHK in a mid-range Delhi society typically costs ₹20,000–₹35,000/month.',
      },
    },
    {
      '@type': 'Question',
      name: 'How much does it cost to rent a flat in Gurgaon?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Gurgaon rents vary widely by location. Sectors near Golf Course Road and DLF City average ₹35,000–₹80,000/month for a 2BHK. More affordable options in sectors like Sector 22, Palam Vihar, and Sohna Road range from ₹15,000–₹30,000/month. New Gurgaon is typically cheaper at ₹12,000–₹25,000/month.',
      },
    },
    {
      '@type': 'Question',
      name: 'What are the cheapest areas to rent in Noida?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Affordable rental areas in Noida include Sector 62, Sector 75, Greater Noida West (Noida Extension), and Yamuna Expressway. 2BHK flats in these sectors typically range from ₹12,000–₹22,000/month. Well-connected areas like Sector 18 and Sector 50 near the metro are pricier at ₹20,000–₹35,000/month.',
      },
    },
    {
      '@type': 'Question',
      name: 'How is NCR Realty data collected?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'All data on NCR Realty is submitted anonymously by residents, tenants, and property owners who have actual knowledge of transactions. No login is required. Each submission is voluntary and community-verified through upvotes and reports. This gives a more accurate picture than broker listings, which are often inflated.',
      },
    },
    {
      '@type': 'Question',
      name: 'Can I find available flats to rent on NCR Realty?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Yes. Users who have a flat available for rent can mark it as "Available" when submitting their pin. These appear as bright green AVAIL markers on the map. You can also filter by "Available now" to see only currently listed flats. The Flat Hunt feature also lets seekers and owners match with each other directly without a broker.',
      },
    },
    {
      '@type': 'Question',
      name: 'Is NCR Realty free? Are there any broker fees?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'NCR Realty is completely free to use for both exploring data and submitting pins. There are no broker fees, no commissions, and no hidden charges. The platform connects tenants and landlords directly through its Flat Hunt feature — no intermediaries involved.',
      },
    },
  ],
};

// Rendered server-side in DOM before the fullscreen map component.
// The map uses position:fixed and covers this visually, but crawlers
// read the HTML source and index this content.
function SEOContent() {
  return (
    <section
      aria-label="About NCR Realty — Real Rent and Property Prices in Delhi NCR"
      style={{ position: 'absolute', top: 0, left: 0, right: 0, zIndex: 0, background: '#fff', padding: '40px 24px 60px' }}
    >
      <div style={{ maxWidth: 860, margin: '0 auto' }}>

        <h1 style={{ fontSize: 28, fontWeight: 800, color: '#111', marginBottom: 12 }}>
          Real Rent &amp; Property Prices in Delhi NCR
        </h1>
        <p style={{ fontSize: 16, color: '#374151', lineHeight: 1.8, marginBottom: 24 }}>
          NCR Realty is a community-driven, map-first platform that shows what people
          actually pay to rent or buy property across Delhi, Gurgaon, Noida, Faridabad,
          and Ghaziabad. All data is submitted anonymously by residents — no brokers,
          no inflated listings, no guesswork.
        </p>

        <h2 style={{ fontSize: 20, fontWeight: 700, color: '#111', marginBottom: 12 }}>
          What you can do on NCR Realty
        </h2>
        <ul style={{ fontSize: 15, color: '#374151', lineHeight: 2, paddingLeft: 20, marginBottom: 32 }}>
          <li><strong>Explore real rents</strong> — see median and average monthly rents across 85+ Delhi NCR localities, filterable by BHK, furnishing, and city.</li>
          <li><strong>Track buy/sale prices</strong> — community-submitted property sale data with ₹/sqft breakdown by area and property type.</li>
          <li><strong>Find available flats</strong> — filter the map to show only flats currently available for rent, posted directly by owners.</li>
          <li><strong>Flat Hunt (broker-free)</strong> — seekers and owners match with each other within 3km based on budget, BHK, and preferences. No commission.</li>
          <li><strong>Add your data</strong> — anonymously pin your rent or sale price to help others make informed decisions.</li>
        </ul>

        <h2 style={{ fontSize: 20, fontWeight: 700, color: '#111', marginBottom: 20 }}>
          Frequently Asked Questions
        </h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          {faqSchema.mainEntity.map((item, i) => (
            <div key={i} style={{ borderBottom: '1px solid #e5e7eb', paddingBottom: 20 }}>
              <h3 style={{ fontSize: 16, fontWeight: 700, color: '#111', marginBottom: 8 }}>
                {item.name}
              </h3>
              <p style={{ fontSize: 15, color: '#4b5563', lineHeight: 1.75, margin: 0 }}>
                {item.acceptedAnswer.text}
              </p>
            </div>
          ))}
        </div>

        <p style={{ marginTop: 32, fontSize: 13, color: '#9ca3af' }}>
          Data covers Delhi, Gurgaon (Gurugram), Noida, Greater Noida, Faridabad, and Ghaziabad.
          All submissions are anonymous. No personal data is stored publicly.
          Last updated continuously by community contributions.
        </p>
      </div>
    </section>
  );
}

export default function HomePage() {
  return (
    <>
      {/* JSON-LD structured data — read by crawlers regardless of visual layout */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />

      {/* Crawlable content — in DOM before the fixed-position map overlay */}
      <SEOContent />

      {/* Map UI — position:fixed, covers viewport, renders on top */}
      <NCRRealty initialPins={[]} />
    </>
  );
}
