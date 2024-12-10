import { generateImage, pulse } from "../../helpers"
import { MyContext } from "../../utils/types"
import { Conversation } from "@grammyjs/conversations"
import { InlineKeyboard, InputFile } from "grammy"
import { getGeneratedImages } from "../../core/supabase/ai"
import { generateMoreImagesButtons } from "../../helpers/buttonHandlers"

const generateImageConversation = async (conversation: Conversation<MyContext>, ctx: MyContext): Promise<void> => {
  const isRu = ctx.from?.language_code === "ru"
  try {
    const keyboard = new InlineKeyboard().text(isRu ? "❌ Отменить генерацию" : "❌ Cancel generation", "cancel")
    const model_type = ctx.message?.text?.slice(1)

    const greetingMessage = await ctx.reply(
      isRu ? "👋 Привет! Напишите промпт на английском для генерации изображения." : "👋 Hello! Write a prompt in English to generate an image.",
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
    let fileUrl = ""

    if (message.document) {
      const file = await ctx.api.getFile(message.document.file_id)
      fileUrl = `https://api.telegram.org/file/bot${ctx.api.token}/${file.file_path}`
    }

    const generatingMessage = await ctx.reply(isRu ? "⏳ Генерация..." : "⏳ Generating...")

    const { image, prompt_id } = await generateImage(text || "", model_type || "", ctx.from.id.toString(), ctx)

    await ctx.api.deleteMessage(ctx.chat?.id || "", generatingMessage.message_id)

    // Обработка изображения для отправки
    const photoToSend = Buffer.isBuffer(image) ? new InputFile(image) : image
    await ctx.replyWithPhoto(photoToSend)

    // Обработка изображения для pulse
    const pulseImage = Buffer.isBuffer(image) ? `data:image/jpeg;base64,${image.toString("base64")}` : image
    await pulse(ctx, pulseImage, text || "", `/${model_type}`)

    if (count < limit) {
      await ctx.reply(isRu ? `ℹ️ Осталось ${limit - count} использований` : `ℹ️ ${limit - count} uses left`)

      generateMoreImagesButtons(ctx, prompt_id)
    }
  } catch (error) {
    console.error("Error in generateImageConversation:", error)
    await ctx.reply(isRu ? "❌ Произошла ошибка" : "❌ An error occurred")
  }
}

export { generateImageConversation }
