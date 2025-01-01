import { generateNeuroImage } from "../../services/generateNeuroImage"

import { MyContext, MyConversation } from "../../utils/types"
import { supabase } from "../../core/supabase"
import { getUserBalance, imageNeuroGenerationCost, sendInsufficientStarsMessage, sendBalanceMessage } from "../../helpers/telegramStars/telegramStars"

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
  console.log(data, "getLatestUserModel")
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
  console.log("CASE: neuroPhotoConversation")
  const isRu = ctx.from?.language_code === "ru"
  const userId = ctx.from?.id

  if (!userId) {
    await ctx.reply(isRu ? "❌ Ошибка идентификации пользователя" : "❌ User identification error")
    return
  }
  const currentBalance = await getUserBalance(userId)

  if (currentBalance < imageNeuroGenerationCost) {
    await sendInsufficientStarsMessage(ctx, isRu)
    return
  }
  await sendBalanceMessage(currentBalance, imageNeuroGenerationCost, ctx, isRu)

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
    await ctx.reply(isRu ? `📸 Опишите, какую фотографию вы хотите сгенерировать` : `📸Describe what kind of photo you want to generate.`, {
      reply_markup: {
        force_reply: true,
      },
    })

    const promptMsg = await conversation.wait()
    console.log(promptMsg, "promptMsg")
    const promptText = promptMsg.message?.text

    if (!promptText) {
      await ctx.reply(isRu ? "❌ Некорректный промпт" : "❌ Invalid prompt")
      return
    }

    // Добавляем trigger word к промпту
    const fullPrompt = `Fashionable ${userModel.trigger_word}, ${promptText}`

    // Отправляем сообщение о начале генерации
    await ctx.reply(isRu ? "⏳ Генерирую изображение..." : "⏳ Generating image...")

    await generateNeuroImage(fullPrompt, userModel.model_url, userId, ctx, 1)
    return
  } catch (error) {
    console.error("Error in neuro_photo conversation:", error)
    await ctx.reply(isRu ? "❌ Произошла ошибка. Пожалуйста, попробуйте еще раз." : "❌ An error occurred. Please try again.")
    return
  }
}
