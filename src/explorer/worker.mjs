import { validateMessage } from './engine.mjs';
self.onmessage=event=>{
  const {id,text,topic,standard}=event.data;
  try { self.postMessage({id,result:validateMessage(text,topic,standard)}); }
  catch { self.postMessage({id,result:{kind:'tool-error',valid:false,errors:[{path:'',message:'Validation could not finish. No result is available.'}]}}); }
};
self.postMessage({ready:true});
