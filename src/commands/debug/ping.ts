import { SlashCommandBuilder, EmbedBuilder } from "discord.js";
import { Command} from "../../types/command.js";
import _ from "underscore";
import { Text, text} from "../../text/index.js";
import { Page } from "../../types/pages.js";
import { defaultMessages } from "../../text/pages/default.js";
import { RanniColors } from "../../utils/constants.js";
import { EmbedGenerator } from "../../utils/embedGenerator.js";
import createPingPage from "../../text/pages/ping.js";


const meta = new SlashCommandBuilder()
    .setName("ping")
    .setDescription(text.commands.ping.commandDescription.get("en-US"))
    .setDescriptionLocalizations(_.omit(text.commands.ping.commandDescription.text, "en-US"))

const icon = "https://cdn.pixabay.com/photo/2022/05/23/16/05/table-tennis-7216579_1280.png"
const color = RanniColors.debug
const detailedDescription = text.commands.ping.detailedDescription

export default new Command({
    icon,
    color,
    detailedDescription,
    meta,
    callback: async({ client, interaction , log}) => {

        try {

            interaction.deferReply({ephemeral: true});
            const timeStamp = await interaction.fetchReply();
            const locale = interaction.locale
            const pingValue = timeStamp.createdTimestamp - interaction.createdTimestamp
            
            createPingPage({locale, icon, pingValue}).followUp(interaction, 60000, true);

        } catch (error) {

            log(error)
            defaultMessages.commandError(interaction)
        }
    }
})