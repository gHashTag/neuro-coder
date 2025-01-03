import { generateNeuroImage } from "../../services/generateNeuroImage"
import { getPrompt } from "../../core/supabase/ai"

import { MyContext } from "../../interfaces"
import { sendInsufficientStarsMessage, getUserBalance, textToImageGenerationCost } from "../../helpers/telegramStars"

export async function handleGenerate(ctx: MyContext, data: string, isRu: boolean) {
  try {
    if (!ctx || !ctx.from) {
      await ctx.reply(isRu ? "Ошибка идентификации пользователя" : "User identification error")
      return
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const [_, count, promptId] = data.split("_")
    const promptData = await getPrompt(promptId)
    if (!promptData) {
      await ctx.reply(isRu ? "Не удалось найти информацию о промпте" : "Could not find prompt information")
      return
    }

    const numImages = parseInt(count)
    console.log("numImages", numImages)

    const currentBalance = await getUserBalance(ctx.from.id)
    const price = textToImageGenerationCost
    if (currentBalance < price) {
      await sendInsufficientStarsMessage(ctx, isRu)
      return
    } else {
      await generateNeuroImage(promptData.prompt, promptData.model_type, numImages, ctx.from.id, ctx)
      return
    }
    return
  } catch (error) {
    console.error("Ошибка при генерации:", error)
    await ctx.reply(isRu ? "Произошла ошибка при генерации. Пожалуйста, попробуйте позже." : "An error occurred during generation. Please try again later.")
    throw error
  }
}
