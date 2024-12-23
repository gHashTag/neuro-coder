require("../src/index")

import express from "express"
import { webhookCallback } from "grammy"

import bot from "../src/core/bot"
import { supabase } from "../src/core/supabase"
import { incrementBalance } from "../src/helpers/telegramStars/telegramStars"
import { sendPaymentNotification } from "../src/helpers"

const app = express()

const port = process.env.PORT || 3000

console.log(port, "port")

app.listen(port, () => {
  console.log(`Server is running on port ${port}`)
})

app.use(express.json())
app.use(`/api/index`, webhookCallback(bot, "express"))

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

app.get("/payment-success", async (req, res) => {
  try {
    const { OutSum, InvId, Email } = req.query
    console.log(OutSum, InvId, Email)
    // Проверьте параметры, чтобы убедиться, что уведомление действительно от платежной системы

    // Пример обновления баланса
    let stars = 0
    if (OutSum === "5000") {
      stars = 3040
    } else if (OutSum === "10000") {
      stars = 6080
    }

    if (stars > 0) {
      // Обновите баланс пользователя
      const { telegram_id, username, language } = await getTelegramIdFromInvId(Email) // Реализуйте эту функцию для получения ID пользователя
      await incrementBalance({ telegram_id: telegram_id.toString(), amount: stars })
      await sendPaymentNotification(Email, stars, telegram_id, language, username)
    }

    res.status(200).send("OK")
  } catch (error) {
    console.error("Ошибка обработки успешного платежа:", error)
    res.status(500).send("Internal Server Error")
  }
})

type User = {
  telegram_id: string
  username: string
  balance: number
  language: string
}

async function getTelegramIdFromInvId(Email: string): Promise<User> {
  try {
    // Реализуйте логику для получения Telegram ID пользователя по InvId
    const { data } = await supabase.from("users").select("telegram_id, username, balance, language").eq("email", Email).single()
    if (!data) {
      throw new Error("User not found")
    }
    return data
  } catch (error) {
    console.error("Ошибка получения Telegram ID пользователя:", error)
    throw error
  }
}

export default app
