import { EmbedBuilder, ButtonBuilder, StringSelectMenuBuilder, RoleSelectMenuBuilder, Awaitable, Interaction, ChatInputCommandInteraction, ComponentType, ButtonInteraction, StringSelectMenuInteraction, UserSelectMenuBuilder, ChannelSelectMenuBuilder, RoleSelectMenuInteraction, UserSelectMenuInteraction, ChannelSelectMenuInteraction, InteractionUpdateOptions, Message, InteractionResponse, MessageFlags } from "discord.js";
import { ActionRowBuilder } from "discord.js";
import MyClient from "../types/client.js";
import { MyUtils } from "../utils/MyUtils.js";
import { Text, text } from "../text/index.js";

// --------------------------------TO DO----------------------------
// documentation

// -------------------------------Errors----------------------------
//      [Page Error] [ID]
//      [PageMenu Error]

// Colors available for Embeds
export const MyColors = {
    error:  0xff0000, 
    debug:  0xd4ac0d,
    help:   0x384f7d,
    music:  0xf6efdd,
    nothing: 0,
} as const

export type ColorType = typeof MyColors[keyof typeof MyColors]

// ---------------------------------PAGE---------------------------------

export type SelectMenuBuilders = StringSelectMenuBuilder | RoleSelectMenuBuilder | UserSelectMenuBuilder | ChannelSelectMenuBuilder 
export type ComponentInteraction = ButtonInteraction | StringSelectMenuInteraction | RoleSelectMenuInteraction | UserSelectMenuInteraction | ChannelSelectMenuInteraction
export type PageInteractions = ChatInputCommandInteraction | ComponentInteraction

/**
 * Default property of callbacks used in Pages.
 * @param {ComponentInteraction} interaction Interaction that triggered callback.
 * @param {MyClient} client Bot client.
 */


export interface ButtonCallbackProps {
    interaction: ButtonInteraction
    client: MyClient
}

export interface SelectMenuCallbackProps {
    interaction: StringSelectMenuInteraction
    client: MyClient
}

/**
 * Default propertys of visibilityCallbacks.
 * @param {ComponentInteraction} interaction Interaction that triggered callback.
 * @param {MyClient} client Bot client.
 */
export interface VisClbkProps {
    interaction: PageInteractions
    client: MyClient;
}

/**
 * Blueprint for callbacks triggered by ButtonInteractions.
 */
export type ButtonCallback = (
    props: ButtonCallbackProps,
    ...args: unknown[]
) => Awaitable<unknown>;


/**
 * Blueprint for callbacks triggered by SelectMenuInteractions.
 */
export type SelectMenuCallback = (
    props: SelectMenuCallbackProps,
    ...args: unknown[]
) => Awaitable<unknown>;

/**
 * Blueprint for callbacks used for checking if a component should be visible on a page.
 */
export type VisibilityCallback = (
    props: VisClbkProps,
    ...args: unknown[]
) => boolean

// Button 
/**
 * @param {string} id
 * @param {Omit<ButtonBuilder, "setCustomId">} buttonBuilder
 * @param {VisibilityCallback} VisibilityCallback
 * @param {ComponentCallback} callback
 */
export interface PageButtonData {
    id: string,
    buttonBuilder: Omit<ButtonBuilder, "setCustomId">,
    VisibilityCallback?: VisibilityCallback,
    callback?: ButtonCallback
}

/**
 * Represent a button including it's functionality.
 * @param {PageButtonData} data
 */
export class PageButton {

    constructor(public data: PageButtonData) {
        if (!this.data.callback) this.setCallback(() => {});
        if (!this.data.VisibilityCallback) this.setVisibilityCallback(() => { return true });
        // makes sure button has always the same custom id as provided in the constructor
        (this.data.buttonBuilder as ButtonBuilder).setCustomId(data.id)
    }

    setVisibilityCallback(callback: VisibilityCallback): this {
        this.data.VisibilityCallback = callback
        return this
    }

    setCallback(callback: ButtonCallback): this {
        this.data.callback = callback
        return this
    }
}

// Selectmenu 
export interface PageSelectMenuData {
    id: string,
    selectMenuBuilder: Omit<SelectMenuBuilders, "setCustomId">,
    VisibilityCallback?: VisibilityCallback,
    callback?: SelectMenuCallback
}

