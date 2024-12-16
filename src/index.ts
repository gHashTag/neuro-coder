require("dotenv").config()

import commands from "./commands"
import { development, production } from "./utils/launch"
import { hydrateFiles } from "@grammyjs/files"
import { conversations, createConversation } from "@grammyjs/conversations"
import { session } from "grammy"
import { imageSizeConversation } from "./commands/imagesize"
import { customMiddleware } from "./helpers"
import { generateImageConversation } from "./commands/generateImage"
import createTriggerReel from "./commands/trigger_reel"
import createCaptionForNews from "./commands/сaptionForNews"
import { get100Conversation } from "./commands/get100"
import { soulConversation } from "./commands/soul"
import { voiceConversation } from "./commands/voice"
import { incrementLimit, setModel } from "./core/supabase/ai"

import { invite } from "./commands/invite"

import { answerAi } from "./core/openai/requests"
import textToSpeech from "./commands/textToSpeech"
import { lipSyncConversation } from "./commands/lipSyncConversation"
import { createBackgroundVideo } from "./commands/createBackgroundVideo"
import { start } from "./commands/start"
import leeSolarNumerolog from "./commands/lee_solar_numerolog"
import leeSolarBroker from "./commands/lee_solar_broker"
import { subtitles } from "./commands/subtitles"
import { sendPaymentInfo } from "./core/supabase/payments"
import { getUid, getUserModel } from "./core/supabase"
import createAinews from "./commands/ainews"
import { textToImageConversation } from "./commands/text_to_image"

import { textToVideoConversation } from "./commands/text_to_video"
import imageToVideo from "./commands/image_to_video"
import { imageToPromptConversation } from "./commands/image_to_prompt"
import { trainFluxModelConversation } from "./commands/train_flux_model"
import { neuroPhotoConversation } from "./commands/neuro_photo"
// import { sequentialize } from "@grammyjs/runner"
import neuroQuest from "./commands/neuro_quest"

import { handleAspectRatioChange, handleBuy, handleChangeSize } from "./handlers"

import bot from "./core/bot"

import { isRussian } from "./utils/language"
import { handleGenerateImproved } from "./handlers/handleGenerateImproved"
import { handleGenerate } from "./handlers/handleGenerate"
import { handleImprove } from "./handlers/handleImprove"
import { handleGenerateImage } from "./handlers/handleGenerateImage"
import { handleRetry } from "./handlers/handleRetry"
import { handleNeuroGenerate } from "./handlers/handleNeuroGenerate"
import { handleNeuroImprove } from "./handlers/handleNeuroImprove"
import { handleNeuroGenerateImproved } from "./handlers/handleNeuroGenerateImproved"
import { handleNeuroVideo } from "./handlers/handleNeuroVideo"

bot.api.config.use(hydrateFiles(bot.token))

bot.use(session({ initial: () => ({}) }))

console.log(`Starting bot in ${process.env.NODE_ENV} mode`)

// Запускаем бот в соответствующем режиме
if (process.env.NODE_ENV === "development") {
  development(bot).catch(console.error)
} else {
  production(bot).catch(console.error)
}

// Добавляем sequentialize middleware для правильной обработки сообщений от одного пользователя
// bot.use(
//   sequentialize((ctx) => {
//     const chat = ctx.chat?.id.toString()
//     const user = ctx.from?.id.toString()
//     return [chat, user].filter((con): con is string => con !== undefined)
//   }),
// )

