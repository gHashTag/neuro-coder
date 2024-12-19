import { InputFile } from "grammy/types"
import { pulse } from "../helpers"
import { generateImage } from "../helpers/generateReplicateImage"
import { MyContext } from "../utils/types"

export async function handleGenerateImage(ctx: MyContext, data: string, isRu: boolean) {
  if (!ctx || !ctx.from) {
    await ctx.reply(isRu ? "Ошибка идентификации пользователя" : "User identification error")
    return
  }
  const prompt = data.replace("generate_image_", "")

  // Отправляем сообщение о начале генерации
  const generatingMsg = await ctx.reply(isRu ? "⏳ Генерирую изображение..." : "⏳ Generating image...")

  try {
    console.log("Generating image 2")
    const result = await generateImage(prompt, "sdxl", ctx.from.id)

    if (!result) {
      throw new Error("Failed to generate image")
    }

    // Отправляем сгенерированное изображение
    const photoToSend = Buffer.isBuffer(result.image) ? new InputFile(result.image) : result.image

    await ctx.replyWithPhoto(photoToSend)

    // Отправляем в pulse
    const pulseImage = Buffer.isBuffer(result.image) ? `data:image/jpeg;base64,${result.image.toString("base64")}` : result.image

    await pulse(ctx, pulseImage, prompt, "/sdxl")

    // Показываем кнопки для дальнейших действий
    await ctx.reply(isRu ? "Что дальше?" : "What's next?", {
      reply_markup: {
        inline_keyboard: [
          [{ text: isRu ? "🔄 Повторить генерацию" : "🔄 Regenerate", callback_data: "retry" }],
          [{ text: isRu ? "⬆️ Улучшить промпт" : "⬆️ Improve prompt", callback_data: "improve" }],
          [{ text: isRu ? "🎥 Сгенерировать видео" : "🎥 Generate video", callback_data: "video" }],
        ],
      },
    })
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
