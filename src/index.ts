require("dotenv").config()

import commands from "./commands"
import { development, production } from "./utils/launch"
import { hydrateFiles } from "@grammyjs/files"
import { conversations, createConversation } from "@grammyjs/conversations"
import { session } from "grammy"
import { imageSizeConversation } from "./commands/imagesize"
import { customMiddleware } from "./helpers"
import { generateImageConversation } from "./commands/generateImageConversation"
import createTriggerReel from "./commands/trigger_reel"
import captionForReels from "./commands/caption_for_reels"
import { get100Conversation } from "./commands/get100"
import { avatarConversation } from "./commands/avatar"
import { voiceConversation } from "./commands/voice"
import { getUserData, setModel } from "./core/supabase/ai"
import { freeStorage } from "@grammyjs/storage-free"
import { invite } from "./commands/invite"

import { answerAi } from "./core/openai/requests"
import textToSpeech from "./commands/text_to_speech"
import { lipSyncConversation } from "./commands/lipSyncConversation"
import { createBackgroundVideo } from "./commands/createBackgroundVideo"
import { start } from "./commands/start"
import leeSolarNumerolog from "./commands/lee_solar_numerolog"
import leeSolarBroker from "./commands/lee_solar_broker"
import { subtitles } from "./commands/subtitles"

import { getUid, getUserModel } from "./core/supabase"
import createAinews from "./commands/ainews"
import { textToImageConversation } from "./commands/text_to_image"

import { textToVideoConversation } from "./commands/text_to_video"
import { imageToVideoConversation } from "./commands/image_to_video"
import { imageToPromptConversation } from "./commands/image_to_prompt"
import { trainFluxModelConversation } from "./commands/train_flux_model"
import { neuroPhotoConversation } from "./commands/neuro_photo"

import { handleAspectRatioChange, handleChangeSize } from "./handlers"

import bot from "./core/bot"
import { neuroQuest } from "./commands/neuro_quest"
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
import { incrementBalance, starCost } from "./helpers/telegramStars/telegramStars"
import { MyContextWithSession, SessionData } from "./utils/types"
import { emailConversation } from "./commands/emailConversation"
import { buyRobokassa } from "./commands/buy/buyRobokassa"
import {
  handleLevel0,
  handleLevel1,
  handleLevel10,
  handleLevel11,
  handleLevel2,
  handleLevel3,
  handleLevel4,
  handleLevel5,
  handleLevel6,
  handleLevel7,
  handleLevel8,
  handleLevel9,
  handleQuestRules,
} from "./commands/neuro_quest/handlers"
import { handleLevel12 } from "./commands/neuro_quest/handlers"
import { handleLevel13 } from "./commands/neuro_quest/handlers"
import { handleQuestComplete } from "./commands/neuro_quest/handlers"
import { handleModelCallback } from "./handlers/handleModelCallback"

bot.api.config.use(hydrateFiles(bot.token))

console.log(`Starting bot in ${process.env.NODE_ENV} mode`)

if (process.env.NODE_ENV === "development") {
  development(bot).catch(console.error)
} else {
  // В production только настраиваем webhook
  production(bot).catch(console.error)
}

function initial(): SessionData {
  return { melimi00: { videos: [], texts: [] }, text: "" }
}

bot.use(session({ initial, storage: freeStorage<SessionData>(bot.token) }))

bot.use(conversations<MyContextWithSession>())
bot.use(createConversation(imageSizeConversation))
bot.use(createConversation(textToSpeech))
bot.use(createConversation(generateImageConversation))
bot.use(createConversation(createTriggerReel))
bot.use(createConversation(captionForReels))
bot.use(createConversation(get100Conversation))
bot.use(createConversation(avatarConversation))
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
bot.use(createConversation(imageToVideoConversation))
bot.use(createConversation(imageToPromptConversation))
bot.use(createConversation(trainFluxModelConversation))
bot.use(createConversation(neuroPhotoConversation))
bot.use(createConversation(neuroQuest))
bot.use(createConversation(emailConversation))

