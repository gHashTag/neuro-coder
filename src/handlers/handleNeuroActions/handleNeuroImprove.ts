import { Markup } from "telegraf"
import { getPrompt } from "../../core/supabase/ai"
import { upgradePrompt } from "../../helpers"
import { supabase } from "../../core/supabase"
import { MyContext } from "../../interfaces"

export async function handleNeuroImprove(ctx: MyContext, data: string, isRu: boolean) {
  try {
    if (!ctx || !ctx.from) {
      await ctx.reply(isRu ? "Ошибка идентификации пользователя" : "User identification error")
      return
    }
    console.log("Starting neuro_improve handler")
    const promptId = data.replace("neuro_improve_", "")
    console.log("Prompt ID:", promptId)

    const promptData = await getPrompt(promptId)
    console.log("Original prompt data:", promptData)

    if (!promptData) {
      await ctx.reply(isRu ? "Не удалось найти информацию о промпте" : "Could not find prompt information")
      return
    }

    await ctx.reply(isRu ? "⏳ Начинаю улучшение промпта..." : "⏳ Starting prompt improvement...")

    const improvedPrompt = await upgradePrompt(promptData.prompt)
    console.log("Improved prompt:", improvedPrompt)

    if (!improvedPrompt) {
      await ctx.reply(isRu ? "Не удалось улучшить промпт" : "Failed to improve prompt")
      return
    }

    // Сохраняем улучшенный промпт в базу данных
    const { data: savedPrompt, error } = await supabase
      .from("prompts_history")
      .insert({
        prompt: improvedPrompt,
        model_type: promptData.model_type,
        telegram_id: ctx.from.id.toString(),
        improved_from: promptId,
      })
      .select()
      .single()

    if (error || !savedPrompt) {
      throw new Error("Failed to save improved prompt")
    }

    // Показываем улучшенный промпт и спрашиваем подтверждение
    await ctx.reply(isRu ? `Улучшенный промпт:\n${improvedPrompt}\n\nСгенерировать изображение?` : `Improved prompt:\n${improvedPrompt}\n\nGenerate image?`, {
      reply_markup: {
        inline_keyboard: [
          [
            { text: "✅ Да", callback_data: `neuro_generate_improved_${savedPrompt.prompt_id}` },
            { text: "❌ Нет", callback_data: "neuro_cancel" },
          ],
        ],
      },
    })
  } catch (error) {
    console.error("Error improving neuro prompt:", error)
    await ctx.reply(
      isRu ? "Произошла ошибка при улучшении промпта. Пожалуйста, попробуйте позже." : "An error occurred while improving the prompt. Please try again later.",
    )
  }
}
