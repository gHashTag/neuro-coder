import { InlineKeyboard } from "grammy"
import { MyContext, MyConversation } from "../../utils/types"

import { getAvailableModels } from "./getAvailableModels"

// Функция для получения доступных моделей
const selectModel = async (conversation: MyConversation, ctx: MyContext) => {
  const isRu = ctx.from?.language_code === "ru"

  try {
    const models = await getAvailableModels()
    const keyboard = new InlineKeyboard()

    // Создаем кнопки для каждой модели, по 2 в ряд
    for (let i = 0; i < models.length; i += 2) {
      if (models[i]) {
        keyboard.text(models[i], `select_model_${models[i]}`)
      }
      if (models[i + 1]) {
        keyboard.text(models[i + 1], `select_model_${models[i + 1]}`)
      }
      keyboard.row()
    }

    await ctx.reply(
      isRu
        ? "🧠 Выберите модель ИИ\n\nМодель ИИ — это как мозг компьютера, который помогает ему понимать и выполнять задачи. Выберите одну из доступных моделей, чтобы бот мог лучше выполнять ваши запросы. Доступные модели:"
        : "🧠 Select AI Model\n\nAn AI model is like a computer's brain that helps it understand and perform tasks. Choose one of the available models so the bot can better handle your requests. Available models:",
      { reply_markup: keyboard },
    )
    return
  } catch (error) {
    console.error("Error creating model selection menu:", error)
    await ctx.reply(isRu ? "❌ Ошибка при получении списка моделей" : "❌ Error fetching models list")
  }
}

export { selectModel }
