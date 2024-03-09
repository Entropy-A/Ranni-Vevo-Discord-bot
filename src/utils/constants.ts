import { EmbedGenerator } from "./embedGenerator.js"
import { Text, text } from "../text/index.js"
import { Page } from "../types/pages.js"
import { GatewayIntentBits, Partials } from "discord.js"

// Colors scheme
export const RanniColors = {
    error:  0xff0000, 
    debug:  0xd4ac0d,
    help:   0x384f7d,
    music:  0xf6efdd,
} as const

export type RanniColorType = typeof RanniColors[keyof typeof RanniColors]

export const ClientIntents = [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildVoiceStates
    ]

export const ClientPartials = [
        Partials.User,
        Partials.Message,
        Partials.Channel,
        Partials.ThreadMember,
    ]
