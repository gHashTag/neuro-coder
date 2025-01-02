import { handleCallbackQuery } from "../../handlers/handleCallbackQuery"
import { isRussian } from "../../utils/language"
import { MyContext } from "../../utils/types"

export async function handleCallback(ctx: MyContext) {
  const isRu = isRussian(ctx)
  try {
    console.log("CASE: callback_query:data")

    if (!ctx.callbackQuery) {
      throw new Error("No callback query")
    }

    const data = ctx.callbackQuery.data
    await ctx.answerCallbackQuery().catch((e) => console.error("Ошибка при ответе на callback query:", e))
    if (!data) {
      throw new Error("No callback query data")
    }

    await handleCallbackQuery(ctx, data, isRu)
    return
  } catch (error) {
    console.error("Ошибка при обработке callback query:", error)
    try {
      await ctx.answerCallbackQuery()
    } catch (e) {
      console.error("Не удалось ответить на callback query:", e)
      await ctx.reply(isRu ? "Произошла ошибка. Пожалуйста, попробуйте позже." : "An error occurred. Please try again later.")
    }
  }
}
