import { Bot } from "grammy";
import { MyContext } from "src/utils/types";

if (!process.env.BOT_TOKEN) {
  throw new Error("BOT_TOKEN is not defined");
}

const bot = new Bot<MyContext>(String(process.env.BOT_TOKEN));

export default bot;
