import { Scenes } from "telegraf"
import { getUserBalance, sendBalanceMessage, validateAndCalculatePrice } from "../../helpers/telegramStars"
import { generateImageToVideo } from "../../services/generateImageToVideo"
import { VideoModel, MyContext, VIDEO_MODELS } from "../../interfaces"
import { cancelMenu, videoModelKeyboard } from "../../menu"
import { isRussian } from "utils/language"

export const imageToVideoWizard = new Scenes.WizardScene<MyContext>(
  "imageToVideoWizard",
  async (ctx) => {
    const isRu = isRussian(ctx)
    // Запрашиваем модель
    await ctx.reply(isRu ? "Выберите модель для генерации:" : "Choose generation model:", { reply_markup: videoModelKeyboard.reply_markup })

    return ctx.wizard.next()
  },
  async (ctx) => {
    const isRu = isRussian(ctx)

    if (!ctx.from) {
      await ctx.reply(isRu ? "Пользователь не найден" : "User not found")
      return ctx.scene.leave()
    }

    const message = ctx.message as { text?: string }

    if (message && "text" in message) {
      const videoModel = message.text?.toLowerCase()
      console.log("videoModel", videoModel)
      const availableModels: VideoModel[] = VIDEO_MODELS.map((model) => model.name)
      console.log("availableModels", availableModels)
      const currentBalance = await getUserBalance(ctx.from.id)
      console.log("currentBalance", currentBalance)

      // Используем новую функцию для проверки и расчета
      const price = await validateAndCalculatePrice(videoModel as string, availableModels, currentBalance, isRu, ctx)
      if (price === null) {
        console.log("price is null")
        return ctx.scene.leave()
      }
      ctx.session.paymentAmount = price

      // Устанавливаем videoModel в сессии
      ctx.session.videoModel = videoModel as VideoModel
      console.log("ctx.session.videoModel", ctx.session.videoModel)

      await sendBalanceMessage(currentBalance, price, ctx, isRu)

      await ctx.reply(isRu ? `Вы выбрали модель для генерации: ${videoModel}` : `You have chosen the generation model: ${videoModel}`, {
        reply_markup: { remove_keyboard: true },
      })

      await ctx.reply(isRu ? "Пожалуйста, отправьте изображение" : "Please send an image")
      return ctx.wizard.next()
    } else {
      await ctx.reply(isRu ? "Произошла ошибка при обработке запроса" : "An error occurred while processing the request")
      return ctx.scene.leave()
    }
  },
  async (ctx) => {
    const message = ctx.message
    const isRu = ctx.from?.language_code === "ru"

    if (message && "photo" in message) {
      const photo = message.photo[message.photo.length - 1]
      const file = await ctx.telegram.getFile(photo.file_id)
      const filePath = file.file_path

      if (!filePath) {
        await ctx.reply(isRu ? "Не удалось получить изображение" : "Failed to get image")
        return ctx.scene.leave()
      }

      ctx.session.imageUrl = `https://api.telegram.org/file/bot${process.env.BOT_TOKEN}/${filePath}`
      await ctx.reply(isRu ? "Теперь опишите желаемое движение в видео" : "Now describe the desired movement in the video", {
        reply_markup: cancelMenu(isRu).reply_markup,
      })
      return ctx.wizard.next()
    }

    await ctx.reply(isRu ? "Пожалуйста, отправьте изображение" : "Please send an image")
    return undefined
  },
  async (ctx) => {
    const message = ctx.message
    const isRu = ctx.from?.language_code === "ru"

    if (message && "text" in message) {
      if (message.text.toLowerCase() === (isRu ? "отмена" : "cancel")) {
        await ctx.reply(isRu ? "Генерация отменена" : "Generation cancelled")
        return ctx.scene.leave()
      }

      const prompt = message.text
      const videoModel = ctx.session.videoModel as VideoModel
      const imageUrl = ctx.session.imageUrl
      if (!prompt) throw new Error("Prompt is required")
      if (!videoModel) throw new Error("Video model is required")
      if (!imageUrl) throw new Error("Image URL is required")
      if (!ctx.from?.username) throw new Error("Username is required")
      if (!isRu) throw new Error("Language is required")

      try {
        console.log("Calling generateImageToVideo with:", {
          imageUrl,
          prompt,
          videoModel,
          telegram_id: ctx.from.id,
          username: ctx.from.username,
          isRu,
        })

        await ctx.reply(isRu ? "Начинаю обработку изображения..." : "Processing image...")
        const paymentAmount = ctx.session.paymentAmount
        await generateImageToVideo(imageUrl, prompt, videoModel, paymentAmount, ctx.from.id, ctx.from.username, isRu)
        ctx.session.prompt = prompt
        ctx.session.mode = "image_to_video"
      } catch (error) {
        console.error("Ошибка при создании видео:", error)
        await ctx.reply(
          isRu ? "Произошла ошибка при создании видео. Пожалуйста, попробуйте позже." : "An error occurred while creating the video. Please try again later.",
        )
      }
      return ctx.scene.leave()
    }

    await ctx.reply(isRu ? "Пожалуйста, отправьте текстовое описание движения" : "Please send a text description of the movement")
    return undefined
  },
)

export default imageToVideoWizard
