import { MyContext } from "../../interfaces"
import { handleChangeSize } from "../handleChangeSize"
import { handleGenerateImageActions } from "../handleGenerateImageActions"
import { handleAspectRatioChange } from "../handleAspectRatioChange"
import { handleModelCallback } from "../handleModelCallback"
import { handleNeuroActions } from "../handleNeuroActions"
import { handleImprove } from "../handleGenerateImageActions/handleImprove"
import { handleLevelQuest } from "../handleLevelQuest"
import { topUpBalanceCommand } from "commands/topUpBalanceCommand"

export async function handleCallbackQuery(ctx: MyContext, data: string, isRu: boolean) {
  try {
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
        await topUpBalanceCommand(ctx)
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
        console.error("Unknownmcommandallback_query:data:", data)
        await ctx.reply(isRu ? "Неизвестная команда" : "Unknown command")
        break
    }
    return
  } catch (error) {
    console.error("Error in handleCallbackQuery:", error)
    throw error
  }
}
