import { User, Client, Message, TextChannel, NewsChannel, GuildChannel, DMChannel } from "discord.js";

// -----------------------General utils-------------------------

export namespace MyUtils {

    //returns the message that was refferenced or returns false if no message was refferenced
    export async function repliedTo(user: User | Client, message: Message): Promise<Message | false> {
        if (!message.reference || !message.reference.messageId) return false

        const channel = message.channel
        const repliedMessage = await getMessage(channel, message.reference.messageId)

        if (user instanceof User) {
            if ( repliedMessage.author.username === user.username ) return repliedMessage
        }

        if (user instanceof Client) {
            if ( repliedMessage.author.id === message.client.user.id ) return repliedMessage
        }
        
        return false
    }

    //retruns message by channel and messageID
    export async function getMessage(channel: unknown, id: string): Promise<Message> {
        const messageChannel = channel as TextChannel || DMChannel || NewsChannel || GuildChannel 
        const message = await messageChannel.messages.fetch(id);
        return message;
    }

    //chunks items of array into matrix with given width 
    export function matrix<T>(items: T[], width: number): T[][] {
        //initialize matrix
        const chunks: T[][] = []

        for (let i = 0; i < items.length; i += width) {
            chunks.push(items.slice(i, i + width))
        }

        return chunks
    }

    //creates an ID by given arguments
    export function createId(context: string, namespace: string, ...args: unknown[]): string {
        return `${context};${namespace};${args.join(";")}`
    }
    
    //converts an ID by to an array
    export function readId(id: string): [namespace: string, ...args: string[]] {
        const [context, namespace, ...args] = id.split(";")
        return [context, namespace, ...args]
    }

    export function objectEmpty(object: Object) {
        if (Object.keys(object).length === 0) return true
        return false
    }

    /**
     * Accesses the deepest level values of an Object an keeps track of the nested path.
     * @returns {Object} {value: unkown, path: string[]}
     */
    export function getDeepestElements(object: Object, path: string[] = []): { value: unknown; path: string[] }[] {
        const values = [];

        // Returns the deepes value that's not an Object. Arrays will be returned as a whole.
        if (typeof object !== "object" || Array.isArray(object)) {
            values.push({ value: object, path });

        // Enters one level deeper in Object
        } else {
            const objectEntries = Object.entries(object);
            for (const [key, deeperObject] of objectEntries) {
                values.push(...getDeepestElements(deeperObject, [...path, key]));
            }
        }

        return values;
    }
}

// -----------------------Array Extentions-------------------------

export namespace MyArrayExtensions {

    //chooses a random elemnt from an Array
    export function sample<T>(array: T[]): T | undefined {
        if (array.length === 0) return undefined

        const randomIndex = Math.floor(array.length* Math.random())
        return array[randomIndex]
    }
}