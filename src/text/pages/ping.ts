import { RanniColors } from "../../utils/constants.js";
import { EmbedGenerator } from "../../utils/generators/embedGenerator.js";
import { Page } from "../../types/pages.js";
import { LocaleString } from "discord.js";
import { text } from "../index.js";

type pingPageData = {
    locale: LocaleString,
    icon: string,
    pingValue: number
}

export default function createPingPage(data: pingPageData): Page {
    const ping = ` \`${data.pingValue}ms\` `;
    const title = text.commands.ping.title.get(data.locale);
    let message: string
    if (data.pingValue < 250) {
        message = text.commands.ping.message.close.insertInMessage([ping], data.locale);
    } else if (data.pingValue < 500) {
        message = text.commands.ping.message.normal.insertInMessage([ping], data.locale);
    } else {
        message = text.commands.ping.message.slow.insertInMessage([ping], data.locale);
    }

    return new Page({
        id: "pingCommand",
        embeds: [EmbedGenerator.Command(RanniColors.debug, data.icon, title, {description: message})]
    })
}