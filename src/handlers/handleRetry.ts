import { InputFile } from "grammy/types"
import { supabase } from "../core/supabase"
import { pulse } from "../helpers"
import { generateImage } from "../helpers/generateImage"
import { MyContext } from "../utils/types"

export async function handleRetry(ctx: MyContext, isRu: boolean) {
  if (!ctx || !ctx.from) {
    await ctx.reply(isRu ? "Ошибка идентификации пользователя" : "User identification error")
    return
  }

  await ctx.answerCallbackQuery()
  // Получаем последний промпт пользователя
  const { data: lastPrompt } = await supabase
    .from("prompts_history")
    .select("*")
    .eq("telegram_id", ctx.from)
    .order("created_at", { ascending: false })
    .limit(1)
    .single()

  if (!lastPrompt) {
    await ctx.reply("Не найден предыдущий промпт для повторной генерации")
    return
  }

  console.log("Generating image 3")
  const result = await generateImage(lastPrompt.prompt, lastPrompt.model_type, ctx.from.id.toString())
  console.log("result4", result)
  if (!result) {
    throw new Error("Не удалось сенерирвать изображение")
  }

  // Отправляем новое изображение
  if (Buffer.isBuffer(result.image)) {
    await ctx.replyWithPhoto(new InputFile(result.image))
  } else {
    await ctx.replyWithPhoto(result.image)
  }

  // Отправляем в pulse
  const pulseImage = Buffer.isBuffer(result.image) ? `data:image/jpeg;base64,${result.image.toString("base64")}` : result.image

  await pulse(ctx, pulseImage, lastPrompt.prompt, `/${lastPrompt.model_type}`)

  // Показываем те же кнопки снова
  await ctx.reply("Что дальше?", {
    reply_markup: {
      inline_keyboard: [
        [{ text: "🔄 Повторить генерацию", callback_data: "retry" }],
        [{ text: "⬆️ Улучшить промпт", callback_data: "improve" }],
        [{ text: "🎥 Сгенерировать видео", callback_data: "video" }],
      ],
    },
  })
}
