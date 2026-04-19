const CONFIG={
/**Supported Events*/
SupportedEvents:
/**@type{const}*/["tick"],
/**Times to try. Do not set below 1 or else it wont work.*/
EventTries:1,
/**Whether to turn on Experimental retries.*/
ExperimentalRetries:!1};let _={};for(let e=0;e<CONFIG.SupportedEvents.length;e++)_[CONFIG.SupportedEvents[e]]=[];
/**@type{Record<typeof CONFIG["SupportedEvents"][number],Function[]>}*/let Events=_;const EventsManager={
/**
    * @template {typeof CONFIG["SupportedEvents"][number]} NAME
    * @param {NAME} name 
    * @param {globalThis[NAME]} callback
    */
register(e,t){Events[e].push(t)},
/** @param {typeof CONFIG["SupportedEvents"][number]} name */
__startFor(e){globalThis[e]=(...t)=>{const r=Events[e];for(let s=0;s<r.length;s++){const o=r[s];let n=1;if(CONFIG.ExperimentalRetries&&Object.defineProperty(globalThis.InternalError.prototype,"name",{configurable:!0,get:()=>{++n>CONFIG.EventRetries?api.broadcastMessage(`Error at ${e}: Too many retries!`,{color:"#ff9d87"}):o(...t)}}),n>CONFIG.EventRetries&&CONFIG.ExperimentalRetries)return void api.broadcastMessage(`Error at ${e}: Too many retries!`,{color:"#ff9d87"});try{o(...t)}catch(t){api.broadcastMessage(`Error at ${e}: ${t}`,{color:"#ff9d87"})}}}},startAll(){for(let e=0;e<CONFIG.SupportedEvents.length;e++)this.__startFor(CONFIG.SupportedEvents[e])}};globalThis.LOOM=function(){let e={...globalThis};for(let t=0;t<CONFIG.SupportedEvents.length;t++){const r=CONFIG.SupportedEvents[t];let s;Object.defineProperty(e,r,{configurable:!0,set:e=>{s=e,EventsManager.register(r,e)},get:()=>s})}return e},EventsManager.startAll();