if (process.env.NODE_ENV === "production") {
  bot.api.setMyCommands([
    {
      command: "start",
      description: "👋 Start bot / Запустить бота",
    },
    {
      command: "help",
      description: "❓ Help / Помощь",
    },
    {
      command: "buy",
      description: "💰 Buy a subscription / Купить подписку",
    },
    {
      command: "select_model",
      description: "🤖 Select model / Выбрать модель",
    },
    {
      command: "invite",
      description: "👥 Invite a friend / Пригласить друга",
    },
    {
      command: "avatar",
      description: "👤 Tell about yourself / Рассказать о себе",
    },
    {
      command: "voice",
      description: "🎤 Add voice to avatar / Добавить аватару голос",
    },
    {
      command: "text_to_speech",
      description: "🎤 Convert text to speech / Преобразовать текст в речь",
    },
    {
      command: "lipsync",
      description: "🎥 Lipsync / Синхронизация губ",
    },
    {
      command: "b_roll",
      description: "🎥 Create B-roll / Создать B-roll",
    },
    {
      command: "subtitles",
      description: "🎥 Create subtitles / Создать субтитры",
    },
    {
      command: "ainews",
      description: "📰 Create AI news caption / Создать описание AI новости",
    },
    {
      command: "text_to_image",
      description: "🎨 Generate image from text / Сгенерировать изображение из текста",
    },
    {
      command: "text_to_video",
      description: "🎥 Generate video from text / Сгенерировать видео из текста",
    },
    {
      command: "caption_for_ai_news",
      description: "📝 Create AI news caption / Создать описание для AI новостей",
    },
    {
      command: "image_to_video",
      description: "🎥 Generate video from image / Сгенерировать видео из изображения",
    },
    {
      command: "image_to_prompt",
      description: "🔍 Generate prompt from image / Сгенерировать промпт из изображения",
    },
    {
      command: "train_flux_model",
      description: "🎨 Train FLUX model / Обучить модель FLUX",
    },
    {
      command: "invite",
      description: "👥 Invite a friend / Пригласить друга",
    },
    {
      command: "train_flux_model",
      description: "🎨 Train FLUX model / Обучить модель FLUX",
    },
    {
      command: "neuro_photo",
      description: "🤖 Generate your photos / Сгенерировать ваши фото",
    },
  ])
}

bot.use(conversations())
bot.use(createConversation(imageSizeConversation))
bot.use(createConversation(textToSpeech))
bot.use(createConversation(generateImageConversation))
bot.use(createConversation(createTriggerReel))
bot.use(createConversation(createCaptionForNews))
bot.use(createConversation(get100Conversation))
bot.use(createConversation(soulConversation))
bot.use(createConversation(voiceConversation))
bot.command("invite", invite)
bot.use(createConversation(lipSyncConversation))
bot.use(createConversation(createBackgroundVideo))
bot.use(createConversation(leeSolarNumerolog))
bot.use(createConversation(leeSolarBroker))
bot.use(createConversation(subtitles))
bot.use(createConversation(createAinews))
bot.use(createConversation(textToImageConversation))
bot.use(createConversation(textToVideoConversation))
bot.use(createConversation(imageToVideo))
bot.use(createConversation(imageToPromptConversation))
bot.use(createConversation(trainFluxModelConversation))
bot.use(createConversation(neuroPhotoConversation))
bot.use(createConversation(neuroQuest))

bot.command("start", async (ctx) => {
  await start(ctx)
})

bot.use(customMiddleware)
bot.use(commands)

bot.on("pre_checkout_query", (ctx) => {
  ctx.answerPreCheckoutQuery(true)
  return
})

bot.on("message:successful_payment", async (ctx) => {
  // const lang = ctx.from?.language_code === "ru"
  console.log("ctx 646(succesful_payment)", ctx)
  const level = ctx.message.successful_payment.invoice_payload
  if (level === "avatar") {
    await incrementLimit({ telegram_id: ctx.from?.id.toString() || "", amount: 400 })
  }
  if (!ctx.from?.id) throw new Error("No telegram id")
  const user_id = await getUid(ctx.from.id.toString())
  if (!user_id) throw new Error("No user_id")
  await sendPaymentInfo(user_id, level)
  // const levelForMessage =
  //   level === "start"
  //     ? lang
  //       ? "НейроСтарт"
  //       : "NeuroStart"
  //     : level === "base"
  //     ? lang
  //       ? "НейроБаза"
  //       : "NeuroBase"
  //     : level === "student"
  //     ? lang
  //       ? "НейроУченик"
  //       : "NeuroStudent"
  //     : lang
  //     ? "НейроЭксперт"
  //     : "NeuroExpert"
  // await ctx.reply(lang ? "🤝 Спасибо за окупку!" : "🤝 Thank you for the purchase!")
  // const textToPost = lang
  //   ? `🪙 @${ctx.from.username} спасибо за покупку уровня ${levelForMessage}!`
  //   : `🪙 @${ctx.from.username} thank you for the purchase level ${levelForMessage}!`
  // await ctx.api.sendMessage(mediaChatId(lang), textToPost)
  return
})

