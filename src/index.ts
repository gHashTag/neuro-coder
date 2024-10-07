require("dotenv").config();

import { Bot } from "grammy";
import commands from "./commands";
import { development, production } from "./utils/launch";
import { MyContext } from "./utils/types";
import { hydrateFiles } from "@grammyjs/files";
import { conversations, createConversation } from "@grammyjs/conversations";
import { session, SessionFlavor } from "grammy";
import { imageSizeConversation } from "./commands/imagesize";
import { customMiddleware, generateImage, pulse } from "./commands/helpers";
import { generateImageConversation } from "./commands/generateImage";
import { get100AnfiVesnaConversation } from "./commands/get100";
import { soulConversation } from "./commands/soul";
import { voiceConversation } from "./commands/voice";
import { getGeneratedImages, getPrompt, setModel } from "./core/supabase/ai";
import { InputMediaPhoto } from "grammy/types";
import { inviterConversation } from "./commands/inviter";
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
bot.use(createConversation(inviterConversation));
bot.use(customMiddleware);
bot.use(commands);

bot.on("callback_query:data", async (ctx) => {
  const callbackData = ctx.callbackQuery.data;
  const isRu = ctx.from?.language_code === "ru";
  if (callbackData.startsWith("generate_")) {
    try {
      const count = parseInt(callbackData.split("_")[1]);
      const prompt_id = callbackData.split("_")[2];
      const info = await getGeneratedImages(ctx.from?.id.toString() || "");
      const { count: generatedCount, limit } = info;

      if (generatedCount >= limit) {
        await ctx.reply(
          isRu
            ? "⚠️ У вас не осталось использований. Пожалуйста, оплатите генерацию изображений."
            : "⚠️ You have no more uses left. Please pay for image generation.",
        );
        return;
      } else if (generatedCount + count > limit) {
        await ctx.reply(
          isRu
            ? `⚠️ У вас осталось ${limit - generatedCount} использований. Пожалуйста, оплатите генерацию изображений.`
            : `⚠️ You have ${limit - generatedCount} uses left. Please pay for image generation.`,
        );
        return;
      }

      if (ctx.callbackQuery.message?.message_id) {
        await ctx.api.deleteMessage(ctx.chat?.id || "", ctx.callbackQuery.message?.message_id);
      }

      const prompt = await getPrompt(prompt_id);
      const message = await ctx.reply(isRu ? "⏳ Генерация изображений началась..." : "⏳ Image generation has started...");

      const images: InputMediaPhoto[] = [];
      for (let i = 0; i < count; i++) {
        const { image } = await generateImage(prompt.prompt, prompt.model_type, ctx.from?.id.toString(), ctx, "");
        images.push({ type: "photo", media: image });
        await ctx.api.editMessageText(
          ctx.chat?.id || "",
          message.message_id,
          isRu ? `⏳ Сгенерировано изображений ${i + 1}/${count}...` : `⏳ Generated images ${i + 1}/${count}...`,
        );
        await pulse(ctx, image, prompt.prompt, `${prompt.model_type} (with callback)`);
      }

      await ctx.replyWithMediaGroup(images);
      await ctx.api.deleteMessage(ctx.chat?.id || "", message.message_id);
      await ctx.reply(isRu ? `🤔 Сгенерировать еще?` : `🤔 Generate more?`, {
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
      await ctx.reply(
        isRu
          ? "❌ Извините, произошла ошибка при генерации изображений. Пожалуйста, попробуйте позже."
          : "❌ Sorry, an error occurred while generating images. Please try again later.",
      );
    }
  } else if (callbackData.startsWith("model_")) {
    const model = callbackData.split("_")[1];
    const message_id = ctx.callbackQuery.message?.message_id;
    await setModel(ctx.from?.id.toString() || "", model);
    if (!message_id) return;
    await ctx.api.deleteMessage(ctx.chat?.id || "", message_id);
    await ctx.reply(isRu ? "🧠 Модель успешно изменена!" : "🧠 Model successfully changed!");
  }
});

bot.catch((err) => {
  const ctx = err.ctx;
  const isRu = ctx.from?.language_code === "ru";
  console.error(`Ошибка при обработке обновления ${ctx.update.update_id}:`);
  console.error(err.error);
  ctx
    .reply(
      isRu
        ? "Извините, произошла ошибка при обработке вашего запроса. Пожалуйста, попробуйте позже."
        : "Sorry, an error occurred while processing your request. Please try again later.",
    )
    .catch((e) => {
      console.error("Ошибка отправки сообщения об ошибке пользователю:", e);
    });
});

console.log(process.env.NODE_ENV, "process.env.NODE_ENV");
process.env.NODE_ENV === "development" ? development(bot) : production(bot);

export { bot };
