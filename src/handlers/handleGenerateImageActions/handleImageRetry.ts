import { supabase } from "../../core/supabase"

import { generateImage } from "../../helpers/generateReplicateImage"
import { MyContext } from "../../utils/types"

export async function handleImageRetry(ctx: MyContext, isRu: boolean) {
  if (!ctx || !ctx.from) {
    await ctx.reply(isRu ? "Ошибка идентификации пользователя" : "User identification error")
    return
  }

  await ctx.answerCallbackQuery()
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
  await generateImage(lastPrompt.prompt, lastPrompt.model_type, ctx.from.id, isRu, ctx)

  return
}
