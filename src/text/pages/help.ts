import { RanniColors } from "../../utils/constants.js";
import { EmbedGenerator } from "../../utils/embedGenerator.js";
import { Page } from "../../types/pages.js";
import commands from "../../commands/index.js";
import { LocaleString } from "discord.js";
import { Text, text } from "../index.js";
import { CategoryPages } from "../../types/pages.js";

// --------------------------------------------------------Help Menu Page--------------------------------------------------------------

type HelpMenuData = {
    locale: LocaleString
    icon: string
}

export function createHelpMenuPage(data: HelpMenuData): Page {

    // Help banner (Format: 728x90)
    const helpBanner = EmbedGenerator.create().setImage("https://i.ibb.co/jJ6VXnV/ranni-the-witch-elden-ring1920v3.png") /////////////////////////////// Change Future
    
    // Menu page       
    const menuEmbed = EmbedGenerator.Command(RanniColors.help, data.icon, Text.get(text.commands.help.menu.title, data.locale))
        .setDescription(Text.get(text.commands.help.menu.description, data.locale))
        .setImage("https://i.ibb.co/Kj1VMCY/7582555-100000001-developed14.png") ////////////// To Fix size Change Future

    // Menu fields for every category
    for (const category of commands) {
        if (category.data.description && category.data.name) {
            
            // Get the commands of category (Future: make them clickable)
            const commands = []
            for (const command of category.data.commands) {
                if (!command.data.meta.name) break
                let string: string = ""

                // Clickable commands
                if(command.data.id) {
                    string = `• </${command.data.meta.name}:${command.data.id}>`
                }
                // Unclickable commands
                else {
                    string = "• " + command.data.meta.name
                }
                commands.push(string)
            }
            menuEmbed.addFields({name: `${category.data.emoji ?? "" } ${Text.get(category.data.name, data.locale)}`, value: commands.join(" ") + "\n" + Text.get(category.data.description, data.locale), inline: false})
        }
    }

    // Footer Fields
    menuEmbed.addFields({name: "\u200B", value: "\u200B", inline: false}, /////////////////////////////////////////////// Change later
                        {name: "Website", value: "[ranni.vevo](https://www.youtube.com/watch?v=d43lJsK7Kvo)", inline: true},
                        {name: "Invite me!", value: "[Ranni Vevo](https://www.youtube.com/watch?v=d43lJsK7Kvo)", inline: true},
                        {name: "Join me guild!", value: "[Ranni's Tower](https://www.youtube.com/watch?v=d43lJsK7Kvo)", inline: true})
    // menuEmbed.addFields({name: "\u200B", value: "Developed by **SR FLORENT**"})

    return new Page({
        id: "menu",
        embeds: [helpBanner, menuEmbed]
    }).setColor(RanniColors.help)
}

// -----------------------------------------------------------------Detailed Help Pages--------------------------------------------------------------

type CommandHelpData = {
    locale: LocaleString
    icon: string
}

export function createCommandHelpPages(data: CommandHelpData): CategoryPages {

    // Creates autopages for every command.
    let commandPages: CategoryPages = {}
    for (const category of commands) {

        const categoryId = category.data.name["en-US"].toLowerCase()
        commandPages[categoryId] = []

        for (const command of category.data.commands) {

            const detailedDescription = command.data.detailedDescription
            if (!detailedDescription || !command.data.meta.name) {
                break
            }

            const title = Text.get(detailedDescription.title, data.locale)
            const description = Text.get(detailedDescription.description, data.locale)
            const syntax = Text.get(detailedDescription.syntax, data.locale)
            const returns = Text.get(detailedDescription.returns, data.locale)

            const commandPage = new Page({
                id: command.data.meta.name,
                embeds: [EmbedGenerator.Command(RanniColors.help, data.icon, Text.get(text.commands.help.commandTitle, data.locale), {
                    thumbnail: {url: "https://i.ibb.co/cgKVZ6N/ranni1.png"},
                    title,
                    description: ":wave: " + description,
                    fields: [
                        {name: Text.get(text.commands.help.commandFieldNames.syntax, data.locale), value: syntax, inline: true},
                        {name: Text.get(text.commands.help.commandFieldNames.returns, data.locale), value: returns, inline: true}
                    ]
                })]
            })
            
            commandPages[categoryId].push(commandPage)
        }
    }

    return commandPages
}