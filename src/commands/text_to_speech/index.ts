import { InputFile } from "grammy"
import { Conversation } from "@grammyjs/conversations"
import { MyContext } from "../../utils/types"
import { createAudioFileFromText } from "../../helpers"
import fs from "fs"
import { getVoiceId } from "../../core/supabase"
import {
  sendInsufficientStarsMessage,
  textToSpeechCost,
  updateUserBalance,
  getUserBalance,
  sendCurrentBalanceMessage,
  sendCostMessage,
} from "../../helpers/telegramStars/telegramStars"

const textToSpeech = async (conversation: Conversation<MyContext>, ctx: MyContext): Promise<void> => {
  if (!ctx.from) {
    throw new Error("User not found")
  }
  const isRu = ctx.from?.language_code === "ru"

  const requestText = await ctx.reply(isRu ? "✍️ Отправьте текст, для преобразования его в голос" : "✍️ Send text, to convert it to voice")
  const { message } = await conversation.wait()
  if (!message?.text) throw new Error("message is not found")
  await ctx.api.deleteMessage(ctx.chat?.id || "", requestText.message_id)
  const voice_id = await getVoiceId(ctx.from?.id?.toString() || "")
  const currentBalance = await getUserBalance(ctx.from.id)
  console.log(currentBalance, "currentBalance")

  const price = textToSpeechCost
  await sendCostMessage(ctx, isRu, price)

  if (currentBalance < price) {
    await sendInsufficientStarsMessage(ctx, isRu)
    return
  }
  await sendCurrentBalanceMessage(ctx, isRu, currentBalance)

  if (!voice_id) {
    await ctx.reply(isRu ? "🎯 Для корректной работы пропишите команду /voice" : "🎯 For correct operation, write the /voice command")
    return
  }
  const audioStream = await createAudioFileFromText({ text: message.text, voice_id })
  console.log(audioStream, "audioStream")
  await ctx.replyWithVoice(new InputFile(audioStream, "audio.mp3"))
  await ctx.replyWithAudio(new InputFile(audioStream, "audio.mp3"))
  await updateUserBalance(ctx.from.id, currentBalance - price)
  await sendCurrentBalanceMessage(ctx, isRu, currentBalance - price)
  fs.unlinkSync(audioStream)
}

export { textToSpeech }
