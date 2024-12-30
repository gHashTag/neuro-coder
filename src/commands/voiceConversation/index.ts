import { MyContext, MyConversation } from "../../utils/types"
import { generateVoiceAvatar } from "../../services/generateVoiceAvatar"
import { isRussian } from "../../utils/language"

export async function voiceConversation(conversation: MyConversation, ctx: MyContext): Promise<void> {
  const isRu = isRussian(ctx)

  if (!ctx.from?.id) {
    await ctx.reply(isRu ? "Ошибка идентификации пользователя" : "User identification error")
    return
  }

  try {
    // Сначала отправляем инструкцию пользователю
    await ctx.reply(
      isRu ? "Пожалуйста, отправьте голосовое сообщение для создания голосового аватара" : "Please send a voice message to create your voice avatar",
    )

    // Получаем сообщение
    const message = await conversation.wait()
    console.log(message, "message")

    // Остальная логика без изменений...
    if (!message.message?.voice && !message.message?.audio) {
      await ctx.reply(isRu ? "Пожалуйста, отправьте голосовое сообщение" : "Please send a voice message")
      return
    }

    const fileId = message.message.voice ? message.message.voice.file_id : message.message.audio?.file_id
    console.log(fileId, "fileId")
    if (!fileId) {
      throw new Error("File ID not found")
    }

    const file = await ctx.api.getFile(fileId)
    console.log(file, "file")
    if (!file.file_path) {
      throw new Error("File path not found")
    }

    const fileUrl = `https://api.telegram.org/file/bot${ctx.api.token}/${file.file_path}`
    console.log(fileUrl, "fileUrl")

    await generateVoiceAvatar(fileUrl, ctx.from.id, ctx, isRu)
    return
  } catch (error) {
    console.error("Error in handleVoiceMessage:", error)
    await ctx.reply(
      isRu
        ? "❌ Произошла ошибка при создании голосового аватара. Пожалуйста, попробуйте позже."
        : "❌ An error occurred while creating the voice avatar. Please try again later.",
    )
    throw error
  }
}
