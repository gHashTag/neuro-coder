import { Context, InputFile } from "grammy"

import ffmpeg from "fluent-ffmpeg"
import ffmpegInstaller from "@ffmpeg-installer/ffmpeg"
import path from "path"
import fs from "fs"
import { makePhotoOnPhoto, makeTextLayers, sizePhoto } from "../../../helpers"

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

const melimi_test = async (ctx: Context): Promise<void> => {
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

    const scenesCount = 1
    // const textJson = await getSlides({ prompt: "Напиши на русском языке текст для продажи школьных блузок", scenesCount });

    for (let i = 0; i < scenesCount; i++) {
      await makeTextLayers("Лёгкий перекус для школы", `${photoTempPath}/photo${i}.png`, false, `${logoPath}/01.png`)
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
    await ctx.reply("Video creation finished")
    return
  } catch (error) {
    // В случае ошибки, пробрасываем её дальше
    throw error
  }
}

export default melimi_test
