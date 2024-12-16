import { InputFile } from "grammy/types"
import { generateNeuroImage } from "../helpers/generateNeuroImage"
import { getPrompt } from "src/core/supabase/ai"
import { buttonHandlers } from "src/helpers/buttonHandlers"
import { pulse } from "src/helpers"
import { MyContext } from "src/utils/types"

export async function handleGenerate(ctx: MyContext, data: string, isRu: boolean) {
  if (!ctx || !ctx.from) {
    await ctx.reply(isRu ? "Ошибка идентификации пользователя" : "User identification error")
    return
  }
  // Сразу отвечаем на callback query  начале
  await ctx.answerCallbackQuery().catch((e) => console.error("Ошибка при ответе на callback query:", e))

  const [_, count, promptId] = data.split("_")
  const promptData = await getPrompt(promptId)
  if (!promptData) {
    await ctx.reply(isRu ? "Не удалось найти информацию о промпте" : "Could not find prompt information")
    return
  }

  const generatingMessage = await ctx.reply(isRu ? "⏳ Генерация..." : "⏳ Generating...")

  try {
    const numImages = parseInt(count)
    for (let i = 0; i < numImages; i++) {
      console.log("Generating image 1")
      const result = await generateNeuroImage(promptData.prompt, promptData.model_type, ctx.from.id.toString())
      if (!result) {
        await ctx.reply(isRu ? "Ошибка при генерации изображения" : "Error generating image")
        continue
      }

      const photoToSend = Buffer.isBuffer(result.image) ? new InputFile(result.image) : result.image
      await ctx.replyWithPhoto(photoToSend)
      await ctx.reply(isRu ? `⏳ Сгенерировано ${i + 1} из ${numImages}...` : `⏳ Generated ${i + 1} of ${numImages}...`)

      const pulseImage = Buffer.isBuffer(result.image) ? `data:image/jpeg;base64,${result.image.toString("base64")}` : result.image
      await pulse(ctx, pulseImage, promptData.prompt, `/${promptData.model_type}`)
    }
  } catch (error) {
    console.error("Ошибка при генерации:", error)
    await ctx.reply(isRu ? "Произошла ошибка при генерации. Пожалуйста, попробуйте позже." : "An error occurred during generation. Please try again later.")
  } finally {
    buttonHandlers(ctx, promptId)
    await ctx.api.deleteMessage(ctx.chat?.id || "", generatingMessage.message_id).catch((e) => console.error("Ошибка при удалении сообщения о генерации:", e))
  }
}
