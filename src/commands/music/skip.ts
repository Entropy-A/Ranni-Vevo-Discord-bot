import { SlashCommandBuilder, GuildMember } from "discord.js";
import { Command } from "../../types/command.js";
import { Text, text } from "../../text/index.js";
import _ from "underscore";
import { Player } from "discord-player";

const meta = new SlashCommandBuilder()
    .setName("skip")
    .setDescription(text.commands.play.commandDescription.get("en-US"))
    .setDescriptionLocalizations(_.omit(text.commands.play.commandDescription.text, "en-US"))

const icon = ":arrow_forward:"
const color = 0
const detailedDescription = text.commands.play.detailedDescription

export default new Command({
    icon,
    color,
    detailedDescription,
    meta,
    callback: async ({client, interaction, log}) => {

        const player = client.player
        if (!(interaction.member instanceof GuildMember)) return interaction.reply("error1")
        const channel = interaction.member.voice.channel
        if (!channel) return interaction.reply("error2")
        if (!interaction.guild?.id) return 
        const queue = player.queues.get(interaction.guild?.id)

        await interaction.deferReply()

        try {
            await queue?.node.skip()
            return interaction.followUp(`Skipped to: ${queue?.tracks.toArray()[0]}`);
        } catch (error) {
            // let's return error if something failed
            log(error)
            return interaction.followUp(`Something went wrong: ${error}`);
        }
    }
})