import { Scenes, Markup } from "telegraf"
import { upgradePrompt } from "../../helpers"
import { MyContext } from "../../interfaces"
import { generateImage } from "services/generateReplicateImage"

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

    await ctx.reply(isRu ? "⏳ Начинаю улучшение промпта..." : "⏳ Starting prompt improvement...")

    const improvedPrompt = await upgradePrompt(prompt)
    if (!improvedPrompt) {
      await ctx.reply(isRu ? "Не удалось улучшить промпт" : "Failed to improve prompt")
      return ctx.scene.leave()
    }

    ctx.session.prompt = improvedPrompt

    await ctx.reply(isRu ? "Улучшенный промпт:\n```\n" + improvedPrompt + "\n```" : "Improved prompt:\n```\n" + improvedPrompt + "\n```", {
      reply_markup: Markup.keyboard([
        [Markup.button.text(isRu ? "✅ Да. Cгенерировать изображение?" : "✅ Yes. Generate image?")],
        [Markup.button.text(isRu ? "❌ Нет" : "❌ No")],
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

      if (text === (isRu ? "✅ Да. Cгенерировать изображение?" : "✅ Yes. Generate image?")) {
        // Логика для генерации изображения
        await generateImage(ctx.session.prompt, ctx.session.selectedModel, 1, ctx.from.id, isRu, ctx)
        return ctx.scene.leave()
      } else if (text === (isRu ? "❌ Нет" : "❌ No")) {
        await ctx.reply(isRu ? "Операция отменена" : "Operation cancelled")
        return ctx.scene.leave()
      }
    }

    await ctx.reply(isRu ? "Произошла ошибка при обработке запроса" : "An error occurred while processing the request")
    return ctx.scene.leave()
  },
)

export default improvePromptWizard
