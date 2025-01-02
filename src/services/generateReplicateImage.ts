import axios from "axios"

import { isDev } from "../helpers"
import { MyContext } from "../interfaces"

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

export const generateImage = async (prompt: string, model_type: string, telegram_id: number, isRu: boolean, ctx: MyContext) => {
  try {
    const url = `${isDev ? "http://localhost:3000" : process.env.ELESTIO_URL}/generate/text-to-image`
    console.log(url, "url")
    await axios.post(
      url,
      {
        prompt,
        model: model_type,
        telegram_id,
        username: ctx.from?.username,
        is_ru: isRu,
      },
      {
        headers: {
          "Content-Type": "application/json",
        },
      },
    )
  } catch (error) {
    console.error("Ошибка при генерации изображения:", error)
    throw error
  }
}
