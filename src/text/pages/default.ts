import { ChatInputCommandInteraction } from "discord.js"
import { EmbedGenerator } from "../../utils/generators/embedGenerator.js"
import { Page } from "../../types/pages.js"
import { Text, text } from "../index.js"
import { Images } from "../../utils/constants.js"

export const defaultMessages = {
    // Future Send Ticket for Error to Website / Report Error
    commandError(interaction: ChatInputCommandInteraction) {
        const errorPage = new Page({id: "commandError", embeds: [
            EmbedGenerator.Error({
                author: {
                    name: text.error.failedCommand.get(interaction.locale),
                    iconURL: "https://thumbs.dreamstime.com/z/blue-icon-symbol-sad-face-4651546.jpg",
                    url: undefined
                },
                image: {url: Images.error.bluescreen}
            })
        ]})
    
        if (interaction.deferred || interaction.replied) {
          return errorPage.followUp(interaction, undefined, true)
        }
    
        else return errorPage.reply(interaction, undefined, true)
    },

} as const 
export type DefaultMessageType = typeof defaultMessages[keyof typeof defaultMessages]