import { mainMenu } from "../../menu/mainMenu"
import { MyContext } from "../../utils/types"

export async function handleImageModel(ctx: MyContext) {
  try {
    if (!ctx.message) {
      throw new Error("No message")
    }
    const text = ctx.message.text
    const isRu = ctx.from?.language_code === "ru"

    switch (text) {
      case "Flux 1.1Pro Ultra":
        // Обработка выбора модели Flux 1.1Pro Ultra
        await ctx.reply(isRu ? "Вы выбрали Flux 1.1Pro Ultra" : "You selected Flux 1.1Pro Ultra")
        break
      case "SDXL":
        // Обработка выбора модели SDXL
        await ctx.reply(isRu ? "Вы выбрали SDXL" : "You selected SDXL")
        break
      case "SD 3.5 Turbo":
        // Обработка выбора модели SD 3.5 Turbo
        await ctx.reply(isRu ? "Вы выбрали SD 3.5 Turbo" : "You selected SD 3.5 Turbo")
        break
      case "Recraft v3":
        // Обработка выбора модели Recraft v3
        await ctx.reply(isRu ? "Вы выбрали Recraft v3" : "You selected Recraft v3")
        break
      case "Photon":
        // Обработка выбора модели Photon
        await ctx.reply(isRu ? "Вы выбрали Photon" : "You selected Photon")
        break
      case "Вернуться в главное меню":
      case "Return to main menu":
        // Обработка возврата в главное меню
        await ctx.reply(isRu ? "Возвращение в главное меню" : "Returning to main menu", {
          reply_markup: mainMenu(isRu),
        })
        break
      default:
        await ctx.reply(isRu ? "Неизвестное действие" : "Unknown action")
    }
    return
  } catch (error) {
    console.error("Error in handleImageModel:", error)
    throw error
  }
}
