import { Scenes } from "telegraf"
import { MyContext } from "../../interfaces"
import { saveUserEmail } from "../../core/supabase/payments"
import { topUpBalanceCommand } from "../../commands/topUpBalanceCommand"

export const emailWizard = new Scenes.WizardScene<MyContext>(
  "emailWizard",
  async (ctx) => {
    if (!ctx.from) {
      throw new Error("User not found")
    }
    const isRu = ctx.from.language_code === "ru"

    await ctx.reply(isRu ? "👉 Для формирования счета напишите ваш E-mail." : "👉 To generate an invoice, please provide your E-mail.")
    return ctx.wizard.next()
  },
  async (ctx) => {
    const isRu = ctx.from?.language_code === "ru"
    const msg = ctx.message

    if (msg && "text" in msg) {
      const email = msg.text
      if (email.includes("@")) {
        try {
          if (!ctx.from) {
            throw new Error("User not found")
          }
          await saveUserEmail(ctx.from.id.toString(), email)
          await ctx.reply(
            isRu
              ? "Ваш e-mail успешно сохранен. Теперь вы можете продолжить оплату."
              : "Your e-mail has been successfully saved. You can now proceed with the payment.",
          )
          await topUpBalanceCommand(ctx)
        } catch (error) {
          await ctx.reply(isRu ? "Ошибка при сохранении e-mail. Пожалуйста, попробуйте снова." : "Error saving e-mail. Please try again.")
        }
        return ctx.scene.leave()
      } else {
        await ctx.reply(isRu ? "Некорректный e-mail. Пожалуйста, попробуйте снова." : "Invalid e-mail. Please try again.")
      }
    }
    return ctx.scene.leave()
  },
)

export default emailWizard
