import { Bot } from "grammy"
import { MyContextWithSession } from "./types"

const production = async (bot: Bot<MyContextWithSession>): Promise<void> => {
  try {
    await bot.api.deleteWebhook({ drop_pending_updates: true })
    console.log("Old webhook deleted")

    await new Promise((resolve) => setTimeout(resolve, 2000))

    const webhookUrl = `${process.env.VERCEL_URL}/api/index`
    //
    const success = await bot.api.setWebhook(webhookUrl)
    await bot.start()
    if (success) {
      console.log(`Webhook successfully set to ${webhookUrl}`)
      console.log("Bot is running in webhook mode")
    } else {
      throw new Error("Failed to set webhook")
    }
  } catch (e) {
    console.error("Error in production setup:", e)
    throw e
  }
}

const development = async (bot: Bot<MyContextWithSession>): Promise<void> => {
  try {
    await bot.api.deleteWebhook({ drop_pending_updates: true })
    console.log("[SERVER] Webhook deleted, starting polling...")

    await new Promise((resolve) => setTimeout(resolve, 1000))

    await bot.start({
      drop_pending_updates: true,
      onStart: () => {
        console.log("[SERVER] Bot started polling")
      },
    })
  } catch (e) {
    console.error("Error in development setup:", e)
    throw e
  }
}

export { production, development }
