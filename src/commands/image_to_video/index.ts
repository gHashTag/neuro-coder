import { Conversation, ConversationFlavor } from "@grammyjs/conversations"
import { MyContext } from "@/utils/types"
import Replicate from "replicate"
import { writeFile } from "node:fs/promises"
import { InputFile } from "grammy"
import axios from "axios"

type MyConversationType = MyContext & ConversationFlavor

async function downloadFile(url: string): Promise<Buffer> {
  const response = await axios.get(url, { responseType: "arraybuffer" })
  return Buffer.from(response.data, "binary")
}

async function retry<T>(fn: () => Promise<T>, attempts = 3, delay = 1000): Promise<T> {
  try {
    return await fn()
  } catch (error) {
    if (attempts <= 1) throw error
    await new Promise((resolve) => setTimeout(resolve, delay))
    return retry(fn, attempts - 1, delay * 2)
  }
}

async function imageToVideo(conversation: Conversation<MyConversationType>, ctx: MyConversationType) {
  const isRu = ctx.from?.language_code === "ru"
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

    // Скачиваем изображение
    const imageUrl = `https://api.telegram.org/file/bot${process.env.BOT_TOKEN}/${filePath}`
    const imageBuffer = await downloadFile(imageUrl)

    const replicate = new Replicate({
      auth: process.env.REPLICATE_API_TOKEN,
    })

    const input = {
      prompt: promptMsg.message.text,
      first_frame_image: imageBuffer,
    }

    const videoUrl = await retry(async () => {
      return await replicate.run("minimax/video-01", { input })
    })
    console.log(videoUrl, "videoUrl")

    if (typeof videoUrl === "string") {
      await ctx.reply(isRu ? "Загружаю видео..." : "Uploading video...")
      const videoBuffer = await downloadFile(videoUrl)
      const tempFilePath = `temp_${Date.now()}.mp4`
      await writeFile(tempFilePath, videoBuffer)

      await ctx.replyWithVideo(new InputFile(tempFilePath))
      await ctx.reply(isRu ? "Видео успешно создано!" : "Video successfully created!")
    } else {
      await ctx.reply(isRu ? "Произошла ошибка при создании видео" : "An error occurred while creating the video")
    }
  } catch (error) {
    console.error("Ошибка при создании видео:", error)
    await ctx.reply(
      isRu ? "Произошла ошибка при создании видео. Пожалуйста, попробуйте позже." : "An error occurred while creating the video. Please try again later.",
    )
  }
}

export default imageToVideo
