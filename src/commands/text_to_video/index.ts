import { Conversation } from "@grammyjs/conversations"

import { generateVideo } from "../../helpers/generateVideo"

import { InputFile } from "grammy"
import type { MyContext } from "../../utils/types"

export const textToVideoConversation = async (conversation: Conversation<MyContext>, ctx: MyContext): Promise<void> => {
  try {
    const isRu = ctx.from?.language_code === "ru"

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

    const { video } = await generateVideo(prompt, "minimax", ctx.from.id.toString())

    await ctx.api.deleteMessage(ctx.chat?.id || "", generatingMessage.message_id)

    // Отправляем видео
    await ctx.replyWithVideo(new InputFile(video))
  } catch (error: unknown) {
    console.error("Error in textToVideoConversation:", error)
    const isRu = ctx.from?.language_code === "ru"
    const errorMessage = error instanceof Error ? error.message : String(error)
    await ctx.reply(isRu ? `❌ Произошла ошибка: ${errorMessage}` : `❌ An error occurred: ${errorMessage}`)
  }
}
