import { Client, Collection, GatewayIntentBits, Partials } from "discord.js";
import MyClient from "./types/index.js";
import Keys from "./keys/keys.js";
import { registerCommands, registerEvents } from "./handlers/index.js";
import events from "./events/index.js";
import commands from "./commands/index.js";
import { MyJSON } from "./utils/MyJSON.js";
export const config = MyJSON.parse("src/config.json");


export const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildVoiceStates
    ],
    partials: [
        Partials.User,
        Partials.Message,
        Partials.Channel,
        Partials.ThreadMember,
    ]
}) as MyClient;

client.config = config
client.events = new Collection();
client.commands = new Collection();

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