import { SlashCommandBuilder, GuildMember } from "discord.js";
import { Command } from "../../types/command.js";
import { Text, text } from "../../text/index.js";
import _ from "underscore";

const meta = new SlashCommandBuilder()
    .setName("play")
    .setDescription(text.commands.play.commandDescription["en"])
    .setDescriptionLocalizations(_.omit(text.commands.play.commandDescription, "en"))
    .addStringOption((option) => option.setName("url").setDescription("song url").setRequired(true))

const icon = ":arrow_forward:"
const detailedDescription = text.commands.play.detailedDescription

export default new Command({
    icon,
    detailedDescription,
    meta,
    callback: ({client, interaction, log}) => {
        if (!(interaction.member instanceof GuildMember)) return interaction.reply("not")

        if(!interaction.member.voice.channel) return interaction.reply("not")

    }
})