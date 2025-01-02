import { MyContext, MyConversation } from "../../utils/types"
import {
  trainingCostInStars,
  promptGenerationCost,
  textToImageGenerationCost,
  imageNeuroGenerationCost,
  imageToVideoCost,
  textToSpeechCost,
  textToVideoCost,
  speechGenerationCost,
  starCost,
} from "../../helpers/telegramStars/telegramStars"

export async function priceCommand(conversation: MyConversation, ctx: MyContext) {
  const isRu = ctx.from?.language_code === "ru"
  const message = isRu
    ? `
    💰 **Стоимость всех услуг:**
    - 🧠 **Обучение модели**: ${trainingCostInStars.toFixed(2)} ⭐️
    - ✍️ **Генерация промпта**: ${promptGenerationCost.toFixed(2)} ⭐️
    - 🖼️ **Генерация изображения из текста**: ${textToImageGenerationCost.toFixed(2)} ⭐️
    - 🤖 **Нейро-генерация изображения**: ${imageNeuroGenerationCost.toFixed(2)} ⭐️
    - 🎥 **Текст в видео**: ${textToVideoCost.toFixed(2)} ⭐️
    - 🎤 **Голос**: ${speechGenerationCost.toFixed(2)} ⭐️
    - 🗣️ **Текст в речь**: ${textToSpeechCost.toFixed(2)} ⭐️
    - 📽️ **Изображение в видео**: ${imageToVideoCost.toFixed(2)} ⭐️

    💵 Стоимость звезды: ${starCost * 99} руб
    💵 Пополнение баланса /buy
    `
    : `
    💰 **Price of all services:**
    - 🧠 **Training model**: ${trainingCostInStars.toFixed(2)} ⭐️
    - ✍️ **Prompt generation**: ${promptGenerationCost.toFixed(2)} ⭐️
    - 🖼️ **Text to image generation**: ${textToImageGenerationCost.toFixed(2)} ⭐️
    - 🤖 **Neuro-image generation**: ${imageNeuroGenerationCost.toFixed(2)} ⭐️
    - 🎥 **Text to video**: ${textToVideoCost.toFixed(2)} ⭐️
    - 🎤 **Voice**: ${speechGenerationCost.toFixed(2)} ⭐️
    - 🗣️ **Text to speech**: ${textToSpeechCost.toFixed(2)} ⭐️
    - 📽️ **Image to video**: ${imageToVideoCost.toFixed(2)} ⭐️

    💵 Star cost: ${starCost} $
    💵 Top up balance /buy
    `

  await ctx.reply(message, { parse_mode: "MarkdownV2" })
}
