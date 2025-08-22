import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "HeyZo - Decentralized Reward System",
  description: "A revolutionary decentralized reward system built on the Celo blockchain. Users earn tokens daily, build streaks, and get boosted rewards while admins manage pools and distributions seamlessly.",
  keywords: ["blockchain", "rewards", "celo", "defi", "tokens", "streaks", "decentralized"],
  authors: [{ name: "HeyZo Team" }],
  creator: "HeyZo",
  publisher: "HeyZo",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL('https://heyzo.app'),
  openGraph: {
    title: "HeyZo - Decentralized Reward System",
    description: "A revolutionary decentralized reward system built on the Celo blockchain. Users earn tokens daily, build streaks, and get boosted rewards while admins manage pools and distributions seamlessly.",
    url: 'https://heyzo.app',
    siteName: 'HeyZo',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'HeyZo - Decentralized Reward System',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: "HeyZo - Decentralized Reward System",
    description: "A revolutionary decentralized reward system built on the Celo blockchain. Users earn tokens daily, build streaks, and get boosted rewards while admins manage pools and distributions seamlessly.",
    images: ['/og-image.png'],
  },
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
  verification: {
    google: 'your-google-verification-code',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="scroll-smooth">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap" rel="stylesheet" />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
