# FleetMesh

Source of [fleetmesh.si](https://fleetmesh.si): independent, vendor-neutral engineering
resources for autonomous fleet interoperability.

- **Guides**: VDA 5050 v3.0.0, MassRobotics AMR Interoperability Standard, and a
  side-by-side comparison. Every claim links to a primary source.
- **Message field reference** (`/reference/`): every field of the VDA 5050 message
  families and MassRobotics reports, generated at build time from pinned official
  JSON Schemas. Descriptions are quoted verbatim; commit and SHA-256 are shown.
- **Message Explorer** (`/tools/message-explorer/`): validates JSON in the browser
  against the same pinned schema bytes (Ajv, Draft 2020-12 for VDA 5050; draft-07
  semantics for MassRobotics, whose schema declares no `$schema`). Full JSON-pointer
  error paths, links into the reference, share links that keep the payload in the
  URL fragment. No payload ever reaches a server.

FleetMesh is not affiliated with VDA, VDMA, MassRobotics or any manufacturer. The
official publications are normative. **Schema-valid does not mean compliant.**

## Build

```sh
npm ci
npm run build     # fetches the pinned MassRobotics files, compiles validators, writes dist/
npm run lint      # syntax + html-validate on dist/
npm run check     # metadata, structured data, sitemap and 1,600+ internal references
npm test          # unit tests: validators, parser, share links, reference walker
npm run preview   # http://127.0.0.1:3186
```

Browser-level checks need Playwright's Chromium: `node scripts/explorer-browser.mjs`,
`node scripts/visual-check.mjs`, `node scripts/design-check.mjs`, `node scripts/lighthouse.mjs`.

## Layout

| Path | Purpose |
| --- | --- |
| `src/pages.mjs`, `src/phase1-pages.mjs` | Authored guide pages (HTML in template strings, with source citations) |
| `src/reference/` | Schema walker and generator for `/reference/` pages |
| `src/explorer/` | Message Explorer: CodeMirror UI, worker, validation engine, share links, standards registry |
| `src/vendor/vda-5050/` | Pinned VDA 5050 schemas with manifest (commit, hashes) |
| `src/vendor/massrobotics/manifest.json` | Pinned commit and hashes; files fetched by `npm run vendor` |
| `src/design/` | Design tokens, system CSS, console CSS, SVG diagram components, presentation transforms |
| `src/changelog.mjs` | Dated site changes; feeds `/changelog/` and `/feed.xml` |
| `scripts/` | Build, schema compilation, checks |
| `tests/` | Node test runner suites |

## Updating a schema snapshot

1. Replace the files under `src/vendor/<standard>/` (or, for MassRobotics, delete the
   fetched files and change the commit in `scripts/vendor-massrobotics.mjs`).
2. Update the commit in `src/explorer/standards.mjs` and the manifest hashes.
3. Rebuild and run the tests. The build fails if any vendored byte differs from the manifest.
4. Add a dated entry to `src/changelog.mjs`.

## Contributing

Corrections with a primary source are welcome: see [CONTRIBUTING.md](CONTRIBUTING.md).
Reference pages are generated; report schema issues upstream.

## License

Code: MIT. Guide text: CC BY 4.0. Third-party terms are listed in [LICENSE](LICENSE).
