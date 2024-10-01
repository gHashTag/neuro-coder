require("dotenv").config();

import { Bot } from "grammy";
import commands from "./commands";
import { development, production } from "./utils/launch";
import { MyContext } from "./utils/types";
import { hydrateFiles } from "@grammyjs/files";
import { conversations, createConversation } from "@grammyjs/conversations";
import { session, SessionFlavor } from "grammy";
import { imageSizeConversation } from "./commands/imagesize";
import { customMiddleware } from "./commands/helpers";
import { generateImageConversation } from "./commands/generateImage";
import { get100AnfiVesnaConversation } from "./commands/get100";
import { soulConversation } from "./commands/soul";
interface SessionData {
  melimi00: {
    videos: string[];
    texts: string[];
  };
}

type MyContextWithSession = MyContext & SessionFlavor<SessionData>;

const bot = new Bot<MyContextWithSession>(process.env.BOT_TOKEN || "");

bot.api.config.use(hydrateFiles(bot.token));

bot.use(session({ initial: () => ({}) }));
bot.api.setMyCommands([
  {
    command: "start",
    description: "👋 Начать использовать бота",
  },
  {
    command: "imagesize",
    description: "🖼️ Изменить размер генерируемого изображения",
  },
]);
bot.use(conversations());
bot.use(createConversation(imageSizeConversation));
bot.use(createConversation(generateImageConversation));
bot.use(createConversation(get100AnfiVesnaConversation));
bot.use(createConversation(soulConversation));
bot.use(customMiddleware);
bot.use(commands);

bot.catch((err) => {
  const ctx = err.ctx;
  console.error(`Ошибка при обработке обновления ${ctx.update.update_id}:`);
  console.error(err.error);
  ctx.reply("Извините, произошла ошибка при обработке вашего запроса. Пожалуйста, попробуйте позже.").catch((e) => {
    console.error("Ошибка отправки сообщения об ошибке пользователю:", e);
  });
});

console.log(process.env.NODE_ENV, "process.env.NODE_ENV");
process.env.NODE_ENV === "development" ? development(bot) : production(bot);

export { bot };
