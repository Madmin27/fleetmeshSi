# Launch kit (drafts only; nothing has been posted)

Audience: robotics / AMR integration engineers. Tone: factual, no superlatives, no claims of
users or partners. Every draft links to primary sources. Post from a personal account; do not
imply affiliation with VDA, VDMA or MassRobotics.

## Show HN (news.ycombinator.com/submit)

Title: Show HN: Browser-only validator and field reference for VDA 5050 and MassRobotics AMR messages

Text:
FleetMesh is an independent reference site for autonomous-fleet interoperability. Two things may be useful:

1. A field reference generated from the pinned official JSON Schemas (VDA 5050 v3.0.0: 8 message families; MassRobotics AMR Interop: 2 reports). 574 fields with types, required flags, enums and constraints; descriptions are quoted verbatim, provenance commit and SHA-256 shown. https://fleetmesh.si/reference/
2. A Message Explorer that validates JSON against those same schema bytes entirely in the browser (Ajv, Draft 2020-12 for VDA; draft-07 semantics for MassRobotics because the file declares no $schema). Errors show full JSON pointers and link to the reference row. Share links put the compressed JSON in the URL fragment, so nothing reaches the server. https://fleetmesh.si/tools/message-explorer/

One thing we found while pinning: the MassRobotics repository's own example files use uppercase UUIDs, which fail the schema's lowercase pattern. The tool reports it rather than fixing it.

Not affiliated with VDA, VDMA or MassRobotics. The official PDFs are normative; schema-valid does not mean compliant.

## r/robotics or r/AutonomousVehicles / ROS Discourse

Title: Field-by-field VDA 5050 v3.0.0 reference generated from the official schemas, plus a local validator

Body (short): Same as HN text, shortened to the two links and the UUID observation. Ask for corrections and point to the changelog.

## LinkedIn (personal)

Three sentences: what it is, that it is generated from pinned official schemas, and that it runs locally. One link to /reference/.

## Where to list

- Awesome lists on GitHub about AMR/AGV/VDA 5050 (open a PR adding the reference page).
- VDA5050 GitHub discussions: a polite note offering the generated reference as a reading aid; do not file it as an issue.
- MassRobotics-AMR repository: an issue reporting the uppercase-UUID vs pattern mismatch with the reproduction steps (this is a genuine upstream bug report and a legitimate backlink).

## Do not

- Buy links, use affiliate links, or claim users, customers or endorsements.
- Post the same text to many venues on the same day.
