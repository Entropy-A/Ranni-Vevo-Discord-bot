import { EmbedBuilder, ButtonBuilder, StringSelectMenuBuilder, RoleSelectMenuBuilder, Awaitable, Interaction, ChatInputCommandInteraction,
ComponentType, ButtonInteraction, StringSelectMenuInteraction, UserSelectMenuBuilder, ChannelSelectMenuBuilder, RoleSelectMenuInteraction,
UserSelectMenuInteraction, ChannelSelectMenuInteraction, InteractionUpdateOptions, Message, InteractionResponse, MessageFlags } from "discord.js";
import { ActionRowBuilder } from "discord.js";
import MyClient from "../types/client.js";
import { MyUtils } from "../utils/MyUtils.js";
import { RanniColorType } from "../utils/constants.js";
import { useClient } from "../hooks/useClient.js";

// --------------------------------TO DO----------------------------
// documentation

// -------------------------------Errors----------------------------
//      [Page Error] [ID]
//      [PageMenu Error]

// ----------------------------------------------------------PAGE--------------------------------------------------------
export type SelectMenuBuilders = StringSelectMenuBuilder | RoleSelectMenuBuilder | UserSelectMenuBuilder | ChannelSelectMenuBuilder 
export type ComponentInteraction = ButtonInteraction | StringSelectMenuInteraction | RoleSelectMenuInteraction | UserSelectMenuInteraction | ChannelSelectMenuInteraction
export type PageInteractions = ChatInputCommandInteraction | ComponentInteraction

/**
 * Default property of callbacks used in Pages.
 * @param {ButtonInteraction} interaction ButtonInteraction that triggered callback.
 * @param {MyClient} client 
 */
export interface ButtonCallbackProps {
    interaction: ButtonInteraction
    client: MyClient
}

/**
 * Default property of callbacks used in Pages.
 * @param {StringSelectMenuInteraction} interaction StringSelectMenuInteraction that triggered callback.
 * @param {MyClient} client 
 */
export interface SelectMenuCallbackProps {
    interaction: StringSelectMenuInteraction
    client: MyClient
}

/**
 * Default propertys of visibilityCallbacks.
 * @param {ComponentInteraction} interaction PageInteraction that triggered callback.
 * @param {MyClient} client
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

export interface PageButtonData {
    id: string,
    buttonBuilder: Omit<ButtonBuilder, "setCustomId">,
    VisibilityCallback?: VisibilityCallback,
    callback?: ButtonCallback
}

/**
 * Creates button used for pages.
 * @param {string} id
 * @param {Omit<ButtonBuilder, "setCustomId">} buttonBuilder
 * @param {VisibilityCallback} VisibilityCallback
 * @param {ButtonCallback} callback
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

export interface PageSelectMenuData {
    id: string,
    selectMenuBuilder: Omit<SelectMenuBuilders, "setCustomId">,
    VisibilityCallback?: VisibilityCallback,
    callback?: SelectMenuCallback
}

/**
 * Creates selectMenu used for pages.
 * @param {string} id
 * @param {Omit<SelectMenuBuilders, "setCustomId">} buttonBuilder
 * @param {VisibilityCallback} VisibilityCallback
 * @param {SelectMenuCallback} callback
 */
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

export interface PageData {
    interaction?: PageInteractions,

    id?: string,
    color?: RanniColorType,
    embeds?: Omit<EmbedBuilder, "setColor">[],

    buttons?: PageButton[] ,
    selectMenus?: PageSelectMenu[],
}

export class Page {  
    private activeComponents: (PageButton|PageSelectMenu)[] = []

    constructor(public data: PageData = {}) {
        this.applyColor()
    }

    private applyColor(): this {
        if(!this.data.color) return this
        if (this.data.embeds) {
            this.data.embeds.forEach( embed => {
                embed.data.color = this.data.color
            })
        } 
        return this
    }

    setId(id: string): this {
        this.data.id = id;
        return this
    }

