import { Markup } from "telegraf"
import { MyContext } from "../../interfaces"

import { getAvailableModels } from "./getAvailableModels"

// Функция для получения доступных моделей
const selectModelCommand = async (ctx: MyContext) => {
  const isRu = ctx.from?.language_code === "ru"

  try {
    const models = await getAvailableModels()

    // Создаем кнопки для каждой модели, по 2 в ряд
    const buttons: ReturnType<typeof Markup.button.callback>[][] = []
    for (let i = 0; i < models.length; i += 2) {
      const row: ReturnType<typeof Markup.button.callback>[] = []
      if (models[i]) {
        row.push(Markup.button.callback(models[i], `select_model_${models[i]}`))
      }
      if (models[i + 1]) {
        row.push(Markup.button.callback(models[i + 1], `select_model_${models[i + 1]}`))
      }
      buttons.push(row)
    }

    // Добавляем кнопку для выбора модели ИИ
    buttons.unshift([Markup.button.callback(isRu ? "🧠 Выберите модель ИИ" : "🧠 Select AI Model", "select_model")])

    const keyboard = Markup.inlineKeyboard(buttons)

    await ctx.reply("Выберите модель:", keyboard)

    return
  } catch (error) {
    console.error("Error creating model selection menu:", error)
    await ctx.reply(isRu ? "❌ Ошибка при получении списка моделей" : "❌ Error fetching models list")
  }
}

export { selectModelCommand }
