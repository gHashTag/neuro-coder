import { Conversation } from "@grammyjs/conversations"
import { generateVideo } from "../../helpers/generateVideo"
import { InputFile } from "grammy"
import type { MyContext } from "../../utils/types"
import { InlineKeyboard } from "grammy"

export const textToVideoConversation = async (conversation: Conversation<MyContext>, ctx: MyContext): Promise<void> => {
  try {
    const isRu = ctx.from?.language_code === "ru"

    // Создаем клавиатуру для выбора модели
    const keyboard = new InlineKeyboard().text("Minimax", "minimax").text("Haiper", "haiper")

    // Запрашиваем модель
    await ctx.reply(isRu ? "Выберите модель для генерации:" : "Choose generation model:", { reply_markup: keyboard })

    // Ждем выбор модели
    const modelResponse = await conversation.waitFor("callback_query")
    const model = modelResponse.callbackQuery.data

    // Запрашиваем промпт
    await ctx.reply(isRu ? "Опишите видео, которое хотите сгенерировать:" : "Describe the video you want to generate:")

    const promptResponse = await conversation.waitFor(":text")
    const prompt = promptResponse.message?.text

    if (!promptResponse.message || !prompt) {
      await ctx.reply(isRu ? "Пожалуйста, отправьте текстовое описание" : "Please send a text description")
      return
    }

    const generatingMessage = await ctx.reply(isRu ? "⏳ Генерация видео..." : "⏳ Generating video...")

    if (!ctx.from) {
      throw new Error(isRu ? "Не удалось определить пользователя" : "Could not identify user")
    }

    if (!model) {
      throw new Error(isRu ? "Не удалось определить модель" : "Could not identify model")
    }

    const { video } = await generateVideo(prompt, model, ctx.from.id.toString())

    await ctx.api.deleteMessage(ctx.chat?.id || "", generatingMessage.message_id)

    // Отправляем видео как файл, а не как base64 строку
    await ctx.replyWithVideo(new InputFile(video), {
      caption: prompt,
      supports_streaming: true,
    })
  } catch (error: unknown) {
    console.error("Error in textToVideoConversation:", error)
    const isRu = ctx.from?.language_code === "ru"
    const errorMessage = error instanceof Error ? error.message : String(error)
    await ctx.reply(isRu ? `❌ Произошла ошибка: ${errorMessage}` : `❌ An error occurred: ${errorMessage}`)
  }
}
