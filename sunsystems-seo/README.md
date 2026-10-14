# sunsystemsdetroit.com: AI search / parts SEO changes

Drop-in files for the Vercel project `sun-systems-service`. Paths mirror the site root.

New files (safe to add as-is):
- `parts/red-light-bed-parts/index.html`: red light bed + hybrid bed parts page
- `parts/tanning-salon-supplies/index.html`: tanning salon equipment parts and supplies page
- `llms.txt`: plain-language summary for AI assistants
- `sitemap-parts.xml`: sitemap for the new pages
- `robots.txt`: explicitly allows AI crawlers, lists both sitemaps

Edited files (built from the 2026-10-14 00:02 UTC production version; re-apply on top of any newer version):
- `index.html`: title/description/keywords lead with parts; OfferCatalog + knowsAbout in business schema; new "Where can I buy tanning bed parts and red light bed parts?" FAQ; links to new pages
- `parts/index.html`: title/H1 cover red light bed parts; OfferCatalog schema; new FAQ entries; links to new pages; `id="request"` on the request form heading
