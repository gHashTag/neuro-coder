require("dotenv").config()

import { Bot } from "grammy"
import commands from "./commands"
import { development, production } from "./utils/launch"
import { MyContext } from "./utils/types"
import { hydrateFiles } from "@grammyjs/files"
import { conversations, createConversation } from "@grammyjs/conversations"
import { session, SessionFlavor } from "grammy"
import { imageSizeConversation } from "./commands/imagesize"
import { customMiddleware, generateImage, pulse, imageToVideo, upgradePrompt } from "./helpers"
import { generateImageConversation } from "./commands/generateImage"
import createTriggerReel from "./commands/trigger_reel"
import createCaptionForNews from "./commands/сaptionForNews"
import { get100AnfiVesnaConversation } from "./commands/get100"
import { soulConversation } from "./commands/soul"
import { voiceConversation } from "./commands/voice"
import { getGeneratedImages, getModel, getPrompt, incrementLimit, savePrompt, setModel } from "./core/supabase/ai"
import { InputMediaPhoto } from "grammy/types"
import { inviterConversation } from "./commands/inviter"
import { models } from "./commands/constants"
import { answerAi } from "./core/openai/requests"
import textToSpeech from "./commands/textToSpeech"
import { lipSyncConversation } from "./commands/lipSyncConversation"
import { createBackgroundVideo } from "./commands/createBackgroundVideo"
import { start } from "./commands/start"
import leeSolarNumerolog from "./commands/lee_solar_numerolog"
import leeSolarBroker from "./commands/lee_solar_broker"
import { subtitles } from "./commands/subtitles"
import { checkSubscriptionByTelegramId, isLimitAi, sendPaymentInfo } from "./core/supabase/payments"
import { getUid } from "./core/supabase"
import createAinews from "./commands/ainews"

interface SessionData {
  melimi00: {
    videos: string[]
    texts: string[]
  }
}

type MyContextWithSession = MyContext & SessionFlavor<SessionData>

const bot = new Bot<MyContextWithSession>(process.env.BOT_TOKEN || "")

bot.api.config.use(hydrateFiles(bot.token))

bot.use(session({ initial: () => ({}) }))

console.log(process.env.NODE_ENV, "process.env.NODE_ENV")
process.env.NODE_ENV === "development" ? development(bot) : production(bot)

if (process.env.NODE_ENV === "production") {
  bot.api.setMyCommands([
    {
      command: "start",
      description: "👋 Start for use bot / Начать использовать бота",
    },
    {
      command: "buy",
      description: "💰 Buy a subscription / Купить подписку",
    },
    {
      command: "model",
      description: "🤖 Change model / Изменить модель",
    },
    {
      command: "invite",
      description: "👥 Invite a friend / Пригласить друга",
    },
    {
      command: "imagesize",
      description: "🖼️ Change image size / Изменить размер генерируемого изображения",
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
    }
  ])
}

bot.use(conversations())
bot.use(createConversation(imageSizeConversation))
bot.use(createConversation(textToSpeech))
bot.use(createConversation(generateImageConversation))
bot.use(createConversation(createTriggerReel))
bot.use(createConversation(createCaptionForNews))
bot.use(createConversation(get100AnfiVesnaConversation))
bot.use(createConversation(soulConversation))
bot.use(createConversation(voiceConversation))
bot.use(createConversation(inviterConversation))
bot.use(createConversation(lipSyncConversation))
bot.use(createConversation(createBackgroundVideo))
bot.use(createConversation(leeSolarNumerolog))
bot.use(createConversation(leeSolarBroker))
bot.use(createConversation(subtitles))
bot.use(createConversation(createAinews))

bot.command("start", start)
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
  // await ctx.reply(lang ? "🤝 Спасибо за покупку!" : "🤝 Thank you for the purchase!")
  // const textToPost = lang
  //   ? `🪙 @${ctx.from.username} спасибо за покупку уровня ${levelForMessage}!`
  //   : `🪙 @${ctx.from.username} thank you for the purchase level ${levelForMessage}!`
  // await ctx.api.sendMessage(mediaChatId(lang), textToPost)
  return
})

bot.on("message:text", async (ctx) => {
  if (ctx.message.text.startsWith("/")) return
  if (ctx.message.text) {
    const isRu = ctx.from?.language_code === "ru"
    const model = await getModel(ctx.from?.id.toString() || "")
    const subscription = await checkSubscriptionByTelegramId(ctx.from?.id.toString() || "")
    if (subscription === "unsubscribed") {
      const isLimit = await isLimitAi(ctx.from.id.toString())
      if (isLimit) {
        await ctx.reply(
          isRu
            ? "У вас закончились бесплатные ежедневные запросы на использование нейросети 🧠. Подписка неактивна. \n\n/buy - выбери уровень и оформляй подписку, чтобы получить неограниченный доступ к нейросети 🧠"
            : "🔒 You are not subscribed to any level. The subscription is inactive. \n\n/buy - select a level and subscribe, to get unlimited access to the neural network 🧠",
        )
        return
      }
    }
    const answer = await answerAi(model, ctx.message.text, ctx.from?.language_code || "en")
    if (!answer) {
      await ctx.reply("❌ Извините, произошла ошибка при ответе на ваш запрос. Пожалуйста, попробуйте позже.")
      return
    }
    await ctx.reply(answer)
  }
})

