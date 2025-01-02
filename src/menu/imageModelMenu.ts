import { Keyboard } from "grammy"
import { MyContext } from "../utils/types"

export async function showModelMenu(ctx: MyContext) {
  const isRu = ctx.from?.language_code === "ru"
  const keyboard = new Keyboard()
    .text("Flux 1.1Pro Ultra")
    .text("SDXL")
    .row()
    .text("SD 3.5 Turbo")
    .text("Recraft v3")
    .row()
    .text("Photon")
    .row()
    .text(isRu ? "Вернуться в главное меню" : "Return to main menu")
    .resized()

  await ctx.reply(isRu ? "🎨 Выберите модель для генерации:" : "🎨 Choose a model for generation:", { reply_markup: keyboard })
}
