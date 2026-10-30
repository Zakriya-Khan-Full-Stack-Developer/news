import Link from 'next/link';
import AdSlot from '../../components/AdSlot.jsx';
import { getPublishedPosts, getCategories, readTimeLabel, formatDate } from '../../lib/data/blog.js';
import { AUTHOR, FOUNDER } from '../../lib/data/editorial.js';
import { pageMetadata, absoluteUrl } from '../../lib/seo.js';

// Title is bare: the root template appends "| NameVerse" exactly once. It used
// to be "Baby Name Guides & Trends 2026 | NameVerse Blog", which rendered as
// "… | NameVerse Blog | NameVerse".
export const metadata = pageMetadata({
  title: 'Baby Name Guides & Articles',
  description:
    'In-depth baby-name guides: Islamic, Hindu and biblical names with meanings, names that mean light, love or strength, and how to choose a name.',
  path: '/blog',
});

function PostCard({ post }) {
  return (
    <Link href={`/blog/${post.id}`} className="card card-hover group flex flex-col p-6">
      <div className="flex items-center justify-between gap-2">
        <span className="badge bg-nv-accent-subtle text-nv-accent">{post.category}</span>
        <span className="text-xs text-nv-text-muted">{readTimeLabel(post)}</span>
      </div>
      <h3 className="mt-3 font-display text-xl font-bold leading-snug text-nv-text transition-colors group-hover:text-nv-accent">
        {post.title}
      </h3>
      <p className="mt-2 line-clamp-3 text-sm leading-relaxed text-nv-text-secondary">{post.excerpt}</p>
      <div className="mt-auto flex items-center justify-between pt-5 text-xs text-nv-text-secondary">
        <time dateTime={post.lastUpdated || post.publishDate}>
          {formatDate(post.lastUpdated || post.publishDate, { month: 'short', day: 'numeric', year: 'numeric' })}
        </time>
        <span className="font-semibold text-nv-accent transition-transform group-hover:translate-x-0.5">Read guide &rarr;</span>
      </div>
    </Link>
  );
}

export default function BlogIndexPage() {
  const posts = getPublishedPosts();
  const categories = getCategories(posts);
  const featured = posts
    .filter((p) => p.featured)
    .sort((a, b) => (a.featuredOrder ?? 99) - (b.featuredOrder ?? 99))
    .slice(0, 3);

  const blogSchema = {
    '@context': 'https://schema.org',
    '@type': 'Blog',
    '@id': `${absoluteUrl('/blog')}#blog`,
    name: 'NameVerse Blog',
    description: 'In-depth baby-name guides covering Islamic, Hindu, Christian and cross-cultural naming.',
    url: absoluteUrl('/blog'),
    inLanguage: 'en',
    publisher: { '@type': 'Organization', '@id': `${absoluteUrl('/')}/#organization`, name: 'NameVerse', url: absoluteUrl('/') },
    blogPost: posts.map((post) => ({
      '@type': 'BlogPosting',
      headline: post.title,
      url: absoluteUrl(`/blog/${post.id}`),
      datePublished: post.publishDate,
  dateModified: post.lastUpdated || post.publishDate,
      author: {
    '@type': AUTHOR.isOrganisation ? 'Organization' : 'Person',
    '@id': AUTHOR.isOrganisation ? undefined : AUTHOR.bioUrl,
    name: AUTHOR.name,
    jobTitle: AUTHOR.isOrganisation ? undefined : AUTHOR.role,
    url: AUTHOR.bioUrl,
      },
    })),
  };

  return (
    <div className="container-page py-10 sm:py-14">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(blogSchema) }} />

      <div className="mx-auto max-w-6xl">
        <header className="mb-10 text-center">
          <span className="eyebrow">NameVerse guides</span>
          <h1 className="mt-2 font-display text-3xl font-bold tracking-tight text-nv-text sm:text-5xl">
            Baby Name Guides &amp; Articles
          </h1>
          <p className="mx-auto mt-3 max-w-2xl text-nv-text-secondary">
            {posts.length} in-depth guides to names, meanings and naming traditions &mdash; with sources named in every
            article. Run by{' '}
            <Link href="/about" className="font-semibold text-nv-accent hover:underline">{FOUNDER.name}</Link>.
          </p>
          <nav className="mt-6 flex flex-wrap justify-center gap-2" aria-label="Guide topics">
            {categories.map((c) => (
              <a
                key={c.id}
                href={`#${c.id}`}
                className="rounded-full border border-nv-border bg-nv-surface px-3 py-1.5 text-xs font-semibold text-nv-text-secondary transition hover:border-nv-accent hover:text-nv-accent"
              >
                {c.name} ({c.count})
              </a>
            ))}
          </nav>
        </header>

        <AdSlot placement="blog-index-top" />

        {featured.length > 0 && (
          <section className="mb-14" aria-labelledby="featured-heading">
            <h2 id="featured-heading" className="mb-5 font-display text-2xl font-bold tracking-tight text-nv-text">
              Start here
            </h2>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {featured.map((post) => (
                <PostCard key={post.id} post={post} />
              ))}
            </div>
          </section>
        )}

        {categories.map((c) => (
          <section key={c.id} id={c.id} className="mb-14 scroll-mt-24" aria-labelledby={`${c.id}-heading`}>
            <h2 id={`${c.id}-heading`} className="mb-5 font-display text-2xl font-bold tracking-tight text-nv-text">
              {c.name}
            </h2>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {posts
                .filter((p) => p.category === c.name)
                .map((post) => (
                  <PostCard key={post.id} post={post} />
                ))}
            </div>
          </section>
        ))}

        <section className="mt-16 border-t border-nv-border pt-12" aria-labelledby="tradition-heading">
          <h2 id="tradition-heading" className="mb-6 text-center font-display text-2xl font-bold tracking-tight text-nv-text">
            Explore names by tradition
          </h2>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
            {[
              { label: 'Islamic Boy Names', href: '/islamic-boy-names' },
              { label: 'Islamic Girl Names', href: '/islamic-girl-names' },
              { label: 'Christian Boy Names', href: '/christian-boy-names' },
              { label: 'Christian Girl Names', href: '/christian-girl-names' },
              { label: 'Hindu Boy Names', href: '/hindu-boy-names' },
              { label: 'Hindu Girl Names', href: '/hindu-girl-names' },
            ].map((cat) => (
              <Link
                key={cat.href}
                href={cat.href}
                className="card p-3.5 text-center text-sm font-semibold text-nv-text transition hover:border-nv-accent hover:text-nv-accent"
              >
                {cat.label}
              </Link>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
