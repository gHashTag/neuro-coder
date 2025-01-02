require("dotenv").config()
import { Bot } from "grammy"
import { development, production } from "./utils/launch"
import { hydrateFiles } from "@grammyjs/files"

import { handleTextMessage, handleSuccessfulPayment } from "./handlers"
import bot from "./core/bot"
import { MyContext } from "./utils/types"
import { autoRetry } from "@grammyjs/auto-retry"
import { setBotCommands } from "./setCommands"
import { composer, registerCommands } from "./registerCommands"
import { handleCallback } from "./handlers/handleCallback"

if (process.env.NODE_ENV === "development") {
  development(bot).catch(console.error)
} else {
  // В production только настраиваем webhook
  production(bot).catch(console.error)
}

bot.api.config.use(hydrateFiles(bot.token))
bot.api.config.use(autoRetry())

console.log(`Starting bot in ${process.env.NODE_ENV} mode`)

bot.use(composer)

// Set bot commands
setBotCommands(bot as Bot<MyContext>)

// Register commands

bot.on("pre_checkout_query", async (ctx) => {
  await ctx.answerPreCheckoutQuery(true)
  return
})

bot.on("message:successful_payment", handleSuccessfulPayment)

bot.on("message:text", handleTextMessage)

bot.on("callback_query:data", handleCallback)

registerCommands()

bot.catch((err) => {
  const ctx = err.ctx
  const isRu = ctx.from?.language_code === "ru"
  console.error(`Ошибка при обработке обновления ${ctx.update.update_id}:`)
  console.error("error", err.error)
  ctx
    .reply(
      isRu
        ? "Извините, произошла ошибка при обработке вашего запроса. Пожалуйста, попробуйте позже."
        : "Sorry, an error occurred while processing your request. Please try again later.",
    )
    .catch((e) => {
      console.error("Ошибка отправки сообщения об ошибке поьзователю:", e)
    })
})

// Enable graceful stop
process.once("SIGINT", () => bot.stop())
process.once("SIGTERM", () => bot.stop())

export { bot }
