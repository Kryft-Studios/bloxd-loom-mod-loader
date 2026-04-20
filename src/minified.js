const CONFIG={
/**Supported Events*/
SupportedEvents:
/**@type{const}*/(["tick"]),
/**Times to try. Do not set below 1 or else it wont work.*/
EventTries:1,
/**Whether to turn on Experimental retries.*/
ExperimentalRetries:!0,
/**What to do when code gets retried. @type{"RetryFn"|"NextFn"}*/
OnRetryPolicy:"NextFn"};let _={};for(let e=0;e<CONFIG.SupportedEvents.length;e++)_[CONFIG.SupportedEvents[e]]=[];
/**@type{Record<typeof CONFIG["SupportedEvents"][number],Function[]>}*/let Events=_;
/**@type{Record<number,{index:number,callback:typeof CONFIG["SupportedEvents"][number]}>}*/const idLookup={};let idCounter=0;const EventsManager={
/**
    * @template {typeof CONFIG["SupportedEvents"][number]} NAME
    * @param {NAME} name 
    * @param {globalThis[NAME]} callback
    */
register:(name,callback)=>(Events[name].push(callback),idLookup[++idCounter]={callback:name,index:Events[name].length-1},idCounter),
/**@param{number} id*/
unregister(id){if(!idLookup[id])return;const{callback:name,index:e}=idLookup[id];Events[name][e]=null,idLookup[id]=void 0},__runFor(name,e=0,t){const r=Events[name];if(!(e>=r.length))for(let n=e;n<r.length;n++){const e=r[n];let o=0;CONFIG.ExperimentalRetries&&Object.defineProperty(globalThis.InternalError.prototype,"name",{configurable:!0,get:()=>{"NextFn"!==CONFIG.OnRetryPolicy?++o>CONFIG.EventRetries&&"RetryFn"===CONFIG.OnRetryPolicy?api.broadcastMessage("[LOOM] Max retries hit at "+name,{color:"#ff9d87"}):e(...t):this.__runFor(name,n+1,t)}});try{e(...t)}catch(e){if("LOOM_SKIP"===e.message)return;if(api.broadcastMessage(`[LOOM] Error at ${name}: ${e}`,{color:"#ff9d87"}),"NextFn"===CONFIG.OnRetryPolicy)continue}}},
/** @param {typeof CONFIG["SupportedEvents"][number]} name*/
__startFor(name){globalThis[name]=(...e)=>{this.__runFor(name,0,e)}},startAll(){for(let e=0;e<CONFIG.SupportedEvents.length;e++)this.__startFor(CONFIG.SupportedEvents[e])}};globalThis.LOOM=function(){let e={...globalThis};for(let t=0;t<CONFIG.SupportedEvents.length;t++){const r=CONFIG.SupportedEvents[t];let n;Object.defineProperty(e,r,{configurable:!0,set:e=>{n=e,EventsManager.register(r,e)},get:()=>n})}return e},EventsManager.startAll();
