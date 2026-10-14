import http from 'node:http';

const BASE = 'http://localhost:3000';

function fetchPage(path, options = {}) {
  return new Promise((resolve, reject) => {
    const url = new URL(path, BASE);
    const req = http.request(
      url,
      {
        method: options.method || 'GET',
        headers: options.headers || {},
      },
      (res) => {
        let body = '';
        res.on('data', (chunk) => {
          body += chunk;
        });
        res.on('end', () => {
          resolve({
            status: res.statusCode,
            headers: res.headers,
            body,
          });
        });
      }
    );
    req.on('error', reject);
    req.end();
  });
}

async function runTests() {
  console.log('=== RUNNING GOOGLE CRAWLABILITY & SEO AUDIT ===\n');
  let passed = 0;
  let failed = 0;

  function readable(body) {
    return String(body || '')
      .replace(/<!--\s*-->\s*/g, ' ')
      .replace(/\s+/g, ' ')
      .replace(/&amp;/g, '&')
      .replace(/&quot;/g, '"')
      .replace(/&#x27;|&#39;/g, "'");
  }

  function assert(condition, testName, details = '') {
    if (condition) {
      console.log(`[PASS] ${testName}`);
      passed++;
    } else {
      console.error(`[FAIL] ${testName} - ${details}`);
      failed++;
    }
  }

  try {
    // 1. Homepage
    const home = await fetchPage('/');
    assert(home.status === 200, '1. Homepage HTTP 200', `Got ${home.status}`);
    assert(home.body.includes('<h1'), '1. Homepage has H1 in raw HTML');
    assert(home.body.includes('rel="canonical" href="https://nameverse.site"'), '1. Homepage has correct canonical (no trailing slash)');
    assert(home.body.includes('name="robots" content="index, follow'), '1. Homepage has index, follow robots directive');
    assert(home.body.includes('"@type":"WebSite"'), '1. Homepage contains WebSite JSON-LD');
    assert(home.body.includes('"@type":"FAQPage"'), '1. Homepage contains FAQPage JSON-LD');

    // 2. Religion page
    const rel = await fetchPage('/names/islamic');
    assert(rel.status === 200, '2. Religion page (/names/islamic) HTTP 200', `Got ${rel.status}`);
    assert(rel.body.includes('rel="canonical" href="https://nameverse.site/names/islamic"'), '2. Religion canonical matches exact URL');
    assert(readable(rel.body).includes('Islamic Baby Names with Meanings'), '2. Religion H1 present in HTML');
    assert(rel.body.includes('"@type":"CollectionPage"'), '2. Religion CollectionPage schema present');

    // 3. Category page
    const cat = await fetchPage('/categories/biblical');
    assert(cat.status === 200, '3. Category page (/categories/biblical) HTTP 200', `Got ${cat.status}`);
    assert(cat.body.includes('rel="canonical" href="https://nameverse.site/categories/biblical"'), '3. Category canonical matches exact URL');
    assert(readable(cat.body).includes('Biblical Baby Names with Meanings'), '3. Category H1 present in HTML');

    // 4. Letter page
    const letter = await fetchPage('/names/islamic/letter/a');
    assert(letter.status === 200, '4. Letter page (/names/islamic/letter/a) HTTP 200', `Got ${letter.status}`);
    assert(letter.body.includes('rel="canonical" href="https://nameverse.site/names/islamic/letter/a"'), '4. Letter canonical matches exact URL');

    // 5. Name page (a prerendered canonical profile)
    const name = await fetchPage('/names/islamic/aaban');
    assert(name.status === 200, '5. Name page (/names/islamic/aaban) HTTP 200', `Got ${name.status}`);
    assert(name.body.includes('<h1'), '5. Name page has H1 in raw HTML');
    assert(readable(name.body).includes('Aaban'), '5. Name page contains name in raw HTML');
    assert(name.body.includes('rel="canonical" href="https://nameverse.site/names/islamic/aaban"'), '5. Name page canonical is exact and self-referencing');
    assert(name.body.includes('"@type":"BreadcrumbList"'), '5. Name page BreadcrumbList schema present');
    assert(name.body.includes('"@type":"WebPage"'), '5. Name page WebPage schema present');
    assert(!name.body.includes('"@type":"Person"'), '5. Name page has NO deceptive Person schema');

    // 6. Blog page
    const blog = await fetchPage('/blog/jewish-baby-names-torah');
    assert(blog.status === 200, '6. Blog post HTTP 200', `Got ${blog.status}`);
    assert(blog.body.includes('rel="canonical" href="https://nameverse.site/blog/jewish-baby-names-torah"'), '6. Blog canonical matches exact URL');
    assert(blog.body.includes('"@type":"BlogPosting"'), '6. Blog BlogPosting schema present');

    // 7. Invalid name -> Real 404 (NOT 200, NOT redirect to /)
    const invalidName = await fetchPage('/names/islamic/invalid-nonexistent-name-xyz-999');
    assert(invalidName.status === 404, '7. Invalid name returns HTTP 404', `Got ${invalidName.status}`);
    assert(invalidName.body.includes('Page Not Found'), '7. Invalid name returns custom 404 page');

    // 8. Old URL -> 301/308 redirect
    const oldUrl = await fetchPage('/homepage');
    assert(oldUrl.status === 308 || oldUrl.status === 301, '8. Old URL (/homepage) redirects', `Got ${oldUrl.status}`);
    assert(oldUrl.headers.location === '/', '8. Old URL redirects directly to / without chains', `Location: ${oldUrl.headers.location}`);

    // 9. URL with trailing slash -> redirects to without trailing slash
    const trailingSlash = await fetchPage('/names/islamic/');
    assert(trailingSlash.status === 308 || trailingSlash.status === 301, '9. Trailing slash URL redirects', `Got ${trailingSlash.status}`);
    assert(trailingSlash.headers.location === '/names/islamic', '9. Trailing slash normalizes to non-slash canonical URL', `Location: ${trailingSlash.headers.location}`);

    // 10. URL without trailing slash -> returns 200 directly
    const noSlash = await fetchPage('/names/islamic');
    assert(noSlash.status === 200, '10. Non-slash canonical URL returns HTTP 200 directly');

    // 11. Robots.txt
    const robots = await fetchPage('/robots.txt');
    assert(robots.status === 200, '11. /robots.txt HTTP 200', `Got ${robots.status}`);
    assert(robots.body.includes('Allow: /'), '11. robots.txt allows /');
    assert(robots.body.includes('https://nameverse.site/sitemap.xml'), '11. robots.txt references correct sitemap');

    // 12. Sitemap Index
    const sitemap = await fetchPage('/sitemap.xml');
    assert(sitemap.status === 200, '12. /sitemap.xml HTTP 200', `Got ${sitemap.status}`);
    assert(sitemap.body.includes('<sitemapindex'), '12. sitemap.xml is valid sitemapindex');
    assert(sitemap.body.includes('https://nameverse.site/sitemap/pages.xml'), '12. sitemap index includes pages.xml');
    assert(sitemap.body.includes('https://nameverse.site/sitemap/islamic.xml'), '12. sitemap index includes islamic.xml');

    // 13. Sub-sitemap pages.xml
    const pagesSitemap = await fetchPage('/sitemap/pages.xml');
    assert(pagesSitemap.status === 200, '13. /sitemap/pages.xml HTTP 200', `Got ${pagesSitemap.status}`);
    assert(pagesSitemap.body.includes('<urlset'), '13. pages.xml is valid urlset');
    assert(pagesSitemap.body.includes('<loc>https://nameverse.site/names/islamic</loc>'), '13. pages.xml contains canonical URLs without trailing slashes');
    assert(!pagesSitemap.body.includes('/search<'), '13. pages.xml excludes disallowed /search');

    // 14. Sub-sitemap islamic.xml
    const islamicSitemap = await fetchPage('/sitemap/islamic.xml');
    assert(islamicSitemap.status === 200, '14. /sitemap/islamic.xml HTTP 200', `Got ${islamicSitemap.status}`);
    assert(islamicSitemap.body.includes('<loc>https://nameverse.site/names/islamic/'), '14. islamic.xml contains name URLs');

    // 15. Gender hub
    const girlHub = await fetchPage('/christian-girl-names');
    assert(girlHub.status === 200, '15. Gender hub (/christian-girl-names) HTTP 200', `Got ${girlHub.status}`);
    assert(readable(girlHub.body).includes('Girl Christian Names & Meanings'), '15. Gender hub renders girl names H1');
    assert(!girlHub.body.includes('0 girl names'), '15. Girl names filter bug is FIXED (shows non-zero count)');

    console.log(`\n=== AUDIT SUMMARY: ${passed} PASSED, ${failed} FAILED ===`);
    if (failed === 0) {
      console.log('ALL GOOGLE CRAWLABILITY AND INDEXING CHECKS PASSED PERFECTLY!\n');
    }
  } catch (err) {
    console.error('Audit failed with error:', err);
  }
}

runTests();
