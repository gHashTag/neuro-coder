import { Markup, Scenes } from "telegraf"
import { MyContext } from "../../interfaces"
import { isRussian } from "../../utils/language"

export const sizeWizard = new Scenes.WizardScene<MyContext>("sizeWizard", async (ctx) => {
  const isRu = isRussian(ctx)
  const keyboard = Markup.keyboard([
    ["21:9", "16:9", "3:2"],
    ["4:3", "5:4", "1:1"],
    ["4:5", "3:4", "2:3"],
    ["9:16", "9:21"],
  ]).resize()

  // Отправляем сообщение с клавиатурой
  await ctx.reply(isRu ? "Выберите размер изображения:" : "Choose image size:", {
    reply_markup: keyboard.reply_markup,
  })

  return ctx.wizard.next()
})
