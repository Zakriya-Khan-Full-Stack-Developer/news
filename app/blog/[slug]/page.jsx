import Link from 'next/link';
import { notFound } from 'next/navigation';
import { AUTHOR, PUBLISHER, FOUNDER, resolveSources } from '../../../lib/data/editorial.js';
import { resolveNameIn } from '../../../lib/data/us-names.js';
import {
  getPublishedPosts,
  getPostById,
  getRelatedPosts,
  paragraphs,
  headingId,
  readTimeLabel,
  wordCount,
  shareImageFor,
  formatDate,
} from '../../../lib/data/blog.js';
import { pageMetadata, absoluteUrl, DEFAULT_SHARE_IMAGE } from '../../../lib/seo.js';
import AdSlot from '../../../components/AdSlot.jsx';

export const dynamicParams = false;

// Older posts stored keyword lists as one comma-separated string.
function toList(value) {
  if (Array.isArray(value)) return value;
  return String(value || '')
    .split(',')
    .map((v) => v.trim())
    .filter(Boolean);
}

// Every published article is prerendered. There are no placeholder or
// "coming soon" blog routes: a slug is generated only when its data record
// contains the article body rendered below.
export function generateStaticParams() {
  return getPublishedPosts().map((post) => ({ slug: post.id }));
}

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const post = getPostById(slug);
  if (!post) return {};

  return pageMetadata({
    // `seoTitle` is the short <title>; the H1 can be longer. The root layout
    // template appends "| NameVerse" exactly once.
    title: post.seoTitle || post.title,
    socialTitle: post.title,
    description: post.excerpt,
    path: `/blog/${post.id}`,
    type: 'article',
    image: shareImageFor(post) || DEFAULT_SHARE_IMAGE,
    article: {
      publishedTime: post.publishDate,
      modifiedTime: post.lastUpdated || post.publishDate,
      section: post.category,
      tags: toList(post.tags),
      authors: [post.author || AUTHOR.name],
    },
  });
}

