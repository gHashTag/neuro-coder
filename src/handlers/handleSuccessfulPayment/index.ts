// import { getUid } from "../../core/supabase"
// import { incrementBalance, starCost } from "../../helpers/telegramStars"
// import { isRussian } from "../../utils/language"
import { Context } from "telegraf"

export async function handlePreCheckoutQuery(ctx: Context) {
  await ctx.answerPreCheckoutQuery(true)
}

// export async function handleSuccessfulPayment(ctx: Context) {
//   console.log("CASE: successful_payment")
//   try {
//     if (!ctx.chat) {
//       console.error("Update does not belong to a chat")
//       return
//     }
//     const message = ctx.message as Message.SuccessfulPaymentMessage | undefined
//     if (message && "successful_payment" in message) {
//       const successfulPayment = message.successful_payment
//       // Обработка успешного платежа
//       console.log("Успешный платеж:", successfulPayment)

//       try {
//         await ctx.telegram.sendMessage(ctx.chat.id, "Спасибо за ваш платеж!")
//       } catch (error) {
//         console.error("Ошибка при отправке сообщения:", error)
//       }
//     } else {
//       console.error("Сообщение не содержит информации о платеже")
//     }

//     if (!ctx.from?.id) throw new Error("No telegram id")

//     const isRu = isRussian(ctx)
//     console.log("ctx 646(succesful_payment)", ctx)

//     if (!ctx.from?.id) throw new Error("No telegram id")
//     const user_id = await getUid(ctx.from.id.toString())
//     if (!user_id) throw new Error("No user_id")

//     const stars = ctx.message?.successful_payment?.total_amount

//     await incrementBalance({ telegram_id: ctx.from.id.toString(), amount: stars })

//     await ctx.reply(
//       isRu
//         ? `💫 Ваш баланс пополнен на ${stars} звезд! (Стоимость звезды: $${starCost})`
//         : `💫 Your balance has been replenished by ${stars} stars! (Cost per star: $${starCost})`,
//     )
//     await ctx.telegram.sendMessage(
//       "-1001978334539",
//       `💫 Пользователь @${ctx.from.username} (ID: ${ctx.from.id}) пополнил баланс на ${stars} звезд! (Стоимость звезды: $${starCost})`,
//     )
//   } catch (error) {
//     console.error("Error in successful_payment:", error)
//     throw error
//   }
// }
