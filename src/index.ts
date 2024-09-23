require("dotenv").config();

import { Bot } from "grammy";
import commands from "./commands";
import { development, production } from "./utils/launch";
import { MyContext } from "./utils/types";
import { hydrateFiles } from "@grammyjs/files";
import { conversations, createConversation } from "@grammyjs/conversations";
import { session, SessionFlavor } from "grammy";
import { melimiCatConversation } from "./commands/melimi/melimi_cat";
// import { neurocoderDjConversation } from "./commands/neurocoder/neurocoder_dj";
import { imageSizeConversation } from "./commands/imagesize";
import { playomConversation } from "./commands/playom";
import { anatol777Conversation } from "./commands/anatol777";
import { createUser } from "./core/supabase";
import { customMiddleware } from "./commands/helpers";

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
  {
    command: "playom",
    description: "🙍‍♀️ playom",
  },
  {
    command: "anatol777",
    description: "🙍‍♂️ anatol777",
  },
  {
    command: "melimi_cat",
    description: "🐱 melimi_cat",
  },
]);
bot.use(conversations());
bot.use(createConversation(melimiCatConversation));
// bot.use(createConversation(neurocoderDjConversation));
bot.use(createConversation(imageSizeConversation));
bot.use(createConversation(playomConversation));
bot.use(createConversation(anatol777Conversation));

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

console.log(process.env.NODE_ENV, 'process.env.NODE_ENV');
process.env.NODE_ENV === "development" ? development(bot) : production(bot);

export { bot };
