import { Context } from "grammy"

import ffmpeg from "fluent-ffmpeg"
import ffmpegInstaller from "@ffmpeg-installer/ffmpeg"
import path from "path"
import fs from "fs"
import { getSlides, makeTextLayers, overlayPhotoOnVideo, toShortVideo } from "../../../helpers"
import { getHistory } from "../../../core/supabase/ai"
import { getVideoUrl, uploadVideo } from "../../../core/supabase/video"

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

const melimi01 = async (ctx: Context): Promise<void> => {
  try {
    await ctx.reply("Video creation started")

    const inputFilePath = path.resolve(__dirname, "../assets/input/")
    const outputFilePath = path.resolve(__dirname, "../assets/output/")
    const photoTempPath = path.resolve(__dirname, "../assets/temp/photo")
    const tempFilePath = path.resolve(__dirname, "../assets/temp/video")
    const folder = "blouses"
    const logoPath = path.resolve(__dirname, "../assets/logo")

    try {
      await checkAccess(inputFilePath, fs.constants.R_OK) // Проверка прав на чтение
      await checkAccess(path.dirname(outputFilePath), fs.constants.W_OK) // Проверка прав на запись в директорию
      console.log("Access check passed")
    } catch (err) {
      console.error("Access check failed:", err)
      throw err
    }
    const history = await getHistory("melimi", "melimi01", "reels")
    const slides = await getSlides({
      prompt: `Напиши текст на русском языке. Напиши реально интересный текст, который будет интересен школьницам. Напиши топ 5 лайфхаков для школы. ЛАЙФХАКИ НЕ ДОЛЖНЫ ПОВТОРЯТЬСЯ. История лайфхаков: ${history}`,
      scenesCount: 1,
      isDescription: true,
    })
    console.log(history)

    const randomVideoIndex = Math.floor(Math.random() * 41)
    const randomAudioIndex = Math.floor(Math.random() * 13)

    await makeTextLayers(slides.reels.onScreenTitle, `${photoTempPath}/photo.png`, false, `${logoPath}/01.png`, "lifehack")
    await toShortVideo(`${inputFilePath}/${folder}/${randomVideoIndex}.mp4`, `${tempFilePath}/video.mp4`)
    await overlayPhotoOnVideo(`${tempFilePath}/video.mp4`, `${photoTempPath}/photo.png`, `${outputFilePath}/video.mp4`)
    const audioFilePath = path.resolve(__dirname, `../assets/audio/${randomAudioIndex}.mp3`)

    await new Promise<void>((resolve, reject) => {
      ffmpeg()
        .input(`${outputFilePath}/video.mp4`)
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

    // await ctx.replyWithVideo(new InputFile(`${outputFilePath}/final_video.mp4`), { caption: "audio" });
    // await ctx.replyWithVideo(new InputFile(`${outputFilePath}/video.mp4`), { caption: "no audio" });
    await ctx.reply(slides.reels.videoDescription)
    if (!ctx.from) throw new Error("No user")
    const fileName = `${ctx.from.id}_${Date.now()}.mp4`
    await uploadVideo(`${outputFilePath}/final_video.mp4`, "melimi", fileName)
    const videoUrl = await getVideoUrl("melimi", fileName)
    if (!videoUrl) throw new Error("No video url")
    //await setHistory("melimi", slides.reels.videoDescription, videoUrl, "melimi01", "reels");
    await ctx.reply("Video creation finished")
    return
  } catch (error) {
    // В случае ошибки, пробрасываем её дальше
    throw error
  }
}

export default melimi01
