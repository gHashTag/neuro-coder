require("../src/index");

import { webhookCallback } from "grammy";
import bot from "../src/core/bot";

// Helper method to wait for a middleware to execute before continuing
// And to throw an error when an error happens in a middleware
function runMiddleware(req: any, res: any, fn: any) {
    return new Promise((resolve, reject) => {
        fn(req, res, (result: any) => {
            if (result instanceof Error) {
                return reject(result);
            }

            return resolve(result);
        });
    });
}

async function handler(req: any, res: any) {
    // Run the middleware
    await runMiddleware(req, res, webhookCallback(bot, "std/http"));
}

export default handler;
