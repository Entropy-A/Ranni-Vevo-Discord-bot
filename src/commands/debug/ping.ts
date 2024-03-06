import { SlashCommandBuilder, EmbedBuilder } from "discord.js";
import { Command} from "../../types/command.js";
import _ from "underscore";
import { Text, text} from "../../text/index.js";
import { MyColors, Page, commandErrorMessage, defaultMessages } from "../../types/pages.js";


const meta = new SlashCommandBuilder()
    .setName("ping")
    .setDescription(text.commands.ping.commandDescription["en"])
    .setDescriptionLocalizations(_.omit(text.commands.ping.commandDescription, "en"))

const icon = "https://cdn.pixabay.com/photo/2022/05/23/16/05/table-tennis-7216579_1280.png"
const detailedDescription = text.commands.ping.detailedDescription

export default new Command({
    icon,
    detailedDescription,
    meta,
    callback: async({ client, interaction , log}) => {

        try {

            interaction.deferReply({ephemeral: true});
            const timeStamp = await interaction.fetchReply();
            const ping_ = timeStamp.createdTimestamp - interaction.createdTimestamp
            const ping = ` \`${ping_}ms\` `;
            const title = Text.get(text.commands.ping.title, interaction.locale);
            let message: string
            if (ping_ < 250) {
                message = Text.get(text.commands.ping.message.close, interaction.locale);
            } else if (ping_ < 500) {
                message = Text.get(text.commands.ping.message.normal, interaction.locale);
            } else {
                message = Text.get(text.commands.ping.message.slow, interaction.locale);
            }

            message = Text.insertInMessage([ping], message)

            const reply = new Page({
                id: "pingCommand", 
                embeds: [
                    new EmbedBuilder()
                        .setAuthor({name: title, iconURL: icon})
                        .setDescription(message)
                ]
                })
            reply.setColor(MyColors.debug)

            return reply.followUp(client, interaction, 60000, true);

        } catch (error) {

            log(error)
            commandErrorMessage(client, interaction, defaultMessages.commandError)
        }
    }
})