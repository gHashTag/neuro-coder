import { InputFile } from "grammy"
import { Conversation } from "@grammyjs/conversations"
import { MyContext } from "../../utils/types"
import { createAudioFileFromText } from "../helpers"
import path from "path"

const textToSpeech = async (conversation: Conversation<MyContext>, ctx: MyContext): Promise<void> => {
  await ctx.reply("Отправьте текст, для преобразования его в голос")
  const { message } = await conversation.wait()
  if (!message?.text) throw new Error("message is not found")
  const audioStream = await createAudioFileFromText({ text: message.text, voice_id: "cGc22WcHfLX5EU1aKiRP" }) //lekomtsev - APeqOF6ti2CVArlqq6Yq, Заварыкин - APeqOF6ti2CVArlqq6Yq, НейроКодер - cGc22WcHfLX5EU1aKiRP
  console.log(audioStream, "audioStream")
  const audioPath = path.join(__dirname, `../${audioStream}`)
  console.log(audioPath, "audioPath")
  await ctx.replyWithAudio(new InputFile(audioPath, "audio.mp3"))
}

export default textToSpeech
