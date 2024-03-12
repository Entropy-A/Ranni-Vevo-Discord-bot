import { EmbedBuilder } from "discord.js";
import { RanniColorType, RanniColors } from "./constants.js";
import { useClient } from "../hooks/useClient.js";

type EmbedInit = ConstructorParameters<typeof EmbedBuilder>[0]

export class EmbedGenerator extends EmbedBuilder {
    public client: ReturnType<typeof useClient> | null = null

    public static Error(data?: EmbedInit) {
        return EmbedGenerator.create(data).setColor(RanniColors.error)
    }

    public static Command(color: RanniColorType, icon: string, title: string, data?: EmbedInit) {
        return EmbedGenerator.create(data).setColor(color).setAuthor({name: title, iconURL: icon})
    }

    public static create(data?: EmbedInit) {
        const client = useClient()
        return new EmbedGenerator(data).setClient(client)
    }

    public setClient(client: ReturnType<typeof useClient>) {
        this.client = client
        return this
    }
}