import { Context, InputFile } from "grammy"

import { generateNeuroImage } from "../../helpers/generateNeuroImage"
import { buttonNeuroHandlers } from "../../helpers/buttonNeuroHandlers"
import { getPrompt } from "../../core/supabase/ai"
import { MyContext } from "../../utils/types"

export async function handleGenerateNeuroImproved(ctx: Context, data: string, isRu: boolean) {
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
    const result = await generateNeuroImage(promptData.prompt, promptData.model_type, ctx.from.id, ctx)
    console.log("Generation result with prompt_id:", result?.prompt_id)

    if (!result) {
      throw new Error("Failed to generate neuro image")
    }

    const photoToSend = Buffer.isBuffer(result.image) ? new InputFile(result.image) : result.image
    console.log("Sending photo...")
    await ctx.replyWithPhoto(photoToSend)
    console.log("Photo sent")

    console.log("Adding neuro buttons with prompt_id:", result.prompt_id)
    await buttonNeuroHandlers(ctx as MyContext, result.prompt_id?.toString() || "")
    console.log("Neuro buttons added")
  } catch (error) {
    console.error("Error in generate_improved_ handler:", error)
    await ctx.reply(
      isRu
        ? "Произошла ошибка при генерации улучшенного изображения. Пожалуйста, попробуйте позже."
        : "An error occurred while generating improved image. Please try again later.",
    )
  }
}
