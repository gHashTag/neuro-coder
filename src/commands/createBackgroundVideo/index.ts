import { Conversation } from "@grammyjs/conversations"
import { MyContext } from "../../utils/types"
import { createClient } from "pexels"
import axios from "axios"
import fs from "fs"
import path from "path"
import { InputFile } from "grammy"
import ffmpeg from "fluent-ffmpeg"
import ffmpegInstaller from "@ffmpeg-installer/ffmpeg"
import ffprobeInstaller from "@ffprobe-installer/ffprobe"

// Настраиваем пути к ffmpeg и ffprobe
ffmpeg.setFfmpegPath(ffmpegInstaller.path)
ffmpeg.setFfprobePath(ffprobeInstaller.path)

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
      per_page: 5,
      orientation: "portrait",
      quality: "high",
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

const resizeVideo = async (inputPath: string, outputPath: string): Promise<void> => {
  return new Promise((resolve, reject) => {
    ffmpeg(inputPath)
      .videoFilter("scale=1080:1920:force_original_aspect_ratio=decrease,pad=1080:1920:(ow-iw)/2:(oh-ih)/2")
      .output(outputPath)
      .on("end", () => {
        console.log("Видео успешно обработано")
        resolve()
      })
      .on("error", (err) => {
        console.error("Ошибка при обработке видео:", err)
        reject(err)
      })
      .run()
  })
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

    if (videoUrls.length === 0) {
      await ctx.reply(isRu ? "Не удалось найти подходящие видео" : "Could not find suitable videos")
      return
    }

    const videoDir = path.join(__dirname, "videos")
    // Создаем директорию, если её нет
    if (!fs.existsSync(videoDir)) {
      fs.mkdirSync(videoDir, { recursive: true })
    }

    // Отправляем каждое видео отдельно
    for (let i = 0; i < videoUrls.length; i++) {
      try {
        await ctx.replyWithChatAction("upload_video")

        const videoNumber = String(i + 1).padStart(2, "0")
        const tempFile = path.join(videoDir, `temp_${videoNumber}.mp4`)
        const bgVideoPath = path.join(videoDir, `bg-video${videoNumber}.mp4`)

        await downloadVideo(videoUrls[i], tempFile)
        await resizeVideo(tempFile, bgVideoPath)

        // Отправляем видео
        const video = new InputFile(bgVideoPath)
        await ctx.replyWithVideo(video)

        // Удаляем только временный файл
        fs.unlinkSync(tempFile)
        fs.unlinkSync(bgVideoPath)
        // Оставляем bg-videoXX.mp4 в папке
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
