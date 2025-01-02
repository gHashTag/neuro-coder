require("dotenv").config()
import { development, production } from "./utils/launch"

import { handleTextMessage } from "./handlers"
import bot from "./core/bot"

import { setBotCommands } from "./setCommands"
import { myComposer, registerCommands } from "./registerCommands"
import { handleCallback } from "./handlers/handleCallback"
import { MyContext } from "./interfaces"

if (process.env.NODE_ENV === "development") {
  development(bot).catch(console.error)
} else {
  production(bot).catch(console.error)
}

console.log(`Starting bot in ${process.env.NODE_ENV} mode`)

bot.use(myComposer.middleware())

setBotCommands(bot)
registerCommands(bot)

bot.on("pre_checkout_query", async (ctx) => {
  await ctx.answerPreCheckoutQuery(true)
  return
})

// bot.on("successful_payment", handleSuccessfulPayment)

bot.on("text", (ctx: MyContext) => handleTextMessage(ctx))
bot.on("callback_query", (ctx: MyContext) => handleCallback(ctx))

bot.catch((err) => {
  const error = err as Error
  console.error("Error:", error.message)
})

// Enable graceful stop
process.once("SIGINT", () => bot.stop())
process.once("SIGTERM", () => bot.stop())

export { bot }