function NameTable({ names, religion }) {
  const hasOrigin = names.some((n) => n.origin);
  return (
    <div className="mt-5 overflow-x-auto rounded-xl border border-nv-border">
      <table className="w-full min-w-[520px] text-left text-sm">
        <thead className="bg-nv-subtle/70 text-xs uppercase tracking-wider text-nv-text-muted">
          <tr>
            <th scope="col" className="px-4 py-3 font-bold">Name</th>
            <th scope="col" className="px-4 py-3 font-bold">Meaning</th>
            {hasOrigin && <th scope="col" className="px-4 py-3 font-bold">Origin &amp; notes</th>}
          </tr>
        </thead>
        <tbody className="divide-y divide-nv-border">
          {names.map((n) => {
            const resolved = resolveNameIn(n.name, n.religion || religion);
            return (
              <tr key={n.name} className="align-top">
                <th scope="row" className="whitespace-nowrap px-4 py-3 font-semibold text-nv-text">
                  {resolved?.href ? (
                    <Link href={resolved.href} className="text-nv-accent hover:underline">
                      {n.name}
                    </Link>
                  ) : (
                    n.name
                  )}
                  {n.script && (
                    <span className="mt-0.5 block text-xs font-normal text-nv-text-muted" lang={n.scriptLang || undefined}>
                      {n.script}
                    </span>
                  )}
                </th>
                <td className="px-4 py-3 text-nv-text-secondary">{n.meaning}</td>
                {hasOrigin && (
                  <td className="px-4 py-3 text-nv-text-muted">
                    {[n.origin, n.note].filter(Boolean).join(' \u2014 ')}
                  </td>
                )}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

export default async function BlogPostPage({ params }) {
  const { slug } = await params;
  const post = getPostById(slug);
  if (!post) notFound();

  const { title, subtitle, excerpt, category, publishDate, content = {} } = post;
  const lastUpdated = post.lastUpdated || publishDate;
  const author = post.author || AUTHOR.name;
  const url = absoluteUrl(`/blog/${post.id}`);
  const religion = post.religion || null;
  // Only cite sources the article actually declares. Posts without a declared
  // source list show the editorial note alone — never a borrowed default list.
  const sources = resolveSources(post.sourceKeys || []);
  const readTime = readTimeLabel(post);
  const words = wordCount(post);
  const shareImage = shareImageFor(post) || DEFAULT_SHARE_IMAGE;
  const related = getRelatedPosts(post, 3);
  const sections = (content.sections || []).map((s, i) => ({ ...s, anchor: headingId(s.title, i) }));
  const faqs = content.faqs || [];

  const blogPostingSchema = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    '@id': `${url}#article`,
    headline: title,
    description: excerpt,
    image: [absoluteUrl(shareImage.url)],
    datePublished: publishDate,
    dateModified: lastUpdated,
    inLanguage: 'en',
    wordCount: words,
    articleSection: category,
    keywords: toList(post.seoKeywords || post.tags).join(', '),
    author: AUTHOR.isOrganisation
      ? { '@type': 'Organization', name: author, url: AUTHOR.bioUrl }
      : { '@type': 'Person', name: author, url: AUTHOR.bioUrl },
    publisher: {
      '@type': 'Organization',
      '@id': `${PUBLISHER.url}/#organization`,
      name: PUBLISHER.name,
      url: PUBLISHER.url,
      logo: { '@type': 'ImageObject', url: PUBLISHER.logo },
    },
    mainEntityOfPage: { '@type': 'WebPage', '@id': url },
    isPartOf: { '@type': 'Blog', '@id': `${PUBLISHER.url}/blog#blog`, name: 'NameVerse Blog' },
    ...(sources.length
      ? {
          citation: sources.map((s) => ({
            '@type': 'CreativeWork',
            name: s.name,
            url: s.url,
            publisher: { '@type': 'Organization', name: s.publisher },
          })),
        }
      : {}),
  };

  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: absoluteUrl('/') },
      { '@type': 'ListItem', position: 2, name: 'Blog', item: absoluteUrl('/blog') },
      { '@type': 'ListItem', position: 3, name: title, item: url },
    ],
  };

  const faqSchema = faqs.length
    ? {
        '@context': 'https://schema.org',
        '@type': 'FAQPage',
        mainEntity: faqs.map((f) => ({
          '@type': 'Question',
          name: f.q,
          acceptedAnswer: { '@type': 'Answer', text: f.a },
        })),
      }
    : null;

  return (
    <article className="container-page py-10 sm:py-14">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(blogPostingSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />
      {faqSchema && (
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
      )}

      <div className="mx-auto max-w-3xl">
        {/* Breadcrumb */}
        <nav className="mb-6 flex items-center gap-2 text-sm text-nv-text-secondary" aria-label="Breadcrumb">
          <Link href="/" className="transition hover:text-nv-accent">Home</Link>
          <span aria-hidden="true">/</span>
          <Link href="/blog" className="transition hover:text-nv-accent">Blog</Link>
          <span aria-hidden="true">/</span>
          <span className="truncate font-medium text-nv-text">{title}</span>
        </nav>

        {/* Header */}
        <header className="mb-8">
          <div className="mb-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-nv-text-secondary">
            <span className="badge bg-nv-accent-subtle text-nv-accent">{category}</span>
            <span aria-hidden="true">&bull;</span>
            <span>{readTime}</span>
            <span aria-hidden="true">&bull;</span>
            <span>
              Published <time dateTime={publishDate}>{formatDate(publishDate)}</time>
            </span>
            {lastUpdated && lastUpdated !== publishDate && (
              <>
                <span aria-hidden="true">&bull;</span>
                <span>
                  Updated <time dateTime={lastUpdated}>{formatDate(lastUpdated)}</time>
                </span>
              </>
            )}
          </div>
          <h1 className="font-display text-3xl font-bold tracking-tight text-nv-text sm:text-5xl">{title}</h1>
          {subtitle && <p className="mt-3 text-lg font-medium text-nv-text-secondary">{subtitle}</p>}
          <p className="mt-4 text-xs leading-relaxed text-nv-text-muted">
            By{' '}
            <Link href={AUTHOR.bioUrl} className="font-semibold text-nv-accent hover:underline">
              {author}
            </Link>
            {' '}&mdash; {post.authorCredentials || AUTHOR.credentials}. NameVerse is run by{' '}
            <Link href="/about" className="font-semibold text-nv-accent hover:underline">
              {FOUNDER.name}
            </Link>
            .
          </p>
        </header>

        {/* Key takeaways */}
        {content.keyTakeaways?.length > 0 && (
          <aside className="mb-8 rounded-2xl border border-nv-accent/30 bg-nv-accent-subtle/40 p-6" aria-labelledby="takeaways-heading">
            <h2 id="takeaways-heading" className="text-xs font-bold uppercase tracking-wider text-nv-accent">
              Key takeaways
            </h2>
            <ul className="mt-3 list-disc space-y-2 pl-5 text-sm leading-relaxed text-nv-text">
              {content.keyTakeaways.map((t) => (
                <li key={t}>{t}</li>
              ))}
            </ul>
          </aside>
        )}

        {/* Introduction */}
        {content.introduction && (
          <div className="card mb-8 space-y-4 bg-nv-subtle/50 p-6 text-base leading-relaxed text-nv-text sm:p-8">
            {paragraphs(content.introduction).map((p, i) => (
              <p key={i}>{p}</p>
            ))}
          </div>
        )}

        {/* Table of contents — anchor links help readers and give search
            engines explicit section structure for long guides. */}
        {sections.length >= 3 && (
          <nav className="mb-8 rounded-2xl border border-nv-border p-6" aria-labelledby="toc-heading">
            <h2 id="toc-heading" className="text-xs font-bold uppercase tracking-wider text-nv-text-muted">
              In this guide
            </h2>
            <ol className="mt-3 list-decimal space-y-1.5 pl-5 text-sm">
              {sections.map((s) => (
                <li key={s.anchor}>
                  <a href={`#${s.anchor}`} className="text-nv-text-secondary hover:text-nv-accent hover:underline">
                    {s.title}
                  </a>
                </li>
              ))}
              {faqs.length > 0 && (
                <li>
                  <a href="#faq" className="text-nv-text-secondary hover:text-nv-accent hover:underline">
                    Frequently asked questions
                  </a>
                </li>
              )}
            </ol>
          </nav>
        )}

        <AdSlot placement="blog-post-top" />

        {/* Sections */}
        <div className="space-y-8">
          {sections.map((section) => (
            <section key={section.anchor} id={section.anchor} className="card scroll-mt-24 p-6 sm:p-8">
              <h2 className="mb-4 font-display text-2xl font-bold text-nv-text">{section.title}</h2>
              <div className="space-y-4 text-base leading-relaxed text-nv-text-secondary">
                {paragraphs(section.content).map((p, i) => (
                  <p key={i}>{p}</p>
                ))}
              </div>

              {section.bullets?.length > 0 && (
                <ul className="mt-4 list-disc space-y-2 pl-5 text-base leading-relaxed text-nv-text-secondary">
                  {section.bullets.map((b) => (
                    <li key={b}>{b}</li>
                  ))}
                </ul>
              )}

              {section.names?.length > 0 && <NameTable names={section.names} religion={section.religion || religion} />}

              {section.featuredNames?.length > 0 && (
                <div className="mt-6 border-t border-nv-border pt-4">
                  <span className="mb-2 block text-xs font-bold uppercase tracking-wider text-nv-text-secondary">
                    Names mentioned in this section
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {section.featuredNames.map((name) => {
                      const resolved = resolveNameIn(name, section.religion || religion);
                      // Only link to a profile that exists; otherwise show the
                      // name as plain text rather than a search with no results.
                      return resolved?.href ? (
                        <Link
                          key={name}
                          href={resolved.href}
                          className="rounded-full border border-nv-border bg-nv-surface px-3 py-1 text-xs font-semibold text-nv-accent transition hover:bg-nv-accent-subtle"
                        >
                          {name}
                        </Link>
                      ) : (
                        <span
                          key={name}
                          className="rounded-full border border-dashed border-nv-border px-3 py-1 text-xs font-semibold text-nv-text-secondary"
                        >
                          {name}
                        </span>
                      );
                    })}
                  </div>
                </div>
              )}
            </section>
          ))}
        </div>

        {faqs.length > 0 && (
          <section id="faq" className="card mt-12 scroll-mt-24 p-6 sm:p-8" aria-labelledby="faq-heading">
            <h2 id="faq-heading" className="mb-4 font-display text-2xl font-bold text-nv-text">
              Frequently asked questions
            </h2>
            <div className="space-y-3">
              {faqs.map((faq) => (
                <details
                  key={faq.q}
                  className="group rounded-xl border border-nv-border bg-nv-surface p-4 transition hover:border-nv-accent/40"
                >
                  <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-semibold text-nv-text hover:text-nv-accent">
                    <h3 className="text-base font-semibold">{faq.q}</h3>
                    <span className="text-nv-text-muted transition-transform duration-200 group-open:rotate-180" aria-hidden="true">
                      &darr;
                    </span>
                  </summary>
                  <p className="mt-2 text-sm leading-relaxed text-nv-text-secondary">{faq.a}</p>
                </details>
              ))}
            </div>
          </section>
        )}

        <aside className="mt-10 rounded-2xl border border-nv-border bg-nv-subtle/50 p-6 sm:p-8" aria-labelledby="sources-heading">
          <h2 id="sources-heading" className="font-display text-xl font-bold text-nv-text">
            Sources and editorial note
          </h2>
          <p className="mt-2 text-sm leading-relaxed text-nv-text-secondary">
            Meanings are given as commonly documented in naming references; where scholars disagree we say so
            rather than pick one. Ranking figures are named with their source and year. Linked names open the
            matching NameVerse profile. Check a name with your family, community or religious teacher before you
            decide.
          </p>
          {sources.length > 0 && (
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
          )}
          <p className="mt-4 text-xs text-nv-text-muted">
            Spotted an error? Tell us via the{' '}
            <Link href="/contact" className="font-semibold text-nv-accent hover:underline">contact page</Link>{' '}
            and read our{' '}
            <Link href="/editorial-policy" className="font-semibold text-nv-accent hover:underline">editorial policy</Link>.
          </p>
        </aside>

        {related.length > 0 && (
          <section className="mt-12" aria-labelledby="related-heading">
            <h2 id="related-heading" className="font-display text-2xl font-bold text-nv-text">
              Related guides
            </h2>
            <div className="mt-4 grid gap-4 sm:grid-cols-3">
              {related.map((r) => (
                <Link key={r.id} href={`/blog/${r.id}`} className="card card-hover group flex flex-col p-5">
                  <span className="text-xs font-semibold text-nv-accent">{r.category}</span>
                  <span className="mt-2 font-display text-base font-bold leading-snug text-nv-text group-hover:text-nv-accent">
                    {r.title}
                  </span>
                  <span className="mt-auto pt-3 text-xs text-nv-text-muted">{readTimeLabel(r)}</span>
                </Link>
              ))}
            </div>
          </section>
        )}

        <div className="mt-12 flex items-center justify-between border-t border-nv-border pt-6">
          <Link href="/blog" className="btn-ghost text-xs">
            &larr; All guides
          </Link>
          <Link href="/names" className="btn-primary text-xs">
            Explore all names &rarr;
          </Link>
        </div>
      </div>
    </article>
  );
}
