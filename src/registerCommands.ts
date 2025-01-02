import { Telegraf, Composer, Scenes, session } from "telegraf"
import { MyContext, SessionData } from "./interfaces"

import { startCommand } from "./commands/startCommand"
import { neuroQuestCommand } from "./commands/neuroQuestCommand"
import { clipmakerCommand } from "./commands/clipmakerCommand"
import { leelaCommand } from "./commands/leelaCommand"
import { topUpBalanceCommand } from "./commands/topUpBalanceCommand"
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
import { handleCallbackQuery } from "./handlers/handleCallbackQuery"
import { createAinewsCommand } from "./commands/createAinewsCommand"
import { subscriptionMiddleware } from "./middleware/subscription"
import { imageModelMenu } from "./menu/imageModelMenu"
import { menuCommand } from "./commands/menuCommand"
import { setupLevelHandlers } from "handlers/setupLevelHandlers"

export const myComposer = new Composer<MyContext>()

export const startScene = new Scenes.WizardScene<MyContext>("startCommand").enter(startCommand)
export const neuroQuestScene = new Scenes.WizardScene<MyContext>("neuroQuestCommand").enter(neuroQuestCommand)
export const clipmakerScene = new Scenes.WizardScene<MyContext>("clipmakerCommand").enter(clipmakerCommand)
export const leelaScene = new Scenes.WizardScene<MyContext>("leelaCommand").enter(leelaCommand)
export const balanceScene = new Scenes.WizardScene<MyContext>("balanceCommand").enter(balanceCommand)
export const topUpBalanceScene = new Scenes.WizardScene<MyContext>("topUpBalanceCommand").enter(topUpBalanceCommand)
export const selectModelScene = new Scenes.WizardScene<MyContext>("selectModelCommand").enter(selectModelCommand)
export const createBackgroundVideoScene = new Scenes.WizardScene<MyContext>("createBackgroundVideoCommand").enter(createBackgroundVideoCommand)
export const avatarScene = new Scenes.WizardScene<MyContext>("avatarCommand").enter(avatarCommand)
export const voiceScene = new Scenes.WizardScene<MyContext>("voiceCommand").enter(voiceCommand)
export const textToSpeechScene = new Scenes.WizardScene<MyContext>("textToSpeechCommand").enter(textToSpeechCommand)
export const lipSyncConversationScene = new Scenes.WizardScene<MyContext>("lipSyncConversationCommand").enter(lipSyncConversationCommand)
export const get100Scene = new Scenes.WizardScene<MyContext>("get100Command").enter(get100Command)
export const captionForReelsScene = new Scenes.WizardScene<MyContext>("captionForReelsCommand").enter(captionForReelsCommand)
export const createTriggerReelScene = new Scenes.WizardScene<MyContext>("createTriggerReelCommand").enter(createTriggerReelCommand)
export const imageSizeScene = new Scenes.WizardScene<MyContext>("imageSizeCommand").enter(imageSizeCommand)
export const subtitlesScene = new Scenes.WizardScene<MyContext>("subtitlesCommand").enter(subtitlesCommand)
export const textPromptToImageScene = new Scenes.WizardScene<MyContext>("textPromptToImageCommand").enter(textPromptToImageCommand)
export const textToVideoScene = new Scenes.WizardScene<MyContext>("textToVideoCommand").enter(textToVideoCommand)
export const imageToVideoScene = new Scenes.WizardScene<MyContext>("imageToVideoCommand").enter(imageToVideoCommand)
export const imageToPromptScene = new Scenes.WizardScene<MyContext>("imageToPromptCommand").enter(imageToPromptCommand)
export const trainFluxModelScene = new Scenes.WizardScene<MyContext>("trainFluxModelCommand").enter(trainFluxModelCommand)
export const neuroPhotoScene = new Scenes.WizardScene<MyContext>("neuroPhotoCommand").enter(neuroPhotoCommand)
export const emailScene = new Scenes.WizardScene<MyContext>("emailCommand").enter(emailCommand)
export const priceScene = new Scenes.WizardScene<MyContext>("priceCommand").enter(priceCommand)
export const inviteScene = new Scenes.WizardScene<MyContext>("inviteCommand").enter(inviteCommand)
export const createAinewsScene = new Scenes.WizardScene<MyContext>("createAinewsCommand").enter(createAinewsCommand)
export const menuScene = new Scenes.WizardScene<MyContext>("menuCommand").enter(menuCommand)

const stage = new Scenes.Stage<MyContext>([
  startScene,
  neuroQuestScene,
  clipmakerScene,
  leelaScene,
  balanceScene,
  topUpBalanceScene,
  selectModelScene,
  createBackgroundVideoScene,
  avatarScene,
  voiceScene,
  textToSpeechScene,
  lipSyncConversationScene,
  get100Scene,
  captionForReelsScene,
  createTriggerReelScene,
  imageSizeScene,
  subtitlesScene,
  textPromptToImageScene,
  textToVideoScene,
  imageToVideoScene,
  imageToPromptScene,
  trainFluxModelScene,
  neuroPhotoScene,
  emailScene,
  priceScene,
  inviteScene,
  createAinewsScene,
  menuScene,
])

