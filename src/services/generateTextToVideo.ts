import axios, { isAxiosError } from "axios"
import { isDev } from "../helpers"

interface TextToVideoResponse {
  success: boolean
  videoUrl?: string
  message?: string
  prompt_id?: number
}

export async function generateTextToVideo(
  prompt: string,
  videoModel: string,
  telegram_id: number,
  username: string,
  isRu: boolean,
): Promise<TextToVideoResponse> {
  try {
    const url = `${isDev ? "http://localhost:3000" : process.env.ELESTIO_URL}/generate/text-to-video`

    if (!prompt) throw new Error(isRu ? "Не удалось определить промпт" : "Could not identify prompt")
    if (!videoModel) throw new Error(isRu ? "Не удалось определить модель" : "Could not identify model")
    if (!telegram_id) throw new Error(isRu ? "Не удалось определить telegram_id" : "Could not identify telegram_id")
    if (!username) throw new Error(isRu ? "Не удалось определить username" : "Could not identify username")
    if (!isRu) throw new Error(isRu ? "Не удалось определить isRu" : "Could not identify isRu")

    const response = await axios.post<TextToVideoResponse>(
      url,
      {
        prompt,
        videoModel,
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