bot.on("callback_query:data", async (ctx) => {
  const callbackData = ctx.callbackQuery.data
  const isRu = ctx.from?.language_code === "ru"
  if (callbackData.startsWith("buy")) {
    if (callbackData.endsWith("avatar")) {
      await ctx.replyWithInvoice(
        isRu ? "Цифровой аватар" : "Digital avatar",
        isRu
          ? "Представьте, у вас есть возможность создать уникальную цифровую копию себя! Я могу обучить ИИ на ваших фотографиях, чтобы вы в любой момент могли получать изображения с вашим лицом и телом в любом образе и окружении — от фантастических миров до модных фотосессий. Это отличная возможность для личного бренда или просто для развлечения!"
          : "Imagine you have the opportunity to create a unique digital copy of yourself! I can train the AI on your photos so that you can receive images with your face and body in any style and setting — from fantastic worlds to fashion photo sessions. This is a great opportunity for a personal brand or just for fun!",
        "avatar",
        "XTR",
        [{ label: "Цена", amount: 5645 }],
      )
      return
    }
    if (callbackData.endsWith("start")) {
      await ctx.replyWithInvoice(
        isRu ? "НейроСтарт" : "NeuroStart",
        isRu ? "Вы получите подписку уровня 'НейроСтарт'" : "You will receive a subscription to the 'NeuroStart' level",
        "start",
        "XTR",
        [{ label: "Цена", amount: 55 }],
      )
      return
    }
    if (callbackData.endsWith("base")) {
      await ctx.replyWithInvoice(
        isRu ? "НейроБаза" : "NeuroBase",
        isRu ? "Вы получите подписку уровня 'НейроБаза'" : "You will receive a subscription to the 'NeuroBase' level",
        "base",
        "XTR",
        [{ label: "Цена", amount: 565 }],
      )
      return
    }
    if (callbackData.endsWith("student")) {
      await ctx.replyWithInvoice(
        isRu ? "НейроУченик" : "NeuroStudent",
        isRu ? "Вы получите подписку уровня 'НейроУченик'" : "You will receive a subscription to the 'NeuroStudent' level",
        "student",
        "XTR",
        [{ label: "Цена", amount: 5655 }],
      )
      return
    }
    if (callbackData.endsWith("expert")) {
      await ctx.replyWithInvoice(
        isRu ? "НейроЭксперт" : "NeuroExpert",
        isRu ? "Вы получите подписку уровня 'НейроЭксперт'" : "You will receive a subscription to the 'NeuroExpert' level",
        "expert",
        "XTR",
        [{ label: "Цена", amount: 16955 }],
      )
      return
    }
  }
  if (callbackData.startsWith("generate_")) {
    try {
      const count = parseInt(callbackData.split("_")[1])
      const prompt_id = callbackData.split("_")[2]
      const info = await getGeneratedImages(ctx.from?.id.toString() || "")
      const { count: generatedCount, limit } = info

      if (generatedCount >= limit) {
        await ctx.reply(
          isRu
            ? "⚠️ У вас не осталось использований. Пожалуйста, оплатите генерацию изображений."
            : "⚠️ You have no more uses left. Please pay for image generation.",
        )
        return
      } else if (generatedCount + count > limit) {
        await ctx.reply(
          isRu
            ? `⚠️ У вас осталось ${limit - generatedCount} использований. Пожалуйста, оплатите генерацию изображений.`
            : `⚠️ You have ${limit - generatedCount} uses left. Please pay for image generation.`,
        )
        return
      }

      if (ctx.callbackQuery.message?.message_id) {
        await ctx.api.deleteMessage(ctx.chat?.id || "", ctx.callbackQuery.message?.message_id)
      }

      const prompt = await getPrompt(prompt_id)
      const message = await ctx.reply(isRu ? "⏳ Генерация изображений началась..." : "⏳ Image generation has started...")

      const images: InputMediaPhoto[] = []
      for (let i = 0; i < count; i++) {
        const { image } = await generateImage(prompt.prompt, prompt.model_type, ctx.from?.id.toString(), ctx, "")
        images.push({ type: "photo", media: image })
        await ctx.api.editMessageText(
          ctx.chat?.id || "",
          message.message_id,
          isRu ? `⏳ Сгенерировано изображений ${i + 1}/${count}...` : `⏳ Generated images ${i + 1}/${count}...`,
        )
        await pulse(ctx, image, prompt.prompt, `${prompt.model_type} (with callback)`)
      }

      await ctx.replyWithMediaGroup(images)
      await ctx.api.deleteMessage(ctx.chat?.id || "", message.message_id)
      await ctx.reply(isRu ? `🤔 Сгенерировать еще?` : `🤔 Generate more?`, {
        reply_markup: {
          inline_keyboard: [
            [
              { text: "1", callback_data: `generate_1_${prompt_id}` },
              { text: "2", callback_data: `generate_2_${prompt_id}` },
            ],
            [
              { text: "3", callback_data: `generate_3_${prompt_id}` },
              { text: "4", callback_data: `generate_4_${prompt_id}` },
            ],
            [{ text: isRu ? "⬆️ Улучшить промпт" : "⬆️ Improve prompt", callback_data: `improve_${prompt_id}` }],
            [{ text: isRu ? "🎥 Сгенерировать видео" : "🎥 Generate video", callback_data: `video_${prompt_id}` }],
          ],
        },
      })
    } catch (e) {
      console.error("Ошибка при генерации изображений:", e)
      await ctx.reply(
        isRu
          ? "❌ Извините, произошла ошибка при генерации изображений. Пожалуйста, попробуйте позже."
          : "❌ Sorry, an error occurred while generating images. Please try again later.",
      )
    }
  } else if (callbackData.startsWith("model_")) {
    const model = callbackData.split("_")[1]
    const message_id = ctx.callbackQuery.message?.message_id
    await setModel(ctx.from?.id.toString() || "", model)
    if (!message_id) return
    await ctx.api.deleteMessage(ctx.chat?.id || "", message_id)
    await ctx.reply(isRu ? "🧠 Модель успешно изменена!" : "🧠 Model successfully changed!")
  } else if (callbackData.startsWith("improve_")) {
    const prompt_id = callbackData.split("_")[callbackData.split("_").length - 1]
    const prompt = await getPrompt(prompt_id)
    console.log(prompt_id, "prompt_id")
    console.log(callbackData, "callbackData")

    if (callbackData.includes("toVideo")) {
      console.log(prompt.prompt, prompt.image_url, "prompt.prompt, prompt.image_url")
      await imageToVideo(prompt.image_url, prompt.prompt)
      return
    }
    if (callbackData.includes("accept")) {
      await ctx.editMessageText(isRu ? `🤔 Сгенерировать еще с новым промптом?` : `🤔 Generate more with new prompt?`, {
        reply_markup: {
          inline_keyboard: [
            [
              { text: "1", callback_data: `generate_1_${prompt_id}` },
              { text: "2", callback_data: `generate_2_${prompt_id}` },
            ],
            [
              { text: "3", callback_data: `generate_3_${prompt_id}` },
              { text: "4", callback_data: `generate_4_${prompt_id}` },
            ],
            [{ text: isRu ? "⬆️ Улучшить промпт" : "⬆️ Improve prompt", callback_data: `improve_${prompt_id}` }],
          ],
        },
      })
      return
    } else if (callbackData.includes("reject")) {
      await ctx.editMessageText(isRu ? `🤔 Сгенерировать еще с изначальным промптом?` : `🤔 Generate more with initial prompt?`, {
        reply_markup: {
          inline_keyboard: [
            [
              { text: "1", callback_data: `generate_1_${prompt_id}` },
              { text: "2", callback_data: `generate_2_${prompt_id}` },
            ],
            [
              { text: "3", callback_data: `generate_3_${prompt_id}` },
              { text: "4", callback_data: `generate_4_${prompt_id}` },
            ],
            [{ text: isRu ? "⬆️ Улучшить промпт" : "⬆️ Improve prompt", callback_data: `improve_${prompt_id}` }],
          ],
        },
      })
      return
    }
    const systemMessage = await ctx.reply(isRu ? "🧠 Улучшение промпта..." : "🧠 Prompt upgrading...")
    const upgradedPrompt = await upgradePrompt(`${models[prompt.model_type].word} ${prompt.prompt}`)

    if (!upgradedPrompt) {
      await ctx.reply(
        isRu
          ? "❌ Извините, произошла ошибка при улучшении промпта. Пожалуйста, попробуйте позже."
          : "❌ Sorry, an error occurred while upgrading the prompt. Please try again later.",
      )
      await ctx.api.deleteMessage(ctx.chat?.id || "", systemMessage.message_id)
      return
    }

    const upgradedPromptId = await savePrompt(upgradedPrompt, prompt.model_type)
    await ctx.api.deleteMessage(ctx.chat?.id || "", systemMessage.message_id)

    console.log(upgradedPrompt, "upgradedPrompt")
    await ctx.editMessageText(upgradedPrompt, {
      reply_markup: {
        inline_keyboard: [
          [
            { text: "✅", callback_data: `improve_accept_${upgradedPromptId}` },
            { text: "❌", callback_data: `improve_reject_${prompt_id}` },
          ],
          [{ text: "🔄", callback_data: `improve_${prompt_id}` }],
        ],
      },
    })
    return
  }
})

bot.catch((err) => {
  const ctx = err.ctx
  const isRu = ctx.from?.language_code === "ru"
  console.error(`Ошибка при обработке обновления ${ctx.update.update_id}:`)
  console.error(err.error)
  ctx
    .reply(
      isRu
        ? "Извините, произошла ошибка при обработке вашего запроса. Пожалуйста, попробуйте позже."
        : "Sorry, an error occurred while processing your request. Please try again later.",
    )
    .catch((e) => {
      console.error("Ошибка отправки сообщения об ошибке пользователю:", e)
    })
})

export { bot }
