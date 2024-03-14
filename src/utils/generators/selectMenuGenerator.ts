import { StringSelectMenuBuilder, RoleSelectMenuBuilder, UserSelectMenuBuilder, ChannelSelectMenuBuilder} from "discord.js";

type StringInit = ConstructorParameters<typeof StringSelectMenuBuilder>[0]
type RoleInit = ConstructorParameters<typeof RoleSelectMenuBuilder>[0]
type UserInit = ConstructorParameters<typeof UserSelectMenuBuilder>[0]
type ChannelInit = ConstructorParameters<typeof ChannelSelectMenuBuilder>[0]

export class StringSelectGenerator extends StringSelectMenuBuilder {

    public static create(data?: StringInit) {
        return new StringSelectMenuBuilder(data)
    }
}