export class PageSelectMenu {

    constructor(public data: PageSelectMenuData) {
        if (!this.data.callback) this.setCallback(() => {});
        if (!this.data.VisibilityCallback) this.setVisibilityCallback(() => { return true });
        // makes sure selectmenu has always the same custom id as provided in the constructor
        (this.data.selectMenuBuilder as SelectMenuBuilders).setCustomId(data.id)
    }

    setVisibilityCallback(callback: VisibilityCallback): this {
        this.data.VisibilityCallback = callback
        return this
    }

    setCallback(callback: SelectMenuCallback): this {
        this.data.callback = callback
        return this
    }
}

// PageData
export interface PageData {
    client?: MyClient
    interaction?: PageInteractions

    id?: string
    embeds?: Omit<EmbedBuilder, "setColor">[]

    buttons?: PageButton[] 
    selectMenus?: PageSelectMenu[] 
}

export class Page {  

    constructor(public data: PageData) {}

    setId(id: string): this {
        this.data.id = id;
        return this
    }

    setColor(color: ColorType): this {
        if (this.data.embeds) {

            this.data.embeds.forEach( embed => {
                embed.data.color = color
            })
            return this
        } 
        throw Error(`[Page Error] [${this.data.id}] The pageEmbed must be defined before applying the color.`)
    }

    setEmbeds(embeds: Omit<EmbedBuilder, "setColor">[], color?: ColorType): this {
        this.data.embeds = embeds
        if (color) this.setColor(color)
        return this
    }

    addButton(button: PageButton): this {
        if (!this.data.buttons) this.data.buttons = [button]
        else this.data.buttons.push(button)
        return this
    }

    addSelectMenu(selectMenu: PageSelectMenu): this {
        if (!this.data.selectMenus) this.data.selectMenus = [selectMenu]
        else this.data.selectMenus.push(selectMenu)
        return this
    }

    private catchErrors(...args: unknown[]) {
        if (!this.data.embeds) throw new Error(`[Page Error] [${this.data.id}] PageEmbed was not defined.`)
        this.data.embeds.forEach( embed => {
            if (MyUtils.objectEmpty(embed.data)) throw new Error(`[Page Error] [${this.data.id}] PageEmbed was not defined.`)
        })
        if (!this.data.id) throw new Error(`[Page Error] [${this.data.id}] PageId was not defined.`)
    }

    private addComponents(): ActionRowBuilder<ButtonBuilder | SelectMenuBuilders>[] | undefined {
        const _client = this.data.client
        const interaction = this.data.interaction

        if(!_client || !interaction) throw new Error(`[Page Error] [${this.data.id}] Could not add Components since [interaction] or [client] were not defined.`)


        let buttons = new ActionRowBuilder<ButtonBuilder>()
        // Loops through button and adds them if the Visibilitycallback returns true
        if (this.data.buttons) {
            for (const button of this.data.buttons) {
                if(!button.data.VisibilityCallback) throw new Error(`[Page Error] [${this.data.id}] Button with [ID:${button.data.id}] has no VisibilityCallback.`)
                if (button.data.VisibilityCallback({ interaction, client: _client})) {
                    buttons.addComponents((button.data.buttonBuilder as ButtonBuilder))
                }
            }
        }
        
        let selectMenus = new ActionRowBuilder<SelectMenuBuilders>()
        // Loops through selectmenus and adds them if the Visibilitycallback returns true
        if (this.data.selectMenus) {
            for (const selectMenu of this.data.selectMenus) {
                if(!selectMenu.data.VisibilityCallback) throw new Error(`[Page Error] [${this.data.id}] SelectMenu with [ID:${selectMenu.data.id}] has no VisibilityCallback`)
                if (selectMenu.data.VisibilityCallback({ interaction, client: _client})) {
                    selectMenus.addComponents((selectMenu.data.selectMenuBuilder as SelectMenuBuilders))
                }
            }
        }


        if (buttons.components.length === 0 && selectMenus.components.length === 0) return undefined
        if (buttons.components.length === 0) return [selectMenus]
        if (selectMenus.components.length === 0) return [buttons]
        return [selectMenus, buttons]
    }

