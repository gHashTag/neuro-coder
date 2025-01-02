import { Composer, session } from "grammy"
import { adapter, MyContext, MyContextWithSession, SessionData } from "./utils/types"
import { conversations, createConversation } from "@grammyjs/conversations"

import { startCommand } from "./commands/startCommand"
import { neuroQuestCommand } from "./commands/neuroQuestCommand"
import { clipmakerCommand } from "./commands/clipmakerCommand"
import { leelaCommand } from "./commands/leelaCommand"
import { balanceCommand } from "./commands/balanceCommand"
import { selectModelCommand } from "./commands/selectModelCommand"
import { createBackgroundVideoCommand } from "./commands/createBackgroundVideoCommand"
import { avatarCommand } from "./commands/avatarCommand"
import { voiceCommand } from "./commands/voiceCommand"
import { textToSpeechCommand } from "./commands/textToSpeechCommand"
import { lipSyncConversationCommand } from "./commands/lipSyncConversationCommand"
import { get100Command } from "./commands/get100Command"
import { captionForReelsCommand } from "./commands/captionForReelsCommand"
import { createTriggerReelCommand } from "./commands/createTriggerReelCommand"
import { imageSizeCommand } from "./commands/imageSizeCommand"
import { subtitlesCommand } from "./commands/subtitlesCommand"
import { textPromptToImageCommand } from "./commands/textPromptToImageCommand"
import { textToVideoCommand } from "./commands/textToVideoCommand"
import { imageToVideoCommand } from "./commands/imageToVideoCommand"
import { imageToPromptCommand } from "./commands/imageToPromptCommand"
import { trainFluxModelCommand } from "./commands/trainFluxModelCommand"
import { neuroPhotoCommand } from "./commands/neuroPhotoCommand"
import { emailCommand } from "./commands/emailCommand"
import { priceCommand } from "./commands/priceCommand"
import { inviteCommand } from "./commands/inviteCommand"
import { mainMenu } from "./menu/mainMenu"
import { bot } from "./index"

import { chatMembers } from "@grammyjs/chat-members"
import { createAinewsCommand } from "./commands/createAinewsCommand"
import { subscriptionMiddleware } from "./middleware/subscription"
import { freeStorage } from "@grammyjs/storage-free"
import { imageModelMenu } from "./menu/imageModelMenu"
import { menuCommand } from "commands/menuCommand"

export const composer = new Composer<MyContext>()

function initial(): SessionData {
  return { selectedModel: "", text: "", conversation: {} }
}

bot.use(session({ initial, storage: freeStorage<SessionData>(bot.token) }))

bot.use(conversations<MyContextWithSession>())
bot.use(createConversation(menuCommand))
bot.use(createConversation(inviteCommand))
bot.use(chatMembers(adapter))
bot.use(subscriptionMiddleware)
bot.use(createConversation(startCommand))
bot.use(createConversation(neuroQuestCommand))
bot.use(createConversation(imageSizeCommand))
bot.use(createConversation(textToSpeechCommand))
bot.use(createConversation(createTriggerReelCommand))
bot.use(createConversation(captionForReelsCommand))
bot.use(createConversation(priceCommand))
bot.use(createConversation(get100Command))
bot.use(createConversation(avatarCommand))
bot.use(createConversation(lipSyncConversationCommand))
bot.use(createConversation(createBackgroundVideoCommand))
bot.use(createConversation(subtitlesCommand))
bot.use(createConversation(createAinewsCommand))
bot.use(createConversation(textPromptToImageCommand))
bot.use(createConversation(textToVideoCommand))
bot.use(createConversation(imageToPromptCommand))
bot.use(createConversation(trainFluxModelCommand))
bot.use(createConversation(neuroPhotoCommand))
bot.use(createConversation(emailCommand))
bot.use(createConversation(selectModelCommand))
bot.use(createConversation(voiceCommand))
bot.use(createConversation(imageToVideoCommand))

