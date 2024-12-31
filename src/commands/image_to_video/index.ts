import { Conversation } from "@grammyjs/conversations"
import { MyContext } from "../../utils/types"

import { InlineKeyboard } from "grammy"
import axios from "axios"
import {
  imageToVideoCost,
  sendCurrentBalanceMessage,
  sendInsufficientStarsMessage,
  getUserBalance,
  sendCostMessage,
} from "../../helpers/telegramStars/telegramStars"
import { generateImageToVideo, VideoModel } from "../../services/generateImageToVideo"

export const downloadFile = async (url: string): Promise<Buffer> => {
  const response = await axios.get(url, { responseType: "arraybuffer" })
  return Buffer.from(response.data, "binary")
}

export const retry = async <T>(fn: () => Promise<T>, attempts = 3, delay = 1000): Promise<T> => {
  try {
    return await fn()
  } catch (error) {
    if (attempts <= 1) throw error
    await new Promise((resolve) => setTimeout(resolve, delay))
    return retry(fn, attempts - 1, delay * 2)
  }
}

export const imageToVideoConversation = async (conversation: Conversation<MyContext>, ctx: MyContext): Promise<string | undefined> => {
  const isRu = ctx.from?.language_code === "ru"
  if (!ctx.from) {
    throw new Error("User not found")
  }
  const currentBalance = await getUserBalance(ctx.from.id)
  const price = imageToVideoCost
  await sendCostMessage(ctx, isRu, price)
  if (currentBalance < price) {
    await sendInsufficientStarsMessage(ctx, isRu)
    return
  }
  await sendCurrentBalanceMessage(ctx, isRu, currentBalance)

  const keyboard = new InlineKeyboard().text("Minimax", "minimax").text("Haiper", "haiper").text("Ray", "ray").text("I2VGen-XL", "i2vgen")
  await ctx.reply(isRu ? "Выберите сервис для генерации видео:" : "Choose video generation service:", { reply_markup: keyboard })

  const serviceMsg = await conversation.wait()
  const model = serviceMsg.callbackQuery?.data

  if (!["minimax", "haiper", "ray", "i2vgen"].includes(model || "")) {
    await ctx.reply(isRu ? "Пожалуйста, выберите сервис используя кнопки" : "Please choose a service using the buttons")
    return
  }

  if (serviceMsg.callbackQuery) {
    await ctx.api.answerCallbackQuery(serviceMsg.callbackQuery.id)
  }

  await ctx.reply(isRu ? "Пожалуйста, отправьте изображение" : "Please send an image")
  const imageMsg = await conversation.wait()

  if (!imageMsg.message?.photo) {
    await ctx.reply(isRu ? "Пожалуйста, отправьте изображение" : "Please send an image")
    return
  }

  await ctx.reply(isRu ? "Теперь опишите желаемое движение в видео" : "Now describe the desired movement in the video")
  const promptMsg = await conversation.wait()

  if (!promptMsg.message?.text) {
    await ctx.reply(isRu ? "Пожалуйста, отправьте текстовое описание движения" : "Please send a text description of the movement")
    return
  }
  if (!model) {
    throw new Error(isRu ? "Не удалось определить модель" : "Could not identify model")
  }

  if (!ctx.from.username) {
    throw new Error(isRu ? "Не удалось определить username" : "Could not identify username")
  }

  try {
    await ctx.reply(isRu ? "Начинаю обработку изображения..." : "Processing image...")

    const photo = imageMsg.message.photo[imageMsg.message.photo.length - 1]
    const file = await ctx.api.getFile(photo.file_id)
    const filePath = file.file_path

    if (!filePath) {
      await ctx.reply(isRu ? "Не удалось получить изображение" : "Failed to get image")
      return
    }

    const imageUrl = `https://api.telegram.org/file/bot${process.env.BOT_TOKEN}/${filePath}`

    if (!imageUrl) {
      throw new Error(isRu ? "Не удалось получить изображение" : "Failed to get image")
    }

    if (!model) {
      throw new Error(isRu ? "Не удалось определить модель" : "Could not identify model")
    }

    await generateImageToVideo(imageUrl, promptMsg.message.text, model as VideoModel, ctx.from.id, ctx.from.username, isRu)
    return
  } catch (error) {
    console.error("Ошибка при создании видео:", error)
    await ctx.reply(
      isRu ? "Произошла ошибка при создании видео. Пожалуйста, попробуйте позже." : "An error occurred while creating the video. Please try again later.",
    )
    throw error
  }
}
