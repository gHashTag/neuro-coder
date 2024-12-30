import { generateImage } from "../../services/generateReplicateImage"
import { MyContext } from "../../utils/types"
import { sendInsufficientStarsMessage, getUserBalance, imageGenerationCost } from "../../helpers/telegramStars/telegramStars"

export async function handleGenerateImage(ctx: MyContext, data: string, isRu: boolean) {
  if (!ctx || !ctx.from) {
    await ctx.reply(isRu ? "Ошибка идентификации пользователя" : "User identification error")
    return
  }
  const prompt = data.replace("generate_image_", "")

  // Получаем текущий баланс пользователя
  const currentBalance = await getUserBalance(ctx.from.id)

  // Проверяем, достаточно ли средств
  if (currentBalance < imageGenerationCost) {
    await sendInsufficientStarsMessage(ctx, isRu)
    return
  }

  // Отправляем сообщение о начале генерации
  const generatingMsg = await ctx.reply(isRu ? "⏳ Генерирую изображение..." : "⏳ Generating image...")

  try {
    console.log("Generating image 2")
    await generateImage(prompt, "sdxl", ctx.from.id, isRu, ctx)
    return
  } catch (error) {
    console.error("Error generating image:", error)
    await ctx.reply(
      isRu
        ? "❌ Произошла ошибка при генерации изображен��я. Пожалуйста, попробуйте позже."
        : "❌ An error occurred while generating the image. Please try again later.",
    )
  } finally {
    // Удаляем сообщение о генерации
    await ctx.api.deleteMessage(ctx.chat?.id || "", generatingMsg.message_id).catch(console.error)
  }
  return
}
