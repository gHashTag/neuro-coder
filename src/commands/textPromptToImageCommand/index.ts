import { MyContext } from "../../interfaces"
import { getUserBalance, sendBalanceMessage, sendInsufficientStarsMessage, textToImageGenerationCost } from "../../helpers/telegramStars/telegramStars"
import { isRussian } from "../../utils/language"
import { Markup } from "telegraf"

export const textPromptToImageCommand = async (ctx: MyContext): Promise<void> => {
  const isRu = isRussian(ctx)
  try {
    console.log("CASE: textPromptToImageCommand")

    if (!ctx || !ctx.from || !ctx.from.id || !ctx.chat?.id) {
      await ctx.reply(isRu ? "❌ Произошла ошибка" : "❌ An error occurred")
      return
    }

    console.log("pre modelResponse")

    const modelResponse = ctx.session.selectedModel
    console.log(modelResponse, "modelResponse")

    const currentBalance = await getUserBalance(ctx.from.id)
    const price = textToImageGenerationCost
    if (currentBalance < price) {
      await sendInsufficientStarsMessage(ctx, isRu)
      return
    }

    await sendBalanceMessage(currentBalance, textToImageGenerationCost, ctx, isRu)

    const model_type = ctx.session.selectedModel
    console.log(model_type, "model_type")

    const keyboard = Markup.keyboard([[Markup.button.text(isRu ? "Отменить генерацию" : "Cancel generation")]])

    const greetingMessage = await ctx.reply(
      isRu ? "👋 Напишите промпт на английском для генерации изображения." : "👋 Hello! Write a prompt in English to generate an image.",
      {
        reply_markup: keyboard,
      },
    )

    const { message, callbackQuery } = await ctx.wait()
    if (callbackQuery?.data === "cancel") {
      await ctx.api.deleteMessage(ctx.chat?.id || "", greetingMessage.message_id)
      await ctx.reply(isRu ? "❌ Генерация отменена" : "❌ Generation cancelled")
      return
    }

    if (!message || !ctx.from?.id) return

    const text = message.photo ? message.caption : message.text

    // const text = "a beautiful girl"
    console.log(text, "text")

    // await generateImage(text || "", model_type || "", ctx.from.id, isRu, ctx)
    await ctx.conversation.exit()
    return
  } catch (error) {
    console.error("Error in generateImageConversation:", error)
    await ctx.reply(isRu ? `❌ Произошла ошибка: ${JSON.stringify(error)}` : `❌ An error occurred: ${JSON.stringify(error)}`)
    throw error
  }
}
