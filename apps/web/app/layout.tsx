import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import '../styles/globals.css'

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' })

export const metadata: Metadata = {
  title: {
    default: 'Mandi — Buy & Sell Animals and Agriculture Goods in Pakistan',
    template: '%s | Mandi',
  },
  description:
    'Pakistan\'s trusted marketplace for buying and selling animals, livestock, and agriculture goods. Find goats, cows, buffaloes, tractors, seeds and more.',
  keywords: ['animals for sale Pakistan', 'goats for sale', 'cows for sale', 'livestock Pakistan', 'agriculture goods Pakistan', 'mandi'],
  openGraph: {
    siteName: 'Mandi',
    locale: 'ur_PK',
    alternateLocale: 'en_PK',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
  },
  robots: {
    index: true,
    follow: true,
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ur" dir="rtl" className={inter.variable}>
      <head>
        {/* Preload Urdu font */}
        <link
          rel="preconnect"
          href="https://fonts.googleapis.com"
        />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Noto+Nastaliq+Urdu:wght@400;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>{children}</body>
    </html>
  )
}
