import { pulse } from "../../helpers"
import { MyContext } from "../../utils/types"
import { Conversation } from "@grammyjs/conversations"
import { InlineKeyboard, InputFile } from "grammy"
import { getGeneratedImages } from "../../core/supabase/ai"
import { generateMoreImagesButtons } from "../../helpers/buttonHandlers"
import { generateImage } from "src/helpers/generateImage"

const textToImageConversation = async (conversation: Conversation<MyContext>, ctx: MyContext): Promise<void> => {
  const isRu = ctx.from?.language_code === "ru"
  try {
    // Показываем меню выбора модели
    await ctx.reply(isRu ? "🎨 Выберите модель для генерации:" : "🎨 Choose generation model:", {
      reply_markup: {
        inline_keyboard: [
          [
            {
              text: "Flux 1.1Pro Ultra",
              callback_data: "select_model_flux",
            },
            {
              text: "SDXL",
              callback_data: "select_model_sdxl",
            },
          ],
          [
            {
              text: "SD 3.5 Turbo",
              callback_data: "select_model_sd3",
            },
            {
              text: "Recraft v3",
              callback_data: "select_model_recraft",
            },
          ],
          [
            {
              text: "Photon",
              callback_data: "select_model_photon",
            },
          ],
          [
            {
              text: isRu ? "❌ Отмена" : "❌ Cancel",
              callback_data: "cancel",
            },
          ],
        ],
      },
    })

    // Ждем выбор модели
    const modelResponse = await conversation.waitFor("callback_query:data")

    if (modelResponse.callbackQuery.data === "cancel") {
      await ctx.reply(isRu ? "❌ Генерация отменена" : "❌ Generation cancelled")
      return
    }

    const model_type = modelResponse.callbackQuery.data.replace("select_model_", "")

    const keyboard = new InlineKeyboard().text(isRu ? "❌ Отменить генерацию" : "❌ Cancel generation", "cancel")

    const greetingMessage = await ctx.reply(
      isRu ? "👋 Напишите промпт на английском для генерации изображения." : "👋 Hello! Write a prompt in English to generate an image.",
      { reply_markup: keyboard },
    )

    const { message, callbackQuery } = await conversation.wait()
    const info = await getGeneratedImages(ctx.from?.id.toString() || "")
    const { count, limit } = info

    if (count >= limit) {
      await ctx.reply(isRu ? "⚠️ У вас не осталось использований." : "⚠️ You have no more uses left.")
      return
    }

    if (callbackQuery?.data === "cancel") {
      await ctx.api.deleteMessage(ctx.chat?.id || "", greetingMessage.message_id)
      await ctx.reply(isRu ? "❌ Генерация отменена" : "❌ Generation cancelled")
      return
    }

    if (!message || !ctx.from?.id) return

    const text = message.photo ? message.caption : message.text

    const generatingMessage = await ctx.reply(isRu ? "⏳ Генерация..." : "⏳ Generating...")

    const { image, prompt_id } = await generateImage(text || "", model_type || "", ctx.from.id.toString(), ctx)

    if (!image) {
      throw new Error("Не удалось получить изображение")
    }

    await ctx.api.deleteMessage(ctx.chat?.id || "", generatingMessage.message_id)

    // Обработка изображения для отправки
    const photoToSend = Buffer.isBuffer(image) ? new InputFile(image) : image
    await ctx.replyWithPhoto(photoToSend).catch((error) => {
      console.error("Ошибка при отправке фото:", error)
      throw error
    })

    // Обработка изображения для pulse
    const pulseImage = Buffer.isBuffer(image) ? `data:image/jpeg;base64,${image.toString("base64")}` : image
    await pulse(ctx, pulseImage, text || "", `/${model_type}`)

    if (count < limit) {
      await ctx.reply(isRu ? `ℹ️ Осталось ${limit - count} использований` : `ℹ️ ${limit - count} uses left`)

      generateMoreImagesButtons(ctx, prompt_id)
    }
  } catch (error) {
    console.error("Error in generateImageConversation:", error)
    await ctx.reply(isRu ? `❌ Произошла ошибка: ${JSON.stringify(error)}` : `❌ An error occurred: ${JSON.stringify(error)}`)
  }
}

export { textToImageConversation }
