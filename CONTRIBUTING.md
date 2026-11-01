# Contributing

FleetMesh publishes only what can be traced to a primary source or reproduced from a
pinned schema. Please keep that bar.

- **Factual corrections**: open an issue or pull request quoting the official document
  (VDA publication, MassRobotics PDF or repository file) and the version or commit.
- **Reference pages** under `/reference/` are generated. Do not edit output; if the
  schema is wrong, report it upstream and link the upstream issue here.
- **Explorer behavior**: add a failing unit test in `tests/` first. The validator must not
  coerce values, insert defaults or strip properties, and no payload may leave the browser.
- **Language**: no superlatives, no vendor rankings, no claims of users, partners or
  certification. "Schema-valid does not mean compliant" stays.
- Run `npm run build && npm run lint && npm run check && npm test` before submitting.
