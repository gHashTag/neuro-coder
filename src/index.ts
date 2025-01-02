require("dotenv").config()
import { development, production } from "./utils/launch"

import { handleTextMessage } from "./handlers"
import bot from "./core/bot"

import { setBotCommands } from "./setCommands"
import { myComposer, registerCommands, stage } from "./registerCommands"
import { handleCallback } from "./handlers/handleCallback"
import { MyContext, MyTextMessageContext } from "./interfaces"

if (process.env.NODE_ENV === "development") {
  development(bot).catch(console.error)
} else {
  production(bot).catch(console.error)
}

console.log(`Starting bot in ${process.env.NODE_ENV} mode`)

setBotCommands(bot)
registerCommands(bot)

bot.use(stage.middleware())
bot.use(myComposer.middleware())

bot.on("pre_checkout_query", async (ctx) => {
  await ctx.answerPreCheckoutQuery(true)
  return
})

// bot.on("successful_payment", handleSuccessfulPayment)
bot.action("callback_query", (ctx: MyContext) => handleCallback(ctx))
bot.on("text", (ctx: MyTextMessageContext) => handleTextMessage(ctx))

bot.catch((err) => {
  const error = err as Error
  console.error("Error:", error.message)
})

// Enable graceful stop
process.once("SIGINT", () => bot.stop())
process.once("SIGTERM", () => bot.stop())

export { bot }