bot.command("start", async (ctx) => {
  await start(ctx)
})

bot.use(customMiddleware)
bot.use(commands)

bot.on("pre_checkout_query", async (ctx) => {
  await ctx.answerPreCheckoutQuery(true)
  return
})

bot.on("message:successful_payment", async (ctx) => {
  if (!ctx.chat) {
    console.error("Update does not belong to a chat")
    return
  }
  const isRu = isRussian(ctx)
  console.log("ctx 646(succesful_payment)", ctx)

  // Рассчитайте количество звезд, которые пользователь получит
  const stars = ctx.message.successful_payment.total_amount

  if (!ctx.from?.id) throw new Error("No telegram id")
  const user_id = await getUid(ctx.from.id.toString())
  if (!user_id) throw new Error("No user_id")

  // Увеличиваем баланс пользователя на количество звезд
  await incrementBalance({ telegram_id: ctx.from.id.toString(), amount: stars })

  await ctx.reply(
    isRu
      ? `💫 Ваш баланс пополнен на ${stars} звезд! (Стоимость звезды: $${starCost})`
      : `💫 Your balance has been replenished by ${stars} stars! (Cost per star: $${starCost})`,
  )
  await ctx.api.sendMessage(
    "-1001978334539",
    `💫 Пользователь @${ctx.from.username} (ID: ${ctx.from.id}) пополнил баланс на ${stars} звезд! (Стоимость звезды: $${starCost})`,
  )
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
    const userData = await getUserData(ctx.from?.id.toString() || "")

    if (!userData) {
      await ctx.reply(ctx.from?.language_code === "ru" ? "Не удалось получить данные пользователя" : "Failed to get user data")
      return
    }

    const response = await answerAi(userModel, userData, ctx.message.text, ctx.from?.language_code || "en")

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

    switch (true) {
      case data === "change_size":
        await handleChangeSize({ ctx })
        break

      case data === "request_email":
        await ctx.conversation.enter("emailConversation")
        break

      case data.startsWith("size_"):
        await handleAspectRatioChange({ ctx })
        break

      case data.startsWith("top_up"):
        await buyRobokassa(ctx)
        break

      case data.startsWith("select_model_"):
        console.log("CHECK")
        const model = data.replace("select_model_", "")
        console.log("model", model)
        await setModel(ctx.from.id.toString(), model)
        break

      case data.startsWith("generate_improved_"):
        await handleGenerateImproved(ctx, data, isRu)
        break

      case data.startsWith("generate_"):
        console.log("generate_")
        await handleGenerate(ctx, data, isRu)
        break

      case data.startsWith("improve_"):
        console.log("improve_")
        await handleImprove(ctx, data, isRu)
        break

      case data.startsWith("generate_image_"):
        console.log("generate_image_", data)
        await handleGenerateImage(ctx, data, isRu)
        break

      case data === "retry":
        await handleRetry(ctx, isRu)
        break

      case data.startsWith("neuro_generate_"):
        await handleNeuroGenerate(ctx, data, isRu)
        break

      case data.startsWith("neuro_improve_"):
        await handleNeuroImprove(ctx, data, isRu)
        break

      case data.startsWith("neuro_generate_improved_"):
        await handleNeuroGenerateImproved(ctx, data, isRu)
        break

      case data === "neuro_cancel":
        await ctx.reply(isRu ? "❌ Генерация отменена" : "❌ Generation cancelled")
        break

      case data === "quest_rules":
        await handleQuestRules(ctx)
        break
      case data === "quest_start":
        await handleLevel0(ctx)
        break
      case data === "level_1":
        await handleLevel1(ctx)
        break
      case data === "level_2":
        await handleLevel2(ctx)
        break
      case data === "level_3":
        await handleLevel3(ctx)
        break
      case data === "level_4":
        await handleLevel4(ctx)
        break
      case data === "level_5":
        await handleLevel5(ctx)
        break
      case data === "level_6":
        await handleLevel6(ctx)
        break
      case data === "level_7":
        await handleLevel7(ctx)
        break
      case data === "level_8":
        await handleLevel8(ctx)
        break
      case data === "level_9":
        await handleLevel9(ctx)
        break
      case data === "level_10":
        await handleLevel10(ctx)
        break
      case data === "level_11":
        await handleLevel11(ctx)
        break
      case data === "level_12":
        await handleLevel12(ctx)
        break
      case data === "level_13":
        await handleLevel13(ctx)
        break
      case data === "quest_complete":
        await handleQuestComplete(ctx)
        break
      case data === "top_up_balance":
        await buyRobokassa(ctx)
        break
      case data.startsWith("generate_"):
        console.log("generate_")
        await handleGenerate(ctx, data, isRu)
        break
      case data.startsWith("neuro_video_"):
        await handleNeuroVideo(ctx, data, isRu)
        break

      default:
        console.error("Неизвестная команда:", data)
    }
  } catch (error) {
    console.error("Ошибка при обработке callback query:", error)
    try {
      await ctx.answerCallbackQuery()
    } catch (e) {
      console.error("Не удалось ответить на callback query:", e)
    }
    await ctx.reply(isRu ? "Произошла ошибка. Пожалуйста, попробуйте позже." : "An error occurred. Please try again later.")
  }
})

