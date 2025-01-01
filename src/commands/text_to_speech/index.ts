import { Conversation } from "@grammyjs/conversations"
import { MyContext } from "../../utils/types"

import { getVoiceId } from "../../core/supabase"
import { textToSpeechCost, sendBalanceMessage, sendInsufficientStarsMessage, getUserBalance } from "../../helpers/telegramStars/telegramStars"
import { generateTextToSpeech } from "../../services/generateTextToSpeech"
import { isRussian } from "../../utils/language"

const textToSpeech = async (conversation: Conversation<MyContext>, ctx: MyContext): Promise<void> => {
  const isRu = isRussian(ctx)
  console.log(isRu, "isRu")
  try {
    if (!ctx.from) {
      throw new Error("User not found")
    }
    const currentBalance = await getUserBalance(ctx.from.id)
    const price = textToSpeechCost

    if (currentBalance < price) {
      await sendInsufficientStarsMessage(ctx, isRu)
      return
    }

    await sendBalanceMessage(currentBalance, price, ctx, isRu)

    const requestText = await ctx.reply(isRu ? "✍️ Отправьте текст, для преобразования его в голос" : "✍️ Send text, to convert it to voice")
    const { message } = await conversation.wait()
    if (!message?.text) throw new Error("message is not found")

    const voice_id = await getVoiceId(ctx.from?.id?.toString() || "")
    console.log(voice_id, "voice_id")

    if (!voice_id) {
      await ctx.reply(isRu ? "🎯 Для корректной работы пропишите команду /voice" : "🎯 For correct operation, write the /voice command")
      return
    }

    if (message) {
      await generateTextToSpeech(message.text, voice_id, ctx.from.id, ctx.from?.username || "", isRu)
      return
    }

    await ctx.api.deleteMessage(ctx.chat?.id || "", requestText.message_id)
    return
  } catch (error) {
    console.error(error)
    await ctx.reply(isRu ? "Произошла ошибка при создании голосового аватара" : "Error occurred while creating voice avatar")
    throw error
  }
}

export { textToSpeech }
