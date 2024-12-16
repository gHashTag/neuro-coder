import { MyContext } from "../../utils/types"
import { InlineKeyboard } from "grammy"

export async function handleLevel1(ctx: MyContext) {
  const isRu = ctx.from?.language_code === "ru"

  await ctx.reply(
    isRu
      ? `🎯 Уровень 1: Основы работы с ботом

Давайте начнем с базовых команд:

1. Используйте /start чтобы получить обзор всех команд
2. Выберите модель ИИ для работы с ботом с помощью /select_model
3. Пригласите друга командой /invite и получите бонус
`
      : `🎯 Level 1: Bot Basics

Let's start with basic commands:

1. Use /start to see all available commands
2. Choose a AI model using /select_model
3. Invite a friend with /invite command and get a bonus
`,
    {
      reply_markup: new InlineKeyboard().text(isRu ? "➡️ Далее" : "➡️ Next", "level_2"),
    },
  )
}

export async function handleLevel2(ctx: MyContext) {
  const isRu = ctx.from?.language_code === "ru"

  await ctx.reply(
    isRu
      ? `🎨 Уровень 2: Генерация изображений

Теперь научимся создавать изображения:

1. /text_to_image - создайте изображение из текста
2. /image_to_prompt - получите описание изображения
3. /train_flux_model - обучите свою модель
4. /neuro_photo - создайте фотореалистичное изображение`
      : `🎨 Level 2: Image Generation

Now let's learn to create images:

1. /text_to_image - create an image from text
2. /image_to_prompt - get image description
3. /train_flux_model - train your own model
4. /neuro_photo - create photorealistic images`,
    {
      reply_markup: new InlineKeyboard().text(isRu ? "➡️ Далее" : "➡️ Next", "level_3"),
    },
  )
}

export async function handleLevel3(ctx: MyContext) {
  const isRu = ctx.from?.language_code === "ru"

  await ctx.reply(
    isRu
      ? `🎥 Уровень 3: Работа с видео

Создадим потрясающие видео:

1. /text_to_video - создайте видео из текста
2. /image_to_video - преобразуйте изображение в видео
3. /b_roll - создайте B-roll видео
4. /lipsync - синхронизируйте движение губ
5. /subtitles - добавьте субтитры`
      : `🎥 Level 3: Video Creation

Let's create amazing videos:

1. /text_to_video - create video from text
2. /image_to_video - convert image to video
3. /b_roll - create B-roll video
4. /lipsync - synchronize lip movements
5. /subtitles - add subtitles`,
    {
      reply_markup: new InlineKeyboard().text(isRu ? "➡️ Далее" : "➡️ Next", "level_4"),
    },
  )
}

export async function handleLevel4(ctx: MyContext) {
  const isRu = ctx.from?.language_code === "ru"

  await ctx.reply(
    isRu
      ? `🎤 Уровень 4: Аудио и голос

Финальный уровень - работа с голосом:

1. /text_to_speech - преобразуйте текст в речь
2. /voice - добавьте голос к аватару
3. /avatar - создайте цифрового аватара`
      : `🎤 Level 4: Audio and Voice

Final level - working with voice:

1. /text_to_speech - convert text to speech
2. /voice - add voice to avatar`,
    {
      reply_markup: new InlineKeyboard().text(isRu ? "🎉 Завершить" : "🎉 Complete", "quest_complete"),
    },
  )
}

export async function handleQuestComplete(ctx: MyContext) {
  const isRu = ctx.from?.language_code === "ru"

  await ctx.reply(
    isRu
      ? `🎉 Поздравляем! Вы прошли все уровни НейроКвеста!

Теперь вы знаете все основные возможности бота. Продолжайте экспериментировать и создавать удивительные вещи!

Используйте /buy чтобы получить расширенный доступ к функциям бота.`
      : `🎉 Congratulations! You've completed all NeuroQuest levels!

Now you know all the main features of the bot. Keep experimenting and creating amazing things!

Use /buy to get extended access to bot features.`,
  )
}

export async function handleQuestRules(ctx: MyContext) {
  const isRu = ctx.from?.language_code === "ru"

  await ctx.reply(
    isRu
      ? `📜 Правила НейроКвеста:

1. Выполняйте задания последовательно
2. За каждое выполненное задание вы получаете очки
3. Чем больше очков - тем выше ваш уровень
4. Некоторые задания имеют ограничение по времени
5. За особые достижения вы получаете бонусы

Удачи в прохождении! 🍀`
      : `📜 NeuroQuest Rules:

1. Complete tasks sequentially
2. You get points for each completed task
3. The more points - the higher your level
4. Some tasks have time limits
5. You get bonuses for special achievements

Good luck! 🍀`,
  )
}
