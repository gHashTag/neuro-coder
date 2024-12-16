import { InlineKeyboard } from "grammy"
import { MyContext } from "../utils/types"

export async function buttonNeuroHandlers(ctx: MyContext, prompt_id: string) {
  console.log("buttonNeuroHandlers called with prompt_id:", prompt_id)
  const isRu = ctx.from?.language_code === "ru"

  try {
    console.log("Creating keyboard...")
    const keyboard = new InlineKeyboard()

    // Формируем callback data для кнопок
    const callbacks = Array.from({ length: 4 }, (_, i) => {
      const callbackData = `neuro_generate_${i + 1}_${prompt_id}`
      console.log(`Generated callback data for button ${i + 1}:`, callbackData)
      return callbackData
    })

    keyboard
      .text("1️⃣", callbacks[0])
      .text("2️⃣", callbacks[1])
      .text("3️⃣", callbacks[2])
      .text("4️⃣", callbacks[3])
      .row()
      .text(isRu ? "⬆️ Улучшить" : "⬆️ Improve", `neuro_improve_${prompt_id}`)
      .row()
      .text(isRu ? "🎥 Создать видео" : "🎥 Create video", `neuro_video_${prompt_id}`)

    console.log("Sending reply with keyboard...")
    await ctx.reply(isRu ? "Выберите количество изображений или действие:" : "Select number of images or action:", {
      reply_markup: keyboard,
    })
    console.log("Reply with keyboard sent successfully")
  } catch (error) {
    console.error("Error in buttonNeuroHandlers:", error)
  }
}
