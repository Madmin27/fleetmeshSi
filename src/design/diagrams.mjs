const escape=value=>String(value).replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('"','&quot;');
export const StatusBadge=(text,tone='neutral')=>`<span class="status-badge status-${tone}">${escape(text)}</span>`;
export function SystemNode({x,y,w=204,h=64,label,meta='',muted=false,href='/architecture/'}) {
  const labels=Array.isArray(label)?label:[label];
  return `<a href="${href}" class="system-node${muted?' node-muted':''}" aria-label="${escape(labels.join(' '))}: ${escape(meta)}"><rect x="${x}" y="${y}" width="${w}" height="${h}" rx="3"/><path class="node-port" d="M${x-4} ${y+h/2}h8M${x+w-4} ${y+h/2}h8"/><text class="node-meta" x="${x+14}" y="${y+19}">${escape(meta)}</text>${labels.map((t,i)=>`<text class="node-label" x="${x+14}" y="${y+41+i*19}">${escape(t)}</text>`).join('')}</a>`;
}
export const ProtocolEdge=({d,dashed=false})=>`<path class="protocol-edge${dashed?' edge-conceptual':''}" d="${d}"/>`;
export const DataFlow=({d,delay=false})=>`<path class="data-flow${delay?' flow-delayed':''}" d="${d}" pathLength="100"/>`;
export function ArchitectureCanvas({id,width,height,content,title,description,extraClass=''}) {
  return `<svg xmlns="http://www.w3.org/2000/svg" class="architecture-canvas ${extraClass}" viewBox="0 0 ${width} ${height}" width="${width}" height="${height}" role="img" aria-labelledby="${id}-title ${id}-desc"><title id="${id}-title">${escape(title)}</title><desc id="${id}-desc">${escape(description)}</desc><defs><pattern id="${id}-grid" width="32" height="32" patternUnits="userSpaceOnUse"><path d="M32 0H0V32" class="canvas-grid"/></pattern></defs><rect width="${width}" height="${height}" fill="url(#${id}-grid)"/>${content}</svg>`;
}
export function fleetTopology(mobile=false) {
  const nodes=mobile?[
    {x:10,y:12,w:150,label:'Fleet Controller',meta:'01 / CONTROL'},
    {x:180,y:12,w:150,label:'MQTT Broker',meta:'02 / TRANSPORT'},
    {x:10,y:112,w:150,label:'AMR',meta:'03 / MOBILE'},
    {x:180,y:112,w:150,label:'AGV',meta:'04 / GUIDED'},
    {x:10,y:232,w:150,label:'Drone',meta:'05 / AERIAL',muted:true},
    {x:180,y:232,w:150,h:82,label:['Autonomous','Vehicle'],meta:'06 / BROADER',muted:true}
  ]:[
    {x:30,y:26,w:225,label:'Fleet Controller',meta:'01 / CONTROL'},
    {x:370,y:26,w:225,label:'MQTT Broker',meta:'02 / TRANSPORT'},
    {x:765,y:26,w:225,label:'AMR',meta:'03 / MOBILE ROBOTICS'},
    {x:765,y:166,w:225,label:'AGV',meta:'04 / GUIDED TRANSPORT'},
    {x:30,y:180,w:225,label:'Drone',meta:'05 / BROADER RESEARCH',muted:true},
    {x:370,y:180,w:225,label:'Autonomous Vehicle',meta:'06 / BROADER RESEARCH',muted:true}
  ];
  const paths=mobile?['M160 44H180','M255 76V94H85V112','M255 94V112']:['M255 58H370','M595 58H765','M680 58V198H765'];
  const content=paths.map(d=>ProtocolEdge({d})).join('')+paths.map((d,i)=>DataFlow({d,delay:i===1})).join('')+
    (mobile?'<path class="scope-boundary" d="M10 218H330"/><text class="scope-label" x="10" y="208">BROADER RESEARCH / SCOPE VARIES</text>':'<path class="scope-boundary" d="M30 156H595"/><text class="scope-label" x="30" y="147">BROADER RESEARCH / NO COMMON PROTOCOL IMPLIED</text>')+
    nodes.map(node=>SystemNode({...node,href:node.meta.includes('TRANSPORT')||node.label==='MQTT Broker'?'/standards/vda-5050/':'/architecture/'})).join('');
  return ArchitectureCanvas({id:mobile?'fleet-mobile':'fleet-desktop',width:mobile?340:1020,height:mobile?324:274,content,title:'Illustrative fleet topology',description:'Conceptual Fleet Controller, MQTT Broker, AMR and AGV message connections. Drone and Autonomous Vehicle are separate broader research subjects, not claims of VDA 5050 or MQTT support. Not a live fleet.',extraClass:mobile?'topology-mobile':'topology-desktop'});
}
export function architectureDiagram(mobile=false) {
  const width=mobile?350:960,height=mobile?510:340;
  const nodes=mobile?[
    {x:15,y:12,w:320,h:82,label:['Fleet Management','Orchestration'],meta:'01 / TASKS, TRAFFIC, ENERGY, RECOVERY'},
    {x:15,y:134,w:320,label:'Interoperability Layer',meta:'02 / INTERFACES, MESSAGES, CAPABILITIES'},
    {x:15,y:256,w:150,label:'AMR',meta:'MOBILE ROBOTICS'},
    {x:185,y:256,w:150,label:'AGV',meta:'GUIDED TRANSPORT'},
    {x:15,y:398,w:150,label:'Drone',meta:'AERIAL SYSTEMS',muted:true},
    {x:185,y:398,w:150,h:82,label:['Autonomous','Vehicle'],meta:'BROADER AUTONOMY',muted:true}
  ]:[
    {x:240,y:10,w:480,label:'Fleet Management / Orchestration',meta:'01 / TASKS, TRAFFIC, ENERGY, RECOVERY'},
    {x:240,y:110,w:480,label:'Interoperability Layer',meta:'02 / INTERFACES, MESSAGES, CAPABILITY MODELS'},
    {x:10,y:240,w:210,label:'AMR',meta:'MOBILE ROBOTICS'},
    {x:250,y:240,w:210,label:'AGV',meta:'GUIDED TRANSPORT'},
    {x:490,y:240,w:210,label:'Drone',meta:'AERIAL SYSTEMS',muted:true},
    {x:730,y:240,w:220,label:'Autonomous Vehicle',meta:'BROADER AUTONOMY',muted:true}
  ];
  const paths=mobile?['M175 94V134','M175 198V226H90V256M175 226H260V256','M175 226V362H90V398M175 362H260V398']:['M480 74V110','M480 174V210H115V240M355 210V240M480 210H840V240M595 210V240'];
  return ArchitectureCanvas({id:mobile?'architecture-mobile':'architecture-desktop',width,height,content:paths.map(d=>ProtocolEdge({d,dashed:true})).join('')+nodes.map(SystemNode).join(''),title:'Conceptual autonomous fleet architecture',description:'Fleet management and orchestration connects through an interoperability layer to AMRs, AGVs, drones and autonomous vehicles. This is a subject-area model, not a product or a claim of common protocol compatibility.',extraClass:mobile?'diagram-mobile':'diagram-desktop'});
}
