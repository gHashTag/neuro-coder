import axios, { isAxiosError } from "axios"
import { isDev } from "../helpers"

import { InlineKeyboard } from "grammy"

export type VideoModel = "minimax" | "haiper" | "ray" | "i2vgen"

interface ImageToVideoResponse {
  success: boolean
  videoUrl?: string
  message?: string
  prompt_id?: number
}

interface VideoModelConfig {
  name: VideoModel
  title: string
  description: string
}

export const VIDEO_MODELS: VideoModelConfig[] = [
  {
    name: "minimax",
    title: "Minimax",
    description: "Оптимальное качество и скорость",
  },
  {
    name: "haiper",
    title: "Haiper",
    description: "Высокое качество, длительность 6 секунд",
  },
  {
    name: "ray",
    title: "Ray",
    description: "Реалистичная анимация",
  },
  {
    name: "i2vgen",
    title: "I2VGen-XL",
    description: "Продвинутая модель для детальной анимации",
  },
]

export async function generateImageToVideo(
  image: string,
  prompt: string,
  model: VideoModel,
  telegram_id: number,
  username: string,
  isRu: boolean,
): Promise<ImageToVideoResponse> {
  try {
    const url = `${isDev ? "http://localhost:3000" : process.env.ELESTIO_URL}/generate/image-to-video`

    const response = await axios.post<ImageToVideoResponse>(
      url,
      {
        image,
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

    console.log("Image to video generation response:", response.data)
    return response.data
  } catch (error) {
    if (isAxiosError(error)) {
      console.error("API Error:", error.response?.data || error.message)
      throw new Error(isRu ? "Произошла ошибка при преобразовании изображения в видео" : "Error occurred while converting image to video")
    }
    console.error("Unexpected error:", error)
    throw error
  }
}

export function createVideoModelKeyboard(isRu: boolean) {
  return new InlineKeyboard()
    .text(isRu ? "Minimax - Оптимальный" : "Minimax - Optimal", "video_model_minimax")
    .text(isRu ? "Haiper - Качественный" : "Haiper - High Quality", "video_model_haiper")
    .row()
    .text(isRu ? "Ray - Реалистичный" : "Ray - Realistic", "video_model_ray")
    .text(isRu ? "I2VGen-XL - Детальный" : "I2VGen-XL - Detailed", "video_model_i2vgen")
}
