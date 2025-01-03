import { MyContext } from "../../interfaces"
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
} from "../../helpers/telegramStars"

export async function priceCommand(ctx: MyContext) {
  console.log("CASE: priceCommand")
  const isRu = ctx.from?.language_code === "ru"
  const message = isRu
    ? `
    <b>💰 Стоимость всех услуг:</b>
    - 🧠 Обучение модели: ${trainingCostInStars.toFixed(2)} ⭐️
    - ✍️ Генерация промпта: ${promptGenerationCost.toFixed(2)} ⭐️
    - 🖼️ Генерация изображения из текста: ${textToImageGenerationCost.toFixed(2)} ⭐️
    - 🤖 Нейро-генерация изображения: ${imageNeuroGenerationCost.toFixed(2)} ⭐️
    - 🎥 Текст в видео: ${textToVideoCost.toFixed(2)} ⭐️
    - 🎤 Голос: ${speechGenerationCost.toFixed(2)} ⭐️
    - 🗣️ Текст в речь: ${textToSpeechCost.toFixed(2)} ⭐️
    - 📽️ Изображение в видео: ${imageToVideoCost.toFixed(2)} ⭐️

    <b>💵 Стоимость звезды:</b> ${starCost * 99} руб
    💵 Пополнение баланса /buy
    `
    : `
    <b>💰 Price of all services:</b>
    - 🧠 Training model: ${trainingCostInStars.toFixed(2)} ⭐️
    - ✍️ Prompt generation: ${promptGenerationCost.toFixed(2)} ⭐️
    - 🖼️ Text to image generation: ${textToImageGenerationCost.toFixed(2)} ⭐️
    - 🤖 Neuro-image generation: ${imageNeuroGenerationCost.toFixed(2)} ⭐️
    - 🎥 Text to video: ${textToVideoCost.toFixed(2)} ⭐️
    - 🎤 Voice: ${speechGenerationCost.toFixed(2)} ⭐️
    - 🗣️ Text to speech: ${textToSpeechCost.toFixed(2)} ⭐️
    - 📽️ Image to video: ${imageToVideoCost.toFixed(2)} ⭐️

    <b>💵 Star cost:</b> ${starCost} $
    💵 Top up balance /buy
    `

  await ctx.reply(message, { parse_mode: "HTML" })
}
