// src/handlers/modelHandler.ts
import { MyContext } from "../../utils/types"
import { setModel } from "../../core/supabase/ai"

export async function handleModelCallback(model: string, ctx: MyContext) {
  if (!ctx.from) {
    console.log("ctx.from is undefined")
    return
  }
  const isRu = ctx.from?.language_code === "ru"

  try {
    await setModel(ctx.from.id.toString(), model)
    // await ctx.answerCallbackQuery()
    await ctx.reply(isRu ? `✅ Модель успешно изменена на ${model}` : `✅ Model successfully changed to ${model}`)
  } catch (error) {
    console.error("Error setting model:", error)
    await ctx.answerCallbackQuery()
    await ctx.reply(isRu ? "❌ Ошибка при изменении модели" : "❌ Error changing model")
  }
}
