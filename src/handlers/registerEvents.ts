import MyClient, { Event, EventKeys } from "../types/index.js";

export function registerEvents(client: MyClient, events: Event<EventKeys>[]) {

    for (const event of events) {
        if (event.data.once) {

            client.once(event.data.key, (...args) => {
                //creates a new log methode for this event
                const log = console.log.bind(console, `[EVENT: ${event.data.key}]`);

                //try to catch un caught errors
                try {
                    event.data.callback( {client, log}, ...args)
                } catch (err) {
                    console.log("[ERROR]", err)
                }
            })
        } else {

            client.on(event.data.key, (...args) => {
                //creates a new log methode for this event
                const log = console.log.bind(console, `[EVENT: ${event.data.key}]`)

                //try to catch un caught errors
                try {
                    event.data.callback( {client, log}, ...args)
                } catch (err) {
                    console.log("[ERROR]", err)
                }
            })
        }
        
        client.events.set(event.data.key, event)
    }
}