const header={headerId:1,timestamp:'2026-10-08T09:00:00.000Z',version:'3.0.0',manufacturer:'ExampleMaker',serialNumber:'DemoRobot001'};
export const examples={
  order:{...header,orderId:'demo-order-001',orderUpdateId:0,nodes:[{nodeId:'station-a',sequenceId:0,released:true,nodePosition:{x:2.5,y:1,mapId:'demo-floor'},actions:[]}],edges:[]},
  instantActions:{...header,actions:[{actionType:'factsheetRequest',actionId:'demo-action-001',blockingType:'NONE'}]},
  state:{...header,orderId:'',orderUpdateId:0,lastNodeId:'station-a',lastNodeSequenceId:0,nodeStates:[],edgeStates:[],driving:false,actionStates:[],instantActionStates:[],powerSupply:{stateOfCharge:80,charging:false},operatingMode:'AUTOMATIC',errors:[],safetyState:{activeEmergencyStop:'NONE',fieldViolation:false}},
  visualization:{...header,referenceStateHeaderId:1},
  connection:{...header,connectionState:'ONLINE'},
  responses:{...header,responses:[{requestId:'demo-request-001',grantType:'GRANTED'}]},
  zoneSet:{...header,zoneSet:{mapId:'demo-floor',zoneSetId:'demo-zones-001',zones:[]}},
  factsheet:{...header,typeSpecification:{seriesName:'Illustrative carrier',mobileRobotKinematics:'DIFFERENTIAL',mobileRobotClass:'CARRIER',maximumLoadMass:100,localizationTypes:['NATURAL'],navigationTypes:['FREELY_NAVIGATING']},physicalParameters:{minimumSpeed:0.1,maximumSpeed:1,maximumAcceleration:0.5,maximumDeceleration:0.5,minimumHeight:0.3,maximumHeight:0.3,width:0.6,length:0.8},protocolLimits:{maximumStringLengths:{},maximumArrayLengths:{},timing:{minimumOrderInterval:0.1,minimumStateInterval:0.1}},protocolFeatures:{optionalParameters:[],mobileRobotActions:[]},mobileRobotGeometry:{},loadSpecification:{}}
};
export const messageNames=['order','instantActions','state','visualization','factsheet','connection','zoneSet','responses'];
import massIdentity from '../vendor/massrobotics/identityReport1.json' with {type:'json'};
import massStatus from '../vendor/massrobotics/statusReport1.json' with {type:'json'};
const lowerUuids=value=>JSON.parse(JSON.stringify(value),(key,v)=>typeof v==='string'&&/^[0-9A-F]{8}-[0-9A-F]{4}-[0-9A-F]{4}-[0-9A-F]{4}-[0-9A-F]{12}$/i.test(v)?v.toLowerCase():v);
// Official repository examples, byte-for-byte parsed, plus a FleetMesh variant with lowercase UUIDs that satisfies the schema pattern.
export const massExamples={
  identityReport:{official:massIdentity,adjusted:lowerUuids(massIdentity)},
  statusReport:{official:massStatus,adjusted:lowerUuids(massStatus)}
};
export const exampleFor=(standard,topic,variant='official')=>standard==='massrobotics'?massExamples[topic][variant]:examples[topic];