    /**
     * Pushes new embeds to class. If color was defined in constructor applys it.
     * @param embeds 
     */
    addEmbeds(embeds: Omit<EmbedBuilder, "setColor">[]): this {
        if (!this.data.embeds) this.data.embeds = embeds
        else this.data.embeds.push(...embeds)
        this.applyColor()
        return this
    }

    /**
     * Pushes new buttons to class.
     * @param buttons 
     */
    addButton(buttons: PageButton[]): this {
        if (!this.data.buttons) this.data.buttons = buttons
        else this.data.buttons.push(...buttons)
        return this
    }

    /**
     * Pushes new selectMenus to class.
     * @param selectMenus 
     */
    addSelectMenu(selectMenus: PageSelectMenu[]): this {
        if (!this.data.selectMenus) this.data.selectMenus = selectMenus
        else this.data.selectMenus.push(...selectMenus)
        return this
    }

    private catchErrors(...args: unknown[]) {
        if (!this.data.embeds) throw new Error(`[Page Error] [${this.data.id}] PageEmbed was not defined.`)
        this.data.embeds.forEach( embed => {
            if (MyUtils.objectEmpty(embed.data)) throw new Error(`[Page Error] [${this.data.id}] Some pageEmbed contains nothing. Please make sure to define it properly.`)
        })
        if (!this.data.id) throw new Error(`[Page Error] [${this.data.id}] PageId was not defined.`)
    }

    private addComponents(): ActionRowBuilder<ButtonBuilder | SelectMenuBuilders>[] | undefined {
        const client = useClient()
        const interaction = this.data.interaction

        if(!interaction) throw new Error(`[Page Error] [${this.data.id}] Could not add Components since [interaction] was not defined.`)


        let buttons = new ActionRowBuilder<ButtonBuilder>()
        // Loops through button and adds them if the Visibilitycallback returns true
        if (this.data.buttons) {
            for (const button of this.data.buttons) {
                if(!button.data.VisibilityCallback) throw new Error(`[Page Error] [${this.data.id}] Button with [ID:${button.data.id}] has no VisibilityCallback.`)
                if (button.data.VisibilityCallback({ interaction, client})) {
                    this.activeComponents.push(button)
                    buttons.addComponents((button.data.buttonBuilder as ButtonBuilder))
                }
            }
        }
        
        let selectMenus = new ActionRowBuilder<SelectMenuBuilders>()
        // Loops through selectmenus and adds them if the Visibilitycallback returns true
        if (this.data.selectMenus) {
            for (const selectMenu of this.data.selectMenus) {
                if(!selectMenu.data.VisibilityCallback) throw new Error(`[Page Error] [${this.data.id}] SelectMenu with [ID:${selectMenu.data.id}] has no VisibilityCallback`)
                if (selectMenu.data.VisibilityCallback({ interaction, client})) {
                    this.activeComponents.push(selectMenu)
                    selectMenus.addComponents((selectMenu.data.selectMenuBuilder as SelectMenuBuilders))
                }
            }
        }


        if (buttons.components.length === 0 && selectMenus.components.length === 0) return undefined
        if (buttons.components.length === 0) return [selectMenus]
        if (selectMenus.components.length === 0) return [buttons]
        return [selectMenus, buttons]
    }