    private async send(client: MyClient, interaction: ChatInputCommandInteraction, methode: string, timeout?: number, ephemeral?: boolean) {

        this.data.client = client
        this.data.interaction = interaction

        this.catchErrors()

        const userId = this.data.interaction.user.id
        const embeds = this.data.embeds ?? undefined
        const components = this.addComponents()

        let page: Message | InteractionResponse | undefined
        switch (methode) { 
            case "followUp": 
                page = await this.data.interaction.followUp({embeds, components, ephemeral})
                break;

            case "reply":  
                page = await this.data.interaction.reply({embeds, components, ephemeral}); 
                break;

            default : 
                page = await this.data.interaction.reply({embeds, components, ephemeral}); 
                break;
        }

        const filter = (i: Interaction) => i.user.id === userId

        const buttonCollector = page.createMessageComponentCollector({
            componentType: ComponentType.Button,
            filter,
        })

        const stringSelectMenuCollector = page.createMessageComponentCollector({
            componentType: ComponentType.StringSelect,
            filter,
        })

        buttonCollector.on("collect", ( interaction ) => {
            if (!this.data.buttons) return

            this.data.interaction = interaction
            for (const button of this.data.buttons) {
                if (!button.data.callback) throw new Error(`[Page Error] [${this.data.id}] Button with [ID:${button.data.id}] has no callback.`)
                if (interaction.customId === button.data.id) button.data.callback({ interaction, client })
            }
        })

        stringSelectMenuCollector.on("collect", ( interaction ) => {
            if (!this.data.selectMenus) return

            this.data.interaction = interaction
            for (const selectMenu of this.data.selectMenus) {
                if (!selectMenu.data.callback) throw new Error(`[Page Error] [${this.data.id}] SelectMenu with [ID:${selectMenu.data.id}] has no callback.`)
                if (interaction.customId === selectMenu.data.id) selectMenu.data.callback({ interaction, client })
            }
        })

        // Delete after time. Resets by activity.
        const deleteCollector = page.createMessageComponentCollector({
            filter,
            time: timeout
        })

        deleteCollector.on("collect", () => {
            deleteCollector.resetTimer()
        })

        deleteCollector.on("end", async () => {
            if (!page || page instanceof Message && page.flags.has(MessageFlags.Ephemeral)) {
                return
            } else page.delete() 
        })

        return this
    }

    reply(client: MyClient, interaction: ChatInputCommandInteraction, timeout?: number, ephemeral?: boolean) {
        return this.send(client, interaction, "reply", timeout, ephemeral)
    }

    followUp(client: MyClient, interaction: ChatInputCommandInteraction, timeout?: number, ephemeral?: boolean) {
        return this.send(client, interaction, "followUp", timeout, ephemeral)
    }

    async update(newPage?: InteractionUpdateOptions) {

        if (!this.data.interaction || this.data.interaction.isChatInputCommand() ) throw new Error(`[Page Error] [${this.data.id}] Cant update page on ChatInputCommandInteractions.`)

        const embeds = this.data.embeds ?? undefined
        let components = undefined

        // here if you want instant update
        components = this.addComponents()

        let updatedMessage
        if (newPage) updatedMessage = await this.data.interaction.update(newPage)
        else updatedMessage = await this.data.interaction.update({embeds, components})

        // Old try to only uodate if the components change as a whole, but it seems useless.
        /* else if (components && components.length === this.data.interaction.message.components.length) {
            for (let a = 0; a < components.length; a++) {
                if (components[a].components.length === this.data.interaction.message.components[a].components.length) {
                    for (let b = 0; b < components.length; b++) {
                        if ((components[a].components[b].data as any)["custom_id"] !== this.data.interaction.message.components[a].components[b].customId){
                            return updatedMessage = await this.data.interaction.update({embeds, components})
                        } 
                    }
                }
            }
            updatedMessage = await this.data.interaction.update({embeds})
        } */

        //here if you want to be able to check in visibility for the new message content
        //components = this.addComponents()
        //updatedMessage.edit({ components })

        return this
    }

