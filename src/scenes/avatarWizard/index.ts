import { Scenes } from "telegraf"
import { MyContext } from "../../interfaces"
import { updateUserSoul } from "../../core/supabase"
import { isRussian } from "utils/language"

interface WizardSessionData extends Scenes.WizardSessionData {
  company?: string
  position?: string
}

export const avatarWizard = new Scenes.WizardScene<MyContext>(
  "avatarWizard",
  async (ctx) => {
    const isRu = isRussian(ctx)
    await ctx.reply(isRu ? "👋 Привет, как называется ваша компания?" : "👋 Hello, what is your company name?")
    return ctx.wizard.next()
  },
  async (ctx) => {
    if (ctx.message && "text" in ctx.message) {
      ;(ctx.wizard.state as WizardSessionData).company = ctx.message.text
      await ctx.reply(ctx.from?.language_code === "ru" ? "💼 Какая у вас должность?" : "💼 What is your position?")
      return ctx.wizard.next()
    }
    await ctx.reply(
      ctx.from?.language_code === "ru" ? "❌ Ошибка: вы не предоставили все необходимые данные" : "❌ Error: you did not provide all the required information",
    )
    return ctx.scene.leave()
  },
  async (ctx) => {
    if (ctx.message && "text" in ctx.message) {
      ;(ctx.wizard.state as WizardSessionData).position = ctx.message.text
      await ctx.reply(ctx.from?.language_code === "ru" ? "🛠️ Какие у тебя навыки?" : "🛠️ What are your skills?")
      return ctx.wizard.next()
    }
    await ctx.reply(
      ctx.from?.language_code === "ru" ? "❌ Ошибка: вы не предоставили все необходимые данные" : "❌ Error: you did not provide all the required information",
    )
    return ctx.scene.leave()
  },
  async (ctx) => {
    if (ctx.message && "text" in ctx.message) {
      const isRu = isRussian(ctx)
      const skills = ctx.message.text
      const { company, position } = ctx.wizard.state as WizardSessionData
      const userId = ctx.from?.id
      if (userId && company && position) {
        await updateUserSoul(userId.toString(), company, position, skills)
        await ctx.reply(
          isRu
            ? `✅ Аватар успешно получил информацию: \n\n <b>Компания:</b> \n ${company} \n\n <b>Должность:</b> \n ${position} \n\n <b>Навыки:</b> \n ${skills}`
            : `✅ Avatar has successfully received the information: \n\n <b>Company:</b> \n ${company} \n\n <b>Position:</b> \n ${position} \n\n <b>Skills:</b> \n ${skills}`,
          {
            parse_mode: "HTML",
          },
        )
      } else {
        const isRu = isRussian(ctx)
        await ctx.reply(isRu ? "❌ Ошибка: не удалось отправить информацию аватару" : "❌ Error: failed to send information to the avatar")
      }
    }
    return ctx.scene.leave()
  },
)

export default avatarWizard
