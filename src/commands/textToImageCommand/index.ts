import { Conversation } from "@grammyjs/conversations"
import { InlineKeyboard } from "grammy"
import { MyContext } from "../../utils/types"

import { generateImage } from "../../services/generateReplicateImage"

import { getUserBalance, sendBalanceMessage, sendInsufficientStarsMessage, textToImageGenerationCost } from "../../helpers/telegramStars/telegramStars"

const textToImageCommand = async (conversation: Conversation<MyContext>, ctx: MyContext): Promise<void> => {
  const isRu = ctx.from?.language_code === "ru"
  if (!ctx || !ctx.from || !ctx.from.id || !ctx.chat?.id) {
    await ctx.reply(isRu ? "❌ Произошла ошибка" : "❌ An error occurred")
    return
  }

  try {
    // Показываем меню выбора модели
    await ctx.reply(isRu ? "🎨 Выберите модель для генерации:" : "🎨 Choose generation model:", {
      reply_markup: {
        inline_keyboard: [
          [
            {
              text: "Flux 1.1Pro Ultra",
              callback_data: "flux",
            },
            {
              text: "SDXL",
              callback_data: "sdxl",
            },
          ],
          [
            {
              text: "SD 3.5 Turbo",
              callback_data: "sd3",
            },
            {
              text: "Recraft v3",
              callback_data: "recraft",
            },
          ],
          [
            {
              text: "Photon",
              callback_data: "photon",
            },
          ],
          [
            {
              text: isRu ? "Отмена" : "Cancel",
              callback_data: "cancel",
            },
          ],
        ],
      },
    })

    // Ждем выбор модели
    const modelResponse = await conversation.waitFor("callback_query:data")
    console.log(modelResponse, "modelResponse")
    if (modelResponse.callbackQuery.data === "cancel") {
      await ctx.reply(isRu ? "Генерация отменена" : "Generation cancelled")
      return
    }
    const currentBalance = await getUserBalance(ctx.from.id)
    const price = textToImageGenerationCost
    if (currentBalance < price) {
      await sendInsufficientStarsMessage(ctx, isRu)
      return
    }

    await sendBalanceMessage(currentBalance, textToImageGenerationCost, ctx, isRu)
    const model_type = modelResponse.callbackQuery.data

    const keyboard = new InlineKeyboard().text(isRu ? "Отменить генерацию" : "Cancel generation", "cancel")

    const greetingMessage = await ctx.reply(
      isRu ? "👋 Напишите промпт на английском для генерации изображения." : "👋 Hello! Write a prompt in English to generate an image.",
      { reply_markup: keyboard },
    )

    const { message, callbackQuery } = await conversation.wait()
    if (callbackQuery?.data === "cancel") {
      await ctx.api.deleteMessage(ctx.chat?.id || "", greetingMessage.message_id)
      await ctx.reply(isRu ? "❌ Генерация отменена" : "❌ Generation cancelled")
      return
    }

    if (!message || !ctx.from?.id) return

    const text = message.photo ? message.caption : message.text
    if (!text) {
      await generateImage(text || "", model_type || "", ctx.from.id, isRu, ctx)
      return
    } else {
      await ctx.reply(isRu ? "❌ Промпт не найден" : "❌ Prompt not found")
      return
    }
  } catch (error) {
    console.error("Error in generateImageConversation:", error)
    await ctx.reply(isRu ? `❌ Произошла ошибка: ${JSON.stringify(error)}` : `❌ An error occurred: ${JSON.stringify(error)}`)
  }
}

export { textToImageCommand }
