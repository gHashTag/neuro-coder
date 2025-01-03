import { MyContext } from "../../interfaces"
import { handleGenerateNeuroImproved } from "../handleNeuroActions/handleGenerateImproved"
import { handleGenerate } from "./handleGenerate"

export async function handleGenerateImageActions(ctx: MyContext, data: string, isRu: boolean) {
  try {
    if (data.startsWith("generate_improved_")) {
      console.log("CASE: generate_improved_")
      await handleGenerateNeuroImproved(ctx, data, isRu)
    } else if (data.startsWith("generate_")) {
      console.log("CASE: generate_")
      await handleGenerate(ctx, data, isRu)
    } else {
      console.error("Неизвестная команда handleGenerateImageActions:", data)
      throw new Error("Unknown command handleGenerateImageActions")
    }
    return
  } catch (error) {
    console.error("Error in handleGenerateImageActions:", error)
    throw error
  }
}
