import { InputFile } from "grammy"
import { Conversation } from "@grammyjs/conversations"
import { MyContext } from "../../utils/types"
import { createAudioFileFromText } from "../helpers"
import fs from "fs"
import { getVoiceId } from "../../core/supabase"

const textToSpeech = async (conversation: Conversation<MyContext>, ctx: MyContext): Promise<void> => {
  const lang = ctx.from?.language_code === "ru"
  const requestText = await ctx.reply(lang ? "✍️ Отправьте текст, для преобразования его в голос" : "✍️ Send text, to convert it to voice")
  const { message } = await conversation.wait()
  if (!message?.text) throw new Error("message is not found")
  await ctx.api.deleteMessage(ctx.chat?.id || "", requestText.message_id)
  const voice_id = await getVoiceId(ctx.from?.id?.toString() || "")
  if (!voice_id) {
    await ctx.reply(lang ? "🎯 Для корректной работы пропишите команду /voice" : "🎯 For correct operation, write the /voice command")
    return
  }
  const audioStream = await createAudioFileFromText({ text: message.text, voice_id })
  console.log(audioStream, "audioStream")
  await ctx.replyWithVoice(new InputFile(audioStream, "audio.mp3"))
  await ctx.replyWithAudio(new InputFile(audioStream, "audio.mp3"))
  await fs.unlinkSync(audioStream)
}

export default textToSpeech
