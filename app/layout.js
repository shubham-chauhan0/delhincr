import './globals.css';

const BASE = process.env.NEXT_PUBLIC_APP_URL || 'https://delhincr-rents.com';

export const metadata = {
  metadataBase: new URL(BASE),
  title: {
    default: 'Delhi NCR Rent & Property Prices — Real Data from Residents',
    template: '%s | NCR Realty',
  },
  description:
    'See what people actually pay to rent or buy property in Delhi, Gurgaon, Noida, Faridabad & Ghaziabad. Community-submitted, anonymous, no brokers. Real rents for 2BHK, 3BHK, builder floor across 85+ localities.',
  keywords: [
    'Delhi NCR rent',
    'rent in Delhi 2025',
    'Gurgaon flat rent',
    'Noida property price',
    '2BHK rent Delhi',
    '3BHK rent Gurgaon',
    'real rent data Delhi NCR',
    'property price per sqft Noida',
    'bachelor flat Delhi',
    'flat available Delhi NCR',
    'community rent data India',
    'real property prices NCR',
    'rent without broker Delhi',
    'Indirapuram flat rent',
    'Dwarka flat rent',
    'Hauz Khas rent',
  ],
  authors: [{ name: 'NCR Realty Community' }],
  creator: 'NCR Realty',
  alternates: { canonical: BASE },
  // Correct viewport — prevents iOS Safari from zooming on input focus
  // user-scalable=no keeps the map feel native; interactive-widget shrinks
  // the viewport to the visible area so the keyboard doesn't push content
  viewport: 'width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no, interactive-widget=resizes-visual',
  openGraph: {
    type: 'website',
    locale: 'en_IN',
    url: BASE,
    siteName: 'NCR Realty',
    title: 'Delhi NCR Rent & Property Prices — Real Data from Residents',
    description:
      'Real rents & buy prices across Delhi, Gurgaon, Noida — submitted anonymously by residents. No brokers, no inflated listings.',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'NCR Realty — Real Rent & Property Data for Delhi NCR',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Delhi NCR Rent & Property Prices — Real Data from Residents',
    description: 'Real rents & buy prices across Delhi NCR. Community data, no brokers.',
    images: ['/og-image.png'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, 'max-snippet': -1, 'max-image-preview': 'large' },
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
