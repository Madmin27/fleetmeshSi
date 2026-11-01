# Phase 2 validation (1 November 2026)

Scope: message field reference (11 pages), MassRobotics validation in the Explorer,
share links, changelog, Atom feed, llms.txt, per-page dates. No factual claim was
written by hand about either standard; new technical content is extracted from the
pinned schema files, and the one observation (uppercase UUIDs in MassRobotics
examples) is reproducible with the Explorer.

## Evidence

- `npm test`: 35 unit tests (17 prior + 7 Phase 2 + presentation), all pass.
- `npm run lint`: html-validate clean on 22 pages + 404.
- `npm run check --external`: 1665 internal references and fragments, 27 external sources HTTP OK.
- `scripts/explorer-browser.mjs`: 14 workflows including MassRobotics switch, official vs
  adjusted example, field-reference links, share-link round trip in a fresh tab with the
  assertion that no request URL contains the fragment or `&m=`. Only extra request after
  load is the favicon refetch Chromium performs after `history.replaceState` (GET, no body).
- `scripts/visual-check.mjs`: 22 pages x 5 widths (320-1920), no overflow, no console errors.
- `scripts/design-check.mjs`: 24 checks pass.
- Lighthouse (mobile, local preview): home 100/100/100/100, massrobotics 100/100/100/100,
  reference state 100/100/100/100, explorer 98/100/100/92 (SEO 92 is the pre-existing
  robots.txt fetch blocked by `connect-src 'none'`, kept deliberately).

## Factual boundaries kept

- Reference descriptions are verbatim schema text; the "Schema constraints" column lists
  only keywords present in the schema.
- MassRobotics schema declares no `$schema`; the site says so and names the draft-07
  semantics used. No LICENSE upstream: schema not served as a download.
- "Schema-valid does not mean compliant" remains on the Explorer; official PDF precedence stated.

## Open items

- contact@fleetmesh.si: MX still absent; Hostinger mailbox decision pending (billing API timed out).
- No real-user Core Web Vitals yet.
- Open-sourcing the site/validator on GitHub requires the owner's account and decision.
