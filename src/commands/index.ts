import { Composer } from "grammy"

import { clipmaker } from "./clipmaker"
import leela from "./leela"
import neuro_broker from "./neuro_broker"

import { invite } from "./invite"
import { buy } from "./buy"
import selectModelComposer from "./select_model"
import { MyContext } from "../utils/types"

const composer = new Composer<MyContext>()

composer.command("clipmaker", (ctx: MyContext) => clipmaker(ctx))

composer.command("leela", (ctx: MyContext) => leela(ctx))
composer.command("neuro_broker", (ctx: MyContext) => neuro_broker(ctx))

composer.command("caption_for_ai_news", async (ctx) => {
  await ctx.conversation.enter("createCaptionForNews")
})

composer.command("lipsync", async (ctx) => {
  await ctx.conversation.enter("lipSyncConversation")
})

composer.command("b_roll", async (ctx) => {
  await ctx.conversation.enter("createBackgroundVideo")
})

composer.command("text_to_speech", async (ctx) => {
  await ctx.conversation.enter("textToSpeech")
})

composer.command("imagesize", async (ctx) => {
  await ctx.conversation.enter("imageSizeConversation")
})

composer.command("playom", async (ctx) => {
  await ctx.conversation.enter("generateImageConversation")
})

composer.command("buy", buy)

composer.command("trigger_reel", async (ctx) => {
  await ctx.conversation.enter("createTriggerReel")
})

composer.command("anatol777", async (ctx) => {
  await ctx.conversation.enter("generateImageConversation")
})

composer.command("anfi_vesna", async (ctx) => {
  await ctx.conversation.enter("generateImageConversation")
})

composer.command("vega_condominium", async (ctx) => {
  await ctx.conversation.enter("generateImageConversation")
})

composer.command("dpbelarusx", async (ctx) => {
  await ctx.conversation.enter("generateImageConversation")
})

composer.command("neuro_coder", async (ctx) => {
  await ctx.conversation.enter("generateImageConversation")
})

composer.command("lee_solar_numerolog", async (ctx) => {
  await ctx.conversation.enter("leeSolarNumerolog")
})

composer.command("lee_solar_broker", async (ctx) => {
  await ctx.conversation.enter("leeSolarBroker")
})

composer.command("yellowshoess", async (ctx) => {
  await ctx.conversation.enter("generateImageConversation")
})

composer.command("gimba", async (ctx) => {
  await ctx.conversation.enter("generateImageConversation")
})

composer.command("karin", async (ctx) => {
  await ctx.conversation.enter("generateImageConversation")
})

composer.command("svedovaya", async (ctx) => {
  await ctx.conversation.enter("generateImageConversation")
})

composer.command("evi", async (ctx) => {
  await ctx.conversation.enter("generateImageConversation")
})

composer.command("evii", async (ctx) => {
  await ctx.conversation.enter("generateImageConversation")
})

composer.command("kata", async (ctx) => {
  await ctx.conversation.enter("generateImageConversation")
})

composer.command("neuro_broker_00", async (ctx) => {
  await ctx.conversation.enter("generateImageConversation")
})

composer.command("neuro_broker_01", async (ctx) => {
  await ctx.conversation.enter("generateImageConversation")
})

composer.command("kirill_korolev", async (ctx) => {
  await ctx.conversation.enter("generateImageConversation")
})

composer.command("zavarikin", async (ctx) => {
  await ctx.conversation.enter("generateImageConversation")
})

composer.command("lekomtsev", async (ctx) => {
  await ctx.conversation.enter("generateImageConversation")
})

composer.command("chuklinov", async (ctx) => {
  await ctx.conversation.enter("generateImageConversation")
})

composer.command("lee_solar", async (ctx) => {
  await ctx.conversation.enter("generateImageConversation")
})

composer.command("muse_nataly", async (ctx) => {
  await ctx.conversation.enter("generateImageConversation")
})

composer.command("soul", async (ctx) => {
  await ctx.conversation.enter("soulConversation")
})

composer.command("voice", async (ctx) => {
  await ctx.conversation.enter("voiceConversation")
})

composer.command("invite", invite)

composer.command("subtitles", async (ctx) => {
  await ctx.conversation.enter("subtitles")
})

composer.command("get100", async (ctx) => {
  await ctx.conversation.enter("get100AnfiVesnaConversation")
})

composer.command("text_to_image", async (ctx) => {
  await ctx.conversation.enter("textToImageConversation")
})

composer.command("text_to_video", async (ctx) => {
  await ctx.conversation.enter("textToVideoConversation")
})

composer.command("caption_for_ai_news", async (ctx) => {
  await ctx.conversation.enter("createCaptionForNews")
})

composer.command("train_flux_model", async (ctx) => {
  await ctx.conversation.enter("trainFluxModelConversation")
})

composer.command("image_to_video", async (ctx) => {
  await ctx.conversation.enter("imageToVideo")
})

composer.command("neuro_photo", async (ctx) => {
  await ctx.conversation.enter("neuroPhotoConversation")
})

composer.use(selectModelComposer)

export default composer
