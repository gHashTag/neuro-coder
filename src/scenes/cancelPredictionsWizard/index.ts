import axios from "axios"
import { MyContext } from "../../interfaces"
import { refundUser } from "../../helpers/telegramStars"
import { Scenes } from "telegraf"
import { isRussian } from "utils/language"

export const cancelPredictionsWizard = new Scenes.WizardScene<MyContext>("cancelPredictionsWizard", async (ctx) => {
  try {
    // Получаем список предсказаний
    const response = await axios.get("https://api.replicate.com/v1/predictions", {
      headers: {
        Authorization: `Bearer ${process.env.REPLICATE_API_TOKEN}`,
      },
    })

    const predictions = response.data.results
    console.log("predictions", predictions)

    // Фильтруем предсказания по статусу и prompt
    const predictionsToCancel = predictions.filter((prediction: any) => {
      const isMatchingPrompt = prediction.input.prompt === ctx.session.prompt
      const isCancelableStatus = ["starting", "processing", "queued"].includes(prediction.status)
      return isMatchingPrompt && isCancelableStatus
    })
    console.log("predictionsToCancel", predictionsToCancel)

    // Отменяем каждое подходящее предсказание
    for (const prediction of predictionsToCancel) {
      await axios.post(
        prediction.urls.cancel,
        {},
        {
          headers: {
            Authorization: `Bearer ${process.env.REPLICATE_API_TOKEN}`,
          },
        },
      )
      console.log(`Cancelled prediction with ID: ${prediction.id}`)
      const isRu = isRussian(ctx)
      // Отправляем сообщение пользователю
      await ctx.reply(isRu ? `Запрос с ID: ${prediction.id} успешно отменен.` : `Request with ID: ${prediction.id} successfully cancelled.`)

      if (ctx.from) {
        const paymentAmount = ctx.session.paymentAmount
        console.log("paymentAmount", paymentAmount)
        await refundUser(ctx, paymentAmount)
      }
    }
  } catch (error) {
    console.error("Error cancelling predictions:", error)
    await ctx.reply("Произошла ошибка при отмене предсказания. Пожалуйста, попробуйте позже.")
  }
})
