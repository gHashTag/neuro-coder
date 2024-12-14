import { Conversation, ConversationFlavor } from "@grammyjs/conversations"
import { MyContext } from "../../utils/types"
import * as fs from "fs/promises"
import * as path from "path"
import archiver from "archiver"
import { createWriteStream } from "fs"

import { supabase } from "../../core/supabase"
import { replicate } from "../../core/replicate"
import { createModelTraining, updateModelTraining, ModelTrainingUpdate } from "../../core/supabase"

// Добавляем интерфейс для ошибки API
interface ApiError extends Error {
  response?: {
    status: number
  }
}

type MyConversation = Conversation<MyContext & ConversationFlavor>

async function isValidImage(buffer: Buffer): Promise<boolean> {
  try {
    // Проверяем первые байты файла на соответствие сигнатурам изображений
    const header = buffer.slice(0, 4)

    // Проверка на JPEG
    if (header[0] === 0xff && header[1] === 0xd8 && header[2] === 0xff) {
      return true
    }

    // Проверка на PNG
    if (header[0] === 0x89 && header[1] === 0x50 && header[2] === 0x4e && header[3] === 0x47) {
      return true
    }

    return false
  } catch (error) {
    return false
  }
}

async function createImagesZip(images: { buffer: Buffer; filename: string }[]): Promise<string> {
  // Создаем временную директорию для изображений
  const tmpDir = path.join(process.cwd(), "tmp")
  const timestamp = Date.now()
  const zipPath = path.join(tmpDir, `training_images_${timestamp}.zip`)

  try {
    // Создаем временную директорию, если её нет
    await fs.mkdir(tmpDir, { recursive: true })

    // Создаем ZIP архив
    const output = createWriteStream(zipPath)
    const archive = archiver("zip", { zlib: { level: 9 } })

    archive.pipe(output)

    // Добавляем изображения в архив
    for (const image of images) {
      archive.append(image.buffer, { name: image.filename })
    }

    await archive.finalize()

    return zipPath
  } catch (error) {
    console.error("Error creating ZIP archive:", error)
    throw error
  }
}

async function cleanupOldArchives(userId: string) {
  try {
    // Получаем список всех файлов в папке пользователя
    const { data: files, error } = await supabase.storage.from("ai-training").list(`training/${userId}`)

    if (error) {
      console.error("Error listing files:", error)
      return
    }

    // Оставляем только последний архив, удаляем остальные
    if (files && files.length > 1) {
      // Сортируем файлы по дате создания (самые новые первые)
      const sortedFiles = files.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())

      // Удаляем все кроме последнего
      for (const file of sortedFiles.slice(1)) {
        await supabase.storage.from("ai-training").remove([`training/${userId}/${file.name}`])
      }
    }
  } catch (error) {
    console.error("Error cleaning up old archives:", error)
  }
}

async function uploadToSupabase(zipPath: string, userId: string): Promise<string> {
  try {
    const zipBuffer = await fs.readFile(zipPath)
    const timestamp = Date.now()
    const filename = `training_images_${timestamp}.zip`
    const filePath = `training/${userId}/${filename}`

    const { error } = await supabase.storage.from("ai-training").upload(filePath, zipBuffer, {
      contentType: "application/zip",
      upsert: false,
    })

    if (error) {
      console.error("Error uploading to Supabase:", error)
      if (error.message.includes("row-level security policy")) {
        throw new Error("Ошибка доступа к хранилищу. Пожалуйста, обратитесь к администратору.")
      }
      throw error
    }

    const { data: publicUrl } = supabase.storage.from("ai-training").getPublicUrl(filePath)

    // Очищаем старые архивы
    await cleanupOldArchives(userId)

    return publicUrl.publicUrl
  } catch (error) {
    console.error("Error in uploadToSupabase:", error)
    throw error
  }
}

interface TrainingInput {
  steps: number
  lora_rank: number
  optimizer: string
  batch_size: number
  resolution: string
  autocaption: boolean
  input_images: string
  trigger_word: string
  learning_rate: number
  wandb_project: string
  wandb_save_interval: number
  caption_dropout_rate: number
  cache_latents_to_disk: boolean
  wandb_sample_interval: number
}

interface TrainingResponse {
  id: string
  status: string
  urls: {
    get: string
  }
  error?: string
}

