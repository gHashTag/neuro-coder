import { SessionFlavor, Context, InlineKeyboard } from "grammy"
import { createUser, getUid } from "../core/supabase"
import { ChatMembersFlavor } from "@grammyjs/chat-members"
import { MyContext, SessionData } from "../utils/types"

import { ConversationFlavor } from "@grammyjs/conversations"
import { bot } from "../index"

// Обновляем тип контекста
export type MyContextChatMembers = Context & SessionFlavor<SessionData> & ConversationFlavor & ChatMembersFlavor

export type MyContextWithSession = MyContext & SessionFlavor<SessionData>
// Проверка подписки с использованием chat-members
async function checkSubscription(ctx: MyContextChatMembers): Promise<boolean> {
  try {
    if (!ctx.from?.id) {
      console.error("User ID is undefined")
      throw new Error("User ID is undefined")
    }
    const chatMember = await bot.api.getChatMember("@neuro_blogger_group", ctx.from?.id)
    return ["member", "administrator", "creator"].includes(chatMember.status)
  } catch (error) {
    console.error("Error checking subscription:", error)
    throw error
  }
}

// Основной middleware
export const subscriptionMiddleware = async (ctx: MyContextChatMembers, next: () => Promise<void>) => {
  try {
    // Проверяем, что команда /start
    if (ctx.message?.text !== "/start") {
      return await next()
    }
    if (!ctx.from) {
      console.error("No user data found in context")
      return await ctx.reply("Error: No user data found")
    }

    // Получаем inviter_id из start параметра
    const startPayload = (ctx.message?.text || "").split(" ")[1]

    console.log("startPayload", startPayload)
    const inviter = await getUid(startPayload)

    const { username, id: telegram_id, first_name, last_name, is_bot, language_code } = ctx.from

    const finalUsername = username || first_name || telegram_id.toString()
    const photo_url = await getUserPhotoUrl(ctx, telegram_id)

    const isSubscribed = await checkSubscription(ctx)
    if (!isSubscribed) {
      return await ctx.reply(
        language_code === "ru"
          ? "Пожалуйста, подпишитесь на наш канал, чтобы продолжить использование бота. 😊"
          : "Please subscribe to our channel to continue using the bot. 😊",
        {
          reply_markup: new InlineKeyboard().url(language_code === "ru" ? "Подписаться" : "Subscribe", "https://t.me/neuro_blogger_group"),
        },
      )
    }

    // Создаем пользователя с inviter из start параметра
    const userData = {
      username: finalUsername,
      telegram_id: telegram_id.toString(),
      first_name: first_name || null,
      last_name: last_name || null,
      is_bot: is_bot || false,
      language_code: language_code || "en",
      photo_url,
      chat_id: ctx.chat?.id || null,
      mode: "clean",
      model: "gpt-4-turbo",
      count: 0,
      limit: 200,
      aspect_ratio: "9:16",
      balance: 100,
      inviter,
    }

    await createUser(userData)

    return await next()
  } catch (error) {
    console.error("Critical error in subscriptionMiddleware:", error)
    const isRu = ctx.from?.language_code === "ru"
    return await ctx.reply(isRu ? "Произошла критическая ошибка. Пожалуйста, попробуйте позже." : "A critical error occurred. Please try again later.")
    throw error
  }
}

async function getUserPhotoUrl(ctx: MyContextChatMembers, userId: number): Promise<string | null> {
  try {
    // Получаем массив фотографий профиля
    const userPhotos = await ctx.api.getUserProfilePhotos(userId, {
      limit: 1,
      offset: 0,
    })

    // Проверяем есть ли фотографии
    if (userPhotos.total_count === 0) {
      console.log("No photos found")
      return null
    }

    // Получаем файл самого большого размера фото
    const photoSizes = userPhotos.photos[0]
    const largestPhoto = photoSizes[photoSizes.length - 1]

    console.log("Largest photo:", largestPhoto)

    const file = await ctx.api.getFile(largestPhoto.file_id)
    console.log("File info:", file)

    if (!file.file_path) {
      console.log("No file_path in response")
      return null
    }

    // Формируем URL фотографии
    const photoUrl = `https://api.telegram.org/file/bot${ctx.api.token}/${file.file_path}`
    console.log("Generated photo URL:", photoUrl)

    return photoUrl
  } catch (error) {
    console.error("Error getting user profile photo:", error)
    throw error
  }
}
