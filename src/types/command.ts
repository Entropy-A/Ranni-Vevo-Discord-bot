import { Awaitable, ChatInputCommandInteraction, SlashCommandBuilder } from "discord.js";
import type MyClient from "./client.js";
import type { LocaleText } from "../text/index.js";


export type CommandLog = (...args: unknown[]) => void;
export type CommandMeta = SlashCommandBuilder | Omit<SlashCommandBuilder, "addSubcommand" | "addSubcommandGroup">;

/**
 * @param {ChatInputCommandInteraction} interaction
 * @param {MyClient} client
 * @param {CommandLog} log
 */
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

export interface CommandData {
    id?: string,
    icon: string,
    color: number,
    detailedDescription: {
        title: LocaleText,
        description: LocaleText,
        syntax: LocaleText,
        returns: LocaleText
    },

    meta: CommandMeta,
    callback: CommandCallback
}

/**
 * @param {string} id (optional) later automaticly set
 * @param {string} icon
 * @param {number} color
 * @param {string} detailedDescription
 * @param {CommandMeta} meta
 * @param {CallableFunction} callback
 */
export class Command {
    constructor (public data: CommandData) {}
}

export interface CommandCategoryData {
    name: LocaleText,
    commands: Command[]

    description?: LocaleText
    emoji?: string
}

/**
 * @param {LocaleText} name
 * @param {Array} commands
 * @param {LocaleText} description (optional)
 * @param {string} emoji (optional)
 */
export class CommandCategory {
    constructor (public data: CommandCategoryData) {}
}