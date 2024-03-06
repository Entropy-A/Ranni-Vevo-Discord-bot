import type { Awaitable, ChatInputCommandInteraction, SlashCommandBuilder } from "discord.js";
import type MyClient from "./client.js";
import type { LocaleText } from "../text/index.js";


export type CommandLog = (...args: unknown[]) => void;
export type CommandMeta = SlashCommandBuilder | Omit<SlashCommandBuilder, "addSubCommand" | "addSubCommandGroup">

export interface CommandProps {
    interaction: ChatInputCommandInteraction,
    client: MyClient,
    log: CommandLog
};

//structure of an eventcallback
export type CommandCallback = (
    props: CommandProps,
    ...args: unknown[]
) => Awaitable<unknown>;

// -------------------------Command-------------------------

export interface CommandData {
    id?: string,
    icon: string,
    detailedDescription: {
        title: LocaleText,
        description: LocaleText,
        syntax: LocaleText,
        returns: LocaleText
    },

    meta: CommandMeta,
    callback: CommandCallback
}

export class Command {
    constructor (public data: CommandData) {}
}

// --------------------Command Category----------------------

export interface CommandCategoryData {
    name: LocaleText,
    commands: Command[]

    description?: LocaleText
    emoji?: string
}

export class CommandCategory {
    constructor (public data: CommandCategoryData) {}
}