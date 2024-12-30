import { InputFile } from "grammy"
import { getPrompt } from "../../core/supabase/ai"
import { buttonNeuroHandlers } from "../../helpers/buttonNeuroHandlers"
import { generateNeuroImage } from "../../services/generateNeuroImage"
import { MyContext } from "../../utils/types"
import { getUserBalance, imageNeuroGenerationCost, sendBalanceMessage, sendInsufficientStarsMessage, updateUserBalance } from "../../helpers/telegramStars"
import { pulse } from "../../helpers"

export async function handleNeuroGenerate(ctx: MyContext, data: string, isRu: boolean) {
  if (!ctx || !ctx.from) {
    await ctx.reply(isRu ? "Ошибка идентификации пользователя" : "User identification error")
    return
  }

  const userId = ctx.from.id

  const currentBalance = await getUserBalance(userId)
  if (currentBalance < imageNeuroGenerationCost) {
    await sendInsufficientStarsMessage(ctx, isRu)
    return
  }

  console.log("Received neuro_generate_ callback with data:", data)

  const parts = data.split("_")
  console.log("Split parts:", parts)

  const count = parts[2]
  const promptId = parts[3]
  console.log("Extracted count and promptId:", { count, promptId })

  let generatingMessage: { message_id: number } | null = null

  try {
    const promptData = await getPrompt(promptId)
    console.log("Retrieved prompt data:", promptData)

    if (!promptData) {
      console.log("No prompt data found for ID:", promptId)
      await ctx.reply(isRu ? "Не удалось найти информацию о промпте" : "Could not find prompt information")
      return
    }

    generatingMessage = await ctx.reply(isRu ? "⏳ Генерация..." : "⏳ Generating...")

    try {
      const numImages = parseInt(count)
      console.log("Generating", numImages, "images")

      await generateNeuroImage(promptData.prompt, promptData.model_type, ctx.from.id, ctx, numImages)
    } catch (error) {
      console.error("Error in generation loop:", error)
      throw error
    }
  } catch (error) {
    console.error("Error in neuro_generate_ handler:", error)
    await ctx.reply(
      isRu
        ? "Произошла ошибка при генерации изображения. Пожалуйста, попробуйте озже."
        : "An error occurred while generating the image. Please try again later.",
    )
  } finally {
    if (generatingMessage) {
      await ctx.api.deleteMessage(ctx.chat?.id || "", generatingMessage.message_id).catch((e) => console.error("Error deleting message:", e))
    }
  }
}
