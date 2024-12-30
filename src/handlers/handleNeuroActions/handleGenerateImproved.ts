import { generateNeuroImage } from "../../services/generateNeuroImage"

import { getPrompt } from "../../core/supabase/ai"
import { MyContext } from "../../utils/types"

export async function handleGenerateNeuroImproved(ctx: MyContext, data: string, isRu: boolean) {
  if (!ctx || !ctx.from) {
    throw new Error("Context or user not found")
  }

  console.log("Starting generate_improved_ handler")
  const promptId = data.split("_")[2]
  console.log("Prompt ID from callback:", promptId)

  const promptData = await getPrompt(promptId)
  console.log("Prompt data:", promptData)

  if (!promptData) {
    console.log("No prompt data found")
    await ctx.reply(isRu ? "Не удалось найти информацию о промпте" : "Could not find prompt information")
    await ctx.answerCallbackQuery()
    return
  }

  await ctx.reply(isRu ? "⏳ Начинаю улучшение промпта..." : "⏳ Starting prompt improvement...")

  try {
    console.log("Generating neuro image...")

    await generateNeuroImage(promptData.prompt, promptData.model_type, ctx.from.id, ctx, 1)
    return
  } catch (error) {
    console.error("Error in generate_improved_ handler:", error)
    await ctx.reply(
      isRu
        ? "Произошла ошибка при генерации улучшенного изображения. Пожалуйста, попробуйте позже."
        : "An error occurred while generating improved image. Please try again later.",
    )
  }
}
