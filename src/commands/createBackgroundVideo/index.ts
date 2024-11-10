import { Conversation } from "@grammyjs/conversations"
import { MyContext } from "../../utils/types"
import { createClient } from "pexels"
import { exec } from "child_process"
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

const getVideoDimensions = async (filePath: string): Promise<{ width: number; height: number }> => {
  return new Promise((resolve, reject) => {
    exec(`ffprobe -v error -select_streams v:0 -show_entries stream=width,height -of json "${filePath}"`, (error, stdout, stderr) => {
      if (error) {
        console.error("Ошибка ffprobe:", error)
        console.error("stderr:", stderr)
        reject(error)
        return
      }

      try {
        if (!stdout || stdout.trim() === "") {
          throw new Error("Пустой вывод ffprobe")
        }

        const data = JSON.parse(stdout)

        if (!data.streams || !data.streams[0]) {
          throw new Error("Не найдены данные потока видео")
        }

        const dimensions = {
          width: data.streams[0].width,
          height: data.streams[0].height,
        }

        console.log("Получены размеры видео:", dimensions)
        resolve(dimensions)
      } catch (parseError) {
        console.error("Ошибка парсинга JSON:", parseError)
        console.error("Полученный stdout:", stdout)
        reject(parseError)
      }
    })
  })
}

const resizeVideo = async (inputPath: string, outputPath: string): Promise<void> => {
  try {
    // Проверяем существование входного файла
    if (!fs.existsSync(inputPath)) {
      throw new Error(`Входной файл не найден: ${inputPath}`)
    }

    console.log("Начало обработки видео:", inputPath)

    // Получаем размеры исходного видео
    try {
      const inputDimensions = await getVideoDimensions(inputPath)
      console.log("Исходные размеры видео:", inputDimensions)
    } catch (error) {
      console.error("Ошибка при получении размеров входного видео:", error)
      // Продолжаем выполнение даже если не удалось получить размеры
    }

    await new Promise((resolve, reject) => {
      exec(
        `ffmpeg -i "${inputPath}" -vf "scale=1080:1920:force_original_aspect_ratio=decrease,pad=1080:1920:(ow-iw)/2:(oh-ih)/2" "${outputPath}"`,
        (error, stdout, stderr) => {
          if (error) {
            console.error("Ошибка ffmpeg:", error)
            console.error("stderr:", stderr)
            reject(error)
            return
          }
          resolve(null)
        },
      )
    })

    // Проверяем существование выходного файла
    if (!fs.existsSync(outputPath)) {
      throw new Error(`Выходной файл не создан: ${outputPath}`)
    }

    // Получаем размеры обработанного видео
    try {
      const outputDimensions = await getVideoDimensions(outputPath)
      console.log("Размеры видео после обработки:", outputDimensions)
    } catch (error) {
      console.error("Ошибка при получении размеров выходного видео:", error)
    }
  } catch (error) {
    console.error("Ошибка при обработке видео:", error)
    throw error
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