export function registerCommands() {
  composer.command("start", async (ctx) => {
    console.log("CASE: start")
    await ctx.conversation.enter("startCommand")
    return
  })

  composer.command("menu", async (ctx) => {
    console.log("CASE: menu")
    await ctx.conversation.enter("menuCommand")
    return
  })

  composer.command("invite", async (ctx) => {
    console.log("CASE: invite")
    await ctx.conversation.enter("inviterConversation")
    return
  })

  composer.command("clipmaker", (ctx) => clipmakerCommand(ctx))

  composer.command("leela", (ctx) => leelaCommand(ctx))

  composer.command("caption_for_reels", async (ctx) => {
    await ctx.conversation.enter("captionForReelsCommand")
  })

  composer.command("neuro_quest", async (ctx) => {
    await ctx.conversation.enter("neuroQuestCommand")
    return
  })

  composer.command("price", async (ctx) => {
    await ctx.conversation.enter("priceCommand")
    return
  })

  composer.command("lipsync", async (ctx) => {
    await ctx.conversation.enter("lipSyncConversationCommand")
    return
  })

  composer.command("b_roll", async (ctx) => {
    await ctx.conversation.enter("createBackgroundVideoCommand")
    return
  })

  composer.command("text_to_speech", async (ctx) => {
    await ctx.conversation.enter("textToSpeechCommand")
    return
  })

  composer.command("imagesize", async (ctx) => {
    await ctx.conversation.enter("imageSizeCommand")
    return
  })

  composer.command("buy", async (ctx) => {
    await ctx.conversation.enter("emailCommand")
    return
  })

  composer.command("balance", (ctx) => balanceCommand(ctx))

  composer.command("trigger_reel", async (ctx) => {
    await ctx.conversation.enter("createTriggerReelCommand")
    return
  })

  composer.command("soul", async (ctx) => {
    await ctx.conversation.enter("soulCommand")
    return
  })

  composer.command("voice", async (ctx) => {
    console.log("CASE: voice")
    await ctx.conversation.enter("voiceCommand")
    return
  })

  composer.command("get100", async (ctx) => {
    await ctx.conversation.enter("get100Command")
    return
  })

  composer.command("text_to_image", async (ctx) => {
    await ctx.conversation.enter("textPromptToImageCommand")
    return
  })

  composer.command("text_to_video", async (ctx) => {
    await ctx.conversation.enter("textToVideoCommand")
    return
  })

  composer.command("caption_for_ai_news", async (ctx) => {
    await ctx.conversation.enter("createAinewsCommand")
    return
  })

  composer.command("train_flux_model", async (ctx) => {
    await ctx.conversation.enter("trainFluxModelCommand")
    return
  })

  composer.command("image_to_video", async (ctx) => {
    await ctx.conversation.enter("imageToVideoCommand")
    return
  })

  composer.command("neuro_photo", async (ctx) => {
    await ctx.conversation.enter("neuroPhotoCommand")
    return
  })

  composer.command("help", async (ctx) => {
    await ctx.conversation.enter("neuroQuestCommand")
    return
  })

  composer.command("avatar", async (ctx) => {
    await ctx.conversation.enter("avatarCommand")
    return
  })

  composer.command("image_to_prompt", async (ctx) => {
    await ctx.conversation.enter("imageToPromptCommand")
    return
  })

  composer.command("select_model", async (ctx) => {
    await ctx.conversation.enter("selectModelCommand")
    return
  })

  composer.hears(["🆔 Создать аватар", "🆔 Create Avatar"], async (ctx) => {
    console.log("CASE: Создать аватар")
    await ctx.conversation.enter("avatarCommand")
    return
  })

  composer.hears(["🌟 Выбор модели ИИ", "🌟 Select AI Model"], async (ctx) => {
    console.log("CASE: Выбор модели ИИ")
    await ctx.conversation.enter("selectModelCommand")
    return
  })

  composer.hears(["🎨 Обучить FLUX", "🎨 Train FLUX"], async (ctx) => {
    console.log("CASE: Обучить FLUX")
    await ctx.conversation.enter("trainFluxModelCommand")
    return
  })

  composer.hears(["📸 Нейрофото", "📸 NeuroPhoto"], async (ctx) => {
    console.log("CASE: Нейрофото")
    await ctx.conversation.enter("neuroPhotoCommand")
    return
  })

  composer.hears(["🎥 Видео из текста", "🎥 Text to Video"], async (ctx) => {
    console.log("CASE: Видео из текста")
    await ctx.conversation.enter("textToVideoCommand")
    return
  })

  composer.hears(["🎥 Изображение в видео", "🎥 Image to Video"], async (ctx) => {
    console.log("CASE: Изображение в видео")
    await ctx.conversation.enter("imageToVideoCommand")
    return
  })

  composer.hears(["🔊 Текст в речь", "🔊 Text to Speech"], async (ctx) => {
    console.log("CASE: Текст в речь")
    await ctx.conversation.enter("textToSpeechCommand")
    return
  })

  composer.hears(["🎤 Голос для аватара", "🎤 Voice for Avatar"], async (ctx) => {
    console.log("CASE: Голос для аватара")
    await ctx.conversation.enter("voiceCommand")
    return
  })

  composer.hears(["🖼️ Изображение из текста", "🖼️ Text to Image"], async (ctx) => {
    console.log("CASE: Изображение из текста")
    await imageModelMenu(ctx)
    return
  })

  composer.hears(["🔍 Описание из изображения", "🔍 Image to Prompt"], async (ctx) => {
    console.log("CASE: Описание из изображения")
    await ctx.conversation.enter("imageToPromptCommand")
    return
  })

  composer.hears(["👥 Пригласить друга", "👥 Invite a friend"], async (ctx) => {
    console.log("CASE: Пригласить друга")
    await ctx.conversation.enter("inviteCommand")
    return
  })

  composer.hears(["❓ Помощь", "❓ Help"], async (ctx) => {
    console.log("CASE: Помощь")
    await ctx.conversation.enter("neuroQuestCommand")
    return
  })

  composer.hears(["Flux 1.1Pro Ultra", "SDXL", "SD 3.5 Turbo", "Recraft v3", "Photon"], async (ctx) => {
    console.log("CASE: Flux 1.1Pro Ultra", "SDXL", "SD 3.5 Turbo", "Recraft v3", "Photon")
    if (!ctx.message) {
      throw new Error("No message")
    }
    const isRu = ctx.from?.language_code === "ru"
    const model = ctx.message.text

    ctx.session.selectedModel = model

    // Обработка выбора модели
    await ctx.reply(isRu ? `Вы выбрали модель: ${model}` : `You selected model: ${model}`)
    // Здесь можно добавить логику для работы с выбранной моделью
    await ctx.conversation.enter("textPromptToImageCommand", { overwrite: true })
    return
  })

  composer.hears(["Вернуться в главное меню", "Return to main menu"], async (ctx) => {
    const isRu = ctx.from?.language_code === "ru"
    await ctx.reply(isRu ? "Возвращение в главное меню" : "Returning to main menu", {
      reply_markup: mainMenu(isRu),
    })
  })
}
