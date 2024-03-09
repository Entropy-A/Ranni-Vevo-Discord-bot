import { Client, Collection, GatewayIntentBits, Partials } from "discord.js";
import MyClient from "../types/index.js";
import Keys from "../keys/keys.js";
import { registerCommands, registerEvents } from "../handlers/index.js";
import events from "../events/index.js";
import commands from "../commands/index.js";
import { MyJSON } from "../utils/MyJSON.js";
import { Player } from "discord-player";
import { HooksRegistry, Symbols } from "../hooks/registry.js";
import { ClientPartials, ClientIntents } from "../utils/constants.js";
export const config = MyJSON.parse("src/config.json");


export const client = new Client({
    intents: ClientIntents,
    partials: ClientPartials
}) as MyClient;

client.config = config
client.events = new Collection();
client.commands = new Collection();
client.player = new Player(client, {
    ytdlOptions: {
        quality: "highestaudio",
        highWaterMark: 1 << 25
    }
})
HooksRegistry.set(Symbols.kClient, client);

await client.player.extractors.loadDefault();

client.login(Keys.clientToken)
    .catch((err => {
        console.error("[Login Error]", err);
        process.exit(1);
    }))
    .then(() => {
        registerEvents(client, events)
    })
    .catch((err) => {
        console.error("[Event loading Error]", err);
        process.exit(1);
    })
    .then(() => {
        const allCommands = commands.map(({ data: {commands} }) => commands).flat()
        allCommands.forEach((command) => {
            client.commands.set(command.data.meta.name, command);
        });

        //registerCommands(client, commands)
    })
    .catch((err) => {
        console.error("[Command loading Error]", err);
        process.exit(1);
    })