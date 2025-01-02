import { MyContext } from "../interfaces"
import { Markup } from "telegraf"

export async function startMenu(ctx: MyContext, isRu: boolean) {
  try {
    await ctx.reply(
      isRu ? "Выберите действие в меню:" : "Choose an action in the menu:",
      Markup.keyboard([
        [Markup.button.callback(isRu ? "🎮 Начать обучение" : "🎮 Start learning", "level_0")],
        [Markup.button.callback(isRu ? "💎 Пополнить баланс" : "💎 Top up balance", "top_up_balance")],
        [Markup.button.callback(isRu ? "🤑 Баланс" : "🤑 Balance", "balance")],
      ]),
    )
  } catch (error) {
    console.error("Error sending inline keyboard:", error)
  }
}
