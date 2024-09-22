import { Bot } from "grammy";
import { MyContextWithSession } from "./types";

const production = async (bot: Bot<MyContextWithSession>): Promise<void> => {
  try {
    await bot.api.setWebhook(`${process.env.VERCEL_URL}/api/index`);
    console.log(`[SERVER] Bot starting webhook`);
  } catch (e) {
    console.error(e);
  }
};

const development = async (bot: Bot<MyContextWithSession>): Promise<void> => {
  try {
    await bot.api.deleteWebhook();
    console.log("[SERVER] Bot starting polling");
    await bot.start();
  } catch (e) {
    console.error(e);
  }
};

export { production, development };
