const CONFIG = {
    /**Supported Events*/
    SupportedEvents:
        /**@type{const}*/ ([
            "tick" // add more events like "Tick"
        ]),
    /**Times to try. Do not set below 1 or else it wont work.*/
    EventTries: 1,
    /**Whether to turn on Experimental retries.*/
    ExperimentalRetries: false
};

let _ = {}; for (let e = 0; e <  CONFIG.SupportedEvents.length; e++)_[CONFIG.SupportedEvents[e]] = [];
/**@type{Record<typeof CONFIG["SupportedEvents"][number],Function[]>}*/
let Events = _;


const EventsManager = {
    /**
    * @template {typeof CONFIG["SupportedEvents"][number]} NAME
    * @param {NAME} name 
    * @param {globalThis[NAME]} callback
    */
    register(name, callback) {
        Events[name].push(callback);
    },
/** @param {typeof CONFIG["SupportedEvents"][number]} name */
    __startFor(name) {
        globalThis[name] = (...args) => {
            const currentEvents = Events[name];
            
            for (let i = 0; i < currentEvents.length; i++) {
                const fn = currentEvents[i];
                let retried = 1;

                if(CONFIG["ExperimentalRetries"])Object.defineProperty(globalThis.InternalError.prototype, "name", {
                    configurable: true,
                    get: () => {
                        if (++retried > CONFIG["EventRetries"]) {
                            api.broadcastMessage(`Error at ${name}: Too many retries!`, {color: "#ff9d87"});
                        } else {
                            fn(...args);
                        }
                    }
                });

                if (retried > CONFIG["EventRetries"] && CONFIG["ExperimentalRetries"]) {
                    api.broadcastMessage(`Error at ${name}: Too many retries!`, {color: "#ff9d87"});
                    return;
                }

                try {
                    fn(...args);
                } catch (err) {
                    api.broadcastMessage(`Error at ${name}: ${err}`, {color: "#ff9d87"});
                }
            }
        };
    },
    startAll() {
        for (let i = 0; i < CONFIG.SupportedEvents.length; i++) {
            this.__startFor(CONFIG.SupportedEvents[i]);
        }
    }
};

globalThis.LOOM = function() {
    let newGlobalThis = {...globalThis}
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
    return newGlobalThis
}
EventsManager.startAll()
