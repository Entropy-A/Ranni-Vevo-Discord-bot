import type { Client, Collection } from "discord.js"

//adds extra keys to the Client object
export default interface MyClient extends Client {
    config: any,
    events: Collection<any, any>,
    commands: Collection<any, any>
}
