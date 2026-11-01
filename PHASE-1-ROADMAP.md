# FleetMesh Phase 1

Phase 1 implements the MassRobotics guide, an eight-axis VDA/MassRobotics comparison,
and the browser-only VDA 5050 v3.0.0 Message Explorer. See PHASE-1-VALIDATION.md.
The remaining work below is recommended, not promised. Publishing criteria require evidence,
not just populated routes. Do not invent products, vendors, endorsements or users.

## 1. MassRobotics technical guide

Initial guide implemented; independent domain-expert review remains outstanding.
There is no MassRobotics validator in this release.

Cover the information model, transport, document version and integration limits
using the official working-group repository. Explain observation versus command
authority. Confirm any ISO transition against the official bodies before naming
an ISO standard or claiming equivalence. Acceptance: source-linked claims,
versioned examples, schema checks and an independent technical review.

## 2. Robot fleet orchestration guide

Expand the existing design questions into worked task-allocation, traffic,
charging and recovery scenarios. Clearly distinguish hypothetical examples from
measured results. Define metrics and failure cases before comparing strategies.
Acceptance: reproducible simulations with stated assumptions, no deployment claims.

## 3. Protocol/message explorer

Initial VDA-only release implemented with eight message families and pinned schemas.
Future work must preserve the zero-payload-network boundary.

Build a browser-local viewer against pinned official schemas, beginning with
VDA 5050 v3.0.0. Include message selection, JSON editing, useful validation errors
and version-specific examples. Keep uploaded messages on the user's device by
default. Acceptance: valid/invalid fixtures, explicit schema-versus-behavior
boundary, accessible controls and no unsupported certification language.

## 4. Structured standards dataset

Record source URL, version, release date, reviewed date, transport, message
families, supported scope and limitations. Keep every field traceable and
separate unknown from unsupported. Use a schema and review changes in Git.
Acceptance: machine validation, provenance for every factual field and update policy.

## 5. Vendor-neutral compatibility framework

Separate advertised support, documentation evidence, schema validation,
interoperability tests and physical deployment evidence. Define a test scenario
and evidence format before listing products. Never turn a missing result into
a failure or a vendor's claim into certification. Acceptance: reviewed criteria,
reproducible fixtures and a transparent corrections process.

## Suggested sequence

1. MassRobotics guide and dataset schema.
2. Orchestration guide and small, reproducible scenarios.
3. Local message explorer based on the dataset.
4. Compatibility criteria, then independently reviewed evidence.

Maintain primary-source links, version dates, mobile accessibility and performance
checks at each stage. Arrange a real editorial contact route before inviting
submissions; do not publish a nonfunctional form or unconfigured mailbox.
