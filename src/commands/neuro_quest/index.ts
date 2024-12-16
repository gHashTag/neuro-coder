import { Conversation, ConversationFlavor } from "@grammyjs/conversations"
import { MyContext } from "../../utils/types"
import { InlineKeyboard } from "grammy"

type MyConversationType = MyContext & ConversationFlavor

async function neuroQuest(conversation: Conversation<MyConversationType>, ctx: MyConversationType) {
  const isRu = ctx.from?.language_code === "ru"
  console.log("🎮 Starting Neuro Quest for user:", ctx.from?.id)

  // Шаг 1: Приветствие
  await ctx.reply(
    isRu
      ? "🎮 Добро пожаловать в Нейро-Квест!\n\nЯ помогу вам освоить все возможности бота в формате увлекательной игры. Готовы начать?"
      : "🎮 Welcome to Neuro-Quest!\n\nI'll help you master all the bot's features in an exciting game format. Ready to start?",
    {
      reply_markup: new InlineKeyboard()
        .text(isRu ? "🚀 Начать приключение" : "🚀 Start adventure", "quest_start")
        .text(isRu ? "❌ Пропустить" : "❌ Skip", "quest_skip"),
    },
  )

  try {
    console.log("Waiting for start response...")
    const startResponse = await conversation.waitFor("callback_query:data")
    console.log("Received start response:", startResponse.callbackQuery.data)
    await ctx.api.answerCallbackQuery(startResponse.callbackQuery.id)

    if (startResponse.callbackQuery.data === "quest_skip") {
      console.log("User skipped the quest")
      await ctx.reply(isRu ? "👋 Вы всегда можете начать квест заново командой /start" : "👋 You can always restart the quest with /start command")
      return
    }

    // Шаг 2: Генерация изображения
    console.log("Starting image generation step")
    await ctx.reply(
      isRu
        ? "🎨 Первое задание: давайте создадим изображение!\n\nИспользуйте команду /text_to_image и опишите что-нибудь простое, например 'космический котик'"
        : "🎨 First task: let's create an image!\n\nUse the /text_to_image command and describe something simple, like 'space cat'",
    )

    // Просто ждем следующее сообщение после команды
    let msg = await conversation.wait()
    while (!msg.message?.text?.startsWith("/text_to_image")) {
      msg = await conversation.wait()
    }
    console.log("Text to image command received")

    // Переходим к следующему шагу после небольшой паузы
    await new Promise((resolve) => setTimeout(resolve, 2000))

    // Шаг 3: Улучшение промпта
    await ctx.reply(
      isRu
        ? "✨ После генерации изображения вы можете улучшить результат, используя кнопку 'Улучшить промпт' под изображением. Давайте перейдем к следующему шагу."
        : "✨ After generating an image, you can improve the result using the 'Improve prompt' button under the image. Let's move to the next step.",
    )

    await new Promise((resolve) => setTimeout(resolve, 3000))

    // Шаг 4: Создание видео
    await ctx.reply(
      isRu
        ? "🎥 Из любого изображения можно создать видео! Используйте кнопку 'Сгенерировать видео' под изображением, когда захотите сделать его анимированным. Идем дальше!"
        : "🎥 You can create a video from any image! Use the 'Generate video' button under the image when you want to animate it. Let's continue!",
    )

    await new Promise((resolve) => setTimeout(resolve, 3000))

    // Шаг 5: Общение с ИИ
    await ctx.reply(
      isRu
        ? "🤖 Я также умею общаться! Просто напишите мне любой вопрос, и я постараюсь на него ответить. Попробуйте прямо сейчас!"
        : "🤖 I can also chat! Just write me any question and I'll try to answer it. Try it now!",
    )

    // Ждем любое текстовое сообщение
    msg = await conversation.wait()
    while (!msg.message?.text || msg.message.text.startsWith("/")) {
      msg = await conversation.wait()
    }
    console.log("Chat message received")

    // Шаг 6: Настройка размера
    await ctx.reply(
      isRu
        ? "⚙️ И последнее: вы можете настроить размер генерируемых изображений командой /imagesize. Попробуйте!"
        : "⚙️ And lastly: you can configure the size of generated images with the /imagesize command. Try it!",
    )

    msg = await conversation.wait()
    while (!msg.message?.text?.startsWith("/imagesize")) {
      msg = await conversation.wait()
    }
    console.log("Imagesize command received")

    // Завершение квеста
    await ctx.reply(
      isRu
        ? "🎉 Поздравляем! Вы узнали основные возможности бота!\n\n" +
            "• Генерация изображений (/text_to_image)\n" +
            "• Улучшение результатов\n" +
            "• Создание видео\n" +
            "• Общение с ИИ\n" +
            "• Настройка параметров (/imagesize)\n\n" +
            "Используйте /help для просмотра всех команд.\n" +
            "Удачи в творчестве! 🚀"
        : "🎉 Congratulations! You've learned the main features!\n\n" +
            "• Image generation (/text_to_image)\n" +
            "• Result improvement\n" +
            "• Video creation\n" +
            "• AI chat\n" +
            "• Settings configuration (/imagesize)\n\n" +
            "Use /help to see all commands.\n" +
            "Good luck with your creations! 🚀",
      {
        reply_markup: new InlineKeyboard()
          .text(isRu ? "🎁 Получить бонус" : "🎁 Get bonus", "quest_bonus")
          .text(isRu ? "💫 Улучшить подписку" : "💫 Upgrade subscription", "quest_upgrade"),
      },
    )
    console.log("Quest completed for user:", ctx.from?.id)
  } catch (error) {
    console.error("Quest error:", error)
    await ctx.reply(isRu ? "Произошла ошибка. Используйте /start для перезапуска квеста." : "An error occurred. Use /start to restart the quest.")
  }
}

export default neuroQuest
