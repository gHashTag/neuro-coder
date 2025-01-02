import { Bot } from "grammy"
import { MyContext } from "./utils/types"

export function setBotCommands(bot: Bot<MyContext>) {
  // eslint-disable-next-line @typescript-eslint/no-floating-promises
  bot.api.setMyCommands([
    {
      command: "menu",
      description: "👤 Menu / Главное меню",
    },
    {
      command: "invite",
      description: "👥 Invite a friend / Пригласить друга",
    },
    {
      command: "buy",
      description: "💰 Top up balance / Пополнить баланс",
    },
    {
      command: "balance",
      description: "💰 Balance / Баланс",
    },
    {
      command: "help",
      description: "🤖 Help / Помощь",
    },
  ])
}
