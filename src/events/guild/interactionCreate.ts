import { ChatInputCommandInteraction, CommandInteraction} from "discord.js";
//import { text } from "../../text/index.js";
import { EventLog, Events, Event } from "../../types/event.js";
import MyClient from "../../types/client.js";
import { Command } from "../../types/command.js";
import { defaultMessages } from "../../text/pages/default.js";

export default new Event({
  key: Events.InteractionCreate,
  callback: async({client, log }, interaction) => {

    switch(true) {

      case interaction.isChatInputCommand(): 
        // So it looks smoother if any error occurs, uncommnt: if (!interaction.isChatInputCommand()) return
        executeCommand((interaction as ChatInputCommandInteraction), client, log);
        break;

      default:
        return 
    }
  }
})

function executeCommand(interaction: ChatInputCommandInteraction, client: MyClient, log: EventLog) {
  
  try {

    const commandName = interaction.commandName;
    const command: Command = client.commands.get(commandName);
    const log = console.log.bind(console, `[${commandName}]`)

    if (!command) throw new Error(`Could not resolve the command with name "${commandName}"`);
    if (!interaction.isChatInputCommand()) throw new Error("Can't react with command to an interaction that is not ChatInputCommand.");

    return command.data.callback({ client, log, interaction })

  } catch (error) {

    if (!interaction.isChatInputCommand()) return
    log(`[Command Error] at [${interaction.commandName}] `,error);
    defaultMessages.commandError(interaction)
  }
}