import { Scenes, Markup } from "telegraf"
import { upgradePrompt } from "../../helpers"
import { MyContext } from "../../interfaces"
import { generateImage } from "services/generateReplicateImage"
import { generateNeuroImage } from "services/generateNeuroImage"
import { generateTextToVideo } from "services/generateTextToVideo"

const MAX_ATTEMPTS = 10

export const improvePromptWizard = new Scenes.WizardScene<MyContext>(
  "improvePromptWizard",
  async (ctx) => {
    const isRu = ctx.from?.language_code === "ru"
    console.log(ctx.session, "ctx.session")
    const prompt = ctx.session.prompt

    console.log(prompt, "prompt")

    if (!ctx.from) {
      await ctx.reply(isRu ? "Ошибка идентификации пользователя" : "User identification error")
      return ctx.scene.leave()
    }

    ctx.session.attempts = 0 // Инициализируем счетчик попыток

    await ctx.reply(isRu ? "⏳ Начинаю улучшение промпта..." : "⏳ Starting prompt improvement...")

    const improvedPrompt = await upgradePrompt(prompt)
    if (!improvedPrompt) {
      await ctx.reply(isRu ? "Не удалось улучшить промпт" : "Failed to improve prompt")
      return ctx.scene.leave()
    }

    ctx.session.prompt = improvedPrompt

    await ctx.reply(isRu ? "Улучшенный промпт:\n```\n" + improvedPrompt + "\n```" : "Improved prompt:\n```\n" + improvedPrompt + "\n```", {
      reply_markup: Markup.keyboard([
        [Markup.button.text(isRu ? "✅ Да. Cгенерировать?" : "✅ Yes. Generate?")],
        [Markup.button.text(isRu ? "🔄 Еще раз улучшить" : "🔄 Improve again")],
        [Markup.button.text(isRu ? "❌ Отмена" : "❌ Cancel")],
      ]).resize().reply_markup,
      parse_mode: "MarkdownV2",
    })

    return ctx.wizard.next()
  },
  async (ctx) => {
    const isRu = ctx.from?.language_code === "ru"
    const message = ctx.message

    if (message && "text" in message) {
      const text = message.text
      console.log(text, "text")

      if (!ctx.from?.id) {
        await ctx.reply(isRu ? "Ошибка идентификации пользователя" : "User identification error")
        return ctx.scene.leave()
      }

      if (text === (isRu ? "✅ Да. Cгенерировать?" : "✅ Yes. Generate?")) {
        // Логика для генерации изображения
        const mode = ctx.session.mode
        if (!mode) throw new Error(isRu ? "Не удалось определить режим" : "Could not identify mode")
        if (!ctx.session.videoModel) throw new Error(isRu ? "Не удалось определить модель" : "Could not identify model")
        if (!ctx.from.id) throw new Error(isRu ? "Не удалось определить telegram_id" : "Could not identify telegram_id")
        if (!ctx.from.username) throw new Error(isRu ? "Не удалось определить username" : "Could not identify username")
        if (!isRu) throw new Error(isRu ? "Не удалось определить isRu" : "Could not identify isRu")

        if (mode === "neuro_photo") {
          await generateNeuroImage(ctx.session.prompt, ctx.session.userModel.model_url, 1, ctx.from.id, ctx)
        } else if (mode === "text_to_video") {
          await generateTextToVideo(ctx.session.prompt, ctx.session.videoModel, ctx.from.id, ctx.from.username, isRu)
        } else if (mode === "generate_image") {
          await generateImage(ctx.session.prompt, ctx.session.selectedModel, 1, ctx.from.id, isRu, ctx)
        } else {
          throw new Error(isRu ? "Неизвестный режим" : "Unknown mode")
        }
        return ctx.scene.leave()
      } else if (text === (isRu ? "🔄 Еще раз улучшить" : "🔄 Improve again")) {
        ctx.session.attempts = (ctx.session.attempts || 0) + 1

        if (ctx.session.attempts >= MAX_ATTEMPTS) {
          await ctx.reply(isRu ? "Достигнуто максимальное количество попыток улучшения промпта." : "Maximum number of prompt improvement attempts reached.")
          return ctx.scene.leave()
        }

        // Повторное улучшение промпта
        await ctx.reply(isRu ? "⏳ Повторное улучшение промпта..." : "⏳ Re-improving prompt...")
        const improvedPrompt = await upgradePrompt(ctx.session.prompt)
        if (!improvedPrompt) {
          await ctx.reply(isRu ? "Не удалось улучшить промпт" : "Failed to improve prompt")
          return ctx.scene.leave()
        }

        ctx.session.prompt = improvedPrompt

        await ctx.reply(isRu ? "Улучшенный промпт:\n```\n" + improvedPrompt + "\n```" : "Improved prompt:\n```\n" + improvedPrompt + "\n```", {
          reply_markup: Markup.keyboard([
            [Markup.button.text(isRu ? "✅ Да. Cгенерировать?" : "✅ Yes. Generate?")],
            [Markup.button.text(isRu ? "🔄 Еще раз улучшить" : "🔄 Improve again")],
            [Markup.button.text(isRu ? "❌ Отмена" : "❌ Cancel")],
          ]).resize().reply_markup,
          parse_mode: "MarkdownV2",
        })

        // eslint-disable-next-line consistent-return
        return
      } else if (text === (isRu ? "❌ Отмена" : "❌ Cancel")) {
        await ctx.reply(isRu ? "Операция отменена" : "Operation cancelled")
        return ctx.scene.leave()
      }
    }

    await ctx.reply(isRu ? "Произошла ошибка при обработке запроса" : "An error occurred while processing the request")
    return ctx.scene.leave()
  },
)

export default improvePromptWizard
