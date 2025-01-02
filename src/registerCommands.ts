import { Composer, session } from "grammy"
import { adapter, MyContext, MyContextWithSession, SessionData } from "./utils/types"
import { conversations, createConversation } from "@grammyjs/conversations"

import { startCommand } from "./commands/startCommand"
import { neuroQuestCommand } from "./commands/neuroQuestCommand"
import { clipmakerCommand } from "./commands/clipmakerCommand"
import { leelaCommand } from "./commands/leelaCommand"
import { balanceCommand } from "./commands/balanceCommand"
import { selectModelCommand } from "./commands/selectModelCommand"
import { generateImageCommand } from "./commands/generateImageCommand"
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
import { textToImageCommand } from "./commands/textToImageCommand"
import { textToVideoCommand } from "./commands/textToVideoCommand"
import { imageToVideoCommand } from "./commands/imageToVideoCommand"
import { imageToPromptCommand } from "./commands/imageToPromptCommand"
import { trainFluxModelCommand } from "./commands/trainFluxModelCommand"
import { neuroPhotoCommand } from "./commands/neuroPhotoCommand"
import { emailCommand } from "./commands/emailCommand"
import { priceCommand } from "./commands/priceCommand"
import { inviteCommand } from "./commands/inviteCommand"
import { createMainMenu } from "menu"
import { bot } from "./index"

import { chatMembers } from "@grammyjs/chat-members"
import { createAinewsCommand } from "./commands/createAinewsCommand"
import { subscriptionMiddleware } from "./middleware/subscription"
import { freeStorage } from "@grammyjs/storage-free"

export const composer = new Composer<MyContext>()

function initial(): SessionData {
  return { melimi00: { videos: [], texts: [] }, text: "" }
}

bot.use(session({ initial, storage: freeStorage<SessionData>(bot.token) }))

bot.use(conversations<MyContextWithSession>())
bot.use(createConversation(inviteCommand))
bot.use(chatMembers(adapter))
bot.use(subscriptionMiddleware)
bot.use(createConversation(startCommand))
bot.use(createConversation(neuroQuestCommand))
bot.use(createConversation(imageSizeCommand))
bot.use(createConversation(textToSpeechCommand))
bot.use(createConversation(generateImageCommand))
bot.use(createConversation(createTriggerReelCommand))
bot.use(createConversation(captionForReelsCommand))
bot.use(createConversation(priceCommand))
bot.use(createConversation(get100Command))
bot.use(createConversation(avatarCommand))
bot.use(createConversation(lipSyncConversationCommand))
bot.use(createConversation(createBackgroundVideoCommand))
bot.use(createConversation(subtitlesCommand))
bot.use(createConversation(createAinewsCommand))
bot.use(createConversation(textToImageCommand))
bot.use(createConversation(textToVideoCommand))
bot.use(createConversation(imageToPromptCommand))
bot.use(createConversation(trainFluxModelCommand))
bot.use(createConversation(neuroPhotoCommand))
bot.use(createConversation(emailCommand))
bot.use(createConversation(selectModelCommand))
bot.use(createConversation(voiceCommand))
bot.use(createConversation(imageToVideoCommand))

