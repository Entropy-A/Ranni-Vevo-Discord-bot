import { text } from "../../text/index.js";
import { CommandCategory } from "../../types/command.js";
import play from "./play.js";
import skip from "./skip.js";

export default new CommandCategory({
    name: text.commands.categorys.music.name,
    commands: [
        play,
        skip
    ],
    emoji: ":musical_notes:",
    description: text.commands.categorys.music.description,
}) 