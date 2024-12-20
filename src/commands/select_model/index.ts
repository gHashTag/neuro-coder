import { Composer, InlineKeyboard } from "grammy"
import { MyContext } from "../../utils/types"
import OpenAI from "openai"
import { handleModelCallback } from "../../handlers/handleModelCallback"

const composer = new Composer<MyContext>()

// Функция для получения доступных моделей
async function getAvailableModels(): Promise<string[]> {
  try {
    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    })

    const models = await openai.models.list()

    // Фильтруем только GPT модели и сортируем их
    return models.data
      .filter((model) => model.id.includes("gpt") && !model.id.includes("instruct") && !model.id.includes("0613") && !model.id.includes("0301"))
      .map((model) => model.id)
      .sort()
  } catch (error) {
    console.error("Error fetching models:", error)
    // Возвращаем базовые модели если произошла ошибка
    return ["gpt-4", "gpt-4-turbo", "gpt-3.5-turbo"]
  }
}

composer.command("select_model", async (ctx) => {
  const isRu = ctx.from?.language_code === "ru"

  try {
    const models = await getAvailableModels()
    const keyboard = new InlineKeyboard()

    // Создаем кнопки для каждой модели, по 2 в ряд
    for (let i = 0; i < models.length; i += 2) {
      if (models[i]) {
        keyboard.text(models[i], `model_${models[i]}`)
      }
      if (models[i + 1]) {
        keyboard.text(models[i + 1], `model_${models[i + 1]}`)
      }
      keyboard.row()
    }

    await ctx.reply(
      isRu
        ? "🧠 Выберите модель ИИ\n\nМодель ИИ — это как мозг компьютера, который помогает ему понимать и выполнять задачи. Выберите одну из доступных моделей, чтобы бот мог лучше выполнять ваши запросы. Доступные модели:"
        : "🧠 Select AI Model\n\nAn AI model is like a computer's brain that helps it understand and perform tasks. Choose one of the available models so the bot can better handle your requests. Available models:",
      { reply_markup: keyboard },
    )
  } catch (error) {
    console.error("Error creating model selection menu:", error)
    await ctx.reply(isRu ? "❌ Ошибка при получении списка моделей" : "❌ Error fetching models list")
  }
})

composer.callbackQuery(/^model_/, async (ctx) => {
  const model = ctx.callbackQuery.data.replace("model_", "")
  await handleModelCallback(model, ctx)
})

export default composer