export function registerCommands() {
  composer.command("invite", async (ctx) => {
    console.log("CASE: invite")
    await ctx.conversation.enter("inviterConversation")
  })

  composer.command("menu", async (ctx) => {
    const isRu = ctx.from?.language_code === "ru"
    const mainMenu = createMainMenu(isRu)
    await ctx.reply(isRu ? "🏠 Главное меню\nВыберите нужный раздел 👇" : "🏠 Main menu\nChoose the section 👇", { reply_markup: mainMenu })
  })

  composer.command("start", async (ctx) => {
    console.log("CASE: start")
    await ctx.conversation.enter("startCommand")
  })

  composer.command("clipmaker", (ctx) => clipmakerCommand(ctx))

  composer.command("leela", (ctx) => leelaCommand(ctx))

  composer.command("caption_for_reels", async (ctx) => {
    await ctx.conversation.enter("captionForReelsCommand")
  })

  composer.command("neuro_quest", async (ctx) => {
    await ctx.conversation.enter("neuroQuestCommand")
  })

  composer.command("price", async (ctx) => {
    await ctx.conversation.enter("priceCommand")
  })

  composer.command("lipsync", async (ctx) => {
    await ctx.conversation.enter("lipSyncConversationCommand")
  })

  composer.command("b_roll", async (ctx) => {
    await ctx.conversation.enter("createBackgroundVideoCommand")
  })

  composer.command("text_to_speech", async (ctx) => {
    await ctx.conversation.enter("textToSpeechCommand")
  })

  composer.command("imagesize", async (ctx) => {
    await ctx.conversation.enter("imageSizeCommand")
  })

  composer.command("playom", async (ctx) => {
    await ctx.conversation.enter("generateImageCommand")
  })

  composer.command("buy", async (ctx) => {
    await ctx.conversation.enter("emailCommand")
  })

  composer.command("balance", (ctx) => balanceCommand(ctx))

  composer.command("trigger_reel", async (ctx) => {
    await ctx.conversation.enter("createTriggerReelCommand")
  })

  composer.command("soul", async (ctx) => {
    await ctx.conversation.enter("soulCommand")
  })

  composer.command("voice", async (ctx) => {
    console.log("CASE: voice")
    await ctx.conversation.enter("voiceCommand")
  })

  composer.command("get100", async (ctx) => {
    await ctx.conversation.enter("get100Command")
  })

  composer.command("text_to_image", async (ctx) => {
    await ctx.conversation.enter("textToImageCommand")
  })

  composer.command("text_to_video", async (ctx) => {
    await ctx.conversation.enter("textToVideoCommand")
  })

  composer.command("caption_for_ai_news", async (ctx) => {
    await ctx.conversation.enter("createAinewsCommand")
  })

  composer.command("train_flux_model", async (ctx) => {
    await ctx.conversation.enter("trainFluxModelCommand")
  })

  composer.command("image_to_video", async (ctx) => {
    await ctx.conversation.enter("imageToVideoCommand")
  })

  composer.command("neuro_photo", async (ctx) => {
    await ctx.conversation.enter("neuroPhotoCommand")
  })

  composer.command("help", async (ctx) => {
    await ctx.conversation.enter("neuroQuestCommand")
  })

  composer.command("avatar", async (ctx) => {
    await ctx.conversation.enter("avatarCommand")
  })

  composer.command("image_to_prompt", async (ctx) => {
    await ctx.conversation.enter("imageToPromptCommand")
  })

  composer.command("select_model", async (ctx) => {
    await ctx.conversation.enter("selectModelCommand")
  })

  composer.hears(["🌟 Создать аватар", "🌟 Create Avatar"], async (ctx) => {
    await ctx.conversation.enter("avatarCommand")
  })

  composer.hears(["🌟 Выбор модели ИИ", "🌟 Select AI Model"], async (ctx) => {
    await ctx.conversation.enter("selectModelCommand")
  })

  composer.hears(["🎨 Обучить FLUX", "🎨 Train FLUX"], async (ctx) => {
    await ctx.conversation.enter("trainFluxModelCommand")
  })

  composer.hears(["📸 Нейрофото", "📸 NeuroPhoto"], async (ctx) => {
    await ctx.conversation.enter("neuroPhotoCommand")
  })

  composer.hears(["🎥 Видео из текста", "🎥 Text to Video"], async (ctx) => {
    await ctx.conversation.enter("textToVideoCommand")
  })

  composer.hears(["🎥 Изображение в видео", "🎥 Image to Video"], async (ctx) => {
    await ctx.conversation.enter("imageToVideoCommand")
  })

  composer.hears(["🔊 Текст в речь", "🔊 Text to Speech"], async (ctx) => {
    await ctx.conversation.enter("textToSpeechCommand")
  })

  composer.hears(["🎤 Голос для аватара", "🎤 Voice for Avatar"], async (ctx) => {
    await ctx.conversation.enter("voiceCommand")
  })

  composer.hears(["🖼️ Изображение из текста", "🖼️ Text to Image"], async (ctx) => {
    await ctx.conversation.enter("textToImageCommand")
  })

  composer.hears(["🔍 Описание из изображения", "🔍 Image to Prompt"], async (ctx) => {
    await ctx.conversation.enter("imageToPromptCommand")
  })

  composer.hears(["👥 Пригласить друга", "👥 Invite a friend"], async (ctx) => {
    await ctx.conversation.enter("inviteCommand")
  })

  composer.hears(["❓ Помощь", "❓ Help"], async (ctx) => {
    await ctx.conversation.enter("neuroQuestCommand")
  })
}
