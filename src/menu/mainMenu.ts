import { Keyboard } from "grammy"

export function mainMenu(isRu: boolean) {
  return new Keyboard()
    .text(isRu ? "🆔 Создать аватар" : "🆔 Create Avatar")
    .text(isRu ? "🌟 Выбор модели ИИ" : "🌟 Select AI Model")
    .row()
    .text(isRu ? "🎨 Обучить FLUX" : "🎨 Train FLUX")
    .text(isRu ? "📸 Нейрофото" : "📸 NeuroPhoto")
    .row()
    .text(isRu ? "🖼️ Изображение из текста" : "🖼️ Text to Image")
    .text(isRu ? "🔍 Описание из изображения" : "🔍 Image to Prompt")
    .row()
    .text(isRu ? "🎥 Видео из текста" : "🎥 Text to Video")
    .text(isRu ? "🎥 Изображение в видео" : "🎥 Image to Video")
    .row()
    .text(isRu ? "🔊 Текст в речь" : "🔊 Text to Speech")
    .text(isRu ? "🎤 Голос для аватара" : "🎤 Voice for Avatar")
    .row()
    .text(isRu ? "👥 Пригласить друга" : "👥 Invite a friend")
    .text(isRu ? "❓ Помощь" : "❓ Help")
    .resized()
}
