require("dotenv").config()

import { InlineKeyboard } from "grammy"
import commands from "./commands"
import { development, production } from "./utils/launch"
import { hydrateFiles } from "@grammyjs/files"
import { conversations, createConversation } from "@grammyjs/conversations"
import { session } from "grammy"
import { imageSizeConversation } from "./commands/imagesize"
import { customMiddleware, pulse, upgradePrompt } from "./helpers"
import { generateImageConversation } from "./commands/generateImage"
import createTriggerReel from "./commands/trigger_reel"
import createCaptionForNews from "./commands/сaptionForNews"
import { get100AnfiVesnaConversation } from "./commands/get100"
import { soulConversation } from "./commands/soul"
import { voiceConversation } from "./commands/voice"
import { getPrompt, incrementLimit, setModel, setAspectRatio } from "./core/supabase/ai"
import { InputFile } from "grammy/types"
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
import { getUid, supabase, getUserModel } from "./core/supabase"
import createAinews from "./commands/ainews"
import { buttonHandlers } from "./helpers/buttonHandlers"
import { textToImageConversation } from "./commands/text_to_image"
import { generateImage } from "./helpers/generateImage"
import { generateNeuroImage } from "./helpers/generateNeuroImage"
import { textToVideoConversation } from "./commands/text_to_video"
import imageToVideo from "./commands/image_to_video"
import { imageToPromptConversation } from "./commands/image_to_prompt"
import { trainFluxModelConversation } from "./commands/train_flux_model"
import { neuroPhotoConversation } from "./commands/neuro_photo"
// import { sequentialize } from "@grammyjs/runner"
import neuroQuest from "./commands/neuro_quest"
import { buttonNeuroHandlers } from "./helpers/buttonNeuroHandlers"

import bot from "./core/bot"

bot.api.config.use(hydrateFiles(bot.token))

bot.use(session({ initial: () => ({}) }))

