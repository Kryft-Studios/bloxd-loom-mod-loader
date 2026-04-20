const CONFIG={
/**Supported Events*/
SupportedEvents:
/**@type{const}*/["tick"],
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
register:(e,t)=>(Events[e].push(t),idLookup[++idCounter]={callback:e,index:Events[e].length-1},idCounter),
/**@param{number} id*/
unregister(e){if(!idLookup[e])return;const{callback:t,index:r}=idLookup[e];Events[t][r]=null,idLookup[e]=void 0},__runFor(e,t=0,r){const n=Events[e];if(!(t>=n.length))for(let o=t;o<n.length;o++){const t=n[o];let s=0;CONFIG.ExperimentalRetries&&Object.defineProperty(globalThis.InternalError.prototype,"name",{configurable:!0,get:()=>{"NextFn"!==CONFIG.OnRetryPolicy?++s>CONFIG.EventRetries&&"RetryFn"===CONFIG.OnRetryPolicy?api.broadcastMessage("[LOOM] Max retries hit at "+e,{color:"#ff9d87"}):t(...r):this.__runFor(e,o+1,r)}});try{t(...r)}catch(t){if("LOOM_SKIP"===t.message)return;if(api.broadcastMessage(`[LOOM] Error at ${e}: ${t}`,{color:"#ff9d87"}),"NextFn"===CONFIG.OnRetryPolicy)continue}}},
/** @param {typeof CONFIG["SupportedEvents"][number]} name*/
__startFor(e){globalThis[e]=(...t)=>{this.__runFor(e,0,t)}},startAll(){for(let e=0;e<CONFIG.SupportedEvents.length;e++)this.__startFor(CONFIG.SupportedEvents[e])}};globalThis.LOOM=function(){let e={...globalThis};for(let t=0;t<CONFIG.SupportedEvents.length;t++){const r=CONFIG.SupportedEvents[t];let n;Object.defineProperty(e,r,{configurable:!0,set:e=>{n=e,EventsManager.register(r,e)},get:()=>n})}return e},EventsManager.startAll();
