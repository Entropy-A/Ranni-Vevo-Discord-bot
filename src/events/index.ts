import { Event, EventKeys } from "../types/event.js";

import ready from "./client/ready.js";
import interactionCreate from "./guild/interactionCreate.js";

export default [
    ready,
    interactionCreate,
] as Event[];