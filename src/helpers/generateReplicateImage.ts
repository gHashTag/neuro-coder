import { models, replicate } from "../core/replicate"
import axios from "axios"
import { incrementGeneratedImages, getAspectRatio, savePrompt } from "../core/supabase/ai"

export interface GenerationResult {
  image: string | Buffer
  prompt_id: number | null
}

export type ApiResponse = string | string[] | { output: string }

export async function processApiResponse(output: ApiResponse): Promise<string> {
  if (typeof output === "string") return output
  if (Array.isArray(output) && output[0]) return output[0]
  if (output && typeof output === "object" && "output" in output) return output.output
  throw new Error(`Некорректный ответ от API: ${JSON.stringify(output)}`)
}

export async function fetchImage(url: string): Promise<Buffer> {
  const response = await axios.get(url, {
    responseType: "arraybuffer",
    validateStatus: (status) => status === 200,
    timeout: 30000,
  })
  return Buffer.from(response.data)
}

export const generateImage = async (prompt: string, model_type: string, telegram_id: number): Promise<GenerationResult> => {
  try {
    await incrementGeneratedImages(telegram_id)
    const aspect_ratio = await getAspectRatio(telegram_id)
    console.log(aspect_ratio, "aspect_ratio")

    const modelConfig = models[model_type]
    console.log(modelConfig, "modelConfig")
    if (!modelConfig) {
      throw new Error(`Неподдерживаемый тип модели: ${model_type}`)
    }

    const input = modelConfig.getInput(`${modelConfig.word} ${prompt}`, aspect_ratio)
    console.log(input, "input")
    let output: ApiResponse = ""
    let retries = 3

    while (retries > 0) {
      try {
        // @ts-expect-error Replicate API возвращает string | string[] но не типизирован корректно
        output = await replicate.run(modelConfig.key, { input })
        const imageUrl = await processApiResponse(output)
        const imageBuffer = await fetchImage(imageUrl)
        const prompt_id = await savePrompt(prompt, modelConfig.key, imageUrl, telegram_id)

        return { image: imageBuffer, prompt_id }
      } catch (error) {
        console.error(`Попытка ${4 - retries} не удалась:`, error)
        retries--
        if (retries === 0) throw error
        await new Promise((resolve) => setTimeout(resolve, 2000))
      }
    }

    throw new Error("Все попытки генерации изображения исчерпаны")
  } catch (error) {
    console.error("Ошибка при генерации изображения:", error)
    throw error
  }
}
