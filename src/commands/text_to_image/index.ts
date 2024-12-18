import { pulse } from "../../helpers"
import { MyContext } from "../../utils/types"
import { Conversation } from "@grammyjs/conversations"
import { InlineKeyboard, InputFile } from "grammy"
import { getGeneratedImages } from "../../core/supabase/ai"
import { buttonHandlers } from "../../helpers/buttonHandlers"
import { generateImage } from "../../helpers/generateReplicateImage"
import { models } from "src/core/replicate"
import { supabase } from "src/core/supabase"

async function getUserBalance(userId: number): Promise<number> {
  const { data, error } = await supabase.from("users").select("balance").eq("telegram_id", userId).single()

  if (error) {
    if (error.code === "PGRST116") {
      console.error(`Пользователь с ID ${userId} не найден.`)
      throw new Error("Пользователь не найден")
    }
    console.error("Ошибка при получении баланса:", error)
    throw new Error("Не удалось получить баланс пользователя")
  }

  return data.balance
}

// Функция для обновления баланса пользователя
async function updateUserBalance(userId: string, newBalance: number): Promise<void> {
  const { error } = await supabase.from("users").update({ balance: newBalance }).eq("telegram_id", userId)

  if (error) {
    console.error("Ошибка при обновлении баланса:", error)
    throw new Error("Не удалось обновить баланс пользователя")
  }
}

const textToImageConversation = async (conversation: Conversation<MyContext>, ctx: MyContext): Promise<void> => {
  const isRu = ctx.from?.language_code === "ru"
  try {
    if (!ctx.from?.id) {
      await ctx.reply(isRu ? "❌ Произошла ошибка" : "❌ An error occurred")
      return
    }

    // Показываем меню выбора модели
    await ctx.reply(isRu ? "🎨 Выберите модель для генерации:" : "🎨 Choose generation model:", {
      reply_markup: {
        inline_keyboard: [
          [
            {
              text: "Flux 1.1Pro Ultra",
              callback_data: "flux",
            },
            {
              text: "SDXL",
              callback_data: "sdxl",
            },
          ],
          [
            {
              text: "SD 3.5 Turbo",
              callback_data: "sd3",
            },
            {
              text: "Recraft v3",
              callback_data: "recraft",
            },
          ],
          [
            {
              text: "Photon",
              callback_data: "photon",
            },
          ],
          [
            {
              text: isRu ? "❌ Отмена" : "❌ Cancel",
              callback_data: "cancel",
            },
          ],
        ],
      },
    })

    // Ждем выбор модели
    const modelResponse = await conversation.waitFor("callback_query:data")
    console.log(modelResponse, "modelResponse")
    if (modelResponse.callbackQuery.data === "cancel") {
      await ctx.reply(isRu ? "❌ Генерация отменена" : "❌ Generation cancelled")
      return
    }

    const model_type = modelResponse.callbackQuery.data
    console.log(model_type, "model_type")
    const price = Number(models[model_type].price)

    // Получаем текущий баланс пользователя
    const currentBalance = await getUserBalance(ctx.from.id)

    // Проверяем, достаточно ли средств
    if (currentBalance < price) {
      await ctx.reply(isRu ? "Недостаточно средств для генерации изображения." : "Insufficient funds to generate the image.")
      return
    }

    // Отправляем текущий баланс
    await ctx.reply(isRu ? `Ваш текущий баланс: $${currentBalance}` : `Your current balance: $${currentBalance}`)

    const keyboard = new InlineKeyboard().text(isRu ? "❌ Отменить генерацию" : "❌ Cancel generation", "cancel")

    const greetingMessage = await ctx.reply(
      isRu ? "👋 Напишите промпт на английском для генерации изображения." : "👋 Hello! Write a prompt in English to generate an image.",
      { reply_markup: keyboard },
    )

    const { message, callbackQuery } = await conversation.wait()
    if (callbackQuery?.data === "cancel") {
      await ctx.api.deleteMessage(ctx.chat?.id || "", greetingMessage.message_id)
      await ctx.reply(isRu ? "❌ Генерация отменена" : "❌ Generation cancelled")
      return
    }

    if (!message || !ctx.from?.id) return

    const text = message.photo ? message.caption : message.text

    const generatingMessage = await ctx.reply(isRu ? "⏳ Генерация..." : "⏳ Generating...")

    const { image, prompt_id } = await generateImage(text || "", model_type || "", ctx.from.id.toString())

    if (!image) {
      throw new Error("Не удалось получить изображение")
    }

    await ctx.api.deleteMessage(ctx.chat?.id || "", generatingMessage.message_id)

    // Обработка изображения для отправки
    const photoToSend = Buffer.isBuffer(image) ? new InputFile(image) : image
    await ctx.replyWithPhoto(photoToSend).catch((error) => {
      console.error("Ошибка при отправке фото:", error)
      throw error
    })

    // Обработка изображения для pulse
    const pulseImage = Buffer.isBuffer(image) ? `data:image/jpeg;base64,${image.toString("base64")}` : image
    await pulse(ctx, pulseImage, text || "", `/${model_type}`)

    // Обновляем баланс пользователя
    const newBalance = currentBalance - price
    await updateUserBalance(ctx.from.id.toString(), newBalance)

    await ctx.reply(
      isRu
        ? `Изображение сгенерировано. Стоимость: $${price}. Ваш новый баланс: $${newBalance}`
        : `Image generated. Cost: $${price}. Your new balance: $${newBalance}`,
    )

    const info = await getGeneratedImages(ctx.from.id.toString() || "")
    const { count, limit } = info

    if (count < limit) {
      buttonHandlers(ctx, prompt_id?.toString() || "")
    }
  } catch (error) {
    console.error("Error in generateImageConversation:", error)
    await ctx.reply(isRu ? `❌ Произошла ошибка: ${JSON.stringify(error)}` : `❌ An error occurred: ${JSON.stringify(error)}`)
  }
}

export { textToImageConversation }
