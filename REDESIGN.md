# FleetMesh visual system - 2026-10-11

## Scope

Presentation-only redesign of all ten existing routes. No changes to the authored
technical pages, Explorer schema/version scope, examples, validator engine, parser
or official vendored schemas. Source-review dates remain 2026-10-08 intentionally.
Canonical URLs, titles, descriptions, Article/WebSite structured data, robots and
existing links remain intact. No DNS, certificate or unrelated service changes.

## Visual system

- src/design/tokens.css: graphite surfaces, off-white text, signal green, telemetry
  cyan, amber warnings, spacing, border, radius and two font-family tokens.
- src/design/system.css: editorial layout, asymmetric contiguous bento, tables,
  navigation and responsive SVG architecture language.
- src/design/console.css: three-column console, dark JSON editor, schema sidebar,
  validation/source column, mobile tabs and non-dismissible bottom scope notice.
- src/design/diagrams.mjs: SystemNode, ProtocolEdge, StatusBadge, DataFlow and
  ArchitectureCanvas. Shared by homepage topology and existing architecture figures.
- src/design/presentation.mjs: build-time DOM presentation transforms; authored
  claims and source links stay in src/pages.mjs and src/phase1-pages.mjs.

Geist and IBM Plex Mono are self-hosted WOFF2 assets (about 44 KiB combined), with
OFL licenses in src/assets/fonts/. No Google Fonts or CDN requests occur at runtime.
Font files were retrieved from Fontsource distributions; they are fixed local
assets, not dynamically resolved dependencies. Preloading avoids late font swaps.
Legacy src/style.css and src/explorer/style.css are not bundled by the new build.

## Motion and scope

Homepage packet movement uses SVG paths and CSS stroke-dashoffset, not WebGL or
JavaScript. A native Motion checkbox pauses it; prefers-reduced-motion disables
it. Nodes have keyboard focus and hover states. The topology is explicitly labeled
ILLUSTRATIVE / NOT LIVE. Drone and Autonomous Vehicle sit in a separate research
group with no implied shared protocol support. There are no customer/fleet metrics.

## Console behavior

Desktop: messages/schemas left, JSON center, validation/provenance right.
Mobile/tablet: Messages, JSON, Validation tabs with arrow/Home/End keyboard control.
Validation opens the result tab; clicking an error returns to its JSON location.
Selecting a schema retains JSON and invalidates the previous result, as before.
File operations, confirmation, formatting, history, clipboard and downloads remain.
The original full warning and source-chain wording are preserved. The requested
short compliance notice is always rendered below the console, without covering
editor content. No-JavaScript styles expose the source information and example.

Nginx only adds font-src 'self' to FleetMesh's existing policies. The Explorer and
worker retain connect-src 'none'; no unsafe-eval, analytics or upload endpoint.

## Verification

- Build and HTML lint pass. DOM serialization uses valid empty-value boolean
  attributes; lint checks that convention explicitly.
- 28 tests pass: existing 17 validator tests plus 11 presentation/content tests.
  The latter preserve every authored heading, paragraph, list item, table cell,
  caption, source link, title, description and path.
- 10 pages at five widths (320,390,768,1440,1920): no page overflow or console
  errors; navigation, images and keyboard skip links pass.
- 24 additional layout cases at six widths; mobile tab/keyboard/error navigation,
  animated packet movement, Motion pause and reduced-motion checks pass.
- Existing eight-example Explorer browser suite passes, including zero network
  requests during payload workflows and no local/session storage.
- Pre-publication compressed-preview Lighthouse mobile: homepage and MassRobotics
  100/100/100/100; Explorer 99/100/100/92. All report CLS 0 and TBT 0 ms.
  Explorer's robots fetch is blocked by its intentional connect-src:none policy,
  as in the previous version. No privacy weakening to inflate the score.

Screenshots and JSON reports are in artifacts/. Laboratory measurements are not
field CWV or expert/protocol/safety approval. The previously recorded Lighthouse
development dependency advisories remain; dependencies are not publicly served.

## Release

### Final production evidence

All browser suites passed again against the actual HTTPS Nginx vhost: 50
page/viewport cases, 24 design cases, mobile keyboard tabs, packet/pause/reduced
motion and eight Explorer examples. Payload workflows produced zero requests.
Final screenshots were inspected at desktop and mobile sizes.

Final mobile Lighthouse (performance / accessibility / best practices / SEO):

| Page | Scores | LCP | CLS | TBT |
| --- | --- | --- | --- | --- |
| Home | 100 / 100 / 100 / 100 | 1.2 s | 0 | 0 ms |
| MassRobotics guide | 100 / 100 / 100 / 100 | 1.2 s | 0 | 0 ms |
| Message Explorer | 99 / 100 / 100 / 92 | 2.0 s | 0 | 0 ms |

The Explorer SEO limitation is unchanged from Phase 1 (CSP-blocked Lighthouse
robots fetch). No network policy was relaxed except allowing self-hosted fonts.
External HTTPS returned 200 from Spain, Japan and the Netherlands:
https://check-host.net/check-report/504548b9kd2c
Nginx test/reload succeeded; unrelated existing duplicate-host warnings remain.

### Paths and rollback

Release: /home/fleetmesh/releases/20261011-redesign
Previous release: /home/fleetmesh/releases/20261008-phase1-r2
Backup: /home/fleetmesh/backups/20261011-redesign
Source: /home/fleetmesh/site
The deployment checks the prior symlink/config hash and unchanged factual sources,
backs up the source/vhost, tests Nginx and switches the release atomically.
Rollback restores the previous symlink and the backed-up FleetMesh vhost, then
nginx -t and reload. Do not restore unrelated server configuration.
