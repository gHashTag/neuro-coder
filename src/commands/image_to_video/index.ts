import { Conversation } from "@grammyjs/conversations"
import { MyContext } from "../../utils/types"
import Replicate from "replicate"
import { unlink, writeFile } from "node:fs/promises"
import { InputFile, InlineKeyboard } from "grammy"
import axios from "axios"
import {
  imageToVideoCost,
  sendBalanceMessage,
  updateUserBalance,
  sendCurrentBalanceMessage,
  sendInsufficientStarsMessage,
  getUserBalance,
  sendCostMessage,
} from "../../helpers/telegramStars/telegramStars"

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

export const imageToVideoConversation = async (conversation: Conversation<MyContext>, ctx: MyContext): Promise<void> => {
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
  const service = serviceMsg.callbackQuery?.data

  if (!["minimax", "haiper", "ray", "i2vgen"].includes(service || "")) {
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

    let videoUrl: string | undefined

    if (service === "minimax") {
      const replicate = new Replicate({
        auth: process.env.REPLICATE_API_TOKEN,
      })

      const imageBuffer = await downloadFile(imageUrl)
      const minimaxResult = await retry(async () => {
        return await replicate.run("minimax/video-01", {
          input: {
            prompt: promptMsg.message?.text,
            first_frame_image: imageBuffer,
          },
        })
      })

      videoUrl = typeof minimaxResult === "string" ? minimaxResult : undefined
    } else if (service === "haiper") {
      const replicate = new Replicate({
        auth: process.env.REPLICATE_API_TOKEN,
      })

      const haiperResult = await retry(async () => {
        return await replicate.run("haiper-ai/haiper-video-2", {
          input: {
            prompt: promptMsg.message?.text || "",
            duration: 6,
            aspect_ratio: "16:9",
            use_prompt_enhancer: true,
            frame_image_url: imageUrl,
          },
        })
      })

      videoUrl = typeof haiperResult === "string" ? haiperResult : undefined
    } else if (service === "ray") {
      const replicate = new Replicate({
        auth: process.env.REPLICATE_API_TOKEN,
      })

      const rayResult = await retry(async () => {
        return await replicate.run("luma/ray", {
          input: {
            prompt: promptMsg.message?.text || "",
            aspect_ratio: "16:9",
            loop: false,
            start_image_url: imageUrl,
          },
        })
      })

      videoUrl = typeof rayResult === "string" ? rayResult : undefined
    } else {
      const photo = imageMsg.message.photo[imageMsg.message.photo.length - 1]
      if (photo.width < photo.height) {
        await ctx.reply(
          isRu
            ? "⚠️ I2VGen-XL не работает с вертикальными фото. Вертикальные фото могут дать некачественный результат."
            : "⚠️ I2VGen-XL does not work with vertical photos. Vertical photos may give poor results.",
        )
      }

      const replicate = new Replicate({
        auth: process.env.REPLICATE_API_TOKEN,
      })

      const i2vgenResult = await retry(async () => {
        return await replicate.run("ali-vilab/i2vgen-xl:5821a338d00033abaaba89080a17eb8783d9a17ed710a6b4246a18e0900ccad4", {
          input: {
            image: imageUrl,
            prompt: promptMsg.message?.text || "",
            max_frames: 16,
            guidance_scale: 9,
            num_inference_steps: 50,
          },
        })
      })

      videoUrl = typeof i2vgenResult === "string" ? i2vgenResult : undefined
    }

    if (videoUrl) {
      await ctx.reply(isRu ? "Загружаю видео..." : "Uploading video...")
      const videoBuffer = await downloadFile(videoUrl)
      const tempFilePath = `temp_${Date.now()}.mp4`
      await writeFile(tempFilePath, videoBuffer)

      await ctx.replyWithVideo(new InputFile(tempFilePath))
      await ctx.reply(isRu ? "Видео успешно создано!" : "Video successfully created!")
      await updateUserBalance(ctx.from.id, currentBalance - price)
      await sendBalanceMessage(ctx, isRu, currentBalance - price)
      await unlink(tempFilePath)
      return
    } else {
      await ctx.reply(isRu ? "Произошла ошибка при создании видео" : "An error occurred while creating the video")
      return
    }
  } catch (error) {
    console.error("Ошибка при создании видео:", error)
    await ctx.reply(
      isRu ? "Произошла ошибка при создании видео. Пожалуйста, попробуйте позже." : "An error occurred while creating the video. Please try again later.",
    )
    return
  }
}