    private async send(interaction: ChatInputCommandInteraction | ComponentInteraction, methode: string, timeout?: number, ephemeral?: boolean) {

        this.data.interaction = interaction
        this.catchErrors()

        const client = useClient()
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

            this.data.interaction = interaction
            for (const button of this.activeComponents) {
                // Check for type
                if(!(button instanceof PageButton)) break

                if (!button.data.callback) throw new Error(`[Page Error] [${this.data.id}] Button with [ID:${button.data.id}] has no callback.`)
                if (interaction.customId === button.data.id) button.data.callback({ interaction, client })
            }
        })

        stringSelectMenuCollector.on("collect", ( interaction ) => {

            this.data.interaction = interaction
            for (const selectMenu of this.activeComponents) {
                // Check for type
                if(selectMenu instanceof PageSelectMenu) {
                    if (!selectMenu.data.callback) throw new Error(`[Page Error] [${this.data.id}] SelectMenu with [ID:${selectMenu.data.id}] has no callback.`)
                    if (interaction.customId === selectMenu.data.id) selectMenu.data.callback({ interaction, client })
                }
            }
        })

        // Delete after time. Reseted by activity.
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

    /**
     * Replys with page to interaction.
     * @param interaction 
     * @param timeout Timer for how long the message should be visible.
     * @param ephemeral 
     */
    reply(interaction: ChatInputCommandInteraction | ComponentInteraction, timeout?: number, ephemeral?: boolean) {
        return this.send(interaction, "reply", timeout, ephemeral)
    }

    /**
     * Follows up with page to interaction.
     * @param interaction 
     * @param timeout Timer for how long the message should be visible.
     * @param ephemeral 
     */
    followUp(interaction: ChatInputCommandInteraction | ComponentInteraction, timeout?: number, ephemeral?: boolean) {
        return this.send(interaction, "followUp", timeout, ephemeral)
    }

    /**
     * If you want to override the current page with new information (You only override the new message not the class itself).
     * @param newPage (optional) Overrides current page with new message. (Results in loss of control over buttons.)
     * @returns Clone of page with new data.
     */
    async update(newPage?: Page): Promise<Page> {

        let anchor = this.clone()
        if (newPage) {
            newPage.data.interaction = this.data.interaction
            anchor = newPage.clone()
        }
        if (!this.data.interaction || this.data.interaction.isChatInputCommand() ) throw new Error(`[Page Error] [${anchor.data.id}] Can't update page on ChatInputCommandInteractions or non existen interactions.`)       

        const embeds = anchor.data.embeds
        const components = anchor.addComponents() 

        this.activeComponents = []
        if (anchor.data.buttons) this.activeComponents.push(...anchor.data.buttons)
        if (anchor.data.selectMenus) this.activeComponents.push(...anchor.data.selectMenus)

        const updatedMessage = await this.data.interaction.update({embeds, components})

        return anchor
    }

    /**
     * Creates independant clone of the page.
     */
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

            id: this.data.id,
            color: this.data.color,
            embeds,

            buttons,
            selectMenus
        }

        return new Page(cloneData)
    }
}



// ---------------------------------------------------------------------PAGE MENU--------------------------------------------------------------------
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

