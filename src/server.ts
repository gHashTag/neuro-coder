import express from "express"
import { webhookCallback } from "grammy"
import { bot } from "./index"
import { supabase } from "./core/supabase"

const app = express()
const port = process.env.PORT || 3000

app.use(express.json())

// Тестовый эндпоинт
app.get("/", (req, res) => {
  res.json({ status: "Server is running" })
})

// Обработчик вебхука для Telegram бота
app.use(`/api/index`, webhookCallback(bot, "express"))

// Обработчик вебхука для Sync Labs
app.post("/api/synclabs-webhook", async (req, res) => {
  try {
    const { status, video_url, id } = req.body
    console.log("Получен вебхук:", req.body)

    if (status === "completed") {
      const { error } = await supabase
        .from("synclabs_videos")
        .update({
          video_url: video_url,
          status: status,
        })
        .eq("video_id", id)

      if (error) {
        console.error("Ошибка при обновлении видео:", error)
        return res.status(500).json({ error: "Ошибка при обновлении видео" })
      }

      console.log("Видео успешно обновлено:", id)
      res.status(200).json({ message: "Видео успешно обработано" })
    } else {
      console.log(`Получен статус ${status} для видео ${id}`)
      res.status(200).json({ message: "Статус получен" })
    }
  } catch (error) {
    console.error("Ошибка обработки вебхука:", error)
    res.status(500).json({ error: "Внутренняя ошибка сервера" })
  }
})

app.listen(port, () => {
  console.log(`Сервер запущен на порту ${port}`)
})

export default app