if (process.env.NODE_ENV === "production") {
  // Добавляем sequentialize middleware только в development
  // eslint-disable-next-line @typescript-eslint/no-floating-promises
  bot.api.setMyCommands([
    {
      command: "start",
      description: "👋 Start bot / Запустить бота",
    },
    {
      command: "avatar",
      description: "👤 Tell about yourself / Рассказать о себе",
    },
    {
      command: "train_flux_model",
      description: "🎨 Train FLUX model / Обучить модель FLUX",
    },
    {
      command: "neuro_photo",
      description: "🤖 Generate your photos / Сгенерировать ваши фото",
    },
    {
      command: "image_to_prompt",
      description: "🔍 Generate prompt from image / Сгенерировать промпт из изображения",
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
      command: "image_to_video",
      description: "🎥 Generate video from image / Сгенерировать видео из изображения",
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
      command: "select_model",
      description: "🤖 Select model / Выбрать модель",
    },
    {
      command: "b_roll",
      description: "🎥 Create B-roll / Создать B-roll",
    },
    {
      command: "lipsync",
      description: "🎥 Lipsync / Синхронизация губ",
    },
    {
      command: "subtitles",
      description: "🎥 Create subtitles / Создать субтитры",
    },
    {
      command: "invite",
      description: "👥 Invite a friend / Пригласить друга",
    },
    {
      command: "buy",
      description: "💰 Top up balance / Пополнить баланс",
    },
    {
      command: "balance",
      description: "💰 Balance / Баланс",
    },
    {
      command: "select_model",
      description: "🤖 Select model / Выбрать модель",
    },
    {
      command: "b_roll",
      description: "🎥 Create B-roll / Создать B-roll",
    },
    {
      command: "help",
      description: "🤖 Help / Помощь",
    },
  ])
}

bot.catch((err) => {
  const ctx = err.ctx
  const isRu = ctx.from?.language_code === "ru"
  console.error(`Ошибка при обработке обновления ${ctx.update.update_id}:`)
  console.error("error", err.error)
  ctx
    .reply(
      isRu
        ? "Извините, произошла ошибка при обработке вашего запроса. Пожалуйста, попробуйте позже."
        : "Sorry, an error occurred while processing your request. Please try again later.",
    )
    .catch((e) => {
      console.error("Ошибка отправки сообщения об ошибке поьзователю:", e)
    })
})

export { bot }
