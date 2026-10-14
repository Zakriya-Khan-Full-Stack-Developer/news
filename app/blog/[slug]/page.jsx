import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getBlogPosts } from '../../../lib/data/names-data.js';
import { AUTHOR, PUBLISHER, resolveSources } from '../../../lib/data/editorial.js';
import { resolveName } from '../../../lib/data/us-names.js';
import AdSlot from '../../../components/AdSlot.jsx';

export const dynamicParams = false;

// Every published article is prerendered. There are no placeholder or
// "coming soon" blog routes: a slug is generated only when its data record
// contains the article body rendered below.
export function generateStaticParams() {
  return getBlogPosts()
    .filter((post) => post && post.id && post.content?.introduction && post.content?.sections?.length)
    .map((post) => ({ slug: post.id }));
}

export async function generateMetadata({ params }) {
  const blogPosts = getBlogPosts();
  const post = blogPosts.find((p) => p.id === params.slug);

  if (!post) return {};

  return {
    title: `${post.title} | NameVerse`,
    description: post.excerpt,
    alternates: {
      canonical: `https://nameverse.site/blog/${post.id}`,
    },
    openGraph: {
      title: post.title,
      description: post.excerpt,
      url: `https://nameverse.site/blog/${post.id}`,
      type: 'article',
      publishedTime: post.publishDate,
      modifiedTime: post.lastUpdated,
      images: [{ url: 'https://nameverse.site/nameverse_logo_emblem.webp', width: 512, height: 512, alt: 'NameVerse — baby names with meanings and origins' }],
    },
    twitter: { card: 'summary_large_image', title: post.title, description: post.excerpt },
  };
}

