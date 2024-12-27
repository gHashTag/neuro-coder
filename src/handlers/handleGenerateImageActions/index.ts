import { MyContext } from "../../utils/types"
import { handleGenerateNeuroImproved } from "../handleNeuroActions/handleGenerateImproved"
import { handleGenerate } from "./handleGenerate"
import { handleImprove } from "./handleImprove"
import { handleGenerateImage } from "./handleGenerateImage"

export async function handleGenerateImageActions(ctx: MyContext, data: string, isRu: boolean) {
  if (data.startsWith("generate_improved_")) {
    console.log("CASE: generate_improved_")
    await handleGenerateNeuroImproved(ctx, data, isRu)
  } else if (data.startsWith("generate_")) {
    console.log("CASE: generate_")
    await handleGenerate(ctx, data, isRu)
  } else if (data.startsWith("improve_")) {
    console.log("CASE: improve_")
    await handleImprove(ctx, data, isRu)
  } else if (data.startsWith("generate_image_")) {
    console.log("CASE: generate_image_")
    await handleGenerateImage(ctx, data, isRu)
  } else if (data.startsWith("generate_")) {
    console.log("CASE: generate_")
    await handleGenerate(ctx, data, isRu)
  } else if (data.startsWith("improve_")) {
    console.log("CASE: improve_")
    await handleImprove(ctx, data, isRu)
  } else if (data.startsWith("generate_image_")) {
    console.log("CASE: generate_image_")
    await handleGenerateImage(ctx, data, isRu)
  } else {
    console.error("Неизвестная команда:", data)
  }
}