export function registerCommands(bot: Telegraf<MyContext>) {
  myComposer.use(
    session({
      defaultSession: (): SessionData => ({
        selectedModel: "",
        text: "",
      }),
    }),
  )

  myComposer.use(stage.middleware())
  myComposer.use(subscriptionMiddleware)

  setupLevelHandlers(bot as Telegraf<MyContext>)

  // Регистрация команд
  myComposer.command("start", async (ctx) => {
    console.log("CASE: start")
    await ctx.scene.enter("startCommand")
  })

  myComposer.command("menu", async (ctx) => {
    console.log("CASE: menu")
    await ctx.scene.enter("menuCommand")
  })

  // composer.command("invite", async (ctx) => {
  //   console.log("CASE: invite")
  //   await ctx.scene.enter("inviteCommand")
  // })

  // composer.command("clipmaker", (ctx) => clipmakerCommand(ctx))

  // composer.command("leela", (ctx) => leelaCommand(ctx))

  // composer.command("caption_for_reels", async (ctx) => {
  //   await ctx.scene.enter("captionForReelsCommand")
  // })

  // composer.command("neuro_quest", async (ctx) => {
  //   await ctx.scene.enter("neuroQuestCommand")
  // })

  // composer.command("price", async (ctx) => {
  //   await ctx.scene.enter("priceCommand")
  // })

  // composer.command("lipsync", async (ctx) => {
  //   await ctx.scene.enter("lipSyncConversationCommand")
  // })

  // composer.command("b_roll", async (ctx) => {
  //   await ctx.scene.enter("createBackgroundVideoCommand")
  // })

  // composer.command("text_to_speech", async (ctx) => {
  //   await ctx.scene.enter("textToSpeechCommand")
  // })

  // composer.command("imagesize", async (ctx) => {
  //   await ctx.scene.enter("imageSizeCommand")
  // })

  // composer.command("buy", async (ctx) => {
  //   await ctx.scene.enter("emailCommand")
  // })

  // composer.command("balance", (ctx) => balanceCommand(ctx))

  // composer.command("trigger_reel", async (ctx) => {
  //   await ctx.scene.enter("createTriggerReelCommand")
  // })

  // composer.command("soul", async (ctx) => {
  //   await ctx.scene.enter("soulCommand")
  // })

  // composer.command("voice", async (ctx) => {
  //   console.log("CASE: voice")
  //   await ctx.scene.enter("voiceCommand")
  // })

  // composer.command("get100", async (ctx) => {
  //   await ctx.scene.enter("get100Command")
  // })

  // composer.command("text_to_image", async (ctx) => {
  //   await ctx.scene.enter("textPromptToImageCommand")
  // })

  // composer.command("text_to_video", async (ctx) => {
  //   await ctx.scene.enter("textToVideoCommand")
  // })

  // composer.command("caption_for_ai_news", async (ctx) => {
  //   await ctx.scene.enter("createAinewsCommand")
  // })

  // composer.command("train_flux_model", async (ctx) => {
  //   await ctx.scene.enter("trainFluxModelCommand")
  // })

  // composer.command("image_to_video", async (ctx) => {
  //   await ctx.scene.enter("imageToVideoCommand")
  // })

  // composer.command("neuro_photo", async (ctx) => {
  //   await ctx.scene.enter("neuroPhotoCommand")
  // })

  // composer.command("help", async (ctx) => {
  //   await ctx.scene.enter("neuroQuestCommand")
  // })

  // composer.command("avatar", async (ctx) => {
  //   await ctx.scene.enter("avatarCommand")
  // })

  // composer.command("image_to_prompt", async (ctx) => {
  //   await ctx.scene.enter("imageToPromptCommand")
  // })

  // composer.command("select_model", async (ctx) => {
  //   await ctx.scene.enter("selectModelCommand")
  // })

  // Обработчики `hears`
  myComposer.hears(["🆔 Создать аватар", "🆔 Create Avatar"], async (ctx) => {
    console.log("CASE: Создать аватар")
    await ctx.scene.enter("avatarCommand")
  })

  myComposer.hears(["🌟 Выбор модели ИИ", "🌟 Select AI Model"], async (ctx) => {
    console.log("CASE: Выбор модели ИИ")
    await ctx.scene.enter("selectModelCommand")
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
    await ctx.scene.enter("imageToPromptCommand")
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
    await ctx.scene.enter("topUpBalanceCommand")
  })

  myComposer.hears(["Flux 1.1Pro Ultra", "SDXL", "SD 3.5 Turbo", "Recraft v3", "Photon"], async (ctx) => {
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
    await ctx.scene.enter("textPromptToImageCommand")
  })

  myComposer.hears(["Вернуться в главное меню", "Return to main menu"], async (ctx) => {
    const isRu = ctx.from?.language_code === "ru"

    await ctx.reply(isRu ? "Возвращение в главное меню" : "Returning to main menu", {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      reply_markup: mainMenu(isRu) as any,
    })
  })
}
