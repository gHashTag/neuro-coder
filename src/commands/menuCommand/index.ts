import { MyContext, MyConversation } from "../../utils/types"
import { mainMenu } from "../../menu/mainMenu"

export async function menuCommand(conversation: MyConversation, ctx: MyContext) {
  const isRu = ctx.from?.language_code === "ru"
  try {
    console.log("CASE: menu")
    const isRu = ctx.from?.language_code === "ru"
    const menu = mainMenu(isRu)
    await ctx.reply(isRu ? "🏠 Главное меню\nВыберите нужный раздел 👇" : "🏠 Main menu\nChoose the section 👇", { reply_markup: menu })
    return
  } catch (error) {
    console.error("Error in menu command:", error)
    await ctx.reply(isRu ? "❌ Произошла ошибка. Пожалуйста, попробуйте позже." : "❌ An error occurred. Please try again later.")
    throw error
  }
}
