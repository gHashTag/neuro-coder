import { InputFile } from "grammy"
import { getPrompt } from "../../core/supabase/ai"
import { generateNeuroImage } from "../../helpers/generateNeuroImage"
import { buttonNeuroHandlers } from "../../helpers/buttonNeuroHandlers"
import { MyContext } from "../../utils/types"

export async function handleNeuroGenerateImproved(ctx: MyContext, data: string, isRu: boolean) {
  if (!ctx || !ctx.from) {
    await ctx.reply(isRu ? "Ошибка идентификации пользователя" : "User identification error")
    return
  }
  console.log("Starting generation of improved prompt")
  const promptId = data.replace("neuro_generate_improved_", "")
  console.log("Generating with prompt ID:", promptId)

  let generatingMessage: { message_id: number } | null = null

  try {
    const promptData = await getPrompt(promptId)
    console.log("Retrieved prompt data:", promptData)

    if (!promptData) {
      await ctx.reply(isRu ? "Не удалось найти информацию о промпте" : "Could not find prompt information")
      return
    }

    generatingMessage = await ctx.reply(isRu ? "⏳ Генерация..." : "⏳ Generating...")

    await generateNeuroImage(promptData.prompt, promptData.model_type, ctx.from.id, ctx, 1)
    return
  } catch (error) {
    console.error("Error generating improved image:", error)
    await ctx.reply(
      isRu
        ? "Произошла ошибка при генерации изображения. Пожалуйста, попробуйте позже."
        : "An error occurred while generating the image. Please try again later.",
    )
  } finally {
    if (generatingMessage) {
      await ctx.api.deleteMessage(ctx.chat?.id || "", generatingMessage.message_id).catch((e) => console.error("Error deleting message:", e))
    }
  }
}
