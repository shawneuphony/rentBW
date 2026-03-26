// app/metadata.js (or in layout.js but export separately)
export const metadata = {
  title: 'RentBW | Find Your Perfect Rental Home in Botswana',
  description: 'RentBW connects verified landlords with reliable tenants for long-term residential rentals in Botswana.',
  keywords: ['Botswana rental', 'Gaborone apartments', 'rental homes', 'property rental', 'verified landlords', 'rental platform'],
  authors: [{ name: 'RentBW Team' }],
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  openGraph: {
    title: 'RentBW | Find Your Perfect Rental Home in Botswana',
    description: 'Verified rental platform connecting landlords and tenants in Botswana.',
    url: 'https://rentbw.com',
    siteName: 'RentBW',
    locale: 'en_BW',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'RentBW | Botswana Rental Platform',
    description: 'Find verified rental properties in Botswana.',
    creator: '@rentbw',
  },
  icons: {
    icon: '/favicon.ico',
  },
};