    async updateToNewPage(newPage: Page) {

        // Overrides the data on Page with the specified
        if (!this.data.interaction || this.data.interaction.isChatInputCommand() ) throw new Error(`[Page Error] [${this.data.id}] Cant update page when interaction was not defined or on ChatInputCommandInteractions.`)

        const interaction = this.data.interaction
        const client = this.data.client

        this.data = newPage.data
        this.data.client = client
        this.data.interaction = interaction

        // Default updates Page to apply newly set data
        this.update()
        return this
    } 

    clone(): Page {

        // Creates a perfect Copy of the Page independant from the parent
        let embeds_: EmbedBuilder[] = []
        this.data.embeds?.forEach( embed => {
            if (embed) embeds_.push(new EmbedBuilder(embed.data))
        })
        const embeds = this.data.embeds ? embeds_ : undefined

        let buttons: any = [] 
        let selectMenus: any = []

        this.data.buttons?.forEach((button) => {
            buttons.push(new PageButton(button.data))
        })
        if (buttons.length === 0 ) buttons = undefined

        this.data.selectMenus?.forEach((selectMenu) => {
            selectMenus.push(new PageSelectMenu(selectMenu.data))
        })
        if (selectMenus.length === 0 ) selectMenus = undefined

        const cloneData: PageData = {
            interaction: this.data.interaction,
            client: this.data.client,

            id: this.data.id,
            embeds,

            buttons,
            selectMenus
        }

        return new Page(cloneData)
    }
}

// -------------------------------PAGE MENU-------------------------------

export type CategoryPages = Record<string, Page[]>

// To edit Embeds dynamicly
export type EditEmbedCallback = (
    props: {page: Page},
    ...agrs: unknown[]
) => EmbedBuilder[]

export type PageTripplet = [
    Page,
    string,
    number
]

// PageMenuData
export interface PageMenuData {
    categoryPages?: CategoryPages
    currentPage?: PageTripplet 
    dynamicEmbedUpdates?: EditEmbedCallback[]
}

export class PageMenu {

    constructor(public data: PageMenuData) {}

    addPages(pages: Page[], category: string): this {

        if(!this.data.categoryPages) this.data.categoryPages = {}

        let categoryPages = this.data.categoryPages

        if (!categoryPages[category]) categoryPages[category] = []
        for (const page_ of pages) {
            categoryPages[category].push(page_)            
        }
        return this
    }

    addCategorys(categorys: CategoryPages): this {

        let categoryPages = this.data.categoryPages
        if(!categoryPages) categoryPages = {}



        for (const [id, _p] of Object.entries(categorys)) {
            categoryPages[id] = categorys[id]          
        }

        this.data.categoryPages = categoryPages
        return this
    }

    addButtons(buttons: PageButton[], category?: string, ): this {

        if(!this.data.categoryPages) return this

        // Sets category on an Array that either contains the specified category or every category
        const categorys = category ? [(this.getCategoryById(category) ?? [])[0]] : Object.values(this.data.categoryPages)

        if (buttons.length === 0) throw new Error("[PageMenu Error] No Buttons provided to add to pageMenu.")

        for (const category of categorys){
            if (!category) throw new Error("[PageMenu Error] Category doesnt exist on pageMenu.")
            for (const page of category) {
                for (const button of buttons) {
                    page.addButton(button)
                }
            }   
        }  
        return this 
    }

    addSelectMenus(selectMenus: PageSelectMenu[], category?: string, ): this {

        if(!this.data.categoryPages) return this 

        // Sets category on an Array that either contains the specified category or every category
        const categorys = category ? [(this.getCategoryById(category) ?? [])[0]] : Object.values(this.data.categoryPages)

        if (selectMenus.length === 0) throw new Error("[PageMenu Error] No Buttons provided to add to pageMenu.")

        for (const category of categorys){
            if (!category) throw new Error("[PageMenu Error] Category doesnt Exist on pageMenu.")
            for (const page of category) {
                for (const selectMenu of selectMenus) {
                    page.addSelectMenu(selectMenu)
                }
            }   
        }   
        return this 
    }

