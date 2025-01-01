import { SessionFlavor, Context, InlineKeyboard } from "grammy"
import { createUser } from "../core/supabase"
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
    console.log("ctx.chat?.id", ctx.chat?.id)
    const chatMember = await bot.api.getChatMember("@neuro_coder_group", ctx.from?.id || 0)
    console.log("chatMember", chatMember)
    return ["member", "administrator", "creator"].includes(chatMember.status)
  } catch (error) {
    console.error("Error checking subscription:", error)
    return true
  }
}

// Основной middleware
export const subscriptionMiddleware = async (ctx: MyContextChatMembers, next: () => Promise<void>) => {
  try {
    const username = ctx.from?.username || ""
    const telegram_id = ctx.from?.id
    const isRu = ctx.from?.language_code === "ru"

    if (!telegram_id) {
      console.error("No telegram_id found in context")
      return await ctx.reply(isRu ? "Ошибка идентификации пользователя" : "User identification error")
    }

    const isSubscribed = await checkSubscription(ctx)
    if (!isSubscribed) {
      return await ctx.reply(
        isRu
          ? "Пожалуйста, подпишитесь на наш канал, чтобы продолжить использование бота. 😊"
          : "Please subscribe to our channel to continue using the bot. 😊",
        {
          reply_markup: new InlineKeyboard().url(isRu ? "Подписаться" : "Subscribe", "https://t.me/neuro_coder_group"),
        },
      )
    }

    // Если пользователь подписан, создаем/проверяем пользователя в базе
    await createUser({ username, telegram_id: telegram_id.toString() })

    // И пропускаем к следующему middleware
    return await next()
  } catch (error) {
    console.error("Critical error in subscriptionMiddleware:", error)
    const isRu = ctx.from?.language_code === "ru"
    return await ctx.reply(isRu ? "Произошла критическая ошибка. Пожалуйста, попробуйте позже." : "A critical error occurred. Please try again later.")
  }
}
