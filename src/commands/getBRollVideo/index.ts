import { MyContext } from "../../interfaces"
import { generateLipSync } from "../../helpers/generateLipSync"

export async function getBRollVideo(ctx: MyContext) {
  const isRu = ctx.from?.language_code === "ru"
  await ctx.sendChatAction("typing")
  try {
    await ctx.reply(isRu ? "Отправьте URL видео" : "Send video URL")
    const videoUrl = (await ctx.wait()).message?.text

    await ctx.reply(isRu ? "Отправьте URL аудио" : "Send audio URL")
    const audioUrl = (await ctx.wait()).message?.text

    if (!videoUrl || !audioUrl) {
      await ctx.reply(isRu ? "Ошибка: URL не предоставлены" : "Error: URLs not provided")
      return
    }

    if (!ctx.from?.id) {
      await ctx.reply(isRu ? "Ошибка: ID пользователя не предоставлен" : "Error: User ID not provided")
      return
    }

    const result = await generateLipSync(videoUrl, audioUrl, ctx.from?.id.toString())

    await ctx.reply(isRu ? `Видео отправлено на обработку: ${result.id}` : `Video sent for processing: ${result.id}`)
  } catch (error) {
    console.error(error)
    await ctx.reply(isRu ? "Произошла ошибка" : "An error occurred")
  }
}
