import Link from 'next/link';
import MyNamesClient from '../../components/MyNamesClient.jsx';
import { pageMetadata, NOINDEX_FOLLOW } from '../../lib/seo.js';

// A personal utility page: useful to visitors, not a search landing page.
// It stays crawlable (no robots.txt disallow) so crawlers can read the noindex.
export const metadata = pageMetadata({
  title: 'My Saved Names',
  description: 'Your baby-name shortlist, saved privately in this browser. Compare names side by side or share the list with a link.',
  path: '/my-names',
  robots: NOINDEX_FOLLOW,
  canonical: false,
});

export default function MyNamesPage() {
  return (
    <div className="container-page py-10 sm:py-14">
      <div className="mx-auto max-w-3xl">
        <h1 className="font-display text-3xl font-bold text-nv-text sm:text-4xl">My Saved Names</h1>
        <p className="mt-4 text-nv-text-secondary">
          Names you save on any profile appear here. Your shortlist is stored only in this browser &mdash; there is
          no account and nothing is sent to our servers. Clearing your browser&rsquo;s site data removes it. To move
          it to another device, copy the share link.
        </p>
        <MyNamesClient />
        <p className="mt-10 text-xs text-nv-text-muted">
          How we handle data: see the{' '}
          <Link href="/privacy" className="font-semibold text-nv-accent hover:underline">privacy policy</Link>.
        </p>
      </div>
    </div>
  );
}
