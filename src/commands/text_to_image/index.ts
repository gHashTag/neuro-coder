import { Conversation } from "@grammyjs/conversations"
import { InlineKeyboard } from "grammy"
import { MyContext } from "../../utils/types"

import { generateImage } from "../../helpers/generateReplicateImage"

import { sendCostMessage, imageGenerationCost } from "../../helpers/telegramStars/telegramStars"

const textToImageConversation = async (conversation: Conversation<MyContext>, ctx: MyContext): Promise<void> => {
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

    await sendCostMessage(ctx, isRu, imageGenerationCost)

    const model_type = modelResponse.callbackQuery.data
    console.log(model_type, "model_type")
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

    await generateImage(text || "", model_type || "", ctx.from.id, isRu, ctx)

    // await ctx.api.deleteMessage(ctx.chat?.id || "", generatingMessage.message_id)

    // // Обработка изображения для pulse
    // const pulseImage = Buffer.isBuffer(image) ? `data:image/jpeg;base64,${image.toString("base64")}` : image
    // await pulse(ctx, pulseImage, text || "", `/${model_type}`)

    // Обновляем баланс пользователя
    // const newBalance = currentBalance - price
    // console.log(newBalance, "newBalance")
    // await updateUserBalance(ctx.from.id, newBalance)

    // await sendBalanceMessage(ctx, isRu, newBalance)

    // const info = await getGeneratedImages(ctx.from.id || 0)
    // const { count, limit } = info

    // if (count < limit) {
    //   await buttonHandlers(ctx, prompt_id?.toString() || "")
    // }
  } catch (error) {
    console.error("Error in generateImageConversation:", error)
    await ctx.reply(isRu ? `❌ Произошла ошибка: ${JSON.stringify(error)}` : `❌ An error occurred: ${JSON.stringify(error)}`)
  }
}

export { textToImageConversation }
