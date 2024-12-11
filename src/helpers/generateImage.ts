import { replicate } from "../core/replicate"
import axios from "axios"
import { incrementGeneratedImages, getAspectRatio, savePrompt } from "../core/supabase/ai"

interface GenerationResult {
  image: string | Buffer
  prompt_id: number | null
}

interface ModelInput {
  prompt: string
  width?: number
  height?: number
  size?: string
  aspect_ratio?: string
  negative_prompt?: string
  refine?: string
  apply_watermark?: boolean
  num_inference_steps?: number
}

interface ModelConfig {
  key: `${string}/${string}` | `${string}/${string}:${string}`
  word: string
  description: {
    ru: string
    en: string
  }
  getInput: (prompt: string, aspect_ratio: string) => ModelInput
}

type ApiResponse = string | string[] | { output: string }

const modelConfigs: Record<string, ModelConfig> = {
  flux: {
    key: "black-forest-labs/flux-1.1-pro-ultra",
    word: "ultra realistic photograph, 8k uhd, high quality",
    description: {
      ru: "🎨 Flux - фотореалистичные изображения высокого качества",
      en: "🎨 Flux - photorealistic high quality images",
    },
    getInput: (prompt, aspect_ratio) => ({
      prompt,
      size: aspect_ratio === "1:1" ? "1024x1024" : aspect_ratio === "16:9" ? "1365x768" : "1365x1024",
      aspect_ratio: aspect_ratio === "1:1" ? "1:1" : aspect_ratio === "16:9" ? "16:9" : "3:2",
      negative_prompt: "nsfw, erotic, violence, bad anatomy",
    }),
  },
  sdxl: {
    key: "stability-ai/sdxl:7762fd07cf82c948538e41f63f77d685e02b063e37e496e96eefd46c929f9bdc",
    word: "ultra realistic photograph, 8k uhd, high quality",
    description: {
      ru: "🎨 SDXL - фотореалистичные изображения высокого качества",
      en: "🎨 SDXL - photorealistic high quality images",
    },
    getInput: (prompt, aspect_ratio) => ({
      width: aspect_ratio === "1:1" ? 1024 : 1024,
      height: aspect_ratio === "1:1" ? 1024 : 768,
      prompt,
      refine: "expert_ensemble_refiner",
      apply_watermark: false,
      num_inference_steps: 25,
      negative_prompt:
        "nsfw, erotic, violence, bad anatomy, bad hands, text, error, missing fingers, extra digit, fewer digits, cropped, worst quality, low quality, normal quality, jpeg artifacts, signature, watermark, username, blurry",
    }),
  },
  sd3: {
    key: "stability-ai/stable-diffusion-3.5-large-turbo",
    word: "",
    description: {
      ru: "🎨 SD3 - фотореалистичные изображения высокого качества",
      en: "🎨 SD3 - photorealistic high quality images",
    },
    getInput: (prompt, aspect_ratio) => ({
      prompt,
      aspect_ratio: aspect_ratio === "1:1" ? "1:1" : aspect_ratio === "16:9" ? "16:9" : "3:2",
      negative_prompt:
        "nsfw, erotic, violence, bad anatomy, bad hands, text, error, missing fingers, extra digit, fewer digits, cropped, worst quality, low quality, normal quality, jpeg artifacts, signature, watermark, username, blurry",
    }),
  },
  recraft: {
    key: "recraft-ai/recraft-v3",
    word: "",
    description: {
      ru: "🎨 Recraft - фотореалистичные изображения высокого качества",
      en: "🎨 Recraft - photorealistic high quality images",
    },
    getInput: (prompt, aspect_ratio) => ({
      prompt,
      width: aspect_ratio === "1:1" ? 1024 : 1024,
      height: aspect_ratio === "1:1" ? 1024 : 768,
      negative_prompt:
        "nsfw, erotic, violence, bad anatomy, bad hands, text, error, missing fingers, extra digit, fewer digits, cropped, worst quality, low quality, normal quality, jpeg artifacts, signature, watermark, username, blurry",
    }),
  },
  photon: {
    key: "luma/photon",
    word: "",
    description: {
      ru: "🎨 Photon - фотореалистичные изображения высокого качества",
      en: "🎨 Photon - photorealistic high quality images",
    },
    getInput: (prompt) => ({
      prompt,
    }),
  },
}

async function processApiResponse(output: ApiResponse): Promise<string> {
  if (typeof output === "string") return output
  if (Array.isArray(output) && output[0]) return output[0]
  if (output && typeof output === "object" && "output" in output) return output.output
  throw new Error(`Некорректный ответ от API: ${JSON.stringify(output)}`)
}

async function fetchImage(url: string): Promise<Buffer> {
  const response = await axios.get(url, {
    responseType: "arraybuffer",
    validateStatus: (status) => status === 200,
    timeout: 30000,
  })
  return Buffer.from(response.data)
}

export const generateImage = async (prompt: string, model_type: string, telegram_id: string): Promise<GenerationResult> => {
  try {
    await incrementGeneratedImages(telegram_id)
    const aspect_ratio = await getAspectRatio(telegram_id)

    const modelConfig = modelConfigs[model_type]
    if (!modelConfig) {
      throw new Error(`Неподдерживаемый тип модели: ${model_type}`)
    }

    const input = modelConfig.getInput(`${modelConfig.word} ${prompt}`, aspect_ratio)
    let output: ApiResponse = ""
    let retries = 3

    while (retries > 0) {
      try {
        // @ts-expect-error Replicate API возвращает string | string[] но не типизирован корректно
        output = await replicate.run(modelConfig.key, { input })
        const imageUrl = await processApiResponse(output)
        const imageBuffer = await fetchImage(imageUrl)
        const prompt_id = await savePrompt(prompt, model_type, imageUrl, telegram_id)

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
