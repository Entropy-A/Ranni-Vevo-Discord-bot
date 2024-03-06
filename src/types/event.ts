import type { ClientEvents, Awaitable} from "discord.js";
import type MyClient from "./client.js";


export { Events } from "discord.js";

export type EventLog = (...args: unknown[] ) => void;

export type EventKeys = keyof ClientEvents;

export interface EventProps {
    client: MyClient,
    log: EventLog,
}

// Structure of an eventcallback
export type EventCallback<T extends EventKeys> = (
    props: EventProps,
    ...args: ClientEvents[T]
) => Awaitable<unknown>;

// Creates an event class for the representing event
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
            once: data.once !== undefined ? data.once : false,
        };
    }
}