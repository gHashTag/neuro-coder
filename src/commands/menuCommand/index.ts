import { MyContext } from "../../interfaces"
import { mainMenu } from "../../menu/mainMenu"

export async function menuCommand(ctx: MyContext) {
  console.log("CASE: menuCommand")
  const isRu = ctx.from?.language_code === "ru"
  try {
    console.log("CASE: menu")
    const isRu = ctx.from?.language_code === "ru"
    const menu = mainMenu(isRu)
    const message = isRu ? "🏠 Главное меню\nВыберите нужный раздел 👇" : "🏠 Main menu\nChoose the section 👇"
    await ctx.reply(message, menu)
    return
  } catch (error) {
    console.error("Error in menu command:", error)
    await ctx.reply(isRu ? "❌ Произошла ошибка. Пожалуйста, попробуйте позже." : "❌ An error occurred. Please try again later.")
    throw error
  }
}
