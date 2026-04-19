const CONFIG={
/**Supported Events*/
SupportedEvents:
/**@type{const}*/["tick"],
/**Times to try. Do not set below 1 or else it wont work.*/
EventTries:1,
/**Whether to turn on Experimental retries.*/
ExperimentalRetries:!0,
/**What to do when code gets retried. @type{"RetryFn"|"NextFn"}*/
OnRetryPolicy:"NextFn"};let _={};for(let t=0;t<CONFIG.SupportedEvents.length;t++)_[CONFIG.SupportedEvents[t]]=[];
/**@type{Record<typeof CONFIG["SupportedEvents"][number],Function[]>}*/let Events=_;const EventsManager={
/**
    * @template {typeof CONFIG["SupportedEvents"][number]} NAME
    * @param {NAME} name 
    * @param {globalThis[NAME]} callback
    */
register(t,e){Events[t].push(e)},__runFor(t,e=0,r){const n=Events[t];if(!(e>=n.length))for(let s=e;s<n.length;s++){const e=n[s];let o=0;CONFIG.ExperimentalRetries&&Object.defineProperty(globalThis.InternalError.prototype,"name",{configurable:!0,get:()=>{"NextFn"!==CONFIG.OnRetryPolicy?++o>CONFIG.EventRetries&&"RetryFn"===CONFIG.OnRetryPolicy?api.broadcastMessage("[LOOM] Max retries hit at "+t,{color:"#ff9d87"}):e(...r):this.__runFor(t,s+1,r)}});try{e(...r)}catch(e){if("LOOM_SKIP"===e.message)return;if(api.broadcastMessage(`[LOOM] Error at ${t}: ${e}`,{color:"#ff9d87"}),"NextFn"===CONFIG.OnRetryPolicy)continue}}},
/** @param {typeof CONFIG["SupportedEvents"][number]} name*/
__startFor(t){globalThis[t]=(...e)=>{this.__runFor(t,0,e)}},startAll(){for(let t=0;t<CONFIG.SupportedEvents.length;t++)this.__startFor(CONFIG.SupportedEvents[t])}};globalThis.LOOM=function(){let t={...globalThis};for(let e=0;e<CONFIG.SupportedEvents.length;e++){const r=CONFIG.SupportedEvents[e];let n;Object.defineProperty(t,r,{configurable:!0,set:t=>{n=t,EventsManager.register(r,t)},get:()=>n})}return t},EventsManager.startAll();
