import { Scenes } from "telegraf"
import type { MyContext } from "../../interfaces"
import { textToVideoCost, sendBalanceMessage, getUserBalance, sendInsufficientStarsMessage } from "../../helpers/telegramStars/telegramStars"
import { generateTextToVideo } from "../../services/generateTextToVideo"
import { isRussian } from "../../utils/language"
import { videoModelKeyboard } from "../../menu"

export const textToVideoWizard = new Scenes.WizardScene<MyContext>(
  "textToVideoWizard",
  async (ctx) => {
    const isRu = isRussian(ctx)
    try {
      if (!ctx.from) {
        throw new Error(isRu ? "Не удалось определить пользователя" : "Could not identify user")
      }

      if (!ctx.from.username) {
        throw new Error(isRu ? "Не удалось определить username" : "Could not identify username")
      }

      const currentBalance = await getUserBalance(ctx.from.id)
      const price = textToVideoCost

      if (currentBalance < price) {
        await sendInsufficientStarsMessage(ctx, isRu)
        await ctx.scene.leave()
        return
      }

      await sendBalanceMessage(currentBalance, price, ctx, isRu)

      // Запрашиваем модель
      await ctx.reply(isRu ? "Выберите модель для генерации:" : "Choose generation model:", { reply_markup: videoModelKeyboard.reply_markup })

      ctx.wizard.next()
    } catch (error: unknown) {
      console.error("Error in textToVideoWizard:", error)
      const errorMessage = error instanceof Error ? error.message : String(error)
      await ctx.reply(isRu ? `❌ Произошла ошибка: ${errorMessage}` : `❌ An error occurred: ${errorMessage}`)
      await ctx.scene.leave()
    }
  },
  async (ctx) => {
    const isRu = isRussian(ctx)
    const message = ctx.message as { text?: string }
    if (!message.text) throw new Error(isRu ? "Не удалось определить модель" : "Could not identify model")

    if (message && "text" in message) {
      ctx.session.videoModel = message.text?.toLowerCase()
      await ctx.reply(isRu ? "Пожалуйста, отправьте текстовое описание" : "Please send a text description")
      ctx.wizard.next()
    } else {
      await ctx.reply(isRu ? "Произошла ошибка при обработке запроса" : "An error occurred while processing the request")
      await ctx.scene.leave()
    }
  },
  async (ctx) => {
    const isRu = isRussian(ctx)
    const message = ctx.message

    if (message && "text" in message) {
      const prompt = message.text

      console.log("prompt", prompt)

      if (!prompt) {
        await ctx.reply(isRu ? "Пожалуйста, отправьте текстовое описание" : "Please send a text description")
        return
      }

      const videoModel = ctx.session.videoModel
      console.log("videoModel", videoModel)
      if (prompt && videoModel && ctx.from && ctx.from.username) {
        await generateTextToVideo(prompt, videoModel, ctx.from.id, ctx.from.username, isRu)
        ctx.session.mode = "text_to_video"
        ctx.session.prompt = prompt
      }

      await ctx.scene.leave()
    } else {
      await ctx.reply(isRu ? "Произошла ошибка при обработке запроса" : "An error occurred while processing the request")
      await ctx.scene.leave()
    }
  },
)

export default textToVideoWizard
