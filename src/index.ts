require("dotenv").config()
import { Composer, session } from "grammy"
import { development, production } from "./utils/launch"
import { hydrateFiles } from "@grammyjs/files"
import { conversations, createConversation } from "@grammyjs/conversations"
import { customMiddleware } from "./helpers"
import { getUserData } from "./core/supabase/ai"
import { freeStorage } from "@grammyjs/storage-free"
import { answerAi } from "./core/openai/requests"
import { getUid, getUserModel } from "./core/supabase"
import { handleAspectRatioChange, handleChangeSize, handleModelCallback, handleNeuroActions } from "./handlers"
import bot from "./core/bot"
import { isRussian } from "./utils/language"
import { incrementBalance, starCost } from "./helpers/telegramStars/telegramStars"
import { MyContext, MyContextWithSession, SessionData } from "./utils/types"

import { handleLevelQuest } from "./handlers/handleLevelQuest"

import {
  neuro_broker,
  leela,
  clipmaker,
  balance,
  neuroQuest,
  buyRobokassa,
  start,
  imageSizeConversation,
  textToSpeech,
  generateImageConversation,
  createTriggerReel,
  captionForReels,
  get100Conversation,
  avatarConversation,
  voiceConversation,
  lipSyncConversation,
  createBackgroundVideo,
  leeSolarNumerolog,
  leeSolarBroker,
  subtitles,
  createAinews,
  textToImageConversation,
  textToVideoConversation,
  imageToVideoConversation,
  imageToPromptConversation,
  trainFluxModelConversation,
  neuroPhotoConversation,
  emailConversation,
  priceConversation,
  selectModel,
  inviterConversation,
} from "./commands"

bot.api.config.use(hydrateFiles(bot.token))

console.log(`Starting bot in ${process.env.NODE_ENV} mode`)

if (process.env.NODE_ENV === "development") {
  development(bot).catch(console.error)
} else {
  // В production только настраиваем webhook
  production(bot).catch(console.error)
}

const composer = new Composer<MyContext>()

function initial(): SessionData {
  return { melimi00: { videos: [], texts: [] }, text: "" }
}

bot.use(session({ initial, storage: freeStorage<SessionData>(bot.token) }))
bot.use(conversations<MyContextWithSession>())

bot.use(createConversation(start))
bot.use(createConversation(neuroQuest))
bot.use(createConversation(imageSizeConversation))
bot.use(createConversation(textToSpeech))
bot.use(createConversation(generateImageConversation))
bot.use(createConversation(createTriggerReel))
bot.use(createConversation(captionForReels))
bot.use(createConversation(priceConversation))
bot.use(createConversation(get100Conversation))
bot.use(createConversation(avatarConversation))
bot.use(createConversation(voiceConversation))
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
bot.use(createConversation(emailConversation))
bot.use(createConversation(selectModel))
bot.use(createConversation(inviterConversation))
bot.use(customMiddleware)

composer.command("invite", async (ctx) => {
  console.log("CASE: start")
  await ctx.conversation.enter("inviterConversation")
  return
})

composer.command("start", async (ctx) => {
  console.log("CASE: start")
  await ctx.conversation.enter("start")
})

composer.command("clipmaker", (ctx: MyContext) => clipmaker(ctx))

composer.command("leela", (ctx: MyContext) => leela(ctx))

composer.command("neuro_broker", (ctx: MyContext) => neuro_broker(ctx))

composer.command("caption_for_reels", async (ctx) => {
  await ctx.conversation.enter("captionForReels")
})

composer.command("neuro_quest", async (ctx) => {
  await ctx.conversation.enter("neuroQuest")
})

composer.command("price", async (ctx) => {
  await ctx.conversation.enter("priceConversation")
})

composer.command("lipsync", async (ctx) => {
  await ctx.conversation.enter("lipSyncConversation")
})

composer.command("b_roll", async (ctx) => {
  await ctx.conversation.enter("createBackgroundVideo")
})

composer.command("text_to_speech", async (ctx) => {
  await ctx.conversation.enter("textToSpeech")
})

composer.command("imagesize", async (ctx) => {
  await ctx.conversation.enter("imageSizeConversation")
})

composer.command("playom", async (ctx) => {
  await ctx.conversation.enter("generateImageConversation")
})

composer.command("buy", async (ctx) => {
  await ctx.conversation.enter("emailConversation")
})

composer.command("balance", balance)

composer.command("trigger_reel", async (ctx) => {
  await ctx.conversation.enter("createTriggerReel")
})

composer.command("anatol777", async (ctx) => {
  await ctx.conversation.enter("generateImageConversation")
})

composer.command("anfi_vesna", async (ctx) => {
  await ctx.conversation.enter("generateImageConversation")
})

composer.command("vega_condominium", async (ctx) => {
  await ctx.conversation.enter("generateImageConversation")
})

composer.command("dpbelarusx", async (ctx) => {
  await ctx.conversation.enter("generateImageConversation")
})

composer.command("neuro_coder", async (ctx) => {
  await ctx.conversation.enter("generateImageConversation")
})

composer.command("lee_solar_numerolog", async (ctx) => {
  await ctx.conversation.enter("leeSolarNumerolog")
})

composer.command("lee_solar_broker", async (ctx) => {
  await ctx.conversation.enter("leeSolarBroker")
})

composer.command("yellowshoess", async (ctx) => {
  await ctx.conversation.enter("generateImageConversation")
})

composer.command("gimba", async (ctx) => {
  await ctx.conversation.enter("generateImageConversation")
})

