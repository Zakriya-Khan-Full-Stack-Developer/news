import Link from 'next/link';
import AdSlot from '../../components/AdSlot.jsx';
import { FOUNDER } from '../../lib/data/editorial.js';
import { pageMetadata, NOINDEX_FOLLOW } from '../../lib/seo.js';

// ─────────────────────────────────────────────────────────────────────────────
// This policy must describe what the site ACTUALLY runs.
//
// Reconciled against the code on 2026-10-17:
//   • components/AdScripts.jsx loads three third-party scripts from
//     revolthem.com (an Adsterra delivery domain): a banner/native unit, a
//     popunder and a "smartlink" popunder, on every page.
//   • There is NO first-party analytics script, and Google AdSense is NOT
//     loaded (components/Ad.jsx and NativeAdBanner.jsx are not used).
//   • localStorage keys: `theme` (light/dark) and `nv-shortlist-v1` (saved
//     names). Neither is sent to our servers.
// If any of that changes, update this page in the same commit.
// ─────────────────────────────────────────────────────────────────────────────

const UPDATED_ISO = '2026-10-17';
const UPDATED_LABEL = 'October 17, 2026';

export const metadata = pageMetadata({
  title: 'Privacy Policy',
  description:
    'How NameVerse handles data: third-party ad scripts, on-device storage for your theme and saved names, hosting logs, and how to contact us.',
  path: '/privacy',
  robots: NOINDEX_FOLLOW,
});

const sections = [
  {
    title: '1. Who we are',
    body: [
      `NameVerse (nameverse.site) is a free baby-name reference founded and run by ${FOUNDER.name}. For anything in this policy, contact ${FOUNDER.email} or WhatsApp ${FOUNDER.whatsappDisplay}.`,
    ],
  },
  {
    title: '2. What we collect ourselves',
    body: [
      'Nothing that identifies you. There are no accounts, no sign-up forms and no newsletter on NameVerse, and we do not run our own analytics or tracking scripts.',
      'Like any website, our hosting provider automatically processes technical request data (such as IP address, browser type, the page requested and the time) to deliver pages and protect the service. We do not use these logs to build profiles of visitors.',
      'If you email or message us on WhatsApp, we receive your address or number and what you write, and use it only to reply to you.',
    ],
  },
  {
    title: '3. Advertising',
    body: [
      'NameVerse is funded by advertising. Every page loads three scripts from revolthem.com, which delivers ads for the Adsterra network: a banner or native ad unit, a pop-under ad, and a "smartlink" that can open an advertiser page in a new window or tab.',
      'These scripts are run by the ad network, not by us. When they load, the network and its partners may receive your IP address, device and browser information and the page you are viewing, and may use cookies or similar technologies to choose, limit and measure ads. Their handling of that data is governed by their own privacy policies.',
      'We do not use Google AdSense or any other ad network at present. If that changes, we will update this page.',
    ],
  },
  {
    title: '4. Storage on your device',
    body: [
      'We use your browser\u2019s local storage for two things only: your light/dark theme choice (key "theme") and the names you save to your shortlist (key "nv-shortlist-v1"). Both stay in your browser and are never sent to our servers. Clearing your browser\u2019s site data removes them.',
      'If you use "Copy share link" on the My Saved Names page, the link contains the names in your shortlist; it is shared only with whoever you choose to send it to.',
    ],
  },
  {
    title: '5. Your choices',
    body: [
      'You can block or delete cookies and site data in your browser settings, use your browser\u2019s tracking protection, or use an ad blocker. NameVerse remains fully usable without ads.',
      'Depending on where you live, you may have rights to access, correct or delete personal data and to object to certain processing. Because we do not hold personal data about visitors beyond messages you send us, requests about advertising data should also be directed to the ad network; we will help where we can.',
    ],
  },
  {
    title: '6. Children\u2019s privacy',
    body: [
      'NameVerse is a general-audience reference for parents and is not directed at children under 13. We do not knowingly collect personal information from children.',
    ],
  },
  {
    title: '7. Changes to this policy',
    body: [
      'We update this policy whenever the scripts or storage the site uses change. The date at the top shows the most recent revision.',
    ],
  },
];

export default function PrivacyPage() {
  return (
    <div className="container-page py-10 sm:py-14">
      <div className="mx-auto max-w-3xl">
        <header className="mb-8">
          <span className="eyebrow">Legal</span>
          <h1 className="mt-2 font-display text-3xl font-bold tracking-tight text-nv-text sm:text-5xl">Privacy Policy</h1>
          <p className="mt-3 text-sm text-nv-text-secondary">
            Last updated: <time dateTime={UPDATED_ISO}>{UPDATED_LABEL}</time>
          </p>
        </header>

        <AdSlot placement="privacy-top" />

        <div className="space-y-4">
          {sections.map((s) => (
            <section key={s.title} className="card p-6">
              <h2 className="font-display text-lg font-bold text-nv-text">{s.title}</h2>
              <div className="mt-2 space-y-3 text-sm leading-relaxed text-nv-text-secondary">
                {s.body.map((p) => (
                  <p key={p}>{p}</p>
                ))}
              </div>
            </section>
          ))}
          <p className="pt-4 text-sm text-nv-text-secondary">
            Questions? Email{' '}
            <a href={`mailto:${FOUNDER.email}`} className="font-semibold text-nv-accent hover:underline">
              {FOUNDER.email}
            </a>{' '}
            or see the{' '}
            <Link href="/contact" className="font-semibold text-nv-accent hover:underline">
              contact page
            </Link>
            .
          </p>
        </div>
      </div>
    </div>
  );
}
