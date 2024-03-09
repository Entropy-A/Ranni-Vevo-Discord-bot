import MyClient from "../types/client.js";
import { HooksRegistry, Symbols } from "./registry.js";

export function useClient() {
    const client = HooksRegistry.get(Symbols.kClient) as MyClient | undefined
    if(!client) throw new Error("Client has not been initialized yet.")

    return client
}