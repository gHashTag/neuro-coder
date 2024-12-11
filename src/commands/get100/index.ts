import { MyContext } from "../../utils/types"
import { Conversation } from "@grammyjs/conversations"
import { InlineKeyboard, InputFile } from "grammy"
import { generateImage } from "src/helpers/generateImage"

async function get100AnfiVesnaConversation(conversation: Conversation<MyContext>, ctx: MyContext) {
  const keyboard = new InlineKeyboard().text("Отменить генерацию", "cancel")
  const model_type = "dpbelarusx"
  console.log(model_type)
  await ctx.reply("Привет! Напишите промпт на английском для генерации изображения.", {
    reply_markup: keyboard,
  })
  const { message, callbackQuery } = await conversation.wait()

  if (callbackQuery?.data === "cancel") {
    await ctx.reply("Вы отменили генерацию изображения.")
    return
  }

  if (!message || !ctx.from?.id) return

  const text = message.text
  if (!text) {
    await ctx.reply("Пожалуйста, отправьте текстовое сообщение с промптом.")
    return
  }

  const generatingMessage = await ctx.reply("Генерация изображения началась...")

  for (let i = 0; i < 100; i++) {
    const result = await generateImage(text, model_type, ctx.from.id.toString())
    if (!result) {
      await ctx.reply("Ошибка при генерации изображения")
      continue
    }

    const { image } = result
    if (Buffer.isBuffer(image)) {
      await ctx.replyWithPhoto(new InputFile(image), { caption: `Фото: ${i + 1} / 100` })
    } else {
      await ctx.replyWithPhoto(image, { caption: `Фото: ${i + 1} / 100` })
    }
  }

  await ctx.api.deleteMessage(ctx.chat?.id || "", generatingMessage.message_id)
  return
}

export { get100AnfiVesnaConversation }
