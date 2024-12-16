require("../src/index")

import express from "express"
import { webhookCallback, Context, session } from "grammy"
import { run, sequentialize } from "@grammyjs/runner"
import bot from "../src/core/bot"
import { supabase } from "../src/core/supabase"

const app = express()

const port = process.env.PORT || 3000

console.log(port, "port")

app.listen(port, () => {
  console.log(`Server is running on port ${port}`)
})

app.use(express.json())
app.use(`/api/index`, webhookCallback(bot, "express"))

// Build a unique identifier for the `Context` object.
function getSessionKey(ctx: Context) {
  return ctx.chat?.id.toString()
}

// Sequentialize before accessing session data!
bot.use(sequentialize(getSessionKey))
bot.use(session({ getSessionKey }))
run(bot)

app.post("/api/synclabs-webhook", async (req, res) => {
  try {
    const { status, video_url, id } = req.body

    if (status === "completed") {
      const { error } = await supabase
        .from("synclabs_videos")
        .update({
          video_url: video_url,
          status: status,
        })
        .eq("video_id", id)

      if (error) {
        console.error("Ошибка при обновлении статуса видео:", error)
        return res.status(500).json({ error: "Ошибка при обновлении статуса видео" })
      }
    }

    res.status(200).json({ message: "Webhook processed successfully" })
  } catch (error) {
    console.error("Ошибка обработки вебхука:", error)
    res.status(500).json({ error: "Internal server error" })
  }
})

export default app
