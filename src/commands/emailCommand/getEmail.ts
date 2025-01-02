import { MyContext } from "../../interfaces"

export async function getEmail(ctx: MyContext) {
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
