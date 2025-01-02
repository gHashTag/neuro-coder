import { getUserBalance } from "../../helpers/telegramStars"
import { MyContext } from "../../interfaces"

export async function balanceCommand(ctx: MyContext) {
  const isRu = ctx.from?.language_code === "ru"

  const balance = await getUserBalance(ctx.from?.id || 0)

  await ctx.reply(isRu ? `💰✨ <b>Ваш баланс:</b> ${balance} ⭐️` : `💰✨ <b>Your balance:</b> ${balance} ⭐️`, { parse_mode: "HTML" })

  return
}
