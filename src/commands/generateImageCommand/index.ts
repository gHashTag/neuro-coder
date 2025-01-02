import { Conversation } from "@grammyjs/conversations"
import { InlineKeyboard } from "grammy"
import { generateNeuroImage } from "../../services/generateNeuroImage"
import { MyContext } from "../../utils/types"
import { getGeneratedImages } from "../../core/supabase/ai"

const generateImageCommand = async (conversation: Conversation<MyContext>, ctx: MyContext): Promise<void> => {
  const isRu = ctx.from?.language_code === "ru"
  try {
    const keyboard = new InlineKeyboard().text(isRu ? "❌ Отменить генерацию" : "❌ Cancel generation", "cancel")
    const model_type = ctx.message?.text?.slice(1)

    const greetingMessage = await ctx.reply(
      isRu
        ? "👋 Привет! Напишите промпт на английском для генерации изображения. Если вы хотите использовать какой-то референс, то прикрепите изображение к сообщению."
        : "👋 Hello! Write a prompt in English to generate an image. If you want to use a reference image, then attach it to the message.",
      {
        reply_markup: keyboard,
      },
    )
    const { message, callbackQuery } = await conversation.wait()
    const info = await getGeneratedImages(ctx.from?.id || 0)
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

    if (!text) {
      throw new Error("Text is required")
    }
    if (!model_type) {
      throw new Error("Model type is required")
    }
    await generateNeuroImage(text, model_type, ctx.from.id, ctx, 1)
    return
  } catch (error) {
    console.error("Error in generateImageConversation:", error)
    await ctx.reply(isRu ? `❌ Произошла ошибка: ${error}` : `❌ An error occurred: ${error}`)
  }
}

export { generateImageCommand }
