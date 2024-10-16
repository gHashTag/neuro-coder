import { generateImage } from "../helpers";
import { MyContext } from "../../utils/types";
import { Conversation } from "@grammyjs/conversations";
import { InlineKeyboard } from "grammy";

async function get100AnfiVesnaConversation(conversation: Conversation<MyContext>, ctx: MyContext) {
  const keyboard = new InlineKeyboard().text("Отменить генерацию", "cancel");
  const model_type = "kirill_korolev";
  console.log(model_type);
  await ctx.reply(
    "Привет! Напишите промпт на английском для генерации изображения. Если вы хотите использовать какой-то референс, то прикрепите изображение к сообщению.",
    {
      reply_markup: keyboard,
    },
  );
  const { message, callbackQuery } = await conversation.wait();

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
  }
  const fileUrl = message.photo ? `https://api.telegram.org/file/bot${ctx.api.token}/${file.file_path}` : "";
  console.log(fileUrl);
  const generatingMessage = await ctx.reply("Генерация изображения началась...");
  for (let i = 0; i < 100; i++) {
    const { image } = await generateImage(text || "", model_type || "", ctx.from?.id.toString(), ctx, fileUrl);
    await ctx.replyWithPhoto(image, { caption: `Фото: ${i + 1} / 100` });
  }
  await ctx.api.deleteMessage(ctx.chat?.id || "", generatingMessage.message_id);
  return;
}
export { get100AnfiVesnaConversation };
