import { Conversation } from "@grammyjs/conversations"
import { MyContext } from "../../utils/types"
import { generateLipSync } from "../../helpers/generateLipSync"

export async function lipSyncConversationCommand(conversation: Conversation<MyContext>, ctx: MyContext) {
  const isRu = ctx.from?.language_code === "ru"
  await ctx.replyWithChatAction("typing")
  try {
    await ctx.reply(isRu ? "Отправьте видео или URL видео" : "Send a video or video URL")
    const videoMsg = await conversation.wait()
    let videoUrl: string | undefined

    if (videoMsg.message?.video) {
      const videoFile = await ctx.api.getFile(videoMsg.message.video.file_id)
      videoUrl = `https://api.telegram.org/file/bot${ctx.api.token}/${videoFile.file_path}`
    } else if (videoMsg.message?.text) {
      videoUrl = videoMsg.message.text
    }

    await ctx.reply(isRu ? "Отправьте аудио или URL аудио" : "Send an audio or audio URL")
    const audioMsg = await conversation.wait()
    let audioUrl: string | undefined

    if (audioMsg.message?.audio) {
      const audioFile = await ctx.api.getFile(audioMsg.message.audio.file_id)
      audioUrl = `https://api.telegram.org/file/bot${ctx.api.token}/${audioFile.file_path}`
    } else if (audioMsg.message?.text) {
      audioUrl = audioMsg.message.text
    }

    if (!videoUrl) {
      await ctx.reply(isRu ? "Ошибка: видео или аудио не предоставлены" : "Error: video or audio not provided")
      return
    }

    if (!audioUrl) {
      await ctx.reply(isRu ? "Ошибка: аудио не предоставлено" : "Error: audio not provided")
      return
    }

    if (!ctx.from?.id) {
      await ctx.reply(isRu ? "Ошибка: ID пользователя не предоставлен" : "Error: User ID not provided")
      return
    }

    await generateLipSync(videoUrl, audioUrl, ctx.from?.id.toString())

    await ctx.reply(isRu ? `🎥 Видео отправлено на обработку. Ждите результата` : `🎥 Video sent for processing. Wait for the result`)
  } catch (error) {
    console.error(error)
    await ctx.reply(isRu ? "Произошла ошибка" : "An error occurred")
  }
}