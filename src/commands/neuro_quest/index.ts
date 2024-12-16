import { InlineKeyboard } from "grammy"
import { MyContext, MyConversation } from "../../utils/types"
import { handleLevel1, handleLevel2, handleLevel3, handleLevel4, handleQuestComplete, handleQuestRules } from "./handlers"

export async function neuroQuest(conversation: MyConversation, ctx: MyContext) {
  const isRu = ctx.from?.language_code === "ru"
  console.log("🎮 Starting Neuro Quest for user:", ctx.from?.id)

  // Приветствие
  await ctx.replyWithPhoto("https://dmrooqbmxdhdyblqzswu.supabase.co/storage/v1/object/public/neuro_coder/bot/ava-16-9.jpg", {
    caption: isRu
      ? `🎮 Привет! Я НейроКодер - ваш персональный ассистент по созданию контента для соцсетей.

🤖 Я помогу вам создавать:
• Вирусные посты
• Креативные видео
• Уникальные изображения
• Продающие тексты
• Озвучку и субтитры

🎯 Давайте пройдем квест и научимся:

1️⃣ Базовые настройки
• Выбор модели ИИ для вашего стиля
• Настройка языка и формата контента
• Управление подпиской

2️⃣ Создание визуального контента
• Генерация трендовых изображений
• Создание уникальных артов
• Обработка фото в вашем стиле

3️⃣ Продвинутая работа с видео
• Создание рилс и шортс
• Добавление эффектов движения
• Генерация B-roll контента
• Синхронизация губ с аудио

4️⃣ Аудио и текст
• Озвучка постов
• Создание субтитров
• Генерация продающих текстов

💡 Каждый уровень даст вам навыки для создания профессионального контента.

Готовы стать профи в создании контента?`
      : `👋 Hi! I'm NeuroCoder - your personal assistant for social media content creation.

🤖 I'll help you create:
• Viral posts
• Creative videos
• Unique images
• Sales copy
• Voiceovers and subtitles

🎯 Let's complete this quest and learn:

1️⃣ Basic Setup
• Choosing AI model for your style
• Setting language and content format
• Managing subscription

2️⃣ Visual Content Creation
• Generating trending images
• Creating unique art
• Processing photos in your style

3️⃣ Advanced Video Work
• Creating reels and shorts
• Adding motion effects
• Generating B-roll content
• Lip sync with audio

4️⃣ Audio and Text
• Post voiceovers
• Creating subtitles
• Generating sales copy

💡 Each level will give you skills for creating professional content.

Ready to become a content creation pro?`,
    reply_markup: new InlineKeyboard()
      .text(isRu ? "🎮 Начать обучение" : "🎮 Start learning", "quest_start")
      .row()
      .text(isRu ? "💎 Купить подписку" : "💎 Buy subscription", "buy_subscription"),
  })

  // Обработка ответов пользователя
  while (true) {
    const response = await conversation.waitFor("callback_query:data")
    await ctx.api.answerCallbackQuery(response.callbackQuery.id)

    const action = response.callbackQuery.data

    switch (action) {
      case "quest_rules":
        await handleQuestRules(ctx)
        break
      case "level_2":
        await handleLevel2(ctx)
        break
      case "level_3":
        await handleLevel3(ctx)
        break
      case "level_4":
        await handleLevel4(ctx)
        break
      case "quest_complete":
        await handleQuestComplete(ctx)
        return
      case "buy_subscription":
        await ctx.conversation.enter("buySubscription")
        return
      case "quest_start":
      default:
        await handleLevel1(ctx)
        break
    }
  }
}

export default neuroQuest
