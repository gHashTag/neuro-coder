import { InputFile } from "grammy"
import { pulse } from "../../helpers"

import { generateNeuroImage } from "../../helpers/generateNeuroImage"
import { buttonNeuroHandlers } from "../../helpers/buttonNeuroHandlers"
import { MyContext, MyConversation } from "../../utils/types"
import { supabase } from "../../core/supabase"
import {
  getUserBalance,
  imageNeuroGenerationCost,
  sendBalanceMessage,
  sendCurrentBalanceMessage,
  sendInsufficientStarsMessage,
  updateUserBalance,
  sendCostMessage,
} from "../../helpers/telegramStars/telegramStars"

interface UserModel {
  model_name: string
  trigger_word: string
  model_url: string
  model_key?: `${string}/${string}:${string}`
}

async function getLatestUserModel(userId: number): Promise<UserModel | null> {
  const { data, error } = await supabase
    .from("model_trainings")
    .select("model_name, trigger_word, model_url")
    .eq("user_id", userId)
    .eq("status", "completed")
    .order("created_at", { ascending: false })
    .limit(1)
    .single()
  console.log(data, "getLatestUserModel: data")
  if (error) {
    console.error("Error getting user model:", error)
    return null
  }

  // Извлекаем model_key из model_url
  if (data && data.model_url) {
    return {
      ...data,
    }
  }

  return data as UserModel
}

export async function neuroPhotoConversation(conversation: MyConversation, ctx: MyContext) {
  const isRu = ctx.from?.language_code === "ru"
  const userId = ctx.from?.id

  if (!userId) {
    await ctx.reply(isRu ? "❌ Ошибка идентификации пользователя" : "❌ User identification error")
    return
  }
  const currentBalance = await getUserBalance(userId)
  await sendCostMessage(ctx, isRu, imageNeuroGenerationCost)
  if (currentBalance < imageNeuroGenerationCost) {
    await sendInsufficientStarsMessage(ctx, isRu)
    return
  }
  await sendCurrentBalanceMessage(ctx, isRu, currentBalance)

  try {
    // Получаем последнюю обученную модель пользователя
    const userModel = await getLatestUserModel(userId)
    console.log(userModel, "userModel")
    if (!userModel || !userModel.model_url) {
      await ctx.reply(
        isRu
          ? "❌ У вас нет обченных моделей. Используйте /train_flux_model чтобы создать свою модель."
          : "❌ You don't have any trained models. Use /train_flux_model to create your model.",
      )
      return
    }

    // Запрашиваем промпт
    await ctx.reply(isRu ? `📸 Опишите, какую фотографию вы хотите сгенерировать` : `📸Describe what kind of photo you want to generate.`)

    const promptMsg = await conversation.wait()
    const promptText = promptMsg.message?.text

    if (!promptText) {
      await ctx.reply(isRu ? "❌ Некорректный промпт" : "❌ Invalid prompt")
      return
    }

    // Добавляем trigger word к промпту
    const fullPrompt = `Fashionable ${userModel.trigger_word}, ${promptText}`

    // Отправляем сообщение о начале генерации
    const loadingMsg = await ctx.reply(isRu ? "⏳ Генерирую изображение..." : "⏳ Generating image...")

    try {
      const result = await generateNeuroImage(fullPrompt, userModel.model_url, userId, ctx)
      console.log("Generation result:", result)

      if (!result || !result.image || (Buffer.isBuffer(result.image) && result.image.length === 0)) {
        throw new Error("Empty image received from generation")
      }

      // Отправляем сгенерированное изображение
      const photoToSend = new InputFile(result.image as Buffer)
      console.log("Photo to send:", typeof photoToSend, photoToSend instanceof InputFile ? "InputFile" : "not InputFile")

      await ctx.replyWithPhoto(photoToSend)

      // Снимаем звезды с баланса
      const newBalance = currentBalance - imageNeuroGenerationCost
      await updateUserBalance(userId, newBalance)
      await sendBalanceMessage(ctx, isRu, newBalance)

      // Отправляем в pulse с правильным model_type
      const pulseImage = Buffer.isBuffer(result.image) ? `data:image/jpeg;base64,${result.image.toString("base64")}` : result.image
      await pulse(ctx, pulseImage, fullPrompt, `/${userModel.model_name}`)

      // Показываем кнопки для дальнейших действий
      await buttonNeuroHandlers(ctx, result.prompt_id.toString())
    } finally {
      // Удаляем сообщение о загрузке
      await ctx.api.deleteMessage(ctx.chat?.id || "", loadingMsg.message_id).catch(console.error)
    }
  } catch (error) {
    console.error("Error in neuro_photo conversation:", error)
    await ctx.reply(isRu ? "❌ Произошла ошибка. Пожалуйста, попробуйте еще раз." : "❌ An error occurred. Please try again.")
  }
}
