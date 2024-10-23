import { Context, InputFile } from "grammy"
import { Bot } from "grammy";
import { conversations, createConversation, Conversation} from "@grammyjs/conversations";
import { MyContext } from "../../utils/types"
import { createAudioFileFromText } from "../helpers"

const textToSpeech = async (conversation: Conversation<MyContext>, ctx: MyContext): Promise<void> => {
    await ctx.reply("Отправьте текст, для преобразования его в голос");
    const { message } = await conversation.wait();
    if (!message?.text) throw new Error('message is not found')
    const audioStream = await createAudioFileFromText({ text: message.text, voice_id: "APeqOF6ti2CVArlqq6Yq" }) //lekomtsev - APeqOF6ti2CVArlqq6Yq, Заварыкин - APeqOF6ti2CVArlqq6Yq, НейроКодер - cGc22WcHfLX5EU1aKiRP
    console.log(audioStream)
    const name = message.text;
    await ctx.replyWithAudio(new InputFile(audioStream, "audio.mp3"));
  }
  
  export default textToSpeech