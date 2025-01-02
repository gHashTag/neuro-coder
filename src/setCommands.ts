import { Telegraf } from "telegraf"
import { MyContext } from "./interfaces"

export function setBotCommands(bot: Telegraf<MyContext>) {
  // eslint-disable-next-line @typescript-eslint/no-floating-promises
  bot.telegram.setMyCommands([
    {
      command: "start",
      description: "👤 Start / Начать",
    },
    {
      command: "menu",
      description: "👤 Menu / Главное меню",
    },
    {
      command: "price",
      description: "💰 Price / Цена",
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
