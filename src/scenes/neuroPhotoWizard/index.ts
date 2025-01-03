import { Scenes } from "telegraf"
import { ModelUrl, MyContext, UserModel } from "../../interfaces"

import { getUserBalance, imageNeuroGenerationCost, sendInsufficientStarsMessage, sendBalanceMessage } from "../../helpers/telegramStars/telegramStars"
import { generateNeuroImage } from "../../services/generateNeuroImage"
import { getLatestUserModel } from "../../core/supabase"

export const neuroPhotoWizard = new Scenes.WizardScene<MyContext>(
  "neuroPhotoWizard",
  async (ctx) => {
    console.log("CASE: neuroPhotoConversation")
    const isRu = ctx.from?.language_code === "ru"
    const userId = ctx.from?.id

    if (!userId) {
      await ctx.reply(isRu ? "❌ Ошибка идентификации пользователя" : "❌ User identification error")
      return ctx.scene.leave()
    }

    const currentBalance = await getUserBalance(userId)

    if (currentBalance < imageNeuroGenerationCost) {
      await sendInsufficientStarsMessage(ctx, isRu)
      return ctx.scene.leave()
    }

    await sendBalanceMessage(currentBalance, imageNeuroGenerationCost, ctx, isRu)

    // Получаем последнюю обученную модель пользователя
    const userModel = await getLatestUserModel(userId)

    console.log(userModel, "userModel")

    if (!userModel || !userModel.model_url) {
      await ctx.reply(
        isRu
          ? "❌ У вас нет обученных моделей. Используйте /train_flux_model чтобы создать свою модель."
          : "❌ You don't have any trained models. Use /train_flux_model to create your model.",
      )

      return ctx.scene.leave()
    }

    ctx.session.userModel = userModel as UserModel

    ctx.session.mode = "neuro_photo"

    // Запрашиваем промпт
    await ctx.reply(isRu ? `📸 Опишите, какую фотографию вы хотите сгенерировать` : `📸 Describe what kind of photo you want to generate.`, {
      reply_markup: {
        force_reply: true,
      },
    })

    return ctx.wizard.next()
  },
  async (ctx) => {
    const isRu = ctx.from?.language_code === "ru"
    const promptMsg = ctx.message

    if (promptMsg && "text" in promptMsg) {
      const promptText = promptMsg.text

      console.log(promptText, "promptText")
      console.log(ctx.session.userModel, "ctx.session.userModel")
      ctx.session.prompt = promptText
      const model_url = ctx.session.userModel.model_url as ModelUrl
      const trigger_word = ctx.session.userModel.trigger_word as string

      // Добавляем trigger word к промпту
      const userId = ctx.from?.id

      if (model_url && trigger_word) {
        console.log(model_url, "model_url")
        const fullPrompt = `Fashionable ${trigger_word}, ${promptText}`
        await generateNeuroImage(fullPrompt, model_url, 1, userId || 0, ctx)
      } else {
        await ctx.reply(isRu ? "❌ Некорректный промпт" : "❌ Invalid prompt")
      }
    }

    return ctx.scene.leave()
  },
)
