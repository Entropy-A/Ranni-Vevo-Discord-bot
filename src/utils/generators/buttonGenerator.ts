import { ButtonBuilder, ButtonStyle } from "discord.js";

type ButtonInit = ConstructorParameters<typeof ButtonBuilder>[0]

export class ButtonGenerator extends ButtonBuilder {
    public static Menu(data?: ButtonInit) {
        return this.create(data)
            .setStyle(ButtonStyle.Secondary)
            .setLabel("Menu") //////////////////////////////// Dynamic text in Future
    }

    public static create(data?: ButtonInit) {
        return new ButtonBuilder(data)
    }
}