    addDynamicEmbedUpdate(callback: EditEmbedCallback): this {
        let dynamicEmbedUpdates = this.data.dynamicEmbedUpdates
        
        if(!dynamicEmbedUpdates) dynamicEmbedUpdates = []
        dynamicEmbedUpdates.push(callback)

        this.data.dynamicEmbedUpdates = dynamicEmbedUpdates
        return this 
    }

    // Returns a clone of the current Page with the dynamic updates applied
    private applyDynamicPageUpdates(page: Page): Page {
        const updatedPage = page.clone()
        
        // Applys all callbacks on Embed
        const dynamicEmbedUpdates = this.data.dynamicEmbedUpdates
        if(!dynamicEmbedUpdates) return updatedPage
      
        let embeds: EmbedBuilder[] = updatedPage.data.embeds as EmbedBuilder[]
        for (const callback of dynamicEmbedUpdates) {
            embeds= callback({page})
        }

        updatedPage.data.embeds = embeds
        
        return updatedPage
    }

    // Returns a triplett [Page class, category, index in category]
    getPageById(pageId: string): PageTripplet | undefined {

        if(!this.data.categoryPages) return

        const categoryPages = Object.entries(this.data.categoryPages)

        for (const [category, pages] of categoryPages) {
            for (const [i, page] of pages.entries()) {
                if (page.data.id === pageId) return [page, category, i]
            }
        }
    }

    getPageByMember(page: Page): PageTripplet | undefined {

        if(!this.data.categoryPages) return

        const categoryPages = Object.entries(this.data.categoryPages)

        for (const [category, pages] of categoryPages) {
            for (const [i, page_] of pages.entries()) {
                if (page_.data.id === page.data.id) return [page_, category, i]
            }
        }
    }

    // Return tupel [category, Page array]
    getCategoryById(categoryId: string): [Page[], string] | undefined {

        if(!this.data.categoryPages) return

        const categoryPages = Object.entries(this.data.categoryPages)

        for (const [category, pages] of categoryPages) {
            if (category === categoryId) return [pages, category]
        }
    }

    getCategoryByMember(member: Page): [Page[], string] | undefined {

        if(!this.data.categoryPages) return

        const categoryPages = Object.entries(this.data.categoryPages)

        for (const [category, pages] of categoryPages) {
            for (const page of pages) {
                if (page.data.id === member.data.id) return [pages, category]
            }
        }
    }

    // Sends specified page as "anchor". The anchor is the message, that registers all the component interactions.
    private async send(page: string | Page, client: MyClient, interaction: ChatInputCommandInteraction, methode: string, timeout?: number, ephemeral?: boolean) {
        let currentPage = this.data.currentPage
        let originPage: PageTripplet | undefined, newPage: Page

        if (typeof(page) === "string"){

            originPage = this.getPageById(page)
            if(!originPage) throw new Error(`[PageMenu Error] This page does not exist on an instance of a pageMenu.`)

            // Prototype currentPage for dynamicUpdate functunality (ex. that current page is defined for usage)
            this.data.currentPage = [originPage[0].clone(), originPage[1], originPage[2]]

            newPage = this.applyDynamicPageUpdates(originPage[0])
            
        } else {

            originPage = this.getPageByMember(page)
            if(!originPage) throw new Error(`[PageMenu Error] This page does not exist on an instance of a pageMenu.`)

            // Prototype currentPage for dynamicUpdate functunality (ex. that current page is defined for usage)
            this.data.currentPage = [originPage[0].clone(), originPage[1], originPage[2]]

            newPage = this.applyDynamicPageUpdates(originPage[0])
        }

        let page_
        switch (methode) { 
            case "followUp": 
                page_ = await newPage.followUp(client, interaction, timeout, ephemeral)
                break;

            case "reply":   
                page_ = await newPage.reply(client, interaction, timeout, ephemeral) 
                break;

            default : 
                page_ = await newPage.reply(client, interaction, timeout, ephemeral) 
                break;
        }

        // Defines current anchor as a clone so that currentPage is independent from the actual Pages displayed and able to update without overriding data.
        currentPage = [page_, originPage[1], originPage[2]];

        this.data.currentPage = currentPage
    }

    reply(page: string | Page, client: MyClient, interaction: ChatInputCommandInteraction, timeout?: number, ephemeral?: boolean) {
        return this.send(page, client, interaction, "reply", timeout, ephemeral)
    }

