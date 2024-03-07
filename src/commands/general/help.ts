import {  ButtonBuilder, ButtonStyle, EmbedBuilder, SlashCommandBuilder, StringSelectMenuBuilder, StringSelectMenuOptionBuilder, } from "discord.js";
import { Command } from "../../types/command.js";
import _ from "underscore";
import { Page, MyColors, PageButton, PageMenu, CategoryPages, PageSelectMenu, defaultMessages, commandErrorMessage } from "../../types/pages.js";
import { Text, text } from "../../text/index.js";
import commands from "../index.js";


const meta = new SlashCommandBuilder()
    .setName("help")
    .setDescription(text.commands.help.commandDescription["en"])
    .setDescriptionLocalizations(_.omit(text.commands.help.commandDescription, "en"))

const icon = "https://i.ibb.co/Pw20ZNN/Help-Icon-test.png"
const detailedDescription = text.commands.help.detailedDescription

export default new Command({
    icon,
    detailedDescription,
    meta,
    callback: async ({ client, log, interaction}) => {

        try {
            // -----------------------------------------------------------------Help Menu Page--------------------------------------------------------------

            // Help banner (Format: 728x90)
            const helpBanner = new EmbedBuilder()
                .setImage("https://i.ibb.co/jJ6VXnV/ranni-the-witch-elden-ring1920v3.png") //////////////////////////////////////////////////////// Change Futurre
            
            // Menu page:        
            const menuEmbed = new EmbedBuilder()
                .setAuthor({name: Text.get(text.commands.help.menu.title, interaction.locale), iconURL: icon})
                .setDescription(Text.get(text.commands.help.menu.description, interaction.locale))
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
                    menuEmbed.addFields({name: `${category.data.emoji ?? "" } ${Text.get(category.data.name, interaction.locale)}`, value: commands.join(" ") + "\n" + Text.get(category.data.description, interaction.locale), inline: false})
                }
            }
            menuEmbed.addFields({name: "\u200B", value: "\u200B", inline: false}, /////////////////////////////////////////////// Change later
                                {name: "Website", value: "[ranni.vevo](https://www.youtube.com/watch?v=d43lJsK7Kvo)", inline: true},
                                {name: "Invite me!", value: "[Ranni Vevo](https://www.youtube.com/watch?v=d43lJsK7Kvo)", inline: true},
                                {name: "Join me guild!", value: "[Ranni's Tower](https://www.youtube.com/watch?v=d43lJsK7Kvo)", inline: true})
            // menuEmbed.addFields({name: "\u200B", value: "Developed by **SR FLORENT**"})
            const menu = new Page({id: "menu"})
                .setEmbeds([helpBanner, menuEmbed], MyColors.help)

            // -----------------------------------------------------------------Detailed Help Pages--------------------------------------------------------------

            // Commands:
            // Creates Auto Autopages for every Command.
            let commandPages: CategoryPages = {}
            for (const category of commands) {
                const categoryId = category.data.name["en"].toLowerCase()
                commandPages[categoryId] = []

                for (const command of category.data.commands) {

                    const detailedDescription = command.data.detailedDescription
                    if (!detailedDescription || !command.data.meta.name) {
                        break
                    }

                    const title = Text.get(detailedDescription.title, interaction.locale)
                    const description = Text.get(detailedDescription.description, interaction.locale)
                    const syntax = Text.get(detailedDescription.syntax, interaction.locale)
                    const returns = Text.get(detailedDescription.returns, interaction.locale)

                    const commandPage = new Page({
                        id: command.data.meta.name,
                        embeds: [
                            new EmbedBuilder()
                                .setAuthor({name: Text.get(text.commands.help.commandTitle, interaction.locale), iconURL: icon})
                                .setTitle(title)
                                .setDescription(":wave: " + description) ///////////////////////////// CHANGE EMOJI
                                .addFields({name: Text.get(text.commands.help.commandFieldNames.syntax, interaction.locale), value: syntax, inline: true}, {name: Text.get(text.commands.help.commandFieldNames.returns, interaction.locale), value: returns, inline: true})
                                .setThumbnail("https://i.ibb.co/cgKVZ6N/ranni1.png")
                            ]
                    }).setColor(MyColors.help)
                    commandPages[categoryId].push(commandPage)
                }
            }

            // -------------------StringSelectMenu----------------------

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
                    selectMenuBuilder
                })
                .setCallback(({interaction}) => {
                    const newPage = help.getPageById(interaction.values[0])?.[0]
                    if (!newPage) return // future send error page
                    
                    help.updateTo(newPage)
                })

            // -------------------Buttons---------------------- ///////////////////////////////////////////////////// FUTURE WORK ON /////////////////////

            // Next in category
            const nextButtunBuilder = new ButtonBuilder()
                .setStyle(ButtonStyle.Success)
                .setLabel("Next")
                //.setEmoji(":arrow_forward:") ///////////////////////////// CHANGE LATER
            
                const nextButton = new PageButton({
                    id: "nextButton",
                    buttonBuilder: nextButtunBuilder
                })

            // Back in category
            const backButtunBuilder = new ButtonBuilder()
                .setStyle(ButtonStyle.Danger)
                .setLabel("Back")
                //.setEmoji(":arrow_forward:") ///////////////////////////// CHANGE LATER
            
                const backButton = new PageButton({
                    id: "backButton",
                    buttonBuilder: backButtunBuilder
                })

            // Back to menu
            const menuButtunBuilder = new ButtonBuilder()
                .setStyle(ButtonStyle.Secondary)
                .setLabel("Menu")
                //.setEmoji(":arrow_forward:") ///////////////////////////// CHANGE LATER
            
                const menuButton = new PageButton({
                    id: "menu",
                    buttonBuilder: menuButtunBuilder
                })
                .setVisibilityCallback(() => {
                    if (!help.data.currentPage || help.data.currentPage[0].data.id === "menu") return false
                    else return true
                })
                .setCallback(() => {
                    help.updateTo("menu")
                })

            // -----------------------------------------------------------------Page Menu--------------------------------------------------------------

            const help = new PageMenu({})
                .addPages([menu], "menu")
                .addDynamicEmbedUpdate(({page}) => {
                    // Create footerField

                    if (page.data.id === "menu") return (page.data.embeds as EmbedBuilder[])
                    let index = help.getPageByMember(page)?.[2]
                    if (index === undefined) return (page.data.embeds as EmbedBuilder[])
                    index++

                    const category = help.getCategoryByMember(page) ?? undefined
                    if (!category) return (page.data.embeds as EmbedBuilder[])
                    const categoryLink = "https://www.youtube.com/watch?v=d43lJsK7Kvo" ////// CHANGE FUTURE WEBSITE DOCUMENTATION


                    const name = "\u200B"
                    const value = Text.insertInMessage([(Text.get((text.commands.categorys as any)[category[1]].name, interaction.locale) ?? category[1]), categoryLink, index.toString(), category[0].length.toString()], Text.get(text.commands.help.commandFooter, interaction.locale))
                    
                    // That the fields don't get added multiple times if called repeatetly
                    const fields = page.data.embeds?.[0].data.fields
                    if (!fields) return (page.data.embeds as EmbedBuilder[])
                    if (fields?.length > 2) fields.pop()
                    fields.push({name, value})
                    
                    page.data.embeds?.[0].setFields(fields)

                    return (page.data.embeds as EmbedBuilder[])
                })

            // Adds all categorys created for each category of a command
            help.addCategorys(commandPages)
            help.addSelectMenus([selectMenu])
            help.addButtons([/* backButton,  */ menuButton /*, nextButton */])
            help.reply(menu, client, interaction, undefined, true)
        
        } catch (error) {
            log(error)
            commandErrorMessage(client, interaction, defaultMessages.commandError)
        }
    } 
})