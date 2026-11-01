// Registry of standards the Explorer validates. Facts here are repeated on the pages;
// keep them traceable to the vendored manifests.
export const VDA_COMMIT='0b2ae43154bcd1ab2be4e2445df8b406dcad77b2';
export const MASS_COMMIT='f9357a423ecabc3f7112e6d10025a5231943ec50';
export const standards={
  'vda-5050':{
    id:'vda-5050',label:'VDA 5050',version:'3.0.0',dialect:'JSON Schema Draft 2020-12',versionField:'3.0.0',
    messages:['order','instantActions','state','visualization','factsheet','connection','zoneSet','responses'],
    schemaFile:topic=>`${topic}.schema`,
    schemaLink:topic=>`https://github.com/VDA5050/VDA5050/blob/${VDA_COMMIT}/json_schemas/${topic}.schema`,
    download:topic=>`/schemas/vda-5050/${VDA_COMMIT}/${topic}.schema`,
    repo:`https://github.com/VDA5050/VDA5050/tree/${VDA_COMMIT}`,commit:VDA_COMMIT,short:VDA_COMMIT.slice(0,7),
    normative:{label:'official VDA publication',href:'https://www.vda.de/en/news/publications/publication/vda-5050'},
    exampleLabel:'FleetMesh structural example',guide:'/standards/vda-5050/',reference:'/reference/vda-5050/'
  },
  'massrobotics':{
    id:'massrobotics',label:'MassRobotics AMR Interop',version:'1.0',dialect:'JSON Schema (no $schema declared; draft-07 semantics)',versionField:null,
    messages:['identityReport','statusReport'],
    schemaFile:()=>'AMR_Interop_Standard.json',
    schemaLink:topic=>`https://github.com/MassRobotics-AMR/AMR_Interop_Standard/blob/${MASS_COMMIT}/AMR_Interop_Standard.json`,
    download:null,
    repo:`https://github.com/MassRobotics-AMR/AMR_Interop_Standard/tree/${MASS_COMMIT}`,commit:MASS_COMMIT,short:MASS_COMMIT.slice(0,7),
    normative:{label:'MassRobotics AMR Interoperability Standard PDF (repository)',href:`https://github.com/MassRobotics-AMR/AMR_Interop_Standard/blob/${MASS_COMMIT}/AMR_Interop_Standard.pdf`},
    exampleLabel:'Official repository example',guide:'/standards/massrobotics/',reference:'/reference/massrobotics/'
  }
};
export const standardIds=Object.keys(standards);
export const messageKey=(standard,topic)=>`${standard}:${topic}`;
