import { supabase } from "../../core/supabase"

import { generateImage } from "../../services/generateReplicateImage"
import { MyContext } from "../../interfaces"

export async function handleImageRetry(ctx: MyContext, isRu: boolean) {
  try {
    if (!ctx || !ctx.from) {
      await ctx.reply(isRu ? "Ошибка идентификации пользователя" : "User identification error")
      return
    }

    // Получаем последний промпт пользователя
    const { data: lastPrompt } = await supabase
      .from("prompts_history")
      .select("*")
      .eq("telegram_id", ctx.from.id.toString())
      .order("created_at", { ascending: false })
      .limit(1)
      .single()

    if (!lastPrompt) {
      await ctx.reply("Не найден предыдущий промпт для повторной генерации")
      return
    }

    console.log("Generating image 3")
    await generateImage(lastPrompt.prompt, lastPrompt.model_type, 1, ctx.from.id, isRu, ctx)
    return
  } catch (error) {
    console.error("Error in handleImageRetry:", error)
    throw error
  }
}
