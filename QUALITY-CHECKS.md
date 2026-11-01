# Phase 0 verification - 2026-10-08

## Completed

- `npm run build`: seven content pages, 404, assets, sitemap and robots.
- `npm run lint`: JavaScript syntax and generated HTML validation passed.
- `npm run check`: unique titles/descriptions, canonical URLs, OpenGraph,
  Article/WebSite JSON-LD, sitemap coverage and 182 internal references passed.
- `node scripts/check.mjs --external`: eight unique primary-source URLs returned
  successful responses. Versioned article citations were checked against v3.0.0.
- Playwright: all seven pages at widths 320, 390, 768, 1440 and 1920 passed
  HTTP status, horizontal overflow, image loading, mobile navigation, article
  anchors and keyboard skip-link checks. No browser console errors.
- Desktop/mobile screenshots inspected. Tables deliberately scroll within their
  own region on narrow screens; message topic names stay unbroken.
- Nginx configuration test and reload passed. Existing unrelated minen.com.tr
  duplicate-vhost warnings predate this task and were not changed.
- HTTPS www path redirect308, missing-page404, sitemap200 and robots200 verified.
- External article HTTPS200 from Zurich and Viana:
  https://check-host.net/check-report/4fa730c1k760

## Mobile Lighthouse, final HTTPS release

| Page | Performance | Accessibility | Best practices | SEO | LCP | CLS | TBT |
| --- | --- | --- | --- | --- | --- | --- | --- |
| Home | 100 | 100 | 100 | 100 | 0.8 s | 0 | 0 ms |
| VDA 5050 guide | 100 | 100 | 100 | 100 | 0.8 s | 0 | 0 ms |

Reports: artifacts/lighthouse-live-home.json and lighthouse-live-article.json.
These are Lighthouse 12.8.2 mobile lab runs, accessing the production Nginx/TLS
configuration with local DNS resolution to loopback. They are not measurements
of geographic latency, field Core Web Vitals or real-user INP. The separate
external checks establish accessibility from two public network locations.

The first live audit could not fetch robots.txt because the strict CSP blocked
same-origin network requests through DevTools. The final CSP allows self only
for connections; no external script or tracking permission was added. Both final
audits succeeded without bypassing CSP or changing the Lighthouse checks.

## Explicit limits

No independent robotics expert, standards body or accessibility specialist has
approved this content. Automated accessibility checks are not a full manual
screen-reader audit. Structured data was parsed and checked locally; Google's
indexing and rich-result eligibility have not been verified. There is no claim
of physical robot tests, standards conformance or commercial deployment.

Review map: CONTENT-REVIEW.md. Proposed next work: PHASE-1-ROADMAP.md.
