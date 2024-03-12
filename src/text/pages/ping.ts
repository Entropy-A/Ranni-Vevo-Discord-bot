import { RanniColors } from "../../utils/constants.js";
import { EmbedGenerator } from "../../utils/embedGenerator.js";
import { Page } from "../../types/pages.js";
import { ChatInputCommandInteraction, Interaction, LocaleString } from "discord.js";
import { Text, text } from "../index.js";

type pingPageData = {
    locale: LocaleString,
    icon: string,
    pingValue: number
}

export default function createPingPage(data: pingPageData): Page {
    const ping = ` \`${data.pingValue}ms\` `;
    const title = Text.get(text.commands.ping.title, data.locale);
    let message: string
    if (data.pingValue < 250) {
        message = Text.get(text.commands.ping.message.close, data.locale);
    } else if (data.pingValue < 500) {
        message = Text.get(text.commands.ping.message.normal, data.locale);
    } else {
        message = Text.get(text.commands.ping.message.slow, data.locale);
    }

    message = Text.insertInMessage([ping], message)

    return new Page({
        id: "pingCommand",
        embeds: [EmbedGenerator.Command(RanniColors.debug, data.icon, title, {description: message})]
    })
}