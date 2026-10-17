// Alias of /sitemap.xml for search-console submissions that used the old URL.
// A re-exported handler is not statically analysable, so without
// `force-static` this route was built as a server function (ƒ) and every
// request to it would invoke one — contrary to the zero-functions design.
export const dynamic = 'force-static';
export { GET } from '../sitemap.xml/route.js';
