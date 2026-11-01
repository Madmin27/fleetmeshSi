// Dated, factual record of what changed on the site. Entries describe the site, not the standards.
export const changelog=[
  {date:'2026-11-01',title:'Phase 2: field reference, MassRobotics validation, share links',items:[
    'Message field reference generated from the pinned official schemas: 8 VDA 5050 v3.0.0 message families and 2 MassRobotics AMR Interop reports, 574 fields with provenance hashes.',
    'Message Explorer validates MassRobotics identityReport and statusReport against the repository schema (draft-07 semantics; the file declares no $schema).',
    'Explorer errors link to the matching field reference row.',
    'Share links encode the JSON in the URL fragment with deflate-raw compression; the fragment is never sent to the server.',
    'Observation recorded: the MassRobotics repository examples use uppercase UUIDs that fail the schema pattern.',
    'Per-page publication and modification dates, Atom feed, llms.txt and this changelog.',
    'Site source published under MIT (guide text CC BY 4.0): https://github.com/Madmin27/leetmeshSi'
  ]},
  {date:'2026-10-11',title:'Visual system redesign',items:['Dark graphite design tokens, two-family typography, SVG topology and architecture components, three-column Explorer console with mobile tabs. Technical copy unchanged.']},
  {date:'2026-10-08',title:'Phase 1: MassRobotics guide, comparison and Explorer',items:['MassRobotics practical guide and an eight-axis VDA 5050 vs MassRobotics comparison.','Browser-only VDA 5050 v3.0.0 Message Explorer with pinned schemas, Draft 2020-12 validation and full error paths.']},
  {date:'2026-10-08',title:'Phase 0: launch',items:['Homepage, VDA 5050 practical guide, standards, orchestration, architecture, resources and about pages with primary-source links.']}
];
export const changelogPage={
  path:'/changelog/',section:'Resources',date:'2026-10-08',modified:changelog[0].date,
  title:'Changelog | FleetMesh',heading:'Changelog',eyebrow:'Site record',
  description:'Dated record of changes to FleetMesh content and tools, including schema snapshot updates and Message Explorer releases.',
  intro:'What changed on this site and when. Standards versions and schema commits are recorded on the pages that use them.',
  body:`<div class="wrap reading prose">${changelog.map(entry=>`<section class="changelog-entry"><p class="eyebrow mono">${entry.date}</p><h2>${entry.title}</h2><ul>${entry.items.map(i=>`<li>${i}</li>`).join('')}</ul></section>`).join('')}<p class="source">Subscribe: <a href="/feed.xml">Atom feed</a>. Machine-readable index: <a href="/llms.txt">llms.txt</a>.</p></div>`
};
