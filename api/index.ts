import { webhookCallback } from "grammy";
import bot from "../src/core/bot";
import { IncomingMessage, ServerResponse } from "http";

// Helper method to wait for a middleware to execute before continuing
// And to throw an error when an error happens in a middleware
function runMiddleware(req: IncomingMessage, res: ServerResponse, fn: Function): Promise<void> {
    return new Promise((resolve, reject) => {
        fn(req, res, (result: any) => {
            if (result instanceof Error) {
                return reject(result);
            }

            return resolve(result);
        });
    });
}

async function handler(req: IncomingMessage, res: ServerResponse): Promise<void> {
    // Run the middleware
    await runMiddleware(req, res, webhookCallback(bot, "std/http"));

    // Send a response to acknowledge the request
    res.statusCode = 200;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({ status: 'ok' }));
}

export default handler;