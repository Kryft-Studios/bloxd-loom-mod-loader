

const CONFIG = {
    
    /**Supported Events*/
    SupportedEvents:
        /**@type{const}*/ ([
            "tick" // add more events like "Tick"
        ]),
    /**Times to try. Do not set below 1 or else it wont work.*/
    EventTries: 1,
    /**Whether to turn on Experimental retries.*/
    ExperimentalRetries:true,
    /**What to do when code gets retried. @type{"RetryFn"|"NextFn"}*/
    OnRetryPolicy: "NextFn"
};

let _ = {}; for (let e = 0; e < CONFIG.SupportedEvents.length; e++)_[CONFIG.SupportedEvents[e]] = [];
/**@type{Record<typeof CONFIG["SupportedEvents"][number],Function[]>}*/
let Events = _;
/**@type{Record<number,{index:number,callback:typeof CONFIG["SupportedEvents"][number]}>}*/
const idLookup = {}
let idCounter = 0;
const EventsManager = {
    /**
    * @template {typeof CONFIG["SupportedEvents"][number]} NAME
    * @param {NAME} name 
    * @param {globalThis[NAME]} callback
    */
    register(name, callback) {
        Events[name].push(callback);
        idLookup[++idCounter] = {callback:name,index:Events[name].length-1}
        return idCounter;
    },
    /**@param{number} id*/
    unregister(id){
        if(!idLookup[id]) return; 
        
        const {callback: name, index} = idLookup[id];
        Events[name][index] = null; 
        
       idLookup[id]=undefined;
    },
    
    __runFor(name, index = 0, args) {
        const currentEvents = Events[name];
        if (index >= currentEvents.length) return;

        for (let i = index; i < currentEvents.length; i++) {
            const fn = currentEvents[i];
            let retried = 0;

            if (CONFIG["ExperimentalRetries"]) {
                Object.defineProperty(globalThis.InternalError.prototype, "name", {
                    configurable: true,
                    get: () => {
                        if (CONFIG["OnRetryPolicy"] === "NextFn") {
                            this.__runFor(name, i + 1, args);
                            return
                        }

                        if (++retried > CONFIG["EventRetries"] && CONFIG["OnRetryPolicy"] === "RetryFn") {
                            api.broadcastMessage(`[LOOM] Max retries hit at ${name}`, { color: "#ff9d87" });
                        } else {
                            fn(...args);
                        }
                    }
                });
            }

            try {
                fn(...args);
            } catch (err) {
                if (err.message === "LOOM_SKIP") return;

                api.broadcastMessage(`[LOOM] Error at ${name}: ${err}`, { color: "#ff9d87" });
                if (CONFIG["OnRetryPolicy"] === "NextFn") continue;
            }
        }
    },
    /** @param {typeof CONFIG["SupportedEvents"][number]} name*/
    __startFor(name) {
        globalThis[name] = (...args) => {
            this.__runFor(name, 0, args);
        };
    },
    startAll() {
        for (let i = 0; i < CONFIG.SupportedEvents.length; i++) {
            this.__startFor(CONFIG.SupportedEvents[i]);
        }
    }
};

globalThis.LOOM = function () {
    let newGlobalThis = { ...globalThis };
    for (let i = 0; i < CONFIG["SupportedEvents"].length; i++) {
        const eventName = CONFIG["SupportedEvents"][i];
        let internalValue;

        Object.defineProperty(newGlobalThis, eventName, {
            configurable: true,
            set: (value) => {
                internalValue = value;
                EventsManager.register(eventName, value);
            },
            get: () => internalValue
        });
    }
    return newGlobalThis;
};
EventsManager.startAll();
