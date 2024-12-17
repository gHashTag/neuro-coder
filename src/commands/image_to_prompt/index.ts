import { Conversation, ConversationFlavor } from "@grammyjs/conversations"
import axios from "axios"
import { MyContext } from "../../utils/types"

if (!process.env.HUGGINGFACE_TOKEN) {
  throw new Error("HUGGINGFACE_TOKEN is not set")
}

type MyConversation = Conversation<MyContext & ConversationFlavor>

function escapeMarkdown(text: string): string {
  // Экранируем специальные символы Markdown
  return text.replace(/[_*[\]()~`>#+=|{}.!-]/g, "\\$&")
}

async function getJoyCaption(imageUrl: string): Promise<string> {
  try {
    // Инициируем запрос
    const initResponse = await axios.post(
      "https://fancyfeast-joy-caption-alpha-two.hf.space/call/stream_chat",
      {
        data: [
          { path: imageUrl },
          "Descriptive", // Тип описания: подробное
          "long", // Длина: длинное описание
          ["Describe the image in detail, including colors, style, mood, and composition."], // Инструкции
          "", // Не используем name_input
          "", // Не используем custom_prompt
        ],
      },
      {
        headers: {
          "Content-Type": "application/json",
        },
        maxContentLength: Infinity,
        maxBodyLength: Infinity,
      },
    )

    console.log("Initial response:", initResponse.data)

    // Получаем EVENT_ID из ответа
    const eventId = initResponse.data?.event_id || initResponse.data

    if (!eventId) {
      throw new Error("No event ID in response")
    }

    // Получаем результат
    const resultResponse = await axios.get(`https://fancyfeast-joy-caption-alpha-two.hf.space/call/stream_chat/${eventId}`, {
      maxContentLength: Infinity,
      maxBodyLength: Infinity,
    })

    console.log("Result response:", resultResponse.data)

    // Парсим результат из event stream
    const responseText = resultResponse.data as string
    const lines = responseText.split("\n")

    for (const line of lines) {
      if (line.startsWith("data: ")) {
        try {
          const data = JSON.parse(line.slice(6))
          if (Array.isArray(data) && data.length > 1) {
            return data[1] // Второй элемент содержит описание
          }
        } catch (e) {
          console.error("Error parsing JSON from line:", line, e)
        }
      }
    }

    throw new Error("No valid caption found in response")
  } catch (error) {
    console.error("Joy Caption API error:", error)
    throw error
  }
}

export const imageToPromptConversation = async (conversation: MyConversation, ctx: MyContext) => {
  const isRu = ctx.from?.language_code === "ru"

  console.log("Starting image_to_prompt conversation")

  try {
    // Запрашиваем изображение
    await ctx.reply(isRu ? "Пожалуйста, отправьте изображение для генерации промпта" : "Please send an image to generate a prompt")

    // Ждем изображение от пользователя и проверяем его тип
    console.log("Waiting for photo message...")
    const imageMsg = await conversation.waitFor("message:photo")
    console.log("Received photo message:", imageMsg.message?.photo)

    if (!imageMsg.message?.photo) {
      console.log("No photo in message")
      await ctx.reply(isRu ? "Пожалуйста, отправьте изображение" : "Please send an image")
      return
    }

    // Отправляем сообщение о начале обработки
    const processingMsg = await ctx.reply(isRu ? "⏳ Генерирую промпт..." : "⏳ Generating prompt...")

    try {
      // Получаем файл изображения
      const photoSize = imageMsg.message.photo[imageMsg.message.photo.length - 1]
      console.log("Getting file info for photo:", photoSize.file_id)
      const file = await ctx.api.getFile(photoSize.file_id)
      const imageUrl = `https://api.telegram.org/file/bot${process.env.BOT_TOKEN}/${file.file_path}`

      // Получаем описание изображения
      console.log("Getting image caption...")
      const prompt = await getJoyCaption(imageUrl)
      console.log("Received caption:", prompt)

      // Удаляем сообщение о обработке
      await ctx.api.deleteMessage(ctx.chat?.id || "", processingMsg.message_id)

      // Отправляем результат
      const escapedPrompt = escapeMarkdown(prompt)
      await ctx.reply(`\`\`\`\n${escapedPrompt}\n\`\`\``, { parse_mode: "MarkdownV2" })
    } catch (error) {
      if (error instanceof Error && error.message?.includes("timeout")) {
        await ctx.reply(
          isRu
            ? "⌛ Извините, обработка заняла слишком много времени. Пожалуйста, попробуйте еще раз."
            : "⌛ Sorry, processing took too long. Please try again.",
        )
      } else {
        console.error("Error processing image:", error)
        await ctx.reply(
          isRu
            ? "❌ Произошла ошибка при обработке изображения. Пожалуйста, попробуйте позже."
            : "❌ An error occurred while processing the image. Please try again later.",
        )
      }
    }
  } catch (error) {
    console.error("Error in image_to_prompt conversation:", error)
    await ctx.reply(isRu ? "❌ Произошла ошибка. Пожалуйста, попробуйте еще раз или позже." : "❌ An error occurred. Please try again or later.")
  }
}
