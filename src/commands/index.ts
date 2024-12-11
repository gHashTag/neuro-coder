import { Composer } from "grammy"
import { MyContext } from "../utils/types"

import circle from "./circle"
import hello from "./hello"
import clipmaker from "./clipmaker"
import leela from "./leela"
import createTriggerReel from "./trigger_reel"
import createCaptionForNews from "./сaptionForNews"
import createAinews from "./ainews"
import neuro_broker from "./neuro_broker"
import textToSpeech from "./textToSpeech"

// import neurocoder_test from "./neurocoder/neurocoder_test";
// import neurocoder01 from "./neurocoder/neurocoder01";

// import melimi_test from "./melimi/melimi_test";
// import melimi01 from "./melimi/melimi01";
// import melimi02 from "./melimi/melimi02";
// import melimi03 from "./melimi/melimi03";
// import melimi04 from "./melimi/melimi04";
// import melimi05 from "./melimi/melimi05";
// import melimi06 from "./melimi/melimi06";
// import { start } from "./start"
import { model } from "./model"
import { invite } from "./invite"
import { buy } from "./buy"
// import neurocoder02 from "./neurocoder/neurocoder02";
// import neurocoder03 from "./neurocoder/neurocoder03";

const composer = new Composer<MyContext>()

// composer.command("start", start)

composer.command("hello", hello)

composer.command("clipmaker", clipmaker)

composer.command("circle", circle)

composer.command("leela", leela)

composer.command("neuro_broker", neuro_broker)

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

composer.command("model", model)
// composer.command("neurocoder01", neurocoder01);
// composer.command("neurocoder02", neurocoder02);
// composer.command("neurocoder03", neurocoder03);
// composer.command("neurocoder_test", neurocoder_test);
// composer.command("create_neurocoder_dj", async (ctx) => {
//   await ctx.conversation.enter("neurocoderDjConversation");
// });

// composer.command("melimi01", melimi01);
// composer.command("melimi02", melimi02);
// composer.command("melimi03", melimi03);
// composer.command("melimi04", melimi04);
// composer.command("melimi05", melimi05);
// composer.command("melimi06", melimi06);
// composer.command("melimi_test", melimi_test);
composer.command("melimi_cat", async (ctx) => {
  await ctx.conversation.enter("generateImageConversation")
})

composer.command("ainews", async (ctx) => {
  await ctx.conversation.enter("createAinews")
})

export default composer
