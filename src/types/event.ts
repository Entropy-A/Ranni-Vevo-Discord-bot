import type { ClientEvents, Awaitable} from "discord.js";
import type MyClient from "./client.js";


export { Events } from "discord.js";
export type EventLog = (...args: unknown[] ) => void;
export type EventKeys = keyof ClientEvents;

/**
 * @param {MyClient} client
 * @param {EventLog} log
 */
export interface EventProps {
    client: MyClient,
    log: EventLog,
}

// Structure of an eventcallback
export type EventCallback<T extends EventKeys> = (
    props: EventProps,
    ...args: ClientEvents[T]
) => Awaitable<unknown>;

/**
 * @param {EventKeys} eventKey
 * @param {EventCallback} callback
 * @param {Boolean} once (optional) default: false
 */
export class Event<T extends EventKeys = EventKeys> {
    data: {
        key: T
        callback: EventCallback<T>
        once: boolean
    }

    constructor (data: {key: T, callback: EventCallback<T>, once?: boolean}) {
        this.data = {
            key: data.key,
            callback: data.callback,
            once: data.once ?? false,
        };
    }
}