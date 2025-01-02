import { MyContext } from "../../utils/types"
import { Conversation } from "@grammyjs/conversations"
import { saveUserEmail } from "../../core/supabase/payments"
import { buyRobokassa } from "../../handlers/buy/buyRobokassa"

export async function buy(ctx: MyContext) {
  const isRu = ctx.from?.language_code === "ru"
  await ctx.reply(
    isRu
      ? `<b>🤑 Пополнение баланса</b>\nДля формирования счета напишите ваш E-mail.`
      : `<b>🤑 Balance Top-Up</b>\nTo generate an invoice, please provide your E-mail.`,
    {
      reply_markup: {
        inline_keyboard: [[{ text: isRu ? "Отправить E-mail" : "Send E-mail", callback_data: "request_email" }]],
      },
      parse_mode: "HTML",
    },
  )
}

export async function emailCommand(conversation: Conversation<MyContext>, ctx: MyContext) {
  if (!ctx.from) {
    throw new Error("User not found")
  }
  const isRu = ctx.from?.language_code === "ru"

  await ctx.reply(isRu ? "👉 Для формирования счета напишите ваш E-mail." : "👉 To generate an invoice, please provide your E-mail.")
  const { message } = await conversation.waitFor("message:text")

  const email = message?.text
  if (email && email.includes("@")) {
    try {
      await saveUserEmail(ctx.from.id.toString(), email)
      await ctx.reply(
        isRu
          ? "Ваш e-mail успешно сохранен. Теперь вы можете продолжить оплату."
          : "Your e-mail has been successfully saved. You can now proceed with the payment.",
      )
      await buyRobokassa(ctx)
    } catch (error) {
      await ctx.reply(isRu ? "Ошибка при сохранении e-mail. Пожалуйста, попробуйте снова." : "Error saving e-mail. Please try again.")
    }
    return
  } else {
    await ctx.reply(isRu ? "Некорректный e-mail. Пожалуйста, попробуйте снова." : "Invalid e-mail. Please try again.")
    return
  }
}
