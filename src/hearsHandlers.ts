import { Composer } from "telegraf"
import { MyContext } from "./interfaces"
import { selectModelCommand } from "./commands/selectModelCommand"
import { imageModelMenu } from "./menu/imageModelMenu"
import { handleCallbackQuery } from "./handlers/handleCallbackQuery"
import { topUpBalanceCommand } from "./commands/topUpBalanceCommand"
import { balanceCommand } from "./commands/balanceCommand"
import { menuCommand } from "./commands/menuCommand"
import { generateImage } from "services/generateReplicateImage"
import { isRussian } from "utils/language"

const myComposer = new Composer<MyContext>()

myComposer.hears(["🆔 Создать аватар", "🆔 Create Avatar"], async (ctx) => {
  console.log("CASE: Создать аватар")
  await ctx.scene.enter("avatarWizard")
})

myComposer.hears(["🌟 Выбор модели ИИ", "🌟 Select AI Model"], async (ctx) => {
  console.log("CASE: Выбор модели ИИ")
  await selectModelCommand(ctx)
})

myComposer.hears(["🎨 Обучить FLUX", "🎨 Train FLUX"], async (ctx) => {
  console.log("CASE: Обучить FLUX")
  await ctx.scene.enter("trainFluxModelCommand")
})

myComposer.hears(["📸 Нейрофото", "📸 NeuroPhoto"], async (ctx) => {
  console.log("CASE: Нейрофото")
  await ctx.scene.enter("neuroPhotoCommand")
})

myComposer.hears(["🎥 Видео из текста", "🎥 Text to Video"], async (ctx) => {
  console.log("CASE: Видео из текста")
  await ctx.scene.enter("textToVideoCommand")
})

myComposer.hears(["🎥 Изображение в видео", "🎥 Image to Video"], async (ctx) => {
  console.log("CASE: Изображение в видео")
  await ctx.scene.enter("imageToVideoCommand")
})

myComposer.hears(["🔊 Текст в речь", "🔊 Text to Speech"], async (ctx) => {
  console.log("CASE: Текст в речь")
  await ctx.scene.enter("textToSpeechCommand")
})

myComposer.hears(["🎤 Голос для аватара", "🎤 Voice for Avatar"], async (ctx) => {
  console.log("CASE: Голос для аватара")
  await ctx.scene.enter("voiceCommand")
})

myComposer.hears(["🖼️ Изображение из текста", "🖼️ Text to Image"], async (ctx) => {
  console.log("CASE: Изображение из текста")
  await imageModelMenu(ctx)
})

myComposer.hears(["🔍 Описание из изображения", "🔍 Image to Prompt"], async (ctx) => {
  console.log("CASE: Описание из изображения")
  await ctx.scene.enter("imageToPromptWizard")
})

myComposer.hears(["👥 Пригласить друга", "👥 Invite a friend"], async (ctx) => {
  console.log("CASE: Пригласить друга")
  await ctx.scene.enter("inviteCommand")
})

myComposer.hears(["❓ Помощь", "❓ Help"], async (ctx) => {
  console.log("CASE: Помощь")
  await ctx.scene.enter("neuroQuestCommand")
})

myComposer.hears(["🎮 Начать обучение", "🎮 Start learning"], async (ctx) => {
  console.log("CASE: Начать обучение")
  await handleCallbackQuery(ctx, "level_0", true)
})

myComposer.hears(["💎 Пополнить баланс", "💎 Top up balance"], async (ctx) => {
  console.log("CASE: Пополнить баланс")
  await topUpBalanceCommand(ctx)
})

myComposer.hears(["🤑 Баланс", "🤑 Balance"], async (ctx) => {
  console.log("CASE: Баланс")
  await balanceCommand(ctx)
})

myComposer.hears(["🏠 Главное меню", "🏠 Main menu"], async (ctx) => {
  console.log("CASE: Главное меню")
  await menuCommand(ctx)
})

myComposer.hears(["1️⃣", "2️⃣", "3️⃣", "4️⃣"], async (ctx) => {
  const text = ctx.message.text
  console.log(`CASE: Нажата кнопка ${text}`)
  const isRu = isRussian(ctx)
  const prompt = ctx.session.prompt
  switch (text) {
    case "1️⃣":
      await generateImage(prompt, ctx.session.selectedModel || "", 1, ctx.from.id, isRu, ctx)
      break
    case "2️⃣":
      await generateImage(prompt, ctx.session.selectedModel || "", 2, ctx.from.id, isRu, ctx)
      break
    case "3️⃣":
      await generateImage(prompt, ctx.session.selectedModel || "", 3, ctx.from.id, isRu, ctx)
      break
    case "4️⃣":
      await generateImage(prompt, ctx.session.selectedModel || "", 4, ctx.from.id, isRu, ctx)
      break
    default:
      await ctx.reply("Неизвестная кнопка")
  }
})

myComposer.hears(["⬆️ Улучшить промпт", "⬆️ Improve prompt"], async (ctx) => {
  console.log("CASE: Улучшить промпт")
  await ctx.scene.enter("improvePromptWizard")
})

myComposer.hears(["Flux 1.1Pro Ultra", "SDXL", "SD 3.5 Turbo", "Recraft v3", "Photon"], async (ctx) => {
  console.log("CASE: Flux 1.1Pro Ultra", "SDXL", "SD 3.5 Turbo", "Recraft v3", "Photon")
  if (!ctx.message) {
    throw new Error("No message")
  }
  const isRu = ctx.from?.language_code === "ru"
  const model = ctx.message.text

  ctx.session.selectedModel = model

  await ctx.reply(isRu ? `Вы выбрали модель: ${model}` : `You selected model: ${model}`)
  await ctx.scene.enter("textPromptToImageWizard")
})

export default myComposer
