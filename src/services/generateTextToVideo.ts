import axios, { isAxiosError } from "axios"
import { isDev } from "../helpers"

interface TextToVideoResponse {
  success: boolean
  videoUrl?: string
  message?: string
  prompt_id?: number
}

export async function generateTextToVideo(prompt: string, model: string, telegram_id: number, username: string, isRu: boolean): Promise<TextToVideoResponse> {
  try {
    const url = `${isDev ? "http://localhost:3000" : process.env.ELESTIO_URL}/generate/text-to-video`

    const response = await axios.post<TextToVideoResponse>(
      url,
      {
        prompt,
        model,
        telegram_id,
        username,
        is_ru: isRu,
      },
      {
        headers: {
          "Content-Type": "application/json",
        },
      },
    )

    console.log("Text to video generation response:", response.data)

    return response.data
  } catch (error) {
    if (isAxiosError(error)) {
      console.error("API Error:", error.response?.data || error.message)
      throw new Error(isRu ? "Произошла ошибка при генерации видео" : "Error occurred while generating video")
    }
    console.error("Unexpected error:", error)
    throw error
  }
}
