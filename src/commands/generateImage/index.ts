import { MyContext } from "../../utils/types"
import { Conversation } from "@grammyjs/conversations"
import { InlineKeyboard } from "grammy"
import { getGeneratedImages } from "../../core/supabase/ai"
import { InputFile } from "grammy"
import { buttonHandlers } from "../../helpers/buttonHandlers"
import { generateImage } from "../../helpers/generateImage"
import { generateNeuroImage } from "src/helpers/generateNeuroImage"

export const generateMoreImagesButtons = async (ctx: MyContext, prompt_id: string | number | null) => {
  try {
    // Если prompt_id равен null, не показываем кнопки
    if (prompt_id === null) {
      return
    }

    const isRu = ctx.from?.language_code === "ru"

    await ctx.reply(isRu ? "Что дальше?" : "What's next?", {
      reply_markup: {
        inline_keyboard: [
          [
            {
              text: isRu ? "🔄 Сгенерировать ещё" : "🔄 Generate more",
              callback_data: `generate_more_${prompt_id}`,
            },
          ],
          [
            {
              text: isRu ? "🎨 Другая модель" : "🎨 Different model",
              callback_data: "select_model",
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
  } catch (error) {
    console.error("Error in buttonHandlers:", error)
  }
}

const generateImageConversation = async (conversation: Conversation<MyContext>, ctx: MyContext): Promise<void> => {
  const isRu = ctx.from?.language_code === "ru"
  try {
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

    if (message.document) {
      const referenceFileId = message.document.file_id
      file = await ctx.api.getFile(referenceFileId)
    }
    const fileUrl = message.document ? `https://api.telegram.org/file/bot${ctx.api.token}/${file.file_path}` : ""
    console.log(fileUrl)
    const generatingMessage = await ctx.reply(isRu ? "⏳ Генерация..." : "⏳ Generating...")
    if (!text) {
      throw new Error("Text is required")
    }
    if (!model_type) {
      throw new Error("Model type is required")
    }
    const result = await generateNeuroImage(text, model_type, ctx.from.id.toString())
    if (!result) {
      throw new Error("Failed to generate image")
    }

    const { image, prompt_id } = result

    if (!image) {
      throw new Error("Не удалось получить изображение")
    }

    await ctx.api.deleteMessage(ctx.chat?.id || "", generatingMessage.message_id)

    // Отправляем изображение
    const photoToSend = Buffer.isBuffer(image) ? new InputFile(image) : image
    await ctx.replyWithPhoto(photoToSend, {
      caption: isRu ? "🎨 Изображение сгенерировано!" : "🎨 Image generated!",
    })

    // Показываем кнопки для дальнейших действий
    await buttonHandlers(ctx, prompt_id?.toString() || "")
  } catch (error) {
    console.error("Error in generateImageConversation:", error)
    await ctx.reply(isRu ? `❌ Произошла ошибка: ${error}` : `❌ An error occurred: ${error}`)
  }
}

export { generateImageConversation }
