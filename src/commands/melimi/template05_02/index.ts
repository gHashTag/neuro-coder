import { Context, InputFile } from "grammy"

import ffmpeg from "fluent-ffmpeg"
import ffmpegInstaller from "@ffmpeg-installer/ffmpeg"
import path from "path"
import fs from "fs"
import { getSlides, makePhotoOnPhoto, makeTextLayers, sizePhoto } from "../../../helpers"
import { createSlideshow } from "slideshow-video"

ffmpeg.setFfmpegPath(ffmpegInstaller.path)

const checkAccess = (filePath: string, mode: number) => {
  return new Promise<void>((resolve, reject) => {
    fs.access(filePath, mode, (err) => {
      if (err) {
        reject(err)
      } else {
        resolve()
      }
    })
  })
}

const template05_02 = async (ctx: Context): Promise<void> => {
  try {
    await ctx.reply("Video creation started")

    const inputFilePath = path.resolve(__dirname, "../assets/input/")
    const outputFilePath = path.resolve(__dirname, "../assets/output/")
    const photoTempPath = path.resolve(__dirname, "../assets/temp/photo")
    const logoPath = path.resolve(__dirname, "../assets/logo/")
    const folder = "blouses"

    const images: string[] = []
    try {
      await checkAccess(inputFilePath, fs.constants.R_OK) // Проверка прав на чтение
      await checkAccess(path.dirname(outputFilePath), fs.constants.W_OK) // Проверка прав на запись в директорию
      console.log("Access check passed")
    } catch (err) {
      console.error("Access check failed:", err)
      throw err
    }

    const scenesCount = 3
    const textJson = await getSlides({
      prompt: "Напиши текст на русском языке. Напиши реально интересный текст, который будет интересен школьницам.",
      scenesCount,
      isDescription: true,
    })
    console.log(textJson.scenes)

    for (let i = 0; i < scenesCount; i++) {
      const scene = textJson.reels
      console.log(`scene ${i}:`, scene)
      await makeTextLayers(`${scene.onScreenTitle}`, `${photoTempPath}/photo${i}.png`, false, `${logoPath}/01.png`)
      await sizePhoto(`${inputFilePath}/${folder}/${i}.png`, `${photoTempPath}/size${i}.png`)
    }

    const createShortVideo = async () => {
      console.log(inputFilePath, outputFilePath)
      console.log("Merging started")

      for (let i = 0; i < scenesCount; i++) {
        await makePhotoOnPhoto(`${photoTempPath}/size${i}.png`, `${photoTempPath}/photo${i}.png`, `${photoTempPath}/scene${i}.png`)
        images.push(`${photoTempPath}/scene${i}.png`)
        await ctx.replyWithPhoto(new InputFile(`${photoTempPath}/scene${i}.png`))
      }
    }

    await createShortVideo()
    const video = await createSlideshow(images, "", {
      imageOptions: {
        imageDuration: 2000,
      },
      transitionOptions: {
        useTransitions: false,
      },
      outputOptions: {
        outputDir: `${outputFilePath}`,
        outputBuffer: false,
      },
    })
    const randomAudioIndex = Math.floor(Math.random() * 13) // Генерируем случайное число от 0 до 12
    const audioFilePath = path.resolve(__dirname, `../assets/audio/${randomAudioIndex}.mp3`)

    await new Promise<void>((resolve, reject) => {
      if (!video.filePath) {
        reject(new Error("Video file path is undefined"))
        return
      }
      ffmpeg()
        .input(video.filePath)
        .input(audioFilePath)
        .outputOptions(["-c:v copy", "-c:a aac", "-strict experimental", "-shortest"])
        .output(`${outputFilePath}/final_video.mp4`)
        .on("end", () => {
          console.log("Audio added to video successfully!")
          resolve()
        })
        .on("error", (err) => {
          console.error("Error adding audio to video:", err)
          reject(err)
        })
        .run()
    })

    await ctx.replyWithVideo(new InputFile(`${outputFilePath}/final_video.mp4`), { caption: textJson.reels.videoDescription })
    // @ts-ignore
    await ctx.replyWithVideo(new InputFile(video.filePath), { caption: textJson.reels.videoDescription })
    await ctx.reply("Video creation finished")
    const filePathToDelete = video.filePath || ""
    fs.unlink(filePathToDelete, (err) => {
      if (err) {
        console.error(`Ошибка при удалении файла ${filePathToDelete}:`, err)
      } else {
        console.log(`Файл ${filePathToDelete} успешно удален`)
      }
    })
    return
  } catch (error) {
    // В случае ошибки, пробрасываем её дальше
    throw error
  }
}

export default template05_02
