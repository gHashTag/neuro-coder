import type { MyContext } from "../../interfaces"
import { textToVideoCost, sendBalanceMessage, getUserBalance, sendInsufficientStarsMessage } from "../../helpers/telegramStars/telegramStars"
import { generateTextToVideo } from "../../services/generateTextToVideo"
import { Markup } from "telegraf"
import { isRussian } from "../../utils/language"

export const textToVideoCommand = async (ctx: MyContext): Promise<void> => {
  const isRu = isRussian(ctx)
  try {
    if (!ctx.from) {
      throw new Error(isRu ? "Не удалось определить пользователя" : "Could not identify user")
    }

    if (!ctx.from.username) {
      throw new Error(isRu ? "Не удалось определить username" : "Could not identify username")
    }

    const currentBalance = await getUserBalance(ctx.from.id)
    const price = textToVideoCost

    if (currentBalance < price) {
      await sendInsufficientStarsMessage(ctx, isRu)
      return
    }

    await sendBalanceMessage(currentBalance, price, ctx, isRu)

    // Создаем клавиатуру для выбора модели
    const keyboard = Markup.inlineKeyboard([
      [Markup.button.callback("Minimax", "minimax")],
      [Markup.button.callback("Haiper", "haiper")],
      [Markup.button.callback("Ray", "ray")],
      [Markup.button.callback("I2VGen-XL", "i2vgen")],
    ])

    // Запрашиваем модель
    await ctx.reply(isRu ? "Выберите модель для генерации:" : "Choose generation model:", { reply_markup: keyboard })

    // Ждем выбор модели
    const modelResponse = await ctx.wait()
    const model = modelResponse.callbackQuery.data
    if (!model) {
      throw new Error(isRu ? "Не удалось определить модель" : "Could not identify model")
    }

    // Запрашиваем промпт
    await ctx.reply(isRu ? "Опишите видео, которое хотите сгенерировать:" : "Describe the video you want to generate:")

    const promptResponse = await ctx.wait()
    const prompt = promptResponse.message?.text

    if (!promptResponse.message || !prompt) {
      await ctx.reply(isRu ? "Пожалуйста, отправьте текстовое описание" : "Please send a text description")
      return
    }

    await ctx.reply(isRu ? "⏳ Генерация видео..." : "⏳ Generating video...")

    if (prompt) {
      await generateTextToVideo(prompt, model, ctx.from.id, ctx.from.username, isRu)
      return
    }
  } catch (error: unknown) {
    console.error("Error in textToVideoConversation:", error)
    const isRu = ctx.from?.language_code === "ru"
    const errorMessage = error instanceof Error ? error.message : String(error)
    await ctx.reply(isRu ? `❌ Произошла ошибка: ${errorMessage}` : `❌ An error occurred: ${errorMessage}`)
    throw error
  }
}
