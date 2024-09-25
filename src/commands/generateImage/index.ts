import { generateImage, pulse } from "../helpers";
import { MyContext } from "../../utils/types";
import { Conversation } from "@grammyjs/conversations";
import { InlineKeyboard } from "grammy";
import { getGeneratedImages } from "../../core/supabase/ai";

async function generateImageConversation(conversation: Conversation<MyContext>, ctx: MyContext) {
  const keyboard = new InlineKeyboard().text("Отменить генерацию", "cancel");
  const model_type = ctx.message?.text?.slice(1);
  console.log(model_type);
  await ctx.reply("Привет! Напишите промпт на английском для генерации изображения.", {
    reply_markup: keyboard,
  });
  // Если вы хотите использовать какой-то референс, то прикрепите изображение к сообщению.
  const { message, callbackQuery } = await conversation.wait();
  const info = await getGeneratedImages(ctx.from?.id.toString() || "");
  const { count, limit } = info;

  if (count >= limit) {
    await ctx.reply("У вас не осталось использований. Пожалуйста, оплатите генерацию изображений.");
    return;
  }

  if (callbackQuery?.data === "cancel") {
    await ctx.reply("Вы отменили генерацию изображения.");
    return;
  }

  if (!message || !ctx.from?.id) return;

  const text = message.photo ? message.caption : message.text;
  let file;
  if (message.photo) {
    const referenceFileId = message.photo[0].file_id;
    file = await ctx.api.getFile(referenceFileId);
    console.log(file);
  }
  // const fileUrl = message.photo ? `https://api.telegram.org/file/bot${ctx.api.token}/${file.file_path}` : "";
  // console.log(fileUrl);
  const generatingMessage = await ctx.reply("Генерация изображения началась...");
  const image = await generateImage(text || "", model_type || "", ctx.from?.id.toString(), ctx);
  await ctx.api.deleteMessage(ctx.chat?.id || "", generatingMessage.message_id);
  await ctx.replyWithPhoto(image);
  await pulse(ctx, image, text || "", `/${model_type}`);
  if (count < limit) {
    await ctx.reply(`У вас осталось ${limit - count} использований.`);
    return;
  } else if (count === limit) {
    await ctx.reply(`У вас не осталось использований. Пожалуйста, оплатите генерацию изображений.`);
    return;
  }
}

export { generateImageConversation };
