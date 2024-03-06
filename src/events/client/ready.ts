import { Events, Event } from "../../types/index.js";

export default new Event({
    key: Events.ClientReady, 
    callback: async({log}, client) => {
        log(`Logged in as ${client.user.username}.`);
    },
    once: true
})