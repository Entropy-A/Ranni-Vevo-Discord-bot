import { ButtonBuilder, ButtonStyle, EmbedBuilder, SlashCommandBuilder, StringSelectMenuBuilder, StringSelectMenuOptionBuilder, } from "discord.js";
import { Command } from "../../types/command.js";
import _ from "underscore";
import { PageButton, PageMenu,PageSelectMenu } from "../../types/pages.js";
import { defaultMessages } from "../../text/pages/default.js";
import { text } from "../../text/index.js";
import { RanniColors } from "../../utils/constants.js";
import { createCommandHelpPages, createHelpMenuPage } from "../../text/pages/help.js";
import { ButtonGenerator } from "../../utils/index.js";


const meta = new SlashCommandBuilder()
    .setName("help")
    .setDescription(text.commands.help.commandDescription.get("en-US"))
    .setDescriptionLocalizations(_.omit(text.commands.help.commandDescription.text, "en-US"))

const icon = "https://i.ibb.co/Pw20ZNN/Help-Icon-test.png"
const color = RanniColors.help
const detailedDescription = text.commands.help.detailedDescription

export default new Command({
    icon,
    color,
    detailedDescription,
    meta,
    callback: async ({ client, log, interaction}) => {

        try {

            const menu = createHelpMenuPage({locale: interaction.locale, icon})
            const commandPages = createCommandHelpPages({locale: interaction.locale, icon})

            // ------------------------------StringSelectMenu-----------------------------------

            // Options
            const options: StringSelectMenuOptionBuilder[] = []
            for (const [_category, pages] of Object.entries(commandPages)) {
                for (const page of pages) {
                    if (!page.data.id) break
                    const command: Command = client.commands.get(page.data.id) ?? ""
                    const option = new StringSelectMenuOptionBuilder()
                        .setLabel(`/${command.data.meta.name}`)
                        .setDescription(command.data.meta.description)
                        .setValue(page.data.id)   
                        //.setEmoji(":wave:")    ///////////////////////////////////// CHANGE FUTUTRE       
                    options.push(option)
                }
            }

            // StringSelect
            const selectMenuBuilder = new StringSelectMenuBuilder()
                .setPlaceholder("Choose a command for further elucidation") //// Maybe Change Future
                .setMaxValues(1)
                .setOptions(options)

            const selectMenu = new PageSelectMenu({
                id: "selectCommand",
                selectMenuBuilder,
                callback: ({interaction}) => {
                    const newPage = help.getPage(interaction.values[0])?.[0]
                    if (!newPage) return // future send error page
                    
                    help.updateTo(newPage)
                }
            })

            // ---------------------------------------Buttons---------------------------------- //////////////////////////////////////// FUTURE WORK ON /////////////////////
            const VisibilityCallback = () => {
                if (!help.data.currentPage || help.data.currentPage[0].data.id === "menu") return false
                else return true
            }
            
            // Next
            const nextButton = new PageButton({
                id: "nextButton",
                buttonBuilder: ButtonGenerator.Next(),
                VisibilityCallback,
                callback: () => {
                    help.defaulButtonCallbacks.absoluteNext(0)
                }
            })
            
            // Back
            const backButton = new PageButton({
                id: "backButton",
                buttonBuilder: ButtonGenerator.Back(),
                VisibilityCallback,
                callback: () => {
                    help.defaulButtonCallbacks.absoluteBack(0)
                }
            })

            // Menu
            const menuButton = new PageButton({
                id: "menu",
                buttonBuilder: ButtonGenerator.Menu(),
                VisibilityCallback,
                callback: () => {
                    help.updateTo(menu)
                }
            })

            // -----------------------------------------------------------------Page Menu--------------------------------------------------------------
            const help = new PageMenu({})
                .addPages([menu], "menu")
                .addDynamicEmbedUpdate(({page}) => {
                    
                    // Create footerField
                    if (page.data.id === "menu") return (page.data.embeds as EmbedBuilder[])
                    let index = help.getPage(page)?.[2]
                    if (index === undefined) return (page.data.embeds as EmbedBuilder[])
                    index++

                    const category = help.getCategory(page) ?? undefined
                    if (!category) return (page.data.embeds as EmbedBuilder[])
                    const categoryLink = "https://www.youtube.com/watch?v=d43lJsK7Kvo" ////// CHANGE FUTURE WEBSITE DOCUMENTATION


                    const name = "\u200B"
                    const value = text.commands.help.commandFooter.insertInMessage([
                        (text.commands.categorys as any)[category[1]].name.get(interaction.locale) ?? category[1], 
                        categoryLink, 
                        index.toString(), 
                        category[0].length.toString()],
                    interaction.locale)
                    
                    // That the fields don't get added multiple times if called repeatetly
                    const fields = page.data.embeds?.[0].data.fields
                    if (!fields) return (page.data.embeds as EmbedBuilder[])
                    if (fields?.length > 2) fields.pop()
                    fields.push({name, value})
                    
                    page.data.embeds?.[0].setFields(fields)

                    return (page.data.embeds as EmbedBuilder[])
                })
                .addCategorys(commandPages)
                .addSelectMenus([selectMenu])
                .addButtons([backButton, menuButton, nextButton])
                
            help.reply(menu, interaction, undefined, true)
        
        } catch (error) {
            log(error)
            defaultMessages.commandError(interaction)
        }
    } 
})