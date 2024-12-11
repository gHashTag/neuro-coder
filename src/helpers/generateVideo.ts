import { replicate } from "../core/replicate"
import axios from "axios"
import { savePrompt } from "../core/supabase/ai"

interface VideoGenerationResult {
  video: Buffer
  prompt_id: number | null
}

interface VideoModelInput {
  prompt: string
  [key: string]: string | number | boolean
}

interface VideoModelConfig {
  key: `${string}/${string}`
  word: string
  description: {
    ru: string
    en: string
  }
  getInput: (prompt: string) => VideoModelInput
}

const videoModelConfigs: Record<string, VideoModelConfig> = {
  minimax: {
    key: "minimax/video-01",
    word: "",
    description: {
      ru: "🎥 Minimax - генерация видео",
      en: "🎥 Minimax - video generation",
    },
    getInput: (prompt) => ({
      prompt,
    }),
  },
}

async function fetchVideo(url: string): Promise<Buffer> {
  const response = await axios.get(url, {
    responseType: "arraybuffer",
    validateStatus: (status) => status === 200,
    timeout: 60000,
  })
  return Buffer.from(response.data)
}

export const generateVideo = async (
  prompt: string,
  model_type: string,
  telegram_id: string, // Оставляем только для сохранения в базу
): Promise<VideoGenerationResult> => {
  try {
    const modelConfig = videoModelConfigs[model_type]
    if (!modelConfig) {
      throw new Error(`Неподдерживаемый тип видео-модели: ${model_type}`)
    }

    const input = modelConfig.getInput(`${modelConfig.word} ${prompt}`)
    let output: string | string[] | null = null
    let retries = 3

    while (retries > 0) {
      try {
        // @ts-expect-error Replicate API возвращает string | string[] но не типизирован корректно
        output = await replicate.run(modelConfig.key, { input })
        const videoUrl = typeof output === "string" ? output : output?.[0]

        if (!videoUrl) {
          throw new Error("Не удалось получить URL видео")
        }

        const videoBuffer = await fetchVideo(videoUrl)
        const prompt_id = await savePrompt(prompt, model_type, videoUrl, telegram_id)

        return { video: videoBuffer, prompt_id }
      } catch (error) {
        console.error(`Попытка ${4 - retries} не удалась:`, error)
        retries--
        if (retries === 0) throw error
        await new Promise((resolve) => setTimeout(resolve, 2000))
      }
    }

    throw new Error("Все попытки генерации видео исчерпаны")
  } catch (error) {
    console.error("Ошибка при генерации видео:", error)
    throw error
  }
}
