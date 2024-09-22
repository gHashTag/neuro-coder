import { generateImage } from "../helpers";
import { MyContext } from "../../utils/types";
import { Conversation } from "@grammyjs/conversations";
import { InlineKeyboard } from "grammy";
import { getGeneratedImages } from "../../core/supabase/ai";

async function playomConversation(conversation: Conversation<MyContext>, ctx: MyContext) {
  const keyboard = new InlineKeyboard().text("Отмена", "cancel");
  await ctx.reply("Привет! Напиши промпт для генерации изображения.", {
    reply_markup: keyboard,
  });
  const { message, callbackQuery } = await conversation.wait();

  if (callbackQuery?.data === "cancel") {
    await ctx.reply("Вы отменили генерацию изображения.");
    return;
  }

  if (!message || !ctx.from?.id) return;

  const image = await generateImage(`TOK ${message.text}` || "", "playom", ctx.from?.id.toString());
  await ctx.replyWithPhoto(image);
  const info = await getGeneratedImages(ctx.from?.id.toString() || "");
  const { count, limit } = info;
  if (count < limit) {
    await ctx.reply(`У вас осталось ${limit - count} использований.`);
    return;
  } else if (count === limit) {
    await ctx.reply(`У вас не осталось использований. Пожалуйста, оплатите генерацию изображений.`);
    return;
  }
}

export { playomConversation };
