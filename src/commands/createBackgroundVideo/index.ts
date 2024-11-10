import { Conversation } from "@grammyjs/conversations"
import { MyContext } from "../../utils/types"
import { createClient } from "pexels"

import ffmpeg from "fluent-ffmpeg"
import axios from "axios"
import fs from "fs"
import path from "path"
import { InputFile } from "grammy"

async function downloadVideo(url: string, outputPath: string): Promise<string> {
  const response = await axios({
    url,
    method: "GET",
    responseType: "stream",
  })

  return new Promise((resolve, reject) => {
    const writer = fs.createWriteStream(outputPath)
    response.data.pipe(writer)
    writer.on("finish", () => resolve(outputPath))
    writer.on("error", reject)
  })
}

async function concatenateVideos(videoUrls: string[], outputPath: string): Promise<string> {
  try {
    // Создаем временную директорию для скачивания видео
    const tempDir = path.join(__dirname, "temp")
    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir)
    }

    // Скачиваем все видео
    const downloadedVideos = await Promise.all(videoUrls.map((url, index) => downloadVideo(url, path.join(tempDir, `video${index}.mp4`))))

    // Создаем файл со списком видео для конкатенации
    const listFile = path.join(tempDir, "list.txt")
    const fileContent = downloadedVideos.map((file) => `file '${file}'`).join("\n")
    fs.writeFileSync(listFile, fileContent)

    // Склеиваем видео
    return new Promise((resolve, reject) => {
      ffmpeg()
        .input(listFile)
        .videoFilters(`crop=1080:1920`)
        .inputOptions(["-f", "concat", "-safe", "0"])
        .outputOptions([
          // ... существующие опции ...
          "-vf scale=1080:1920", // Фиксированное разрешение 1080x1920
          "-aspect 9:16", // Фиксированное соотношение сторон
        ])
        .output(outputPath)
        .on("end", () => {
          // Очищаем временные файлы
          downloadedVideos.forEach((file) => fs.unlinkSync(file))
          fs.unlinkSync(listFile)
          resolve(outputPath)
        })
        .on("error", reject)
        .run()
    })
  } catch (error) {
    console.error("Ошибка при склеивании видео:", error)
    throw error
  }
}

// Модифицируем существующую функцию getBRollVideo
async function getBRollVideo(query: string): Promise<string[]> {
  if (!process.env.PIXEL_API_KEY) {
    throw new Error("PIXEL_API_KEY is not set")
  }
  const client = createClient(process.env.PIXEL_API_KEY)

  try {
    const response = await client.videos.search({
      query,
      per_page: 10,
      orientation: "portrait",
    })

    console.log(response)

    if ("videos" in response && Array.isArray(response.videos)) {
      return response.videos
        .map(
          (video) =>
            // Берем первый доступный видеофайл для каждого видео
            video.video_files[0]?.link,
        )
        .filter((link): link is string => !!link)
    }
    return []
  } catch (error) {
    console.error("Ошибка при получении видео из Pexels:", error)
    return []
  }
}

export async function createBackgroundVideo(conversation: Conversation<MyContext>, ctx: MyContext) {
  const isRu = ctx.from?.language_code === "ru"
  await ctx.replyWithChatAction("typing")

  try {
    await ctx.reply(isRu ? "Отправьте поисковый запрос для B-roll видео" : "Send search query for B-roll video", {
      reply_markup: {
        force_reply: true,
      },
    })
    const query = (await conversation.wait()).message?.text

    if (!query) {
      await ctx.reply(isRu ? "Ошибка: Поисковый запрос не предоставлен" : "Error: Search query not provided")
      return
    }

    const videoUrls = await getBRollVideo(query)
    console.log(videoUrls, "videoUrls")
    if (videoUrls.length === 0) {
      await ctx.reply(isRu ? "Не удалось найти подходящие видео" : "Could not find suitable videos")
      return
    }

    // Отправляем каждое видео отдельно
    for (const url of videoUrls) {
      try {
        await ctx.replyWithChatAction("upload_video")

        // Скачиваем видео во временный файл
        const tempFile = path.join(__dirname, `temp_${Date.now()}.mp4`)
        await downloadVideo(url, tempFile)

        // Отправляем видео
        const video = new InputFile(tempFile)
        await ctx.replyWithVideo(video)

        // Удаляем временный файл
        fs.unlinkSync(tempFile)
      } catch (error) {
        console.error("Ошибка при отправке видео:", error)
        await ctx.reply(isRu ? "Ошибка при отправке видео" : "Error sending video")
      }
    }
  } catch (error) {
    console.error(error)
    await ctx.reply(isRu ? "Произошла ошибка при обработке видео" : "An error occurred while processing the video")
  }
}
