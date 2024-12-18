import { replicate } from "../core/replicate"
import { getAspectRatio, savePrompt } from "../core/supabase/ai"
import { processApiResponse, fetchImage, ApiResponse } from "./generateReplicateImage"
import { GenerationResult } from "../utils/types"

export async function generateNeuroImage(prompt: string, model_type: string, telegram_id: string, ctx: any): Promise<GenerationResult | null> {
  console.log("Starting generateNeuroImage with:", { prompt, model_type, telegram_id })

  try {
    const aspect_ratio = await getAspectRatio(telegram_id)
    console.log("Got aspect ratio:", aspect_ratio)

    let output: ApiResponse = ""
    let retries = 1

    // Создаем input для запроса
    const input = {
      prompt,
      negative_prompt:
        "nsfw, erotic, violence, bad anatomy, bad hands, text, error, missing fingers, extra digit, fewer digits, cropped, worst quality, low quality, normal quality, jpeg artifacts, signature, watermark, username, blurry",
      num_inference_steps: 28,
      guidance_scale: 7,
      ...(aspect_ratio === "1:1"
        ? { width: 1024, height: 1024 }
        : aspect_ratio === "16:9"
        ? { width: 1365, height: 768 }
        : aspect_ratio === "9:16"
        ? { width: 768, height: 1365 }
        : { width: 1024, height: 1024 }),
      sampler: "flowmatch",
      num_outputs: 1,
      aspect_ratio,
    }

    console.log("Created input:", input)

    while (retries > 0) {
      try {
        console.log("Attempting to run model, attempt:", 4 - retries)
        // @ts-expect-error Replicate API типы
        output = await replicate.run(model_type, { input })
        console.log("Got output from replicate:", output)

        const imageUrl = await processApiResponse(output)
        console.log("Processed image URL:", imageUrl)

        if (!imageUrl || imageUrl.endsWith("empty.zip")) {
          throw new Error(`Invalid image URL: ${imageUrl}`)
        }

        const imageBuffer = await fetchImage(imageUrl)
        console.log("Fetched image buffer, size:", imageBuffer.length)

        const prompt_id = await savePrompt(prompt, model_type, telegram_id)

        console.log("Saved prompt with id:", prompt_id)

        if (prompt_id === null) {
          console.error("Failed to save prompt")
          return null
        }

        console.log("Returning successful result with prompt_id:", prompt_id)
        return {
          image: imageBuffer,
          prompt_id,
        }
      } catch (error) {
        console.error(`Generation attempt ${4 - retries} failed:`, error)
        retries--
        if (retries === 0) throw error
        console.log("Waiting before next attempt...")
        await new Promise((resolve) => setTimeout(resolve, 2000))
      }
    }

    throw new Error("All generation attempts exhausted")
  } catch (error) {
    if (error instanceof Error && error.message.includes("NSFW content detected")) {
      console.error("NSFW контент обнаружен при генерации изображения.")
      // Отправьте сообщение пользователю
      await ctx.reply("Извините, генерация изображения не удалась из-за обнаружения неподходящего контента.")
    } else {
      console.error("Ошибка при генерации изображения:", error)
      // Обработка других ошибок
    }
    return null
  }
}
