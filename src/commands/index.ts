import { Composer } from "grammy";
import { MyContext } from "../utils/types";

import circle from "./circle";
import hello from "./hello";
import clipmaker from "./clipmaker";
import leela from "./leela";

// import neurocoder_test from "./neurocoder/neurocoder_test";
// import neurocoder01 from "./neurocoder/neurocoder01";

// import melimi_test from "./melimi/melimi_test";
// import melimi01 from "./melimi/melimi01";
// import melimi02 from "./melimi/melimi02";
// import melimi03 from "./melimi/melimi03";
// import melimi04 from "./melimi/melimi04";
// import melimi05 from "./melimi/melimi05";
// import melimi06 from "./melimi/melimi06";
import { start } from "./start";
// import neurocoder02 from "./neurocoder/neurocoder02";
// import neurocoder03 from "./neurocoder/neurocoder03";

const composer = new Composer<MyContext>();

composer.command("start", start);

composer.command("hello", hello);

composer.command("clipmaker", clipmaker);

composer.command("circle", circle);

composer.command("leela", leela);

composer.command("imagesize", async (ctx) => {
  await ctx.conversation.enter("imageSizeConversation");
});

composer.command("playom", async (ctx) => {
  await ctx.conversation.enter("generateImageConversation");
});

composer.command("anatol777", async (ctx) => {
  await ctx.conversation.enter("generateImageConversation");
});

composer.command("anfi_vesna", async (ctx) => {
  await ctx.conversation.enter("generateImageConversation");
});

composer.command("vega_condominium", async (ctx) => {
  await ctx.conversation.enter("generateImageConversation");
});

composer.command("neuro_coder", async (ctx) => {
  await ctx.conversation.enter("generateImageConversation");
});

composer.command("yellowshoess", async (ctx) => {
  await ctx.conversation.enter("generateImageConversation");
});

composer.command("gimba", async (ctx) => {
  await ctx.conversation.enter("generateImageConversation");
});

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
  await ctx.conversation.enter("melimiCatConversation");
});

export default composer;
