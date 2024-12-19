import { InputFile } from "grammy"
import { generateNeuroImage } from "../helpers/generateNeuroImage"
import { getPrompt } from "../core/supabase/ai"
import { buttonHandlers } from "../helpers/buttonHandlers"
import { pulse } from "../helpers"
import { MyContext } from "../utils/types"
import {
  sendInsufficientStarsMessage,
  getUserBalance,
  starCost,
  imageGenerationCost,
  incrementBalance,
  sendBalanceMessage,
  updateUserBalance,
} from "../helpers/telegramStars/telegramStars"

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
      const currentBalance = await getUserBalance(ctx.from.id)
      const price = imageGenerationCost
      if (currentBalance < price) {
        await sendInsufficientStarsMessage(ctx, isRu)
        return
      }

      const result = await generateNeuroImage(promptData.prompt, promptData.model_type, ctx.from.id, ctx)
      if (!result) {
        await ctx.reply(isRu ? "Ошибка при генерации изображения" : "Error generating image")
        continue
      }

      const photoToSend = Buffer.isBuffer(result.image) ? new InputFile(result.image) : result.image
      await ctx.replyWithPhoto(photoToSend)
      await ctx.reply(isRu ? `⏳ Сгенерировано ${i + 1} из ${numImages}...` : `⏳ Generated ${i + 1} of ${numImages}...`)

      const pulseImage = Buffer.isBuffer(result.image) ? `data:image/jpeg;base64,${result.image.toString("base64")}` : result.image
      await pulse(ctx, pulseImage, promptData.prompt, `/${promptData.model_type}`)
      await updateUserBalance(ctx.from.id, currentBalance - price)

      await sendBalanceMessage(ctx, isRu, currentBalance - price)
    }
  } catch (error) {
    console.error("Ошибка при генерации:", error)
    await ctx.reply(isRu ? "Произошла ошибка при генерации. Пожалуйста, попробуйте позже." : "An error occurred during generation. Please try again later.")
  } finally {
    await buttonHandlers(ctx, promptId)
    await ctx.api.deleteMessage(ctx.chat?.id || "", generatingMessage.message_id).catch((e) => console.error("Ошибка при удалении сообщения о генерации:", e))
  }
}