export default function BlogPostPage({ params }) {
  const blogPosts = getBlogPosts();
  const post = blogPosts.find((p) => p.id === params.slug);

  if (!post) notFound();

  const {
    title,
    subtitle,
    excerpt,
    category,
    author,
    publishDate,
    lastUpdated,
    readTime,
    content,
  } = post;
  const sources = resolveSources(post.sourceKeys || ['ssa', 'babycenter']);
  const formattedDate = new Date(publishDate).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
  const updatedDate = new Date(lastUpdated || publishDate).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const blogPostingSchema = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: title,
    description: excerpt,
    datePublished: publishDate,
    dateModified: lastUpdated,
    author: {
      '@type': AUTHOR.isOrganisation ? 'Organization' : 'Person',
      '@id': AUTHOR.isOrganisation ? undefined : 'https://nameverse.site/about#founder',
      name: author || AUTHOR.name,
      jobTitle: AUTHOR.isOrganisation ? undefined : AUTHOR.role,
      url: AUTHOR.bioUrl,
    },
    publisher: {
      '@type': 'Organization',
      name: PUBLISHER.name,
      url: PUBLISHER.url,
      logo: { '@type': 'ImageObject', url: PUBLISHER.logo },
    },
    image: 'https://nameverse.site/nameverse_logo_emblem.webp',
    citation: sources.map((source) => source.url),
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': `https://nameverse.site/blog/${post.id}`,
    },
  };

  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://nameverse.site' },
      { '@type': 'ListItem', position: 2, name: 'Blog', item: 'https://nameverse.site/blog' },
      { '@type': 'ListItem', position: 3, name: title },
    ],
  };

  return (
    <article className="container-page py-10 sm:py-14">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(blogPostingSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />

      <div className="mx-auto max-w-3xl">
        {/* Breadcrumb */}
        <nav className="mb-6 flex items-center gap-2 text-sm text-nv-text-secondary" aria-label="Breadcrumb">
          <Link href="/" className="hover:text-nv-accent transition">Home</Link>
          <span>/</span>
          <Link href="/blog" className="hover:text-nv-accent transition">Blog</Link>
          <span>/</span>
          <span className="text-nv-text font-medium truncate">{title}</span>
        </nav>

        {/* Header */}
        <header className="mb-8">
          <div className="flex items-center gap-3 text-xs text-nv-text-secondary mb-3">
            <span className="badge bg-nv-accent-subtle text-nv-accent">{category}</span>
            <span>&bull;</span>
            <span>{readTime}</span>
            <span>&bull;</span>
            <time dateTime={publishDate}>{formattedDate}</time>
          </div>
          <p className="mb-3 text-xs leading-relaxed text-nv-text-muted">
            By{' '}
            <Link href={AUTHOR.bioUrl} className="font-semibold text-nv-accent hover:underline">
              {author || AUTHOR.name}
            </Link>
            {' '}&mdash; {post.authorCredentials || AUTHOR.credentials}. Updated{' '}
            <time dateTime={lastUpdated || publishDate}>{updatedDate}</time>.{' '}
            <Link href="/contact" className="font-semibold text-nv-accent hover:underline">
              Report a correction
            </Link>
            .
          </p>
          <h1 className="font-display text-3xl font-bold tracking-tight text-nv-text sm:text-5xl">
            {title}
          </h1>
          {subtitle && <p className="mt-3 text-lg text-nv-text-secondary font-medium">{subtitle}</p>}
        </header>

        <AdSlot placement="blog-post-top" />

        {/* Introduction */}
        {content?.introduction && (
          <div className="card p-6 sm:p-8 mb-8 bg-nv-subtle/50 text-base leading-relaxed text-nv-text">
            {content.introduction}
          </div>
        )}

        {/* Sections */}
        <div className="space-y-8">
          {content?.sections?.map((section, idx) => (
            <section key={idx} className="card p-6 sm:p-8">
              <h2 className="font-display text-2xl font-bold text-nv-text mb-4">
                {section.title}
              </h2>
              <div className="space-y-4 text-base leading-relaxed text-nv-text-secondary">
                {section.content}
              </div>

              {section.featuredNames && section.featuredNames.length > 0 && (
                <div className="mt-6 pt-4 border-t border-nv-border">
                  <span className="text-xs font-bold uppercase tracking-wider text-nv-text-secondary block mb-2">
                    Featured names in this section:
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {section.featuredNames.map((name) => {
                      const resolved = resolveName(name);
                      return (
                        <Link
                          key={name}
                          href={resolved?.href || `/search?q=${encodeURIComponent(name)}`}
                          className="rounded-full border border-nv-border bg-nv-surface px-3 py-1 text-xs font-semibold text-nv-accent hover:bg-nv-accent-subtle transition"
                        >
                          {name}
                        </Link>
                      );
                    })}
                  </div>
                </div>
              )}
            </section>
          ))}
        </div>

        {/* FAQs if present */}
        {content?.faqs && content.faqs.length > 0 && (
          <section className="mt-12 card p-6 sm:p-8">
            <h2 className="font-display text-2xl font-bold text-nv-text mb-4">
              Frequently Asked Questions
            </h2>
            <div className="space-y-3">
              {content.faqs.map((faq, idx) => (
                <details
                  key={idx}
                  className="group rounded-xl border border-nv-border bg-nv-surface p-4 transition hover:border-nv-accent/40"
                >
                  <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-semibold text-nv-text hover:text-nv-accent">
                    <span>{faq.q}</span>
                    <span className="text-nv-text-muted transition-transform duration-200 group-open:rotate-180">
                      &darr;
                    </span>
                  </summary>
                  <p className="mt-2 text-sm leading-relaxed text-nv-text-secondary">{faq.a}</p>
                </details>
              ))}
            </div>
          </section>
        )}

        {sources.length > 0 && (
          <aside className="mt-10 rounded-2xl border border-nv-border bg-nv-subtle/50 p-6 sm:p-8" aria-labelledby="sources-heading">
            <h2 id="sources-heading" className="font-display text-xl font-bold text-nv-text">
              Sources and editorial note
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-nv-text-secondary">
              This guide combines cultural context with the NameVerse structured name database. Popularity
              figures are signals for discovery, not religious or linguistic evidence; verify a name with
              trusted family and community sources before making a decision.
            </p>
            <ul className="mt-4 space-y-2 text-sm">
              {sources.map((source) => (
                <li key={source.url}>
                  <a href={source.url} target="_blank" rel="noopener noreferrer" className="font-semibold text-nv-accent hover:underline">
                    {source.name}
                  </a>
                  <span className="text-nv-text-muted"> &mdash; {source.note}</span>
                </li>
              ))}
            </ul>
            <p className="mt-4 text-xs text-nv-text-muted">
              Corrections and source questions are welcome via the <Link href="/contact" className="font-semibold text-nv-accent hover:underline">contact page</Link>.
            </p>
          </aside>
        )}

        <div className="mt-12 pt-6 border-t border-nv-border flex justify-between items-center">
          <Link href="/blog" className="btn-ghost text-xs">
            &larr; Back to all guides
          </Link>
          <Link href="/names" className="btn-primary text-xs">
            Explore All Names &rarr;
          </Link>
        </div>
      </div>
    </article>
  );
}
