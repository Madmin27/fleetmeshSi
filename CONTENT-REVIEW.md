# Phase 0 content review

Reviewed 2026-10-08 against primary sources. This is an editorial source check,
not external expert approval, safety review or implementation certification.

## Source boundaries

- VDA 5050: official tag 3.0.0, commit
  e9ba560b0e2d3f66526550ad5d61b8a2ad936172; publisher page and release notes
  independently identify version 3.0.0. No examples copied from v2.
- Publisher: https://www.vda.de/en/news/publications/publication/vda-5050
- Specification: https://github.com/VDA5050/VDA5050/blob/3.0.0/VDA5050_EN.md
- Release: https://github.com/VDA5050/VDA5050/releases/tag/3.0.0
- MassRobotics role: its own explanation of information sharing, not task,
  navigation or safety control. No claim about an unverified ISO designation.
- Source: https://www.massrobotics.org/what-is-the-massrobotics-amr-interoperability-standard/

## Claim mapping

| Topic | Primary support |
| --- | --- |
| Scope and excluded responsibilities | VDA 5050 section 2 |
| Fleet-control and robot functions | Sections 5.3 and 5.4 |
| MQTT, JSON, topic hierarchy and QoS | Sections 4, 4.1, 4.2, 4.3 |
| Nodes, edges, base, horizon and order identifiers | Section 6.1 |
| Instant actions | Section 6.2.1 |
| State, visualization and connection | Sections 6.6, 6.7, 6.8 and 6.5 |
| Factsheet and factsheetRequest | Section 6.10 |
| V3 optional zoneSet and responses | Section 4.3 and v3 release notes |
| Breaking v3 changes and action-state arrays | Official v3.0.0 release notes |

Each relevant passage links to the source near the claim. Explanations and
hypothetical integration scenarios are original summaries. No specification
tables, paragraphs, vendor logos or robot photographs are reproduced.

FleetMesh's orchestration checklist and architecture model are explicitly
editorial, not normative. The diagram states that drones and autonomous road
vehicles are broader subject areas, not evidence of standard compatibility.

No customers, employees, funding, certifications, partnerships, product
availability or deployment statistics are claimed. About describes the actual
independent initiative and the site's data collection limits. Server access
logs are acknowledged; the site is not incorrectly called log-free.

## Remaining editorial work

An independent robotics engineer has not reviewed this material. A corrections
channel requires an actual configured destination before it is published.
Recheck the official release record before expanding or modifying examples.
