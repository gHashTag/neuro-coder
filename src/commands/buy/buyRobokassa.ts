import { MyContext } from "../../utils/types"

export async function buyRobokassa(ctx: MyContext) {
  const isRu = ctx.from?.language_code === "ru"
  await ctx.reply(
    isRu
      ? `<b>🤑 Пополнение баланса</b>
    Теперь вы можете пополнить баланс на любое количество звезд и использовать их для различных функций бота.\nПросто выберите количество звезд, которое вы хотите добавить на свой баланс.\nВ случае возникновения проблем с оплатой, пожалуйста, свяжитесь с нами @neurocalls.`
      : `<b>🤑 Balance Top-Up</b>
      You can now top up your balance with any number of stars and use them for various bot features. Simply choose the number of stars you want to add to your balance.\nIn case of payment issues, please contact us @neurocalls.`,
    {
      reply_markup: {
        inline_keyboard: [
          [
            {
              text: isRu ? "Купить 3040 ⭐️ за 5000 р" : "Buy 3040 ⭐️ for 5000 RUB",
              web_app: { url: `https://auth.robokassa.ru/merchant/Invoice/lm8bmBTG0Eet_kh7ITXp-w` },
            },
            {
              text: isRu ? "Купить 6080 ⭐️ за 10000 р" : "Buy 6080 ⭐️ for 10000 RUB",
              web_app: { url: `https://auth.robokassa.ru/merchant/Invoice/I3IwAR8z-E67RwCPE-ag6Q` },
            },
          ],
          [{ text: isRu ? "Что такое звезды❓" : "What are stars❓", web_app: { url: `https://telegram.org/blog/telegram-stars/${isRu ? "ru" : "en"}?ln=a` } }],
        ],
      },
      parse_mode: "HTML",
    },
  )

  return
}
