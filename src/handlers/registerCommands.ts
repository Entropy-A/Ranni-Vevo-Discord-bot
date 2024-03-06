import MyClient from "../types/client.js";
import { Command, CommandCategory } from "../types/command.js";

export async function registerCommands(client: MyClient, commands: CommandCategory[]) {

    const allCommands = commands.map(({ data: {commands} }) => commands).flat()
    allCommands.forEach((command) => {
        client.commands.set(command.data.meta.name, command);
    });

    if (!client.application) throw new Error("client.application was not defined")
    client.application.commands.set(allCommands.map(({data}) => data.meta)).then(commands => {
        commands.forEach( command => {
            const rawCommand: Command = client.commands.get(command.name)

            rawCommand.data.id = command.id
            
            client.commands.set(command.name, rawCommand)
        })
    })
}