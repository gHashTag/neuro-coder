import { upgradePrompt } from "src/helpers"
import { getPrompt } from "src/core/supabase/ai"
import { MyContext } from "src/utils/types"
import { supabase } from "src/core/supabase"

export async function handleImprove(ctx: MyContext, data: string, isRu: boolean) {
  if (!ctx || !ctx.from) {
    await ctx.reply(isRu ? "Ошибка идентификации пользователя" : "User identification error")
    return
  }
  await ctx.answerCallbackQuery().catch((e) => console.error("Ошибка при ответе на callback query:", e))

  const promptId = data.split("_")[1]
  const promptData = await getPrompt(promptId)

  if (!promptData) {
    await ctx.reply(isRu ? "Не удалось найти информацию о промпте" : "Could not find prompt information")
    return
  }

  await ctx.reply(isRu ? "⏳ Начинаю улучшение промпта..." : "⏳ Starting prompt improvement...")

  try {
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

    // Показываем улучшенный промпт и спрашиваем подтверждение
    await ctx.reply(isRu ? `Улучшенный промпт:\n${improvedPrompt}\n\nСгенерировать изображение?` : `Improved prompt:\n${improvedPrompt}\n\nGenerate image?`, {
      reply_markup: {
        inline_keyboard: [
          [{ text: isRu ? "✅ Да" : "✅ Yes", callback_data: `generate_1_${savedPrompt.prompt_id}` }],
          [{ text: isRu ? "❌ Нет" : "❌ No", callback_data: "cancel" }],
        ],
      },
    })
  } catch (error) {
    console.error("Ошибка при улучшении прмпта:", error)
    await ctx.reply(isRu ? "Произошла ошибка при улучшении промпта" : "An error occurred while improving the prompt")
  }
}
