import { generateImage } from "../../services/generateReplicateImage"
import { MyContext } from "../../interfaces"
import { sendInsufficientStarsMessage, getUserBalance, textToImageGenerationCost } from "../../helpers/telegramStars/telegramStars"

export async function handleGenerateImage(ctx: MyContext, data: string, isRu: boolean) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let generatingMsg: any
  try {
    if (!ctx || !ctx.from) {
      await ctx.reply(isRu ? "Ошибка идентификации пользователя" : "User identification error")
      return
    }

    const prompt = data.replace("generate_image_", "")

    // Получаем текущий баланс пользователя
    const currentBalance = await getUserBalance(ctx.from.id)

    // Проверяем, достаточно ли средств
    if (currentBalance < textToImageGenerationCost) {
      await sendInsufficientStarsMessage(ctx, isRu)
      return
    }

    // Отправляем сообщение о начале генерации
    generatingMsg = await ctx.reply(isRu ? "⏳ Генерирую изображение..." : "⏳ Generating image...")

    ctx.session.prompt = prompt
    try {
      await generateImage(prompt, "sdxl", 1, ctx.from.id, isRu, ctx)
      return
    } catch (error) {
      console.error("Error generating image:", error)
      await ctx.reply(
        isRu
          ? "❌ Произошла ошибка при генерации изображения. Пожалуйста, попробуйте позже."
          : "❌ An error occurred while generating the image. Please try again later.",
      )
    } finally {
      // Удаляем сообщение о генерации
      if (generatingMsg) {
        await ctx.telegram.deleteMessage(ctx.chat?.id || "", generatingMsg.message_id).catch(console.error)
      }
    }
    return
  } catch (error) {
    console.error("Error in handleGenerateImage:", error)
    throw error
  }
}
