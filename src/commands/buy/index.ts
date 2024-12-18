import { MyContext } from "../../utils/types"

export async function buy(ctx: MyContext) {
  const isRu = ctx.from?.language_code === "ru"
  ctx.reply(
    isRu
      ? `<b>🤑 Пополнение баланса</b>
  Теперь вы можете пополнить баланс на любое количество звезд и использовать их для различных функций бота.\nПросто выберите количество звезд, которое вы хотите добавить на свой баланс.`
      : `<b>🤑 Balance Top-Up</b>
    You can now top up your balance with any number of stars and use them for various bot features. Simply choose the number of stars you want to add to your balance.`,
    {
      reply_markup: {
        inline_keyboard: [
          [{ text: isRu ? "Пополнить 100 ⭐️" : "Top up 100 ⭐️", callback_data: "top_up_100" }],
          [{ text: isRu ? "Пополнить 500 ⭐️" : "Top up 500 ⭐️", callback_data: "top_up_500" }],
          [{ text: isRu ? "Пополнить 1000 ⭐️" : "Top up 1000 ⭐️", callback_data: "top_up_1000" }],
          [{ text: isRu ? "Пополнить 2000 ⭐️" : "Top up 2000 ⭐️", callback_data: "top_up_2000" }],
          [{ text: isRu ? "Пополнить 5000 ⭐️" : "Top up 5000 ⭐️", callback_data: "top_up_5000" }],
          [{ text: isRu ? "Пополнить 10000 ⭐️" : "Top up 10000 ⭐️", callback_data: "top_up_10000" }],
          [{ text: isRu ? "Пополнить 20000 ⭐️" : "Top up 20000 ⭐️", callback_data: "top_up_20000" }],
          [{ text: isRu ? "Пополнить 50000 ⭐️" : "Top up 50000 ⭐️", callback_data: "top_up_50000" }],
          [{ text: isRu ? "Пополнить 100000 ⭐️" : "Top up 100000 ⭐️", callback_data: "top_up_100000" }],
          [{ text: isRu ? "Что такое звезды❓" : "What are stars❓", web_app: { url: `https://telegram.org/blog/telegram-stars/${isRu ? "ru" : "en"}?ln=a` } }],
        ],
      },
      parse_mode: "HTML",
    },
  )
}
