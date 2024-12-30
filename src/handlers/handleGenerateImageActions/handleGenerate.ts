import { generateNeuroImage } from "../../services/generateNeuroImage"
import { getPrompt } from "../../core/supabase/ai"

import { MyContext } from "../../utils/types"
import { sendInsufficientStarsMessage, getUserBalance, imageGenerationCost } from "../../helpers/telegramStars/telegramStars"

export async function handleGenerate(ctx: MyContext, data: string, isRu: boolean) {
  if (!ctx || !ctx.from) {
    await ctx.reply(isRu ? "Ошибка идентификации пользователя" : "User identification error")
    return
  }

  if (ctx.callbackQuery && ctx.callbackQuery.id) {
    await ctx.answerCallbackQuery({
      text: isRu ? "Генерация началась" : "Generation started",
      show_alert: false,
    })
  } else {
    console.error("Отсутствует ID callback query")
  }
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [_, count, promptId] = data.split("_")
  const promptData = await getPrompt(promptId)
  if (!promptData) {
    await ctx.reply(isRu ? "Не удалось найти информацию о промпте" : "Could not find prompt information")
    return
  }

  await ctx.reply(isRu ? "⏳ Генерация..." : "⏳ Generating...")

  try {
    const numImages = parseInt(count)
    console.log("numImages", numImages)

    const currentBalance = await getUserBalance(ctx.from.id)
    const price = imageGenerationCost
    if (currentBalance < price) {
      await sendInsufficientStarsMessage(ctx, isRu)
      return
    } else {
      await generateNeuroImage(promptData.prompt, promptData.model_type, ctx.from.id, ctx, numImages)
      return
    }
  } catch (error) {
    console.error("Ошибка при генерации:", error)
    await ctx.reply(isRu ? "Произошла ошибка при генерации. Пожалуйста, попробуйте позже." : "An error occurred during generation. Please try again later.")
  }
}
