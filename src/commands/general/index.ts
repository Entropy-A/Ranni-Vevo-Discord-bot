import { text } from "../../text/index.js";
import { CommandCategory } from "../../types/command.js";
import help from "./help.js";

export default new CommandCategory({
    name: text.commands.categorys.general.name,
    commands: [
        help
    ],
    emoji: ":unlock:",
    description: text.commands.categorys.general.description
})