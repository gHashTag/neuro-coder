import { InputFile } from "grammy"
import { getPrompt } from "../core/supabase/ai"
import { buttonNeuroHandlers } from "../helpers/buttonNeuroHandlers"
import { generateNeuroImage } from "../helpers/generateNeuroImage"
import { MyContext } from "../utils/types"

export async function handleNeuroGenerate(ctx: MyContext, data: string, isRu: boolean) {
  if (!ctx || !ctx.from) {
    await ctx.reply(isRu ? "Ошибка идентификации пользователя" : "User identification error")
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

      for (let i = 0; i < numImages; i++) {
        console.log(`Starting generation of image ${i + 1}/${numImages}`)
        const result = await generateNeuroImage(promptData.prompt, promptData.model_type, ctx.from.id, ctx)

        if (!result) {
          console.error("Generation returned null result")
          throw new Error("Failed to generate neuro image")
        }

        console.log("Generation successful, sending photo...")
        const photoToSend = Buffer.isBuffer(result.image) ? new InputFile(result.image) : result.image
        await ctx.replyWithPhoto(photoToSend)

        if (numImages > 1) {
          await ctx.reply(isRu ? `⏳ Сгенерировано ${i + 1} из ${numImages}...` : `⏳ Generated ${i + 1} of ${numImages}...`)
        }
      }

      console.log("All images generated, showing buttons with promptId:", promptId)
      await buttonNeuroHandlers(ctx, promptId)
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
