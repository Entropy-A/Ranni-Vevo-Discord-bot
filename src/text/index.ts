import fs from "fs";
import { MyJSON } from "../utils/MyJSON.js";
import { plainToInstance } from "class-transformer";
import { MyUtils } from "../utils/MyUtils.js";
import { LocaleString } from "discord.js";

// -----------To Do----------------
// Documentation / Types

// Bluepront for command in Language files
/* "commands":{  
    "categorys": {
        "CATEGORYNAME": {
            "name": "",
            "emoji": "",
            "description": ""
        },
        
    },

    "COMMANDNAME": {
        "commandDescription": "",
        "detailedDescription": {
            "title": "",
            "description": "",
            "syntax": "",
            "returns": ""
        } */

export type LocaleText = Record<LocaleString, string>
export type LocaleTextFiles = {
    error: {
        failedCommand: LocaleText
    }, 

    commands: {
        categorys: {
            general: {
                name: LocaleText,
                description: LocaleText
            },

            debug: {
                name: LocaleText,
                description: LocaleText
            },

            music: {
                name: LocaleText,
                description: LocaleText
            }
        },

        ping: {
            name: LocaleText,
            icon: LocaleText,
            commandDescription: LocaleText,
            detailedDescription: {
                title: LocaleText,
                description: LocaleText,
                syntax: LocaleText,
                returns: LocaleText
            },

            title: LocaleText,
            message: {
                close: LocaleText,
                normal: LocaleText,
                slow: LocaleText
            }
        },

        help: {
            name: LocaleText,
            icon: LocaleText,
            commandDescription: LocaleText,
            detailedDescription: {
                title: LocaleText,
                description: LocaleText,
                syntax: LocaleText,
                returns: LocaleText
            },

            menu: {
                title: LocaleText,           
                description: LocaleText,
            },

            commandFieldNames:{
                syntax: LocaleText,
                returns: LocaleText
            },

            commandTitle: LocaleText
            commandFooter: LocaleText
        },

        play: {
            commandDescription: LocaleText,
            detailedDescription: {
                title: LocaleText,
                description: LocaleText,
                syntax: LocaleText,
                returns: LocaleText
            }
        }
    }
}

/**
 * The custom Text class used to contain every specified language file in a Discord Locale object. 
 * @see Must always be updated to match Language File.
 * @param {LocaleTextFiles} data 
 */
export class Text {
    data: LocaleTextFiles

    // Constructor checks if every Property was defined
    constructor(data: LocaleTextFiles) {
        for (const element of MyUtils.getDeepestElements(data)) {
            if(element.value === undefined) throw new Error(`[Text] [${element.path.join(".")}] is missing.`);
        }
        this.data = data
    }

    /**
     * Replaces "[]" in a string with strings of an array in order.
     * @param strings Takes in a string of strings, that will be entered in ascending index order. (Ex.: [first, second, third, ...])
     * @param message Takes in a string in with the strings should be entered.
     */
    static insertInMessage(strings: string[], message: string) {
        let pendingMessage = message;

        for (const string of strings) {
            let i = pendingMessage.indexOf("[]");
            if (i < 0) throw new Error(`[InsertInMessage Error] List ${strings} contains MORE strings than [spaces] exist in provided string [${message}].`);
            pendingMessage = pendingMessage.slice(0, i) + string + pendingMessage.slice(i + 2);
        }

        if (pendingMessage.indexOf("[]") > -1) throw new Error(`[InsertInMessage Error] List [${strings}] contains LESS strings than [spaces] exist in provided string [${message}].`);
        return pendingMessage;
    }

    /**
     * Returns the correct string according to specified location. Handles undefined problems.
     * @param property Property of text.
     * @param locale Location string.
     */
    static get(property: LocaleText, locale: LocaleString | undefined): string {
        if (!property) throw new Error(`[Text] Accessed property does not exist in language file(s).`)
        if (!locale) return property["en-US"]
        if (property[locale]) return property[locale]
        else if (property["en-US"]) return property["en-US"]
        else throw new Error(`[Text] property was not defined in language file(s).`)
    }
}

// Creates an Object with each language and its id as key and the JSON file as value.
const files = fs.readdirSync("src/text/languages");
const languages: Record<string, Object> = {};
for (const file of files) {
    const id: string = file.split(".")[1];
    languages[id] = plainToInstance(Object, MyJSON.parse(`src/text/languages/${file}`));
}

// Creates a emptry text Object as Type Text to get the property skelett.
let data: LocaleTextFiles = {} as LocaleTextFiles

// Fuses all different langues text files to one big object using the Discord Local Object.
for (const [id, language] of Object.entries(languages)) {
    const results = MyUtils.getDeepestElements(language);

    // Runs through each language file
    for (const result of results) {
        let currentTree: any = data;

        // Creates new tree for each Object in language file
        for (const path of result.path) {
            // If tree does not already exist
            if (!currentTree[path]) {
                currentTree[path] = {};
            }
            currentTree = currentTree[path];
        }

        // Creates the Discord Local Object
        if (typeof currentTree === "object") {
            currentTree[id] = result.value;
        }
    }
}

// ----------------------Exports Text------------------------------
// I used this syntax so that the exported text is proper defined Text Class where the constructor checks if any value is undefined before it is accessed. 
// Also the methodes are properly defined.

/**
 * @see You should use get() for auto check if something in language fale was not specified.
 */

export const text = new Text(data).data;