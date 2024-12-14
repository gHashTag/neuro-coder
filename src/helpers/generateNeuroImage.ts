import { replicate } from "../core/replicate"
import { getAspectRatio, savePrompt } from "../core/supabase/ai"
import { processApiResponse, fetchImage, ApiResponse } from "./generateImage"

// Определяем тип результата без null для prompt_id
export interface GenerationPhotoResult {
  image: Buffer
  prompt_id: number
}

export async function generateNeuroImage(prompt: string, model_type: string, telegram_id: string): Promise<GenerationPhotoResult> {
  try {
    const aspect_ratio = await getAspectRatio(telegram_id)
    let output: ApiResponse = ""
    let retries = 1

    // Создаем input для запроса с учетом aspect_ratio
    const input = {
      prompt,
      negative_prompt:
        "nsfw, erotic, violence, bad anatomy, bad hands, text, error, missing fingers, extra digit, fewer digits, cropped, worst quality, low quality, normal quality, jpeg artifacts, signature, watermark, username, blurry",
      num_inference_steps: 28,
      guidance_scale: 3.5,
      // Устанавливаем размеры в зависимости от aspect_ratio
      ...(aspect_ratio === "1:1"
        ? { width: 1024, height: 1024 }
        : aspect_ratio === "16:9"
        ? { width: 1365, height: 768 }
        : aspect_ratio === "9:16"
        ? { width: 768, height: 1365 }
        : { width: 1024, height: 1024 }), // дефолтный размер
      sampler: "flowmatch",
      seed: 42,
      num_outputs: 1,
      aspect_ratio, // Добавляем aspect_ratio в параметры
    }

    console.log("Using model:", model_type)
    console.log("Input:", input)
    console.log("Aspect ratio:", aspect_ratio)

    while (retries > 0) {
      try {
        // @ts-expect-error Replicate API возвращает string | string[] но не типизирован корректно
        output = await replicate.run(model_type, { input })
        console.log("Replicate output:", output)

        const imageUrl = await processApiResponse(output)
        console.log("Image URL:", imageUrl)

        if (!imageUrl || imageUrl.endsWith("empty.zip")) {
          throw new Error(`Invalid image URL: ${imageUrl}`)
        }

        const imageBuffer = await fetchImage(imageUrl)
        console.log("Image buffer size:", imageBuffer.length)

        if (!imageBuffer || imageBuffer.length === 0) {
          throw new Error("Empty image buffer received")
        }

        // Сохраняем промпт и получаем id
        const prompt_id = await savePrompt(prompt, model_type, imageUrl, telegram_id)
        if (!prompt_id) {
          throw new Error("Failed to save prompt")
        }

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
