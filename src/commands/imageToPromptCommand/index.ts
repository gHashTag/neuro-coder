import { Conversation } from "@grammyjs/conversations"

import { MyContext } from "../../utils/types"

import { getUserBalance, imageToPromptCost, sendBalanceMessage } from "../../helpers/telegramStars/telegramStars"
import { generateImageToPrompt } from "../../services/generateImageToPrompt"

if (!process.env.HUGGINGFACE_TOKEN) {
  throw new Error("HUGGINGFACE_TOKEN is not set")
}

export const imageToPromptCommand = async (conversation: Conversation<MyContext>, ctx: MyContext) => {
  const isRu = ctx.from?.language_code === "ru"
  try {
    console.log("CASE: imageToPromptCommand")
    if (!ctx.from?.id) {
      await ctx.reply("User ID not found")
      return
    }

    const userId = ctx.from?.id
    const currentBalance = await getUserBalance(userId)

    await sendBalanceMessage(currentBalance, imageToPromptCost, ctx, isRu)

    // Запрашиваем изображение
    await ctx.reply(isRu ? "Пожалуйста, отправьте изображение для генерации промпта" : "Please send an image to generate a prompt")

    // Ждем изображение от пользователя и проверяем его тип
    console.log("Waiting for photo message...")
    const imageMsg = await conversation.waitFor("message:photo")
    console.log("Received photo message:", imageMsg.message?.photo)

    if (!imageMsg.message?.photo) {
      console.log("No photo in message")
      await ctx.reply(isRu ? "Пожалуйста, отправьте изображение" : "Please send an image")
      return
    }

    // Отправляем сообщение о начале обработки
    await ctx.reply(isRu ? "⏳ Генерирую промпт..." : "⏳ Generating prompt...")

    // Получаем файл изображения
    const photoSize = imageMsg.message.photo[imageMsg.message.photo.length - 1]
    console.log("Getting file info for photo:", photoSize.file_id)
    const file = await ctx.api.getFile(photoSize.file_id)
    const imageUrl = `https://api.telegram.org/file/bot${process.env.BOT_TOKEN}/${file.file_path}`
    await generateImageToPrompt(imageUrl, ctx.from.id, ctx, isRu)
    return
  } catch (error) {
    console.error("Error in image_to_prompt conversation:", error)
    await ctx.reply(isRu ? "❌ Произошла ошибка. Пожалуйста, попробуйте еще раз или позже." : "❌ An error occurred. Please try again or later.")
    throw error
  }
}
