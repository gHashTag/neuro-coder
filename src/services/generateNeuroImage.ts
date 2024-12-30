import axios, { isAxiosError } from "axios"

import { isDev } from "../helpers"
import { isRussian } from "../utils/language"
import { MyContext } from "../utils/types"

export async function generateNeuroImage(prompt: string, model_type: string, telegram_id: number, ctx: MyContext, numImages: number): Promise<null> {
  console.log("Starting generateNeuroImage with:", { prompt, model_type, telegram_id })

  try {
    const url = `${isDev ? "http://localhost:3000" : process.env.ELESTIO_URL}/generate/neuro-photo`

    await axios.post(
      url,
      {
        prompt,
        telegram_id,
        username: ctx.from?.username,
        num_images: numImages || 1,
        is_ru: isRussian(ctx),
      },
      {
        headers: {
          "Content-Type": "application/json",
        },
      },
    )
    return null
  } catch (error) {
    if (isAxiosError(error)) {
      console.error("API Error:", error.response?.data || error.message)
      if (error.response?.data?.error?.includes("NSFW")) {
        await ctx.reply("Извините, генерация изображения не удалась из-за обнаружения неподходящего контента.")
      } else {
        await ctx.reply("Произошла ошибка при генерации изображения. Пожалуйста, попробуйте позже.")
      }
    } else {
      console.error("Error generating image:", error)
    }
    return null
  }
}
