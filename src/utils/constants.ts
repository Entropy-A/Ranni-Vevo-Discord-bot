import { GatewayIntentBits, Partials } from "discord.js"

// Colors scheme
export const RanniColors = {
    error:  0xff0000, 
    debug:  0xd4ac0d,
    help:   0x384f7d,
    music:  0xf6efdd,
} as const
export type RanniColorType = typeof RanniColors[keyof typeof RanniColors]

// Images
export const Images = {
    ranni: {
        avatar: "https://i.ibb.co/cgKVZ6N/ranni1.png",
    },
    debug: {
        line:   "https://i.ibb.co/Yp5skkC/debug-Bottom-Line.png"
    },
    help: {
        banner: "https://i.ibb.co/jJ6VXnV/ranni-the-witch-elden-ring1920v3.png",
        line:   "https://i.ibb.co/7Xnz3q5/help-Bottom-Line.png"
    },
    error: {
        bluescreen: "https://support.content.office.net/de-de/media/4c10ecfd-3008-4b00-9f98-d41b6f899c2d.png",
    },
} as const
export type ImageType = typeof Images[keyof typeof Images]

// Emojis
export const Emojis = {
    detailedCommandhelp: ":wave:"
} as const
export type EmojiType = typeof Emojis[keyof typeof Emojis]

// Button Icons (Emojis)
export const ButtonIcons = {
    next:  "", 
    back:  "",
    menu:  "",
} as const
export type ButtonIconType = typeof ButtonIcons[keyof typeof ButtonIcons]

// SelectMenu Icons (Emojis)
export const SelectMenuIcons = {
    unkown: "",
} as const
export type SelectMenuIconType = typeof SelectMenuIcons[keyof typeof SelectMenuIcons]

// Client config
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