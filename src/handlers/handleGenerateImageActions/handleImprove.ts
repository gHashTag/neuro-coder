import { upgradePrompt } from "../../helpers"
import { getPrompt } from "../../core/supabase/ai"
import { MyContext } from "../../interfaces"
import { supabase } from "../../core/supabase"

export async function handleImprove(ctx: MyContext, data: string, isRu: boolean) {
  try {
    if (!ctx || !ctx.from) {
      await ctx.reply(isRu ? "Ошибка идентификации пользователя" : "User identification error")
      return
    }

    const promptId = data.split("_")[2]
    console.log(promptId, "promptId")
    const promptData = await getPrompt(promptId)
    console.log(promptData, "promptData")

    if (!promptData) {
      await ctx.reply(isRu ? "Не удалось найти информацию о промпте" : "Could not find prompt information")
      return
    }

    await ctx.reply(isRu ? "⏳ Начинаю улучшение промпта..." : "⏳ Starting prompt improvement...")

    const improvedPrompt = await upgradePrompt(promptData.prompt)
    if (!improvedPrompt) {
      await ctx.reply(isRu ? "Не удалось улучшить промпт" : "Failed to improve prompt")
      return
    }

    // Сохраняем улучшенный промпт
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
      console.error("Ошибка при сохранении улучшенного промпта:", error)
      await ctx.reply(isRu ? "Ошибка при сохранении улучшенного промпта" : "Error saving improved prompt")
      return
    }

    await ctx.reply(isRu ? "Улучшенный промпт:\n```\n" + improvedPrompt + "\n```" : "Improved prompt:\n```\n" + improvedPrompt + "\n```", {
      reply_markup: {
        inline_keyboard: [
          [{ text: isRu ? "✅ Да. Cгенерировать?" : "✅ Yes. Generate?", callback_data: `generate_1_${savedPrompt.prompt_id}` }],
          [{ text: isRu ? "❌ Нет" : "❌ No", callback_data: "cancel" }],
        ],
      },
      parse_mode: "MarkdownV2",
    })
    return
  } catch (error) {
    console.error("Ошибка при улучшении прмпта:", error)
    await ctx.reply(isRu ? "Произошла ошибка при улучшении промпта" : "An error occurred while improving the prompt")
    return
  }
}
