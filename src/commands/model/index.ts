import { InlineKeyboard } from "grammy"
import { MyContext } from "../../utils/types"

async function model(ctx: MyContext) {
  const lang = ctx.from?.language_code === "ru" ? true : false

  const keyboard = new InlineKeyboard()
    .text("GPT-4", "model_gpt-4")
    .text("GPT-4o", "model_gpt-4o")
    .row()
    .text("GPT-4-turbo", "model_gpt-4-turbo")
    .text("GPT-3.5-turbo", "model_gpt-3.5-turbo")

  await ctx.reply(lang ? "🧠 Выберите модель ИИ" : "🧠 Select Model AI", {
    reply_markup: keyboard,
  })
}

export { model }
