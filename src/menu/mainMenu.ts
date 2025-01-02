import { Markup } from "telegraf"

export function mainMenu(isRu: boolean) {
  return Markup.keyboard([
    [Markup.button.text(isRu ? "🆔 Создать аватар" : "🆔 Create Avatar")],
    [Markup.button.text(isRu ? "🌟 Выбор модели ИИ" : "🌟 Select AI Model")],
    [Markup.button.text(isRu ? "🎨 Обучить FLUX" : "🎨 Train FLUX")],
    [Markup.button.text(isRu ? "📸 Нейрофото" : "📸 NeuroPhoto")],
    [Markup.button.text(isRu ? "🖼️ Изображение из текста" : "🖼️ Text to Image")],
    [Markup.button.text(isRu ? "🔍 Описание из изображения" : "🔍 Image to Prompt")],
    [Markup.button.text(isRu ? "🎥 Видео из текста" : "🎥 Text to Video")],
    [Markup.button.text(isRu ? "🎥 Изображение в видео" : "🎥 Image to Video")],
  ]).resize()
}
