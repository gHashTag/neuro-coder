import { getUserBalance } from "src/helpers/telegramStars"
import { MyContext } from "../../utils/types"

export async function balance(ctx: MyContext) {
  const isRu = ctx.from?.language_code === "ru"

  const balance = await getUserBalance(ctx.from?.id || 0)

  await ctx.reply(isRu ? `💰✨ <b>Ваш баланс:</b> ${balance} ⭐️` : `💰✨ <b>Your balance:</b> ${balance} ⭐️`, { parse_mode: "HTML" })

  return
}
