import { getUid } from "../../core/supabase"
import { incrementBalance, starCost } from "../../helpers/telegramStars"
import { isRussian } from "../../utils/language"
import { Context } from "grammy"

export async function handlePreCheckoutQuery(ctx: Context) {
  await ctx.answerPreCheckoutQuery(true)
}

export async function handleSuccessfulPayment(ctx: Context) {
  if (!ctx.chat) {
    console.error("Update does not belong to a chat")
    return
  }

  if (!ctx.message?.successful_payment?.total_amount) {
    console.error("No successful payment")
    return
  }

  if (!ctx.from?.id) throw new Error("No telegram id")

  const isRu = isRussian(ctx)
  console.log("ctx 646(succesful_payment)", ctx)

  const stars = ctx.message.successful_payment.total_amount

  if (!ctx.from?.id) throw new Error("No telegram id")
  const user_id = await getUid(ctx.from.id.toString())
  if (!user_id) throw new Error("No user_id")

  await incrementBalance({ telegram_id: ctx.from.id.toString(), amount: stars })

  await ctx.reply(
    isRu
      ? `💫 Ваш баланс пополнен на ${stars} звезд! (Стоимость звезды: $${starCost})`
      : `💫 Your balance has been replenished by ${stars} stars! (Cost per star: $${starCost})`,
  )
  await ctx.api.sendMessage(
    "-1001978334539",
    `💫 Пользователь @${ctx.from.username} (ID: ${ctx.from.id}) пополнил баланс на ${stars} звезд! (Стоимость звезды: $${starCost})`,
  )
}
