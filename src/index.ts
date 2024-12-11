require("dotenv").config()

import { Bot } from "grammy"
import commands from "./commands"
import { development, production } from "./utils/launch"
import { MyContext } from "./utils/types"
import { hydrateFiles } from "@grammyjs/files"
import { conversations, createConversation } from "@grammyjs/conversations"
import { session, SessionFlavor } from "grammy"
import { imageSizeConversation } from "./commands/imagesize"
import { customMiddleware, generateImage, pulse, upgradePrompt } from "./helpers"
import { generateImageConversation } from "./commands/generateImage"
import createTriggerReel from "./commands/trigger_reel"
import createCaptionForNews from "./commands/сaptionForNews"
import { get100AnfiVesnaConversation } from "./commands/get100"
import { soulConversation } from "./commands/soul"
import { voiceConversation } from "./commands/voice"
import { getModel, getPrompt, incrementLimit, setModel } from "./core/supabase/ai"
import { InputFile } from "grammy/types"
import { inviterConversation } from "./commands/inviter"

import { answerAi } from "./core/openai/requests"
import textToSpeech from "./commands/textToSpeech"
import { lipSyncConversation } from "./commands/lipSyncConversation"
import { createBackgroundVideo } from "./commands/createBackgroundVideo"
import { start } from "./commands/start"
import leeSolarNumerolog from "./commands/lee_solar_numerolog"
import leeSolarBroker from "./commands/lee_solar_broker"
import { subtitles } from "./commands/subtitles"
import { checkSubscriptionByTelegramId, isLimitAi, sendPaymentInfo } from "./core/supabase/payments"
import { getUid, supabase } from "./core/supabase"
import createAinews from "./commands/ainews"
import { generateMoreImagesButtons } from "./helpers/buttonHandlers"
import { textToImageConversation } from "./commands/text_to_image"

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
    },
    {
      command: "text_to_image",
      description: "🎨 Generate image from text / Сгенерировать изображение из текста",
    },
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
bot.use(createConversation(textToImageConversation))

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
  console.log("Received message:", ctx.message?.text)
  if (ctx.message?.text?.startsWith("/")) {
    console.log("Skipping command message")
    return
  }

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
  const isRu = ctx.from?.language_code === "ru"

  try {
    const data = ctx.callbackQuery.data
    await ctx.answerCallbackQuery().catch((e) => console.error("Ошибка при ответе на callback query:", e))

    // Добавляем новый обработчик для выбора модели
    if (data.startsWith("select_model_")) {
      const model = data.replace("select_model_", "")
      await setModel(ctx.from.id.toString(), model)
      return // Выходим, так как дальнейший диалог продолжится в conversation
    }
    if (data.startsWith("generate_improved_")) {
      // Обработка улучшенного промпта
      const promptId = data.split("_")[2]
      const promptData = await getPrompt(promptId)
      if (!promptData) {
        await ctx.reply(isRu ? "Не удало��ь найти информацию о промпте" : "Could not find prompt information")
        await ctx.answerCallbackQuery()
        return
      }

      await ctx.reply(isRu ? "⏳ Начинаю улучшение промпта..." : "⏳ Starting prompt improvement...")

      // Улучшаем промпт
      const improvedPrompt = await upgradePrompt(promptData.prompt)
      if (!improvedPrompt) {
        await ctx.reply(isRu ? "Не удалось улучшить промпт" : "Failed to improve prompt")
        return
      }

      // Сохраняем улучшенный промпт в базу данных
      const { data: savedPrompt, error } = await supabase
        .from("prompts_history")
        .insert({
          prompt: improvedPrompt,
          model_type: promptData.model_type,
          telegram_id: ctx.from.id.toString(),
          improved_from: promptId,
        })
        .select()
        .single()

      if (error || !savedPrompt) {
        console.error("Ошибка при сохранении улучшенного промпта:", error)
        await ctx.reply(isRu ? "Ошибка при сохранении улучшенного промпта" : "Error saving improved prompt")
        return
      }

      // Показываем улучшенный промпт и спрашиваем подтверждение
      await ctx.reply(isRu ? `Улучшенный промпт:\n${improvedPrompt}\n\nСгенерировать изображение?` : `Improved prompt:\n${improvedPrompt}\n\nGenerate image?`, {
        reply_markup: {
          inline_keyboard: [
            [{ text: isRu ? "✅ Да" : "✅ Yes", callback_data: `generate_improved_${savedPrompt.prompt_id}` }],
            [{ text: isRu ? "❌ Нет" : "❌ No", callback_data: "cancel" }],
          ],
        },
      })
    } else if (data.startsWith("generate_")) {
      // Сразу отвечаем на callback query в начале
      await ctx.answerCallbackQuery().catch((e) => console.error("Ошибка при ответе на callback query:", e))

      const [_, count, promptId] = data.split("_")
      const promptData = await getPrompt(promptId)
      if (!promptData) {
        await ctx.reply(isRu ? "Не удалось найти информацию о промпте" : "Could not find prompt information")
        return
      }

      const generatingMessage = await ctx.reply(isRu ? "⏳ Генерация..." : "⏳ Generating...")

      try {
        const numImages = parseInt(count)
        for (let i = 0; i < numImages; i++) {
          const result = await generateImage(promptData.prompt, promptData.model_type, ctx.from.id.toString(), ctx)
          if (!result) {
            await ctx.reply(isRu ? "Ошибка при генерации изображения" : "Error generating image")
            continue
          }

          const photoToSend = Buffer.isBuffer(result.image) ? new InputFile(result.image) : result.image
          await ctx.replyWithPhoto(photoToSend)
          await ctx.reply(isRu ? `⏳ Сгенерировано ${i + 1} из ${numImages}...` : `⏳ Generated ${i + 1} of ${numImages}...`)

          const pulseImage = Buffer.isBuffer(result.image) ? `data:image/jpeg;base64,${result.image.toString("base64")}` : result.image
          await pulse(ctx, pulseImage, promptData.prompt, `/${promptData.model_type}`)
        }
      } catch (error) {
        console.error("Ошибка при генерации:", error)
        await ctx.reply(isRu ? "Произошла ошибка при генерации. Пожалуйста, попробуйте позже." : "An error occurred during generation. Please try again later.")
      } finally {
        generateMoreImagesButtons(ctx, promptId)
        await ctx.api
          .deleteMessage(ctx.chat?.id || "", generatingMessage.message_id)
          .catch((e) => console.error("Ошибка при удалении сообщения о генерации:", e))
      }
    } else if (data.startsWith("improve_")) {
      await ctx.answerCallbackQuery().catch((e) => console.error("Ошибка при ответе на callback query:", e))

      const promptId = data.split("_")[1]
      const promptData = await getPrompt(promptId)

      if (!promptData) {
        await ctx.reply(isRu ? "Не удалось найти информацию о промпте" : "Could not find prompt information")
        return
      }

      await ctx.reply(isRu ? "⏳ Начинаю улучшение промпта..." : "⏳ Starting prompt improvement...")

      try {
        const improvedPrompt = await upgradePrompt(promptData.prompt)
        if (!improvedPrompt) {
          await ctx.reply(isRu ? "Не удалось улучшить промпт" : "Failed to improve prompt")
          return
        }

        // Сохраняем улучшенный промпт
        const { data: savedPrompt, error } = await supabase
          .from("prompts_history")
          .insert({
            prompt: improvedPrompt,
            model_type: promptData.model_type,
            telegram_id: ctx.from.id.toString(),
            improved_from: promptId,
          })
          .select()
          .single()

        if (error || !savedPrompt) {
          console.error("Ошибка при сохранении улучшенного промпта:", error)
          await ctx.reply(isRu ? "Ошибка при сохранении улучшенного промпта" : "Error saving improved prompt")
          return
        }

        // Показываем улучшенный промпт и спрашиваем подтверждение
        await ctx.reply(
          isRu ? `Улучшенный промпт:\n${improvedPrompt}\n\nСгенерировать изображение?` : `Improved prompt:\n${improvedPrompt}\n\nGenerate image?`,
          {
            reply_markup: {
              inline_keyboard: [
                [{ text: isRu ? "✅ Да" : "✅ Yes", callback_data: `generate_1_${savedPrompt.prompt_id}` }],
                [{ text: isRu ? "❌ Нет" : "❌ No", callback_data: "cancel" }],
              ],
            },
          },
        )
      } catch (error) {
        console.error("Ошибка при улучшении промпта:", error)
        await ctx.reply(isRu ? "Произошла ошибка при улучшении промпта" : "An error occurred while improving the prompt")
      }
    }

    if (data === "retry") {
      await ctx.answerCallbackQuery()
      // Получаем последний промпт пользователя
      const { data: lastPrompt } = await supabase
        .from("prompts_history")
        .select("*")
        .eq("telegram_id", ctx.from.id)
        .order("created_at", { ascending: false })
        .limit(1)
        .single()

      if (!lastPrompt) {
        await ctx.reply("Не найден предыдущий промпт для повторной генерации")
        return
      }

      // Генерируем новое изображение с тем же промптом
      const result = await generateImage(lastPrompt.prompt, lastPrompt.model_type, ctx.from.id.toString(), ctx)
      console.log("result4", result)
      if (!result) {
        throw new Error("Не удалось сгенерировать изображение")
      }

      // Отправляем новое изображение
      if (Buffer.isBuffer(result.image)) {
        await ctx.replyWithPhoto(new InputFile(result.image))
      } else {
        await ctx.replyWithPhoto(result.image)
      }

      // Отправляем в pulse
      const pulseImage = Buffer.isBuffer(result.image) ? `data:image/jpeg;base64,${result.image.toString("base64")}` : result.image

      await pulse(ctx, pulseImage, lastPrompt.prompt, `/${lastPrompt.model_type}`)

      // Показываем те же кнопки снова
      await ctx.reply("Что дальше?", {
        reply_markup: {
          inline_keyboard: [
            [{ text: "🔄 Повторить генерацию", callback_data: "retry" }],
            [{ text: "⬆️ Улучшить промпт", callback_data: "improve" }],
            [{ text: "🎥 Сгенерировать видео", callback_data: "video" }],
          ],
        },
      })
    }
  } catch (error) {
    console.error("Ошибка при обработке callback query:", error)
    try {
      await ctx.answerCallbackQuery()
    } catch (e) {
      console.error("Не удалось ответить на callback query:", e)
    }
    await ctx.reply(isRu ? "Произошла ошибка. Пожалуйста, попробуйте позже." : "An error occurred. Please try again later.")
  } finally {
    const loadingMessage = await ctx.reply(isRu ? "⏳ Начинаю генерацию изображений..." : "⏳ Starting image generation...")

    // Удаляем сообщение о загрузке в любом случае
    await ctx.api.deleteMessage(ctx.chat?.id || "", loadingMessage.message_id).catch(console.error) // игнорируем ошибку если сообщение уже удалено
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
        ? "Извините, поизошла ошибка при обработке вашего запроса. Пожалуйста, попробуйте позже."
        : "Sorry, an error occurred while processing your request. Please try again later.",
    )
    .catch((e) => {
      console.error("Ошибка отправки сообщения об ошибке пользователю:", e)
    })
})

// Регистрируем команду
bot.command("text_to_image", async (ctx) => {
  await ctx.conversation.enter("textToImageConversation")
})

export { bot }