console.log(process.env.NODE_ENV, "process.env.NODE_ENV")
process.env.NODE_ENV === "development" ? development(bot) : production(bot)

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
      description: "Invite a friend / Пригласить друга",
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
bot.use(createConversation(get100AnfiVesnaConversation))
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
  const isRu = ctx.from?.language_code === "ru"

  try {
    const data = ctx.callbackQuery.data
    await ctx.answerCallbackQuery().catch((e) => console.error("Ошибка при ответе на callback query:", e))

    if (data === "change_size") {
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
      return
    }

    if (data.startsWith("size_")) {
      const size = data.replace("size_", "")
      const userId = ctx.from?.id.toString()

      if (!userId) {
        await ctx.reply(isRu ? "❌ Ошибка идентификации пользователя" : "❌ User identification error")
        return
      }

      await setAspectRatio(userId, size)
      await ctx.reply(
        isRu
          ? `✅ Размер изображения изменен на ${size}.\nНажмите команду /neuro_photo чтобы сгенерировать изображение`
          : `✅ Image size changed to ${size}. \nClick the command /neuro_photo to generate an image  `,
      )
      return
    }

    if (data.startsWith("buy")) {
      if (data.endsWith("avatar")) {
        await ctx.replyWithInvoice(
          isRu ? "Цифровой аватар" : "Digital avatar",
          isRu
            ? "Представьте, у вас есть возможность создать уникальную цифовую копию себя! Я могу обучить ИИ на ваших фотографиях, чтобы вы в любой момент могли получать изображения с вашим лцом и телом в любом образе и окружении — от фантастических миров до модных фотосессий. Это отличная возможность для личного бренда или просто для развлечения!"
            : "Imagine you have the opportunity to create a unique digital copy of yourself! I can train the AI on your photos so that you can receive images with your face and body in any style and setting — from fantastic worlds to fashion photo sessions. This is a great opportunity for a personal brand or just for fun!",
          "avatar",
          "XTR",
          [{ label: "Цена", amount: 5645 }],
        )
        return
      }
      if (data.endsWith("start")) {
        await ctx.replyWithInvoice(
          isRu ? "НейроСтарт" : "NeuroStart",
          isRu ? "Вы получите подписку уровня 'НейроСтарт'" : "You will receive a subscription to the 'NeuroStart' level",
          "start",
          "XTR",
          [{ label: "Цена", amount: 55 }],
        )
        return
      }
      if (data.endsWith("base")) {
        await ctx.replyWithInvoice(
          isRu ? "НейроБаза" : "NeuroBase",
          isRu ? "Вы получите подписку уровня 'НейроБаза'" : "You will receive a subscription to the 'NeuroBase' level",
          "base",
          "XTR",
          [{ label: "Цена", amount: 565 }],
        )
        return
      }
      if (data.endsWith("student")) {
        await ctx.replyWithInvoice(
          isRu ? "НейроУченик" : "NeuroStudent",
          isRu ? "Вы получите подписку уровня 'НейроУченик'" : "You will receive a subscription to the 'NeuroStudent' level",
          "student",
          "XTR",
          [{ label: "Цена", amount: 5655 }],
        )
        return
      }
      if (data.endsWith("expert")) {
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

    // Добавляем новый обработчик для выбора модели
    if (data.startsWith("select_model_")) {
      const model = data.replace("select_model_", "")
      await setModel(ctx.from.id.toString(), model)
      return
    }
    if (data.startsWith("generate_improved_")) {
      console.log("Starting generate_improved_ handler")
      const promptId = data.split("_")[2]
      console.log("Prompt ID from callback:", promptId)

      const promptData = await getPrompt(promptId)
      console.log("Prompt data:", promptData)

      if (!promptData) {
        console.log("No prompt data found")
        await ctx.reply(isRu ? "Не удалось найти информацию о промпте" : "Could not find prompt information")
        await ctx.answerCallbackQuery()
        return
      }

      await ctx.reply(isRu ? "⏳ Начинаю улучшение промпта..." : "⏳ Starting prompt improvement...")

      try {
        console.log("Generating neuro image...")
        const result = await generateNeuroImage(promptData.prompt, promptData.model_type, ctx.from.id.toString())
        console.log("Generation result with prompt_id:", result?.prompt_id)

        if (!result) {
          throw new Error("Failed to generate neuro image")
        }

        const photoToSend = Buffer.isBuffer(result.image) ? new InputFile(result.image) : result.image
        console.log("Sending photo...")
        await ctx.replyWithPhoto(photoToSend)
        console.log("Photo sent")

        console.log("Adding neuro buttons with prompt_id:", result.prompt_id)
        await buttonNeuroHandlers(ctx, result.prompt_id?.toString() || "")
        console.log("Neuro buttons added")
      } catch (error) {
        console.error("Error in generate_improved_ handler:", error)
        await ctx.reply(
          isRu
            ? "Произошла ошибка при генерации улучшенного изображения. Пожалуйста, попробуйте позже."
            : "An error occurred while generating improved image. Please try again later.",
        )
      }
    } else if (data.startsWith("generate_")) {
      // Сразу отвечаем на callback query  начале
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
          const result = await generateImage(promptData.prompt, promptData.model_type, ctx.from.id.toString())
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
        buttonHandlers(ctx, promptId)
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
        console.error("Ошибка при улучшении прмпта:", error)
        await ctx.reply(isRu ? "Произошла ошибка при улучшении промпта" : "An error occurred while improving the prompt")
      }
    } else if (data.startsWith("generate_image_")) {
      const prompt = data.replace("generate_image_", "")

      // Отправляем сообщ��ние о начале генерации
      const generatingMsg = await ctx.reply(isRu ? "⏳ Генерирую изображение..." : "⏳ Generating image...")

      try {
        // Используем существующую функцию generateImage
        const result = await generateImage(prompt, "sdxl", ctx.from.id.toString())

        if (!result) {
          throw new Error("Failed to generate image")
        }

        // Отправляем сгенерированное изображение
        const photoToSend = Buffer.isBuffer(result.image) ? new InputFile(result.image) : result.image

        await ctx.replyWithPhoto(photoToSend)

        // Отправляем в pulse
        const pulseImage = Buffer.isBuffer(result.image) ? `data:image/jpeg;base64,${result.image.toString("base64")}` : result.image

        await pulse(ctx, pulseImage, prompt, "/sdxl")

        // Показываем кнопки для дальнейших действий
        await ctx.reply(isRu ? "Что дальше?" : "What's next?", {
          reply_markup: {
            inline_keyboard: [
              [{ text: isRu ? "🔄 Повторить генерацию" : "🔄 Regenerate", callback_data: "retry" }],
              [{ text: isRu ? "⬆️ Улучшить промпт" : "⬆️ Improve prompt", callback_data: "improve" }],
              [{ text: isRu ? "🎥 Сгенерировать видео" : "🎥 Generate video", callback_data: "video" }],
            ],
          },
        })
      } catch (error) {
        console.error("Error generating image:", error)
        await ctx.reply(
          isRu
            ? "❌ Произошла ошибка при генерации изображения. Пожалуйста, попробуйте позже."
            : "❌ An error occurred while generating the image. Please try again later.",
        )
      } finally {
        // Удаляем сообщение о генерации
        await ctx.api.deleteMessage(ctx.chat?.id || "", generatingMsg.message_id).catch(console.error)
      }
      return
    }

    if (data === "retry") {
      await ctx.answerCallbackQuery()
      // Получаем последний промпт пользователя
      const { data: lastPrompt } = await supabase
        .from("prompts_history")
        .select("*")
        .eq("telegram_id", ctx.from)
        .order("created_at", { ascending: false })
        .limit(1)
        .single()

      if (!lastPrompt) {
        await ctx.reply("Не найден предыдущий промпт для повторной генерации")
        return
      }

      // Генер��руем н��вое изображение с тем же промптом
      const result = await generateImage(lastPrompt.prompt, lastPrompt.model_type, ctx.from.id.toString())
      console.log("result4", result)
      if (!result) {
        throw new Error("Не удалось сенерирвать изображение")
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

    // Добав��яем обр��ботчики для нейро-кнопок
    if (data.startsWith("neuro_generate_")) {
      console.log("Received neuro_generate_ callback with data:", data)

      const parts = data.split("_")
      console.log("Split parts:", parts)

      const count = parts[2]
      const promptId = parts[3] // UUID будет последней частью
      console.log("Extracted count and promptId:", { count, promptId })

      let generatingMessage: { message_id: number } | null = null

      try {
        const promptData = await getPrompt(promptId)
        console.log("Retrieved prompt data:", promptData)

        if (!promptData) {
          console.log("No prompt data found for ID:", promptId)
          await ctx.reply(isRu ? "Не удалось найти информацию о промпте" : "Could not find prompt information")
          return
        }

        generatingMessage = await ctx.reply(isRu ? "⏳ Генерация..." : "⏳ Generating...")

        try {
          const numImages = parseInt(count)
          console.log("Generating", numImages, "images")

          for (let i = 0; i < numImages; i++) {
            console.log(`Starting generation of image ${i + 1}/${numImages}`)
            const result = await generateNeuroImage(promptData.prompt, promptData.model_type, ctx.from.id.toString())

            if (!result) {
              console.error("Generation returned null result")
              throw new Error("Failed to generate neuro image")
            }

            console.log("Generation successful, sending photo...")
            const photoToSend = Buffer.isBuffer(result.image) ? new InputFile(result.image) : result.image
            await ctx.replyWithPhoto(photoToSend)

            if (numImages > 1) {
              await ctx.reply(isRu ? `⏳ Сгенерировано ${i + 1} из ${numImages}...` : `⏳ Generated ${i + 1} of ${numImages}...`)
            }
          }

          console.log("All images generated, showing buttons with promptId:", promptId)
          await buttonNeuroHandlers(ctx, promptId)
        } catch (error) {
          console.error("Error in generation loop:", error)
          throw error
        }
      } catch (error) {
        console.error("Error in neuro_generate_ handler:", error)
        await ctx.reply(
          isRu
            ? "Произошла ошибка при генерации изображения. Пожалуйста, попробуйте озже."
            : "An error occurred while generating the image. Please try again later.",
        )
      } finally {
        if (generatingMessage) {
          await ctx.api.deleteMessage(ctx.chat?.id || "", generatingMessage.message_id).catch((e) => console.error("Error deleting message:", e))
        }
      }
    } else if (data.startsWith("neuro_improve_")) {
      console.log("Starting neuro_improve handler")
      const promptId = data.replace("neuro_improve_", "")
      console.log("Prompt ID:", promptId)

      const promptData = await getPrompt(promptId)
      console.log("Original prompt data:", promptData)

      if (!promptData) {
        await ctx.reply(isRu ? "Не удалось найти информацию о промпте" : "Could not find prompt information")
        return
      }

      await ctx.reply(isRu ? "⏳ Начинаю улучшение промпта..." : "⏳ Starting prompt improvement...")

      try {
        const improvedPrompt = await upgradePrompt(promptData.prompt)
        console.log("Improved prompt:", improvedPrompt)

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
          throw new Error("Failed to save improved prompt")
        }

        // Показываем улучшенный промпт и спрашиваем подтверждение
        await ctx.reply(
          isRu ? `Улучшенный промпт:\n${improvedPrompt}\n\nСгенерировать изображение?` : `Improved prompt:\n${improvedPrompt}\n\nGenerate image?`,
          {
            reply_markup: new InlineKeyboard()
              .text(isRu ? "✅ Да" : "✅ Yes", `neuro_generate_improved_${savedPrompt.prompt_id}`)
              .row()
              .text(isRu ? "❌ Нет" : "❌ No", "neuro_cancel"),
          },
        )
      } catch (error) {
        console.error("Error improving neuro prompt:", error)
        await ctx.reply(
          isRu
            ? "Произошла ошибка при улучшении промпта. Пожалуйста, попробуйте позже."
            : "An error occurred while improving the prompt. Please try again later.",
        )
      }
    } else if (data.startsWith("neuro_generate_improved_")) {
      console.log("Starting generation of improved prompt")
      const promptId = data.replace("neuro_generate_improved_", "")
      console.log("Generating with prompt ID:", promptId)

      let generatingMessage: { message_id: number } | null = null

      try {
        const promptData = await getPrompt(promptId)
        console.log("Retrieved prompt data:", promptData)

        if (!promptData) {
          await ctx.reply(isRu ? "Не удалось найти информацию о промпте" : "Could not find prompt information")
          return
        }

        generatingMessage = await ctx.reply(isRu ? "⏳ Генерация..." : "⏳ Generating...")

        // Генерируем одно изображение с улучшенным промптом
        const result = await generateNeuroImage(promptData.prompt, promptData.model_type, ctx.from.id.toString())
        console.log("Generation result:", result)

        if (!result) {
          throw new Error("Failed to generate neuro image")
        }

        const photoToSend = Buffer.isBuffer(result.image) ? new InputFile(result.image) : result.image
        console.log("Sending photo...")
        await ctx.replyWithPhoto(photoToSend)
        console.log("Photo sent")

        // ��оказываем кнопки для дальнейших действий
        console.log("Adding neuro buttons for prompt_id:", result.prompt_id)
        await buttonNeuroHandlers(ctx, result.prompt_id?.toString() || "")
      } catch (error) {
        console.error("Error generating improved image:", error)
        await ctx.reply(
          isRu
            ? "Произошла ошибка при генерации изображения. Пожалуйста, попробуйте позже."
            : "An error occurred while generating the image. Please try again later.",
        )
      } finally {
        if (generatingMessage) {
          await ctx.api.deleteMessage(ctx.chat?.id || "", generatingMessage.message_id).catch((e) => console.error("Error deleting message:", e))
        }
      }
    } else if (data === "neuro_cancel") {
      await ctx.reply(isRu ? "❌ Генерация отменена" : "❌ Generation cancelled")
    } else if (data.startsWith("neuro_video_")) {
      // Обработка создания видео из нейро-изображения
      const promptId = data.replace("neuro_video_", "")
      const promptData = await getPrompt(promptId)

      if (!promptData) {
        await ctx.reply(isRu ? "Не удалось найти информацию о промпте" : "Could not find prompt information")
        return
      }

      try {
        await ctx.conversation.enter("imageToVideo")
      } catch (error) {
        console.error("Error starting video generation:", error)
        await ctx.reply(
          isRu
            ? "Произошла ошибка при запуске генерации видео. Пожалуйста, попробуйте позже."
            : "An error occurred while starting video generation. Please try again later.",
        )
      }
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

bot.catch((err) => {
  const ctx = err.ctx
  const isRu = ctx.from?.language_code === "ru"
  console.error(`Ошибка при обработке обновления ${ctx.update.update_id}:`)
  console.error("error", err.error)
  ctx
    .reply(
      isRu
        ? "Извините, поизшла ошбка ри обработке вашго запроса. Пожалуйста, попробуйте позже."
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

// Обработчик кнопки изменения размера
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
