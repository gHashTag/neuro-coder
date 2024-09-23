import { generateImage } from "../helpers";
import { MyContext } from "../../utils/types";
import { Conversation } from "@grammyjs/conversations";
import { InlineKeyboard } from "grammy";
import { getGeneratedImages } from "../../core/supabase/ai";

async function anatol777Conversation(conversation: Conversation<MyContext>, ctx: MyContext) {
  const keyboard = new InlineKeyboard().text("Отмена", "cancel");
  await ctx.reply("Привет! Напиши промпт для генерации изображения.", {
    reply_markup: keyboard,
  });
  const { message, callbackQuery } = await conversation.wait();
  const info = await getGeneratedImages(ctx.from?.id.toString() || "");
  const { count, limit } = info;

  if (callbackQuery?.data === "cancel") {
    await ctx.reply("Вы отменили генерацию изображения.");
    return;
  }

  if (!message || !ctx.from?.id) return;

  const generatingMessage = await ctx.reply("Генерация изображения началась...");
  const image = await generateImage(`TOK ${message.text}` || "", "anatol777", ctx.from?.id.toString());
  await ctx.api.deleteMessage(ctx.chat?.id || "", generatingMessage.message_id);
  await ctx.replyWithPhoto(image);
  if (count < limit) {
    await ctx.reply(`У вас осталось ${limit - count} использований.`);
    return;
  } else if (count === limit) {
    await ctx.reply(`У вас не осталось использований. Пожалуйста, оплатите генерацию изображений.`);
    return;
  }
}

export { anatol777Conversation };
