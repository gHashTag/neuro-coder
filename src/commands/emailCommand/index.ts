import { MyContext } from "../../interfaces"
import { saveUserEmail } from "../../core/supabase/payments"
import { topUpBalanceCommand } from "commands/topUpBalanceCommand"

export async function emailCommand(ctx: MyContext) {
  if (!ctx.from) {
    throw new Error("User not found")
  }
  const isRu = ctx.from?.language_code === "ru"

  await ctx.reply(isRu ? "👉 Для формирования счета напишите ваш E-mail." : "👉 To generate an invoice, please provide your E-mail.")
  const msg = await ctx.wait()

  const email = msg.message?.text
  if (email && email.includes("@")) {
    try {
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
    return
  } else {
    await ctx.reply(isRu ? "Некорректный e-mail. Пожалуйста, попробуйте снова." : "Invalid e-mail. Please try again.")
    return
  }
}
