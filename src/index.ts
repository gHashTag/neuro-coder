require("dotenv").config();

import { Bot } from "grammy";
import commands from "./commands";
import { development, production } from "./utils/launch";
import { MyContext } from "./utils/types";
import { hydrateFiles } from "@grammyjs/files";
import { conversations, createConversation } from "@grammyjs/conversations";
import { session, SessionFlavor } from "grammy";
import { imageSizeConversation } from "./commands/imagesize";
import { customMiddleware, generateImage } from "./commands/helpers";
import { generateImageConversation } from "./commands/generateImage";
import { get100AnfiVesnaConversation } from "./commands/get100";
import { soulConversation } from "./commands/soul";
import { voiceConversation } from "./commands/voice";
import { getGeneratedImages, getPrompt } from "./core/supabase/ai";
import { InputMediaPhoto } from "grammy/types";
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
    command: "avatar",
    description: "👤 Рассказать о себе аватару",
  },
  {
    command: "voice",
    description: "🎤 Добавить аватару голос",
  },
]);
bot.use(conversations());
bot.use(createConversation(imageSizeConversation));
bot.use(createConversation(generateImageConversation));
bot.use(createConversation(get100AnfiVesnaConversation));
bot.use(createConversation(soulConversation));
bot.use(createConversation(voiceConversation));
bot.use(customMiddleware);
bot.use(commands);

bot.on("callback_query:data", async (ctx) => {
  const callbackData = ctx.callbackQuery.data;
  if (callbackData.startsWith("generate_")) {
    try {
      const count = parseInt(callbackData.split("_")[1]);
      const prompt_id = callbackData.split("_")[2];
      const info = await getGeneratedImages(ctx.from?.id.toString() || "");
      const { count: generatedCount, limit } = info;

      if (generatedCount >= limit) {
        await ctx.reply("⚠️ У вас не осталось использований. Пожалуйста, оплатите генерацию изображений.");
        return;
      } else if (generatedCount + count > limit) {
        await ctx.reply(`⚠️ У вас осталось ${limit - generatedCount} использований. Пожалуйста, оплатите генерацию изображений.`);
        return;
      }

      if (ctx.callbackQuery.message?.message_id) {
        await ctx.api.deleteMessage(ctx.chat?.id || "", ctx.callbackQuery.message?.message_id);
      }

      const prompt = await getPrompt(prompt_id);
      const message = await ctx.reply("⏳ Генерация изображений началась...");

      const images: InputMediaPhoto[] = [];
      for (let i = 0; i < count; i++) {
        const { image } = await generateImage(prompt.prompt, prompt.model_type, ctx.from?.id.toString(), ctx, "");
        images.push({ type: "photo", media: image });
        await ctx.api.editMessageText(ctx.chat?.id || "", message.message_id, `⏳ Сгенерировано изображений ${i + 1}/${count}...`);
      }

      await ctx.replyWithMediaGroup(images);
      await ctx.api.deleteMessage(ctx.chat?.id || "", message.message_id);
      await ctx.reply(`🤔 Сгенерировать еще?`, {
        reply_markup: {
          inline_keyboard: [
            [
              { text: "1", callback_data: `generate_1_${prompt_id}` },
              { text: "2", callback_data: `generate_2_${prompt_id}` },
            ],
            [
              { text: "3", callback_data: `generate_3_${prompt_id}` },
              { text: "4", callback_data: `generate_4_${prompt_id}` },
            ],
          ],
        },
      });
    } catch (e) {
      console.error("Ошибка при генерации изображений:", e);
      await ctx.reply("❌ Извините, произошла ошибка при генерации изображений. Пожалуйста, попробуйте позже.");
    }
  }
});

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
