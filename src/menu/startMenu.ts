import { MyContext } from "../interfaces"
import { Markup } from "telegraf"

export async function startMenu(ctx: MyContext, isRu: boolean) {
  try {
    await ctx.reply(
      isRu ? "Выберите действие в меню:" : "Choose an action in the menu:",
      Markup.keyboard([
        [Markup.button.text(isRu ? "🎮 Начать обучение" : "🎮 Start learning"), Markup.button.text(isRu ? "🏠 Главное меню" : "🏠 Main menu")],
        [Markup.button.text(isRu ? "💎 Пополнить баланс" : "💎 Top up balance"), Markup.button.text(isRu ? "🤑 Баланс" : "🤑 Balance")],
      ]).resize(),
    )
  } catch (error) {
    console.error("Error sending inline keyboard:", error)
  }
}
