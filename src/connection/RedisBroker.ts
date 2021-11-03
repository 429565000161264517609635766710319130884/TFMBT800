
import { createClient } from 'redis';

const MODULE_NAME = "[RedisBroker]";

var pendingInit: true | null = true;
var subClient: ReturnType<typeof createClient>;
var pubClient: ReturnType<typeof createClient>;

export async function subscribeChannel(...args: Parameters<typeof subClient.subscribe>) {
    if (pendingInit) throw MODULE_NAME + " Cannot subscribe before init!";
    return subClient.subscribe(...args);
}

export function publishChannel(...args: Parameters<typeof pubClient.publish>) {
    if (pendingInit) throw MODULE_NAME + " Cannot publish before init!";
    return pubClient.publish(...args);
}

export function isReady() {
    return !pendingInit;
}

/**
 * Creates the Redis sub/pub. Throws an error if failed.
 */
export async function initRedis() {
    var client = createClient({
        url: process.env.REDIS_URL,
    });

    subClient = client as typeof subClient;
    pubClient = subClient.duplicate();

    await Promise.all([subClient.connect(), pubClient.connect()]);
    console.debug(MODULE_NAME, "connected.");

    pendingInit = null;
}