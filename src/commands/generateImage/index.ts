import { generateImage, pulse } from "../helpers"
import { MyContext } from "../../utils/types"
import { Conversation } from "@grammyjs/conversations"
import { InlineKeyboard } from "grammy"
import { getGeneratedImages } from "../../core/supabase/ai"

async function generateImageConversation(conversation: Conversation<MyContext>, ctx: MyContext) {
  const isRu = ctx.from?.language_code === "ru"
  const keyboard = new InlineKeyboard().text(isRu ? "❌ Отменить генерацию" : "❌ Cancel generation", "cancel")
  const model_type = ctx.message?.text?.slice(1)
  console.log(model_type)
  const greetingMessage = await ctx.reply(
    isRu
      ? "👋 Привет! Напишите промпт на английском для генерации изображения. Если вы хотите использовать какой-то референс, то прикрепите изображение к сообщению."
      : "👋 Hello! Write a prompt in English to generate an image. If you want to use a reference image, then attach it to the message.",
    {
      reply_markup: keyboard,
    },
  )
  const { message, callbackQuery } = await conversation.wait()
  const info = await getGeneratedImages(ctx.from?.id.toString() || "")
  const { count, limit } = info

  if (count >= limit) {
    await ctx.reply(
      isRu
        ? "⚠️ У вас не осталось использований. Пожалуйста, оплатите генерацию изображений."
        : "⚠️ You have no more uses left. Please pay for image generation.",
    )
    return
  }

  if (callbackQuery?.data === "cancel") {
    await ctx.api.deleteMessage(ctx.chat?.id || "", greetingMessage.message_id)
    await ctx.reply(isRu ? "❌ Вы отменили генерацию изображения." : "❌ You canceled image generation.")
    return
  }

  if (!message || !ctx.from?.id) return

  const text = message.photo ? message.caption : message.text
  let file
  console.log(message.document)
  if (message.document) {
    const referenceFileId = message.document.file_id
    file = await ctx.api.getFile(referenceFileId)
  }
  const fileUrl = message.document ? `https://api.telegram.org/file/bot${ctx.api.token}/${file.file_path}` : ""
  console.log(fileUrl)
  const generatingMessage = await ctx.reply(isRu ? "⏳ Генерация изображения началась..." : "⏳ Image generation started...")
  const { image, prompt_id } = await generateImage(
    text || "",
    model_type || "",
    ctx.from?.id.toString(),
    ctx,
    "https://shopsycdn.com/i/p/c3/13/c3139b3a395ca6a1f7b0bbb54495cefb_medium.jpg",
  )
  await ctx.api.deleteMessage(ctx.chat?.id || "", generatingMessage.message_id)
  await ctx.replyWithPhoto(image)

  // // Добавление кнопки "Повторить генерацию" после отправки изображения
  // const retryKeyboard = new InlineKeyboard().text("🔄 Повторить генерацию", "retry");
  // await ctx.reply("🔄 Вы можете повторить генерацию изображения.", { reply_markup: retryKeyboard });

  await pulse(ctx, image, text || "", `/${model_type}`)
  if (count < limit) {
    await ctx.reply(isRu ? `ℹ️ У вас осталось ${limit - count} использований.` : `ℹ️ You have ${limit - count} uses left.`)
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
          [{ text: isRu ? "⬆️ Улучшить промпт" : "⬆️ Improve prompt", callback_data: `improve_${prompt_id}` }],
        ],
      },
    })
  } else if (count === limit) {
    await ctx.reply(
      isRu
        ? "⚠️ У вас не осталось использований. Пожалуйста, оплатите генерацию изображений."
        : "⚠️ You have no more uses left. Please pay for image generation.",
    )
  }

  // Обработка нажатия кнопки "Повторить генерацию"
  // const { callbackQuery: retryCallback } = await conversation.wait();
  // if (retryCallback?.data === "retry") {
  //   await ctx.reply("Сколько фото нужно сгенерировать?");
  //   const { message: countMessage } = await conversation.wait();
  //   const photoCount = parseInt(countMessage?.text || "", 10);

  //   if (isNaN(photoCount) || photoCount <= 0) {
  //     console.log(photoCount);
  //     await ctx.reply("Пожалуйста, введите корректное количество.");
  //     return;
  //   }

  //   for (let i = 0; i < photoCount; i++) {
  //     const image = await generateImage(text || "", model_type || "", ctx.from?.id.toString(), ctx, fileUrl);
  //     await ctx.replyWithPhoto(image);
  //     await pulse(ctx, image, text || "", `/${model_type}`);
  //   }
  //   if (count < limit) {
  //     await ctx.reply(`У вас осталось ${limit - count} использований.`);
  //   } else if (count === limit) {
  //     await ctx.reply(`У вас не осталось использований. Пожалуйста, оплатите генерацию изображений.`);
  //   }
  // }
}

export { generateImageConversation }
