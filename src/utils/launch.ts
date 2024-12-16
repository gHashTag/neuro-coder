import { Bot } from "grammy"
import { MyContextWithSession } from "./types"

const production = async (bot: Bot<MyContextWithSession>): Promise<void> => {
  try {
    await bot.api.deleteWebhook()
    await bot.api.setWebhook(`${process.env.VERCEL_URL}/api/index`)
    console.log(`[SERVER] Bot starting webhook`)
  } catch (e) {
    console.error("Error setting webhook:", e)
  }
}

const development = async (bot: Bot<MyContextWithSession>): Promise<void> => {
  try {
    await bot.api.deleteWebhook()
    console.log("[SERVER] Bot starting polling")
    await new Promise((resolve) => setTimeout(resolve, 1000))
    await bot.start({
      drop_pending_updates: true,
      onStart: () => console.log("[SERVER] Bot started polling"),
    })
  } catch (e) {
    console.error("Error starting polling:", e)
  }
}

export { production, development }