bot.on("message:text", async (ctx) => {
  // Если это команда, пропускаем
  if (ctx.message.text.startsWith("/")) {
    return
  }

  // Здесь должен быть вызов GPT
  try {
    // Получаем модель пользователя
    const userModel = await getUserModel(ctx.from?.id.toString() || "")

    const response = await answerAi(userModel, ctx.message.text, ctx.from?.language_code || "en")

    // Проверяем, что ответ не null
    if (!response) {
      await ctx.reply(
        ctx.from?.language_code === "ru"
          ? "Не удалось получить ответ от GPT. Пожалуйста, попробуйте позже."
          : "Failed to get response from GPT. Please try again later.",
      )
      return
    }

    await ctx.reply(response)
  } catch (error) {
    console.error("Error in GPT response:", error)
    await ctx.reply(ctx.from?.language_code === "ru" ? "Произошла ошибка при обработке запроса" : "An error occurred while processing your request")
  }
})

bot.on("callback_query:data", async (ctx) => {
  const isRu = isRussian(ctx)

  try {
    const data = ctx.callbackQuery.data
    await ctx.answerCallbackQuery().catch((e) => console.error("Ошибка при ответе на callback query:", e))

    if (data === "change_size") {
      await handleChangeSize({ ctx })
      return
    }

    if (data.startsWith("size_")) {
      await handleAspectRatioChange({ ctx })
      return
    }

    if (data.startsWith("buy")) {
      await handleBuy({ ctx, data, isRu })
      return
    }

    // Добавляем новый обработчик для выбора модели
    if (data.startsWith("select_model_")) {
      const model = data.replace("select_model_", "")
      await setModel(ctx.from.id.toString(), model)
      return
    }

    if (data.startsWith("generate_improved_")) {
      await handleGenerateImproved(ctx, data, isRu)
      return
    } else if (data.startsWith("generate_")) {
      await handleGenerate(ctx, data, isRu)
      return
    } else if (data.startsWith("improve_")) {
      await handleImprove(ctx, data, isRu)
      return
    } else if (data.startsWith("generate_image_")) {
      await handleGenerateImage(ctx, data, isRu)
      return
    }

    if (data === "retry") {
      await handleRetry(ctx, isRu)
      return
    }

    // Добавляем обрботчики для нейро-кнопок
    if (data.startsWith("neuro_generate_")) {
      await handleNeuroGenerate(ctx, data, isRu)
      return
    } else if (data.startsWith("neuro_improve_")) {
      await handleNeuroImprove(ctx, data, isRu)
      return
    } else if (data.startsWith("neuro_generate_improved_")) {
      await handleNeuroGenerateImproved(ctx, data, isRu)
      return
    } else if (data === "neuro_cancel") {
      await ctx.reply(isRu ? "❌ Генерация отменена" : "❌ Generation cancelled")
    } else if (data.startsWith("neuro_video_")) {
      await handleNeuroVideo(ctx, data, isRu)
      return
    }
  } catch (error) {
    console.error("Ошибка при обработке callback query:", error)
    try {
      await ctx.answerCallbackQuery()
    } catch (e) {
      console.error("Не удалось от��етить на callback query:", e)
    }
    await ctx.reply(isRu ? "Произошла ошибка. Пожалуйста, попробуйте позже." : "An error occurred. Please try again later.")
  }
})

bot.catch((err) => {
  const ctx = err.ctx
  const isRu = ctx.from?.language_code === "ru"
  console.error(`Ошибка при обработке обновления ${ctx.update.update_id}:`)
  console.error("error", err.error)
  ctx
    .reply(
      isRu
        ? "Извините, позшла ошбка ри обработке вашго запроса. Пожалуйста, попробуйте позже."
        : "Sorry, an error occurred while processing your request. Please try again later.",
    )
    .catch((e) => {
      console.error("Ошибка отправки сообщения об ошибке поьзователю:", e)
    })
})

// Регистрирем команду
bot.command("text_to_image", async (ctx) => {
  await ctx.conversation.enter("textToImageConversation")
})

bot.command("image_to_prompt", async (ctx) => {
  await ctx.conversation.enter("imageToPromptConversation")
})

bot.command("train_flux_model", async (ctx) => {
  await ctx.conversation.enter("trainFluxModelConversation")
})

// Обработчик кнопки изменения ��азмера
bot.callbackQuery("change_size", async (ctx) => {
  const isRu = ctx.from?.language_code === "ru"
  await ctx.reply(isRu ? "Выберите размер изображения:" : "Choose image size:", {
    reply_markup: {
      inline_keyboard: [
        [
          { text: "1:1", callback_data: "size_1:1" },
          { text: "16:9", callback_data: "size_16:9" },
          { text: "9:16", callback_data: "size_9:16" },
        ],
      ],
    },
  })
})

export { bot }
