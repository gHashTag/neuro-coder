import { MyContext } from "../../utils/types"
import { Conversation } from "@grammyjs/conversations"
import { InlineKeyboard } from "grammy"
import { setAspectRatio } from "../../core/supabase/ai"

async function imageSizeConversation(conversation: Conversation<MyContext>, ctx: MyContext) {
  const keyboard = new InlineKeyboard().text("Отмена", "cancel")

  await ctx.reply("Пожалуйста, введите соотношение сторон изображения (например, 9:16).", {
    reply_markup: keyboard,
  })

  const { message, callbackQuery } = await conversation.wait()

  if (callbackQuery?.data === "cancel") {
    await ctx.reply("Вы отменили операцию.")
    return
  }

  if (!message || !ctx.from?.id) return

  const aspectRatio = message.text
  const aspectRatioPattern = /^\d+:\d+$/

  if (!aspectRatioPattern.test(aspectRatio || "9:16")) {
    await ctx.reply("Неверный формат соотношения сторон. Пожалуйста, введите в формате число:число (например, 9:16).")
    return
  }

  const success = await setAspectRatio(ctx.from.id, aspectRatio || "9:16")

  if (success) {
    await ctx.reply(`Соотношение сторон ${aspectRatio} успешно сохранено.`)
  } else {
    await ctx.reply("Произошла ошибка при сохранении соотношения сторон.")
  }
}

export { imageSizeConversation }