composer.command("karin", async (ctx) => {
  await ctx.conversation.enter("generateImageConversation")
})

composer.command("svedovaya", async (ctx) => {
  await ctx.conversation.enter("generateImageConversation")
})

composer.command("evi", async (ctx) => {
  await ctx.conversation.enter("generateImageConversation")
})

composer.command("evii", async (ctx) => {
  await ctx.conversation.enter("generateImageConversation")
})

composer.command("kata", async (ctx) => {
  await ctx.conversation.enter("generateImageConversation")
})

composer.command("neuro_broker_00", async (ctx) => {
  await ctx.conversation.enter("generateImageConversation")
})

composer.command("neuro_broker_01", async (ctx) => {
  await ctx.conversation.enter("generateImageConversation")
})

composer.command("kirill_korolev", async (ctx) => {
  await ctx.conversation.enter("generateImageConversation")
})

composer.command("zavarikin", async (ctx) => {
  await ctx.conversation.enter("generateImageConversation")
})

composer.command("lekomtsev", async (ctx) => {
  await ctx.conversation.enter("generateImageConversation")
})

composer.command("chuklinov", async (ctx) => {
  await ctx.conversation.enter("generateImageConversation")
})

composer.command("lee_solar", async (ctx) => {
  await ctx.conversation.enter("generateImageConversation")
})

composer.command("muse_nataly", async (ctx) => {
  await ctx.conversation.enter("generateImageConversation")
})

composer.command("soul", async (ctx) => {
  await ctx.conversation.enter("soulConversation")
})

composer.command("voice", async (ctx) => {
  await ctx.conversation.enter("voiceConversation")
})

composer.command("subtitles", async (ctx) => {
  await ctx.conversation.enter("subtitles")
})

composer.command("get100", async (ctx) => {
  await ctx.conversation.enter("get100Conversation")
})

composer.command("text_to_image", async (ctx) => {
  await ctx.conversation.enter("textToImageConversation")
})

composer.command("text_to_video", async (ctx) => {
  await ctx.conversation.enter("textToVideoConversation")
})

composer.command("caption_for_ai_news", async (ctx) => {
  await ctx.conversation.enter("createCaptionForNews")
})

composer.command("train_flux_model", async (ctx) => {
  await ctx.conversation.enter("trainFluxModelConversation")
})

composer.command("image_to_video", async (ctx) => {
  await ctx.conversation.enter("imageToVideoConversation")
})

composer.command("neuro_photo", async (ctx) => {
  await ctx.conversation.enter("neuroPhotoConversation")
})

composer.command("image_to_prompt", async (ctx) => {
  await ctx.conversation.enter("imageToPromptConversation")
})

composer.command("help", async (ctx) => {
  await ctx.conversation.enter("helpConversation")
})

composer.command("avatar", async (ctx) => {
  await ctx.conversation.enter("avatarConversation")
})

composer.command("text_to_image", async (ctx) => {
  await ctx.conversation.enter("textToImageConversation")
})

composer.command("image_to_prompt", async (ctx) => {
  await ctx.conversation.enter("imageToPromptConversation")
})

composer.command("select_model", async (ctx) => {
  await ctx.conversation.enter("selectModel")
})

bot.use(composer)

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
  if (ctx.message.text.startsWith("/")) {
    console.log("SKIP")
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

    if (!response) {
      await ctx.reply(
        ctx.from?.language_code === "ru"
          ? "Не удалось получить ответ от GPT. Пожалуйста, попробуйте позже."
          : "Failed to get response from GPT. Please try again later.",
      )
      return
    }

    await ctx.reply(response)
    return
  } catch (error) {
    console.error("Error in GPT response:", error)
    await ctx.reply(ctx.from?.language_code === "ru" ? "Произошла ошибка при обработке запроса" : "An error occurred while processing your request")
  }
})

bot.on("callback_query:data", async (ctx) => {
  console.log("CASE: callback_query:data")
  const isRu = isRussian(ctx)

  try {
    const data = ctx.callbackQuery.data
    await ctx.answerCallbackQuery().catch((e) => console.error("Ошибка при ответе на callback query:", e))

    switch (true) {
      case data === "change_size":
        console.log("CASE: change_size")
        await handleChangeSize({ ctx })
        break

      case data === "request_email":
        console.log("CASE: request_email")
        await ctx.conversation.enter("emailConversation")
        break

      case data.startsWith("size_"):
        console.log("CASE: size_")
        await handleAspectRatioChange({ ctx })
        break

      case data === "top_up_balance":
        console.log("CASE: top_up_balance")
        await buyRobokassa(ctx)
        break

      case data.startsWith("select_model_"):
        console.log("CASE: select_model_")
        const model = data.replace("select_model_", "")
        console.log("model", model)
        await handleModelCallback(model, ctx)
        break

      case data.startsWith("neuro_"):
        console.log("CASE: neuro_")
        await handleNeuroActions(ctx, data, isRu)
        break

      case data.startsWith("level_"):
        console.log("CASE: level_")
        await handleLevelQuest(ctx, data)
        break

      default:
        console.error("Неизвестная команда:", data)
    }
    return
  } catch (error) {
    console.error("Ошибка при обработке callback query:", error)
    try {
      await ctx.answerCallbackQuery()
      return
    } catch (e) {
      console.error("Не удалось ответить на callback query:", e)
      await ctx.reply(isRu ? "Произошла ошибка. Пожалуйста, попробуйте позже." : "An error occurred. Please try again later.")
      return
    }
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