export type CategoryTripplet = [
    Page[], 
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
    private anchor?: Page

    constructor(public data: PageMenuData) {}

    /**
     * Adds pages to category (auto creates new categorys).
     * @param pages 
     * @param category 
     */
    addPages(pages: Page[], category: string): this {

        if(!this.data.categoryPages) this.data.categoryPages = {}

        let categoryPages = this.data.categoryPages

        if (!categoryPages[category]) categoryPages[category] = []
        for (const page_ of pages) {
            categoryPages[category].push(page_)            
        }
        return this
    }

    /**
     * Add a whole set of category with pages to the page menu.
     * @param categorys
     */
    addCategorys(categorys: CategoryPages): this {

        let categoryPages = this.data.categoryPages
        if(!categoryPages) categoryPages = {}

        for (const [id, _p] of Object.entries(categorys)) {
            categoryPages[id] = categorys[id]          
        }

        this.data.categoryPages = categoryPages
        return this
    }

    /**
     * Adds buttons to every page (either specified category or every category).
     * @param buttons 
     */
    addButtons(buttons: PageButton[], category?: string, ): this {

        if(!this.data.categoryPages) return this

        // Sets category on an Array that either contains the specified category or every category
        const categorys = category ? [(this.getCategory(category) ?? [])[0]] : Object.values(this.data.categoryPages)

        for (const category of categorys){
            if (!category) throw new Error("[PageMenu Error] Category doesnt exist on pageMenu.")
            for (const page of category) {
                for (const button of buttons) {
                    page.addButton([button])
                }
            }   
        }  
        return this 
    }

    /**
     * Adds selectMenus to every page (either specified category or every category).
     * @param buttons 
     */
    addSelectMenus(selectMenus: PageSelectMenu[], category?: string, ): this {

        if(!this.data.categoryPages) return this 

        // Sets category on an Array that either contains the specified category or every category
        const categorys = category ? [(this.getCategory(category) ?? [])[0]] : Object.values(this.data.categoryPages)

        for (const category of categorys){
            if (!category) throw new Error("[PageMenu Error] Category doesnt Exist on pageMenu.")
            for (const page of category) {
                for (const selectMenu of selectMenus) {
                    page.addSelectMenu([selectMenu])
                }
            }   
        }   
        return this 
    }

    /**
     * Adds a callback to the callbackArray that will be checked before sending the message to dynamicly adapt embeds (will only edit a clone).
     * @param callback 
     */
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
            embeds = callback({page})
        }

        updatedPage.data.embeds = embeds
        
        return updatedPage
    }

    /**
     * Returns a triplett [Page, category, index in category]
     * @param page 
     */
    getPage(page: string | Page): PageTripplet | undefined {

        if(!this.data.categoryPages) return

        const categoryPages = Object.entries(this.data.categoryPages)

        for (const [category, pages] of categoryPages) {
            for (const [i, page_] of pages.entries()) {
                if ( (typeof page === "string" && page_.data.id === page) || (page instanceof Page && page_.data.id === page.data.id) ) return [page_, category, i]
            }
        }
    }

    /**
     * Return tupel [category, Page array].
     * @param search Page or category name.
     */
    getCategory(search: string | Page): CategoryTripplet | undefined {

        if(!this.data.categoryPages) return

        const categoryPages = Object.entries(this.data.categoryPages)

        let i = 0
        for (const [category, pages] of categoryPages) {
            if (typeof search === "string" && category === search) return [pages, category, i]
            for (const page of pages) {
                if (search instanceof Page && page.data.id === search.data.id) return [pages, category, i]
            }
            i++
        }
    }

    // Sends specified page as "anchor". The anchor is the message, that registers all the component interactions.
    private async send(page: string | Page, interaction: ChatInputCommandInteraction | ComponentInteraction, methode: string, timeout?: number, ephemeral?: boolean) {

        const pageContext = this.getPage(page);
        if (!pageContext) throw new Error("[PageMenu Error] This page does not exist.");
        if (typeof page === "string") page = pageContext[0];

        const newPage = this.applyDynamicPageUpdates(page)

        // Prototype currentPage for dynamicUpdate functunality (ex. that current page is defined for usage) ------If error add .clone()------
        this.data.currentPage = [page, pageContext[1], pageContext[2]] 

        switch (methode) { 
            case "followUp": 
                this.data.currentPage = [await newPage.followUp(interaction, timeout, ephemeral), pageContext[1], pageContext[2]]
                break;

            case "reply":   
                this.data.currentPage = [await newPage.reply(interaction, timeout, ephemeral), pageContext[1], pageContext[2]]
                break;

            default: 
                this.data.currentPage = [await newPage.reply(interaction, timeout, ephemeral), pageContext[1], pageContext[2]]
                break;
        }
        this.anchor = this.data.currentPage[0]
    }

    /**
     * Replys with page to an interaction.
     * @param page 
     * @param interaction 
     * @param timeout How long the page should be visible.
     * @param ephemeral 
     */
    reply(page: string | Page, interaction: ChatInputCommandInteraction | ComponentInteraction, timeout?: number, ephemeral?: boolean) {
        return this.send(page, interaction, "reply", timeout, ephemeral)
    }

    /**
     * Follows up with page to an interaction.
     * @param page 
     * @param interaction 
     * @param timeout How long the page should be visible.
     * @param ephemeral 
     */
    followUp(page: string | Page, interaction: ChatInputCommandInteraction | ComponentInteraction, timeout?: number, ephemeral?: boolean) {
        return this.send(page, interaction, "followUp", timeout, ephemeral)
    }

    /**
     * Updates the menu to a new Page.
     * @param page 
     */
    async updateTo(page: string | Page) {

        if (!this.data.currentPage) throw new Error("[PageMenu Error] No pagemenu was send to update.")

        const pageContext = this.getPage(page);
        if (!pageContext) throw new Error("[PageMenu Error] This page does not exist.");
        if (typeof page === "string") page = pageContext[0];

        const newPage: Page = this.applyDynamicPageUpdates(page)

        // Prototype currentPage for dynamicUpdate functunality (ex. that current page is defined for usage) ------If error add .clone()------
        this.data.currentPage = [page, pageContext[1], pageContext[2]]

        // calles updateFunction on page
        if (!this.anchor) throw new Error("[Page Menu] No anchor.")
        this.data.currentPage = [await this.anchor.update(newPage), pageContext[1], pageContext[2]]
    }
    
    defaulButtonCallbacks = {
        nextPageInCategory: () => {
            if (!this.data.currentPage) throw new Error("[PageMenu Error] Cant use Button since no pageMenu was send.")
            const currentCategory = this.getCategory(this.data.currentPage[0])

            if(!currentCategory) throw new Error("[Page Menu] CurrentCategory doesn't exist.")
            
            let nextIndex = this.data.currentPage[2] + 1
            if (nextIndex >= currentCategory[0].length) nextIndex = 0

            const nextPage = currentCategory[0][nextIndex]
            this.updateTo(nextPage)
        },

        absoluteNext: (skipCategoryIndex?: number) => {
            if (!this.data.currentPage) throw new Error("[PageMenu Error] Cant use Button since no pageMenu was send.")
            if (!this.data.categoryPages) return

            const categorys = Object.values(this.data.categoryPages)

            let nextCategoryIndex = this.getCategory(this.data.currentPage[0])![2]
            let nextPageIndex = this.data.currentPage[2] + 1

            if (nextPageIndex >= this.getCategory(this.data.currentPage[0])![0].length) {
                nextPageIndex = 0

                nextCategoryIndex++

                if (nextCategoryIndex >= categorys.length) {
                    nextCategoryIndex = 0
                }
                if (nextCategoryIndex === skipCategoryIndex) nextCategoryIndex++
            }

            const nextPage = categorys[nextCategoryIndex][nextPageIndex]
            this.updateTo(nextPage)
        },

        backPageInCategory: () => {
            if (!this.data.currentPage) throw new Error("[PageMenu Error] Cant use Button since no pageMenu was send.")
            const currentCategory = this.getCategory(this.data.currentPage[0])

            if(!currentCategory) throw new Error("[Page Menu] CurrentCategory doesn't exist.")
            
            let nextIndex = this.data.currentPage[2] - 1
            if (nextIndex < 0) nextIndex = currentCategory[0].length - 1

            const nextPage = currentCategory[0][nextIndex]
            this.updateTo(nextPage)
        },

        absoluteBack: (skipCategoryIndex?: number) => { /////////////////////////// FUTURE SKIP INDEX
            if (!this.data.currentPage) throw new Error("[PageMenu Error] Cant use Button since no pageMenu was send.")
            if (!this.data.categoryPages) return

            const categorys = Object.values(this.data.categoryPages)

            let nextCategoryIndex = this.getCategory(this.data.currentPage[0])![2]
            let nextPageIndex = this.data.currentPage[2] - 1

            if (nextPageIndex < 0) {
                nextCategoryIndex--
                if (nextCategoryIndex === skipCategoryIndex) nextCategoryIndex--

                if (nextCategoryIndex < 0 ) {
                    nextCategoryIndex = categorys.length - 1
                }

                nextPageIndex = categorys[nextCategoryIndex].length - 1
            }

            const nextPage = categorys[nextCategoryIndex][nextPageIndex]
            this.updateTo(nextPage)
        },

        // Future NextCategory Button to access Pages from Different Categorys

        // Future BackCategory Button to access Pages from Different Categorys
    }
}