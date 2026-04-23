import './globals.css';

export const metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'https://ncrrealty.in'),
  title: {
    default: 'NCR Realty — Real Rent & Property Prices Delhi NCR',
    template: '%s | NCR Realty',
  },
  description:
    'See what people actually pay to rent or buy property in Delhi, Gurgaon, Noida, Faridabad & Ghaziabad. Community-submitted, anonymous, no brokers.',
  keywords: [
    'Delhi NCR rent',
    'Gurgaon flat rent',
    'Noida property price',
    'DLF rent price',
    'Golf Course Road rent',
    'Dwarka rent',
    '2BHK rent Delhi',
    'property price per sqft Gurgaon',
    'bachelor flat Delhi',
    'community rent data India',
    'real property prices NCR 2025',
  ],
  authors: [{ name: 'NCR Realty Community' }],
  creator: 'NCR Realty',
  openGraph: {
    type: 'website',
    locale: 'en_IN',
    url: 'https://ncrrealty.in',
    siteName: 'NCR Realty',
    title: 'NCR Realty — Real Rent & Property Prices Delhi NCR',
    description:
      'See what people actually pay in Delhi, Gurgaon, Noida. Crowdsourced rent & buy data. Anonymous, no brokers.',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'NCR Realty — Community Property Data',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'NCR Realty — Real Rent & Property Prices Delhi NCR',
    description: 'Crowdsourced rent & buy data. Anonymous, no brokers.',
    images: ['/og-image.png'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true },
  },
  icons: {
    icon: '/favicon.ico',
    apple: '/apple-touch-icon.png',
  },
};

const GA_ID = process.env.NEXT_PUBLIC_GA_ID;

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        {GA_ID && (
          <>
            <script async src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`} />
            <script
              dangerouslySetInnerHTML={{
                __html: `
                  window.dataLayer = window.dataLayer || [];
                  function gtag(){dataLayer.push(arguments);}
                  gtag('js', new Date());
                  gtag('config', '${GA_ID}', { page_path: window.location.pathname });
                `,
              }}
            />
          </>
        )}
      </head>
      <body>{children}</body>
    </html>
  );
}
