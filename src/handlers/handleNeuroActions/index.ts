import { MyContext } from "../../interfaces"
import { handleNeuroGenerate } from "./handleNeuroGenerate"
import { handleNeuroImprove } from "./handleNeuroImprove"

import { handleNeuroVideo } from "./handleNeuroVideo"

export async function handleNeuroActions(ctx: MyContext, data: string, isRu: boolean) {
  console.log("CASE: handleNeuroActions")
  if (data.startsWith("neuro_generate_")) {
    console.log("CASE: neuro_generate_")
    await handleNeuroGenerate(ctx, data, isRu)
  } else if (data.startsWith("neuro_improve_")) {
    console.log("CASE: neuro_improve_")
    await handleNeuroImprove(ctx, data, isRu)
  } else if (data === "neuro_cancel") {
    console.log("CASE: neuro_cancel")
    await ctx.reply(isRu ? "❌ Генерация отменена" : "❌ Generation cancelled")
  } else if (data.startsWith("neuro_video_")) {
    console.log("CASE: neuro_video_")
    await handleNeuroVideo(ctx, data, isRu)
  } else {
    console.error("Неизвестная команда:", data)
  }
}
