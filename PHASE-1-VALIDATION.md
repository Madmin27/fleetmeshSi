# Phase 1 implementation and evidence

Date: 2026-10-08. The existing Phase 0 quality report is historical evidence.

## Delivered scope

- /standards/massrobotics/: identity/status, actual field names, coordinate and
  intention boundaries, WebSocket transport, pinned primary source links.
- /standards/vda-5050-vs-massrobotics/: eight requested responsibility axes,
  no superiority ranking or automatic compatibility claims.
- /tools/message-explorer/: CodeMirror JSON editor, eight authored examples,
  explicit validation, full JSON Pointer errors with editor navigation, local
  file open, formatting, undo/redo, clipboard and local download.
- Always-rendered yellow schema-versus-compliance warning and visible PDF priority.

## Source chain

VDA version: 3.0.0. Official main snapshot:
`0b2ae43154bcd1ab2be4e2445df8b406dcad77b2`.
The original 3.0.0 tag (`e9ba560b0e2d3f66526550ad5d61b8a2ad936172`)
contains malformed JSON in factsheet, order and visualization schema files.
We did not repair upstream files locally or claim the main snapshot is the tag.
All eight vendored schemas declare Draft 2020-12. README, license and schema
SHA-256 values are checked on every build against src/vendor/vda-5050/manifest.json.
The snapshot and manifest are downloadable under /schemas/vda-5050/<commit>/.
The official VDA PDF remains normative in a conflict with repository material.

MassRobotics: PDF v1.0, repository snapshot
`f9357a423ecabc3f7112e6d10025a5231943ec50`. The schema declares no dialect.
UUID case discrepancies in published examples are called out, not silently fixed.
No MassRobotics validator or protocol bridge is included.

## Validation architecture

Ajv2020 8.20.0 plus ajv-formats 3.0.1 compiles standalone ESM during build.
The uint32 annotation in the responses schema is checked as an unsigned 32-bit
integer. Descriptive upstream keywords are tolerated with strict:false; schemas
still undergo dialect validation. No coercion, default insertion or property
removal. All examples are original FleetMesh structural examples, not captured
robot messages or evidence of correct protocol sessions.

Validation runs in a dedicated browser worker. No schema fetches, CDN assets,
analytics, local/session storage, backend endpoint, runtime eval or payload logs.
Document and worker CSP block connect requests. CodeMirror requires injected
styles; only the Explorer allows inline styles, never inline scripts or eval.
Worker timeout: 3 seconds. Input: 256 KiB; nesting guard: 100 parser-tree levels.
Duplicate keys and unsafe numeric representations fail before schema checking.
Version mismatch is a tool-scope result, not a claimed schema constraint.
Only the first 100 errors are rendered; total schema-error count is retained.
Dependency license texts are shipped in /THIRD-PARTY-NOTICES.txt.

## Completed local checks

- npm run build: 10 pages, eight precompiled validators and verified source hashes.
- npm run lint: HTML and script checks passed.
- npm run check: 10 pages, 302 internal references/fragments, sitemap and metadata.
- External link check: all 20 distinct source URLs returned success.
- npm test: 17 tests passed. Includes all examples, nested error paths and exact
  offsets, required fields, date-time/enum/uint32, no coercion, JSON syntax,
  duplicate keys, unsupported versions, size/depth/numeric guards, source hashes.
- Draft 2020-12 fixtures explicitly exercise prefixItems and unevaluatedProperties.
- scripts/visual-check.mjs: all 10 pages at 320, 390, 768, 1440, 1920 pixels;
  no page overflow, missing images or console errors, navigation and skip links pass.
- scripts/explorer-browser.mjs: eight examples, nested errors, stale-result reset,
  syntax failures, replacement/cancel, format/undo/redo, clipboard, local download,
  local file read, empty storage and zero network requests after asset loading.
  Validation also passed at 320 and 390 pixels. Desktop/mobile screenshots inspected.

Evidence is in artifacts/. Run browser tests against a localhost preview, or set
TEST_BASE=https://fleetmesh.si TEST_HOST=fleetmesh.si for the live local Nginx route.
The latter validates the production vhost but is not an independent external probe.

## Production checks

Published to /home/fleetmesh/releases/20261008-phase1-r2 through the atomic
/home/fleetmesh/public symlink. Previous source and vhost are backed up under
/home/fleetmesh/backups/20261008-phase1. DNS and certificate renewal were unchanged.
nginx -t and reload passed; pre-existing unrelated minen duplicate-host warnings
remain unchanged. www redirects preserve the Explorer path (HTTP 308).

Both browser suites passed against the live HTTPS vhost: 50 page/viewport cases,
all Explorer workflows, zero payload-workflow network requests and zero console
errors. Final mobile screenshots include successful validation at 320/390 pixels.
External Explorer HTTP checks returned 200 from Hungary and Sweden; the Miami
node timed out. This is not a claim of universal geographic availability.
Independent report: https://check-host.net/check-report/4fa8f8d4k836

Lighthouse mobile lab, final release, performance/accessibility/best-practices/SEO:

| Page | Scores | LCP | CLS | TBT |
| --- | --- | --- | --- | --- |
| Home | 100 / 100 / 100 / 100 | 0.9 s | 0 | 10 ms |
| MassRobotics | 100 / 100 / 100 / 100 | 0.8 s | 0 | 0 ms |
| Explorer | 99 / 100 / 100 / 92 | 1.7 s | 0 | 0 ms |

Explorer SEO loses the robots.txt audit because Lighthouse cannot fetch the file
from this document's connect-src:none context. The actual robots.txt is publicly
served (independently checked locally over HTTPS) and declares Allow:/ plus the
sitemap. We did not weaken the payload-network policy to raise this lab score.
These are local lab measurements through the production vhost, not field metrics.

## Limits and follow-up

No domain-expert approval, protocol conformance, safety certification, physical
robot integration, real-user CWV or search-indexing claim is made.
Validation covers individual messages, not ordering, timing, state transitions,
capability agreement, session semantics or implementations.
The existing Lighthouse development-tool chain reports 27 npm advisories
(19 moderate, 8 high). They are in its Sentry/OpenTelemetry/Puppeteer dependency
tree, not the bundled editor/validator. Development dependencies and Node are not
served in production. Toolchain remediation remains separate maintenance work;
no claim of a clean full npm audit is made.
