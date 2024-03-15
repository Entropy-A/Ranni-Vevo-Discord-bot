import { Emojis, Images, RanniColors } from "../../utils/constants.js";
import { EmbedGenerator } from "../../utils/generators/embedGenerator.js";
import { Page, CategoryPages } from "../../types/pages.js";
import commands from "../../commands/index.js";
import { LocaleString } from "discord.js";
import { text } from "../index.js";

// --------------------------------------------------------Help Menu Page--------------------------------------------------------------
type HelpMenuData = {
    locale: LocaleString
    icon: string
}

export function createHelpMenuPage(data: HelpMenuData): Page {

    // Menu page       
    const menuEmbed = EmbedGenerator.Command(
        RanniColors.help, 
        data.icon,
        text.commands.help.menu.title.get(data.locale), 
        {
            description: text.commands.help.menu.description.get(data.locale)
        }
    )

    // Menu fields for every category
    for (const category of commands) {
        if (category.data.description && category.data.name) {
            
            // Get the commands of category
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
                    string = "• " + `**${command.data.meta.name}**`
                }
                commands.push(string)
            }
            menuEmbed.addFields({
                name: `${category.data.emoji ?? "" } ${category.data.name.get(data.locale)}`, 
                value: commands.join(" ") + "\n" + category.data.description.get(data.locale) + "\n\u200B",
                inline: false
            })
        }
    }

    // Footer Fields
    menuEmbed.addFields(
        {name: "Website", value: "[ranni.vevo](https://www.youtube.com/watch?v=d43lJsK7Kvo)", inline: true},                        
        {name: "Invite me!", value: "[Ranni Vevo](https://www.youtube.com/watch?v=d43lJsK7Kvo)", inline: true},          
        {name: "Join me guild!", value: "[Ranni's Tower](https://www.youtube.com/watch?v=d43lJsK7Kvo)", inline: true},                        
        {name: "\u200B", value: "Developed by **ENTROPY A** [*](https://github.com/Entropy-A)", inline: false}
    )

    return new Page({
        id: "menu",
        color: RanniColors.help,
        embeds: [
            EmbedGenerator.Banner(Images.help.banner),
            menuEmbed
        ]
    })
}

// -----------------------------------------------------------Detailed Help Pages-------------------------------------------------------
type CommandHelpData = {
    locale: LocaleString
    icon: string
}

export function createCommandHelpPages(data: CommandHelpData): CategoryPages {

    // Creates autopages for every command.
    let commandPages: CategoryPages = {}
    for (const category of commands) {

        const categoryId = category.data.name.get("en-US").toLowerCase()
        commandPages[categoryId] = []

        for (const command of category.data.commands) {

            const detailedDescription = command.data.detailedDescription
            if (!detailedDescription || !command.data.meta.name) {
                break
            }

            const title = detailedDescription.title.get(data.locale)
            const description = detailedDescription.description.get(data.locale)
            const syntax = detailedDescription.syntax.get(data.locale)
            const returns = detailedDescription.returns.get(data.locale)

            const commandPage = new Page({
                id: command.data.meta.name,
                embeds: [EmbedGenerator.Command(RanniColors.help, data.icon, text.commands.help.commandTitle.get(data.locale), {
                    thumbnail: {url: Images.ranni.avatar},
                    title,
                    description: Emojis.detailedCommandhelp + " " + description,
                    fields: [
                        {name: text.commands.help.commandFieldNames.syntax.get(data.locale), value: syntax, inline: true},
                        {name: text.commands.help.commandFieldNames.returns.get(data.locale), value: returns, inline: true}
                    ]
                })]
            })
            commandPages[categoryId].push(commandPage)
        }
    }
    return commandPages
}