    followUp(page: string | Page, client: MyClient, interaction: ChatInputCommandInteraction, timeout?: number, ephemeral?: boolean) {
        return this.send(page, client, interaction, "followUp", timeout, ephemeral)
    }

    // Updates the anchor
    async updateTo(page: string | Page) {

        if (!this.data.currentPage) throw new Error("[PageMenu Error] No pagemenu was send to update.")
        let currentPage = this.data.currentPage

        if (typeof(page) === "string"){

            const originPage = this.getPageById(page)
            if(!originPage) throw new Error(`[PageMenu Error] This page does not exist on an instance of a pageMenu.`)

            // Prototype currentPage for dynamicUpdate functunality (ex. that current page is defined for usage)
            this.data.currentPage = [originPage[0].clone(), originPage[1], originPage[2]]

            const newPage: Page = this.applyDynamicPageUpdates(originPage[0])

            // calles updateFunction on page
            currentPage = [await currentPage[0].updateToNewPage(newPage), originPage[1], originPage[2]]

        } else {

            const originPage = this.getPageByMember(page)
            if(!originPage) throw new Error(`[PageMenu Error] This page does not exist on an instance of a pageMenu.`)

            // Prototype currentPage for dynamicUpdate functunality (ex. that current page is defined for usage)
            this.data.currentPage = [originPage[0].clone(), originPage[1], originPage[2]]

            const newPage: Page = this.applyDynamicPageUpdates(originPage[0])

            // calles updateFunction on page
            currentPage = [await currentPage[0].updateToNewPage(newPage), originPage[1], originPage[2]]
        }

        this.data.currentPage = currentPage
    }
    
    defaulButtonCallbacks = {
        nextPageInCategory: () => {
            if (!this.data.currentPage) throw new Error("[PageMenu Error] Cant use Button since no pageMenu was send.")
            const currentCategory = this.getCategoryByMember(this.data.currentPage[0])

            if(!currentCategory) throw new Error("[] CurrentCategory doesn't exist.")
            
            let nextIndex = this.data.currentPage[2] + 1
            if (nextIndex >= currentCategory[0].length) nextIndex = 0

            const nextPage = currentCategory[0][nextIndex]
            this.updateTo(nextPage)
        },

        backPageInCategory: () => {
            if (!this.data.currentPage) throw new Error("[PageMenu Error] Cant use Button since no pageMenu was send.")
            const currentCategory = this.getCategoryByMember(this.data.currentPage[0])

            if(!currentCategory) throw new Error("[] CurrentCategory doesn't exist.")
            
            let nextIndex = this.data.currentPage[2] - 1
            if (nextIndex < 0) nextIndex = currentCategory[0].length - 1

            const nextPage = currentCategory[0][nextIndex]
            this.updateTo(nextPage)
        }

        // Future NextCategory Button to access Pages from Different Categorys

        // Future BackCategory Button to access Pages from Different Categorys
    }
}

// -----------------------------Default Pages-----------------------------
// Future Send Ticket for Error to Website / Report Error
export const defaultMessages = {
    commandError(interaction: ChatInputCommandInteraction):Page {
        return new Page({
            id: "commandError",
            embeds: [
                new EmbedBuilder()
                    .setAuthor({
                        name: Text.get(text.error.failedCommand, interaction.locale), //
                        iconURL: "https://thumbs.dreamstime.com/z/blue-icon-symbol-sad-face-4651546.jpg",
                        url: undefined}) // Future link to my Website/Errors
                    .setImage("https://support.content.office.net/de-de/media/4c10ecfd-3008-4b00-9f98-d41b6f899c2d.png")
                ]
            } 
        ).setColor(MyColors.error)
    }
} as const

export type DefaultMessageType = typeof defaultMessages[keyof typeof defaultMessages]

export function commandErrorMessage(client: MyClient, interaction: ChatInputCommandInteraction, message: DefaultMessageType) {
    if (interaction.deferred || interaction.replied) {
      return message(interaction).followUp(client, interaction, undefined, true)
    }

    else return message(interaction).reply(client, interaction, undefined, true)
}