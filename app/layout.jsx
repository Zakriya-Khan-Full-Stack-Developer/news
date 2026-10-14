import '@fontsource-variable/inter';
import '@fontsource-variable/fraunces';
import './globals.css';
import Navbar from '../components/Navbar.jsx';
import Footer from '../components/Footer.jsx';
import AdScripts from '../components/AdScripts.jsx';
import { FOUNDER, CONTACT, POSTAL_ADDRESS_SCHEMA } from '../lib/data/editorial.js';

const siteUrl = 'https://nameverse.site';
const siteName = 'NameVerse';
const siteLogo = `${siteUrl}/nameverse_logo_emblem.webp`;

export const metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    template: '%s | NameVerse',
    default: 'Baby Names with Meanings, Origins & Lucky Numbers | NameVerse',
  },
  description:
    'Search 11,412 baby names with documented meanings, origins, pronunciation guides, script forms and cultural context across Islamic, Christian and Hindu traditions.',
  alternates: {
    canonical: siteUrl,
  },
  keywords: [
    'baby names',
    'baby name meanings',
    'name origin',
    'Islamic baby names',
    'Christian baby names',
    'Hindu baby names',
    'baby name finder',
    'names by meaning',
  ],
  openGraph: {
    title: 'Baby Names with Meanings, Origins & Lucky Numbers | NameVerse',
    description:
      'Search 11,412 baby names with documented meanings, origins, pronunciation and cultural context across three traditions.',
    url: siteUrl,
    siteName,
    images: [
      {
        url: siteLogo,
        width: 512,
        height: 512,
        alt: 'NameVerse',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  applicationName: siteName,
  // A named author and publisher, not an anonymous "Team". This was
  // `authors: [{ name: 'NameVerse' }]` — an organisation standing in for a
  // person who now exists and is named on /about.
  authors: [{ name: FOUNDER.name, url: `${siteUrl}/about#founder` }],
  creator: FOUNDER.name,
  publisher: siteName,
  category: 'Parenting',
  twitter: {
    // FIX — was 'summary' here while the US cluster pages used
    // 'summary_large_image', so the same link rendered two completely different
    // ways depending on which page it pointed at. A shared baby-name page is a
    // visual, emotional share; the small square thumbnail wastes the slot.
    // Large image is the right default for every page on this site.
    card: 'summary_large_image',
    title: 'Baby Names with Meanings, Origins & Lucky Numbers | NameVerse',
    description:
      'Search 11,412 baby names with documented meanings, origins, pronunciation and cultural context.',
    images: [{ url: siteLogo, width: 512, height: 512, alt: `${siteName} — baby names with meanings` }],
    site: '@NameVerseOfficial',
    creator: '@NameVerseOfficial',
  },
  robots: {
    index: true,
    follow: true,
    'max-snippet': -1,
    'max-image-preview': 'large',
    'max-video-preview': -1,
  },
  verification: {
    google: 'fB60sPZ-K1f5t10x-57z6f6_n655',
  },
};

const orgJsonLd = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'Organization',
      '@id': `${siteUrl}/#organization`,
      name: siteName,
      url: siteUrl,
      logo: {
        '@type': 'ImageObject',
        url: siteLogo,
        width: 512,
        height: 512,
      },
      email: CONTACT.email,
      telephone: CONTACT.phone.e164,
      founder: {
        '@type': 'Person',
        '@id': `${siteUrl}/about#founder`,
        name: FOUNDER.name,
        jobTitle: FOUNDER.role,
        url: `${siteUrl}/about#founder`,
      },
      address: POSTAL_ADDRESS_SCHEMA,
      contactPoint: {
        '@type': 'ContactPoint',
        email: CONTACT.email,
        telephone: CONTACT.phone.e164,
        contactType: 'customer support',
        contactOption: 'TollFree',
        areaServed: 'Worldwide',
        availableLanguage: FOUNDER.languages,
      },
      sameAs: FOUNDER.sameAs,
    },
    {
      '@type': 'WebSite',
      '@id': `${siteUrl}/#website`,
      name: siteName,
      url: siteUrl,
      publisher: { '@id': `${siteUrl}/#organization` },
      potentialAction: {
        '@type': 'SearchAction',
        target: `${siteUrl}/search?q={search_term_string}`,
        'query-input': 'required name=search_term_string',
      },
    },
  ],
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" dir="ltr" suppressHydrationWarning>
      <head>
        <meta name="color-scheme" content="light dark" />
        <meta name="theme-color" content="#1E2A4A" />
        <meta
          name="google-site-verification"
          content="bY09F9IpVk_dzOagZu5xAzZwH9U-Io3IeuBeaBkfG0g"
        />
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{const t=localStorage.getItem('theme');if(t==='dark'||(!t&&window.matchMedia('(prefers-color-scheme:dark)').matches)){document.documentElement.classList.add('dark')}}catch(e){}})()`,
          }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(orgJsonLd) }}
        />
      </head>
      <body className="flex min-h-screen flex-col bg-nv-page text-nv-text antialiased">
        <Navbar />
        {/* pb-mobile-cta reserves space for the sticky mobile tab bar so it
            never overlaps the footer or the last content block. */}
        <main className="flex-1 pb-mobile-cta">{children}</main>
        <Footer />
        {/* Every Adsterra script, rendered once for the whole site. Plain
            <script async> tags so they are present in the prerendered HTML and
            never block parsing or paint. Client-side only — zero server CPU. */}
        <AdScripts />
      </body>
    </html>
  );
}
