import fs from "fs";
import { MyJSON } from "../utils/MyJSON.js";
import { plainToInstance } from "class-transformer";
import { MyUtils } from "../utils/MyUtils.js";
import { Locale, LocaleString } from "discord.js";

// -----------To Do----------------
// Documentation / Types

// Bluepront for command in Language files
/* 
"CATEGORYNAME": {
    "name": "",
    "emoji": "",
    "description": ""
},    

"COMMANDNAME": {
    "commandDescription": "",
    "detailedDescription": {
        "title": "",
        "description": "",
        "syntax": "",
        "returns": ""
    }
*/

/**
 * Class to make local-text-handling easier.
 * @param {Record<LocaleString, string>} text Discord's locale object.
 * @function get(local) Returns string corresponding to specified locale.
 * @function insertInMessage(local) Iserts array of strings into the message at ever instance of "[]" and returns specified locale.
 */
export class LocaleText  {
    constructor(public text: Record<LocaleString, string>) {}

    public get(locale: LocaleString): string {
        if (!this.text) throw new Error(`[Text] [${locale.valueOf()}] Accessed property does not exist in language file(s).`)
        if (!locale) return this.text["en-US"]
        if (this.text[locale]) return this.text[locale]
        else if (this.text["en-US"]) return this.text["en-US"]
        else throw new Error(`[Text] [${locale.valueOf()}] Accessed property was not defined in language file(s).`)
    }

    public insertInMessage(strings: string[], locale: LocaleString): string {
        let pendingMessage = this.get(locale)

        for (const string of strings) {
            let i = pendingMessage.indexOf("[]");
            if (i < 0) throw new Error(`[InsertInMessage Error] List ${strings} contains MORE strings than [spaces] exist in provided string [${pendingMessage}].`);
            pendingMessage = pendingMessage.slice(0, i) + string + pendingMessage.slice(i + 2);
        }

        if (pendingMessage.indexOf("[]") > -1) throw new Error(`[InsertInMessage Error] List [${strings}] contains LESS strings than [spaces] exist in provided string [${pendingMessage}].`);
        return pendingMessage;
    }
}

/**
 * structure of language-files.
 */
export type TextData = {
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
    data: TextData

    // Constructor checks if every Property was defined
    constructor(data: TextData) {
        for (const element of MyUtils.getDeepestElements(data)) {
            if(element.value === undefined) throw new Error(`[Text] [${element.path.join(".")}] is missing.`);
        }
        this.data = data
    }
}

// Locals Array
export const Locals = Object.values(Locale) 

// Creates an Object with each language-file as value and its id as key and the JSON file as value.
const files = fs.readdirSync("src/text/languages");
const languages: Record<string, Object> = {};

for (const file of files) {
    const fileId = file.split(".")[1]

    //Check if fileId matches LocaleString
    if (!Locals.includes(fileId as Locale)) throw new Error(`Language filename [${fileId}] does not match Locals.`)

    const id: LocaleString = fileId as Locale
    languages[id] = plainToInstance(Object, MyJSON.parse(`src/text/languages/${file}`));
}

// Creates a emptry text Object as Type Text to get the property skelett.
let data: TextData = {} as TextData

// Collects all language files to create the text-class-data.
for (const [id, language] of Object.entries(languages)) {
    const results = MyUtils.getDeepestElements(language);

    // Runs through each language file
    for (const result of results) {
        let currentTree: any = data;

        result.path.forEach((path, i) => {

            // Initialzes class if in last branch.
            if (i === result.path.length - 1) {

                if (!currentTree[path]) {currentTree[path] = new LocaleText({} as Record<LocaleString, string>);};
            }
    
            // Develops tree if not in last branch.
            else if (!currentTree[path]) {

                currentTree[path] = {};
            }
            currentTree = currentTree[path];
        })

        // Sets text
        currentTree.text[id] = result.value;
    }
}

/**
 * @see You should use get() for auto check for erros (ex.: If something was not specified in language file).
 */
// I used this syntax so that the exported text is proper defined Text Class where the constructor checks if any value is undefined before it is accessed. 
export const text = new Text(data).data;