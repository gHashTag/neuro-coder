import { MyContext } from "../../utils/types"
import { handleChangeSize } from "../handleChangeSize"
import { handleGenerateImageActions } from "../handleGenerateImageActions"
import { handleAspectRatioChange } from "../handleAspectRatioChange"
import { buyRobokassa } from "../buy/buyRobokassa"
import { handleModelCallback } from "../handleModelCallback"
import { handleNeuroActions } from "../handleNeuroActions"
import { handleImprove } from "../handleGenerateImageActions/handleImprove"
import { handleLevelQuest } from "../handleLevelQuest"

export async function handleCallbackQuery(ctx: MyContext, data: string, isRu: boolean) {
  console.log("CASE: handleCallbackQuery")

  switch (true) {
    case data === "change_size":
      console.log("CASE: change_size")
      await handleChangeSize({ ctx })
      break

    case data.startsWith("generate_"):
      console.log("CASE: generate_")
      await handleGenerateImageActions(ctx, data, isRu)
      break

    case data === "request_email":
      console.log("CASE: request_email")
      await ctx.conversation.enter("emailConversation")
      break

    case data.startsWith("size_"):
      console.log("CASE: size_")
      await handleAspectRatioChange({ ctx })
      break

    case data === "top_up_balance":
      console.log("CASE: top_up_balance")
      await buyRobokassa(ctx)
      break

    case data.startsWith("select_model_"):
      console.log("CASE: select_model_")
      const model = data.replace("select_model_", "")
      console.log("model", model)
      await handleModelCallback(model, ctx)
      break

    case data.startsWith("neuro_"):
      console.log("CASE: neuro_")
      await handleNeuroActions(ctx, data, isRu)
      break

    case data.startsWith("improve_"):
      console.log("CASE: improve_")
      await handleImprove(ctx, data, isRu)
      break

    case data.startsWith("level_"):
      console.log("CASE: level_")
      await handleLevelQuest(ctx, data)
      break

    default:
      console.error("Неизвестная команда - callback_query:data:", data)
  }
}