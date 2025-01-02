import { Markup } from "telegraf"
import { MyContext } from "../interfaces"

export async function imageModelMenu(ctx: MyContext) {
  const isRu = ctx.from?.language_code === "ru"
  const keyboard = Markup.keyboard([
    [Markup.button.text("Flux 1.1Pro Ultra"), Markup.button.text("SDXL")],
    [Markup.button.text("SD 3.5 Turbo"), Markup.button.text("Recraft v3")],
    [Markup.button.text("Photon")],
    [Markup.button.text(isRu ? "🏠 Главное меню" : "🏠 Main menu")],
  ]).resize()

  await ctx.reply(isRu ? "🎨 Выберите модель для генерации:" : "🎨 Choose a model for generation:", {
    reply_markup: keyboard.reply_markup,
  })
}
