/* eslint-disable @typescript-eslint/no-explicit-any */
import { Conversation } from "@grammyjs/conversations"
import { MyContext } from "../../utils/types"
import { createRender } from "../../helpers"
import { InputFile } from "grammy"
import axios from "axios"
import fs from "fs"
import path from "path"
import os from "os"

export async function subtitles(conversation: Conversation<MyContext>, ctx: MyContext) {
  const isRu = ctx.from?.language_code === "ru"

  try {
    await ctx.reply(isRu ? "Отправьте URL видео для создания субтитров" : "Send video URL for subtitles creation")

    const videoUrlMsg = await conversation.wait()
    const videoUrl = videoUrlMsg.message?.text

    if (!videoUrl) {
      await ctx.reply(isRu ? "Ошибка: URL видео не предоставлен" : "Error: Video URL not provided")
      return
    }

    await ctx.reply(isRu ? "Начинаю рендеринг видео..." : "Starting video rendering...")

    const result = await createRender({
      template_id: "10f7cf9f-9c44-479b-ad65-ea8b9242ccb1",
      modifications: { "Video-1": videoUrl },
    })

    // Проверяем, что результат существует и содержит URL
    if (!result || !result[0]?.url) {
      throw new Error(isRu ? "Не удалось получить URL видео" : "Failed to get video URL")
    }

    const videoFileUrl = result[0].url

    // Скачиваем видео
    const tempFilePath = path.join(os.tmpdir(), `subtitles_${Date.now()}.mp4`)

    // Добавляем обработку статуса загрузки
    await ctx.reply(isRu ? "⏳ Загружаю видео..." : "⏳ Downloading video...")

    const response = await axios({
      method: "GET",
      url: videoFileUrl,
      responseType: "stream",
    })

    const writer = fs.createWriteStream(tempFilePath)
    response.data.pipe(writer)

    await new Promise((resolve, reject) => {
      writer.on("finish", resolve)
      writer.on("error", reject)
    })

    // Отправляем видео в чат
    await ctx.replyWithChatAction("upload_video")
    await ctx.replyWithVideo(new InputFile(tempFilePath), {
      caption: isRu
        ? `✅ Видео с субтитрами готово!\nДлительность: ${result[0].duration} сек\nРазмер: ${Math.round((result[0].fileSize / 1024 / 1024) * 100) / 100} МБ`
        : `✅ Video with subtitles is ready!\nDuration: ${result[0].duration} sec\nSize: ${Math.round((result[0].fileSize / 1024 / 1024) * 100) / 100} MB`,
    })

    // Удаляем временный файл
    fs.unlinkSync(tempFilePath)
  } catch (error) {
    console.error("Error in subtitles command:", error)
    await ctx.reply(isRu ? `❌ Произошла ошибка при обработке видео: ${error}` : `❌ Error processing video: ${error}`)
  }
}
