import { text } from "../../text/index.js";
import { CommandCategory } from "../../types/command.js";
import ping from "./ping.js";

export default new CommandCategory ({
    name: text.commands.categorys.debug.name, 
    commands: [
       ping
    ],
    emoji: ":tools:",
    description: text.commands.categorys.debug.description,
})