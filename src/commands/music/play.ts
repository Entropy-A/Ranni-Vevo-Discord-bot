import { SlashCommandBuilder, GuildMember } from "discord.js";
import { Command } from "../../types/command.js";
import { Text, text } from "../../text/index.js";
import _ from "underscore";
import { Player } from "discord-player";

const meta = new SlashCommandBuilder()
    .setName("play")
    .setDescription(text.commands.play.commandDescription["en-US"])
    .setDescriptionLocalizations(_.omit(text.commands.play.commandDescription, "en-US"))
    .addStringOption((option) => option.setName("title").setDescription("Title or url of the requested song.").setRequired(true))

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
        let title = interaction.options.getString("title")
        if (!title) return interaction.reply("error3")

        await interaction.deferReply()

        try {
            const { track } = await player.play(channel, title, {
                nodeOptions: {
                    // nodeOptions are the options for guild node (aka your queue in simple word)
                    metadata: interaction // we can access this metadata object using queue.metadata later on
                }
            });
    
            return interaction.followUp(`**${track.title}** enqueued!`);
        } catch (error) {
            // let's return error if something failed
            log(error)
            return interaction.followUp(`Something went wrong: ${error}`);
        }
    }
})