async function trainFluxModel(zipUrl: string, triggerWord: string, modelName: string, userId: string): Promise<string> {
  let currentTraining: TrainingResponse | null = null

  try {
    if (!process.env.REPLICATE_USERNAME) {
      throw new Error("REPLICATE_USERNAME is not set")
    }

    const destination: `${string}/${string}` = `${process.env.REPLICATE_USERNAME}/${modelName}`
    console.log("Training configuration:", {
      username: process.env.REPLICATE_USERNAME,
      modelName,
      destination,
      triggerWord,
      zipUrl,
    })

    // Сначала создаем модель
    try {
      const model = await replicate.models.create(
        process.env.REPLICATE_USERNAME, // owner
        modelName, // model_name
        {
          // options
          description: `LoRA model trained with trigger word: ${triggerWord}`,
          visibility: "public",
          hardware: "gpu-t4",
        },
      )
      console.log("Model created:", model)
    } catch (error) {
      // Игнорируем ошибку если модель уже существует
      const apiError = error as ApiError
      if (apiError.response?.status !== 409) {
        // Добавляем более подробное логирование ошибки
        if (apiError.response?.status === 400) {
          console.error("Model creation validation error:", error)
          throw new Error("Ошибка валидации при создании модели. Проверьте параметры конфигурации.")
        }
        throw error
      }
      console.log("Model already exists, continuing with training...")
    }

    // Создаем запись о тренировке
    await createModelTraining({
      user_id: userId,
      model_name: modelName,
      trigger_word: triggerWord,
      zip_url: zipUrl,
    })

    // Создаем тренировку в Replicate
    currentTraining = await replicate.trainings.create("ostris", "flux-dev-lora-trainer", "e440909d3512c31646ee2e0c7d6f6f4923224863a6a10c494606e79fb5844497", {
      destination,
      input: {
        steps: 5000,
        lora_rank: 20,
        optimizer: "adamw8bit",
        batch_size: 1,
        resolution: "512,768,1024",
        autocaption: true,
        input_images: zipUrl,
        trigger_word: triggerWord,
        learning_rate: 0.0004,
        wandb_project: "flux_train_replicate",
      } as TrainingInput,
    })

    // Обновляем запись с ID тренировки
    await updateModelTraining(userId, modelName, {
      replicate_training_id: currentTraining.id,
    })

    // Ждем завершения тренировки
    let status = currentTraining.status
    while (status !== "succeeded" && status !== "failed") {
      await new Promise((resolve) => setTimeout(resolve, 10000))
      const updatedTraining = await replicate.trainings.get(currentTraining.id)
      status = updatedTraining.status
      console.log(`Training status: ${status}`)

      // Добавляем логирование деталей тренировки
      if (updatedTraining.error) {
        console.error("Training error details from Replicate:", {
          error: updatedTraining.error,
          status: updatedTraining.status,
          id: updatedTraining.id,
        })
      }

      // Обновляем статус в базе
      await updateModelTraining(userId, modelName, { status })
    }

    if (status === "failed") {
      // Получаем детали ошибки
      const failedTraining = await replicate.trainings.get(currentTraining.id)
      console.error("Training failed details:", {
        error: failedTraining.error,
        status: failedTraining.status,
        id: failedTraining.id,
        urls: failedTraining.urls,
      })

      await updateModelTraining(userId, modelName, {
        status: "failed",
        error: failedTraining.error || "Unknown error",
      } as ModelTrainingUpdate)

      throw new Error(`Training failed: ${failedTraining.error || "Unknown error"}`)
    }

    // Обновляем URL модели
    await updateModelTraining(userId, modelName, {
      status: "completed",
      model_url: currentTraining.urls.get,
    })

    return currentTraining.urls.get
  } catch (error) {
    console.error("Training error details:", {
      error,
      username: process.env.REPLICATE_USERNAME,
      modelName,
      triggerWord,
      trainingId: currentTraining?.id,
    })

    if ((error as ApiError).response?.status === 404) {
      throw new Error(`Ошибка при создании или доступе к модели. Проверьте REPLICATE_USERNAME (${process.env.REPLICATE_USERNAME}) и права доступа.`)
    }
    throw error
  }
}

async function ensureSupabaseAuth(): Promise<void> {
  try {
    // Проверяем подключение простым запросом
    const { error } = await supabase.from("users").select("count", { count: "exact", head: true }).limit(1)

    if (error) throw error
  } catch (error) {
    console.error("Supabase connection error:", error)
    throw new Error("Не удалось подключиться к Supabase")
  }
}

export async function trainFluxModelConversation(conversation: MyConversation, ctx: MyContext) {
  const isRu = ctx.from?.language_code === "ru"
  const userId = ctx.from?.id.toString()
  const username = ctx.from?.username
  const images: { buffer: Buffer; filename: string }[] = []
  let isCancelled = false
  let modelName = ""

  if (!userId) {
    await ctx.reply(isRu ? "❌ Ошибка идентификации пользователя" : "❌ User identification error")
    return
  }

  if (!username) {
    await ctx.reply(
      isRu ? "❌ Для обучения модели необходимо указать username в настройках Telegram" : "❌ You need to set a username in Telegram settings to train a model",
    )
    return
  }

  try {
    // Формируем название модели из username
    modelName = `${username.toLowerCase()}`

    // Проверяем, есть ли уже модель с таким именем
    const { data: existingModel } = await supabase.from("model_trainings").select("*").eq("model_name", modelName).single()

    if (existingModel) {
      // Добавляем номер к имени модели, если такая уже существует
      const { count } = await supabase.from("model_trainings").select("*", { count: "exact" }).eq("user_id", userId)
      modelName = `${username.toLowerCase()}_${(count || 0) + 1}`
    }

    // Запрашиваем изображения с кнопкой отмены
    await ctx.reply(
      isRu
        ? "Пожалуйста, отправьте изображения для обучения модели (минимум 10 изображений). Отправьте /done когда закончите."
        : "Please send images for model training (minimum 10 images). Send /done when finished.",
      {
        reply_markup: {
          inline_keyboard: [[{ text: isRu ? "❌ Отменить" : "❌ Cancel", callback_data: "cancel_training" }]],
        },
      },
    )

    // Вместо conversation.on используем проверку в цикле
    while (!isCancelled) {
      const msg = await conversation.wait()

      // Проверяем callback_query
      if (msg.callbackQuery?.data === "cancel_training") {
        isCancelled = true
        await msg.answerCallbackQuery()
        await ctx.reply(isRu ? "❌ Генерация отменена" : "❌ Generation cancelled")
        break
      }

      if (msg.message?.text === "/done") {
        if (images.length < 10) {
          await ctx.reply(isRu ? `Необходимо минимум 10 изображений. Сейчас: ${images.length}` : `Minimum 10 images required. Current: ${images.length}`)
          continue
        }
        break
      }

      if (msg.message?.photo) {
        const photo = msg.message.photo[msg.message.photo.length - 1]
        const file = await ctx.api.getFile(photo.file_id)

        if (!file.file_path) {
          await ctx.reply(isRu ? "❌ Ошибка получения файла" : "❌ Error getting file")
          continue
        }

        const response = await fetch(`https://api.telegram.org/file/bot${process.env.BOT_TOKEN}/${file.file_path}`)
        const buffer = Buffer.from(await response.arrayBuffer())

        // Проверяем валидность изображения
        if (!(await isValidImage(buffer))) {
          await ctx.reply(
            isRu
              ? "❌ Файл не является корректным изображением. Пожалуйста, отправьте другое изображение."
              : "❌ File is not a valid image. Please send another image.",
          )
          continue
        }

        // Добавьте константу для максимального размера
        const MAX_IMAGE_SIZE = 10 * 1024 * 1024 // 10 MB

        // В обработчике изображений добавьте проверку размера
        if (buffer.length > MAX_IMAGE_SIZE) {
          await ctx.reply(isRu ? "❌ Изображение слишком большое. Максимальный размер: 10MB" : "❌ Image is too large. Maximum size: 10MB")
          continue
        }

        images.push({
          buffer,
          filename: `a_photo_of_${username}x${images.length + 1}.jpg`,
        })

        await ctx.reply(
          isRu
            ? `✅ Изображение ${images.length} добавлено. Отправьте еще или /done для завершения`
            : `✅ Image ${images.length} added. Send more or /done to finish`,
        )
      }
    }

    if (isCancelled) {
      return
    }

    // Создаем ZIP архив
    await ctx.reply(isRu ? "⏳ Создаю архив..." : "⏳ Creating archive...")
    const zipPath = await createImagesZip(images)

    // Проверяем авторизацию перед загрузкой
    await ensureSupabaseAuth()

    // Загружаем архив в Supabase (userId уже проверен выше)
    await ctx.reply(isRu ? "⏳ Загружаю архив..." : "⏳ Uploading archive...")
    const zipUrl = await uploadToSupabase(zipPath, userId)

    const triggerWord = `${username.toLocaleUpperCase()}`

    if (!triggerWord) {
      await ctx.reply(isRu ? "❌ Некорректный trigger word" : "❌ Invalid trigger word")
      return
    }

    // Начинаем обучение
    await ctx.reply(isRu ? "⏳ Начинаю обучение модели..." : "⏳ Starting model training...")

    const modelUrl = await trainFluxModel(zipUrl, triggerWord, modelName, userId)

    // Очищаем временные файлы
    await fs.unlink(zipPath).catch(console.error)

    await ctx.reply(
      isRu
        ? `✅ Обучение завершено!\n\nВаша модель доступна по адресу: ${modelUrl}\n\nДля генерации изображений используйте trigger word: ${triggerWord}`
        : `✅ Training completed!\n\nYour model is available at: ${modelUrl}\n\nUse trigger word: ${triggerWord} for image generation`,
    )
  } catch (error) {
    console.error("Error in train_flux_model conversation:", error)
    await ctx.reply(isRu ? "❌ Произошла ошибка. Пожалуйста, попробуйте еще раз." : "❌ An error occurred. Please try again.")
  }
}
