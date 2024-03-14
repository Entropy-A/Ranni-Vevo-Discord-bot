import { getEnvVar } from "../utils/env.js";

export const Keys = {
    clientToken: getEnvVar("TOKEN"),
    clientId: getEnvVar("ID"),
    testGuild: getEnvVar("TEST_GUILD"),
    characterToken: getEnvVar("CHARACTERAI_TOKEN"),
    characterId: getEnvVar("CHARACTERAI_ID"),
} as const;

export default Keys;