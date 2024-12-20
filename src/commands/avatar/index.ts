import { updateUserSoul } from "../../core/supabase"
import { Conversation } from "@grammyjs/conversations"
import { MyContext } from "../../utils/types"

export async function avatarConversation(conversation: Conversation<MyContext>, ctx: MyContext) {
  const lang = ctx.from?.language_code || "en"
  const messageIds: number[] = []

  //   await ctx.i18n.setLocale(lang);

  //   await ctx.reply(ctx.i18n.t("ask_work"));
  const nameMessage = await ctx.reply(lang === "ru" ? "👋 Привет, как называется ваша компания?" : "👋 Hello, what is your company name?")
  const company = (await conversation.wait()).message
  if (!company || !company.text) {
    await ctx.reply(lang === "ru" ? "❌ Ошибка: вы не предоставили все необходимые данные" : "❌ Error: you did not provide all the required information")
    return
  }
  messageIds.push(nameMessage.message_id, company?.message_id)

  //   await ctx.reply(ctx.i18n.t("ask_position"));
  const positionMessage = await ctx.reply(lang === "ru" ? "💼 Какая у вас должность?" : "💼 What is your position?")
  const position = (await conversation.wait()).message
  if (!position || !position.text) {
    await ctx.reply(lang === "ru" ? "❌ Ошибка: вы не предоставили все необходимые данные" : "❌ Error: you did not provide all the required information")
    return
  }
  messageIds.push(positionMessage.message_id, position.message_id)

  //   await ctx.reply(ctx.i18n.t("ask_skills"));
  const skillsMessage = await ctx.reply(lang === "ru" ? "🛠️ Какие у тебя навыки?" : "🛠️ What are your skills?")
  const designation = (await conversation.wait()).message
  if (!designation || !designation.text) {
    await ctx.reply(lang === "ru" ? "❌ Ошибка: вы не предоставили все необходимые данные" : "❌ Error: you did not provide all the required information")
    return
  }
  messageIds.push(skillsMessage.message_id, designation.message_id)

  const userId = ctx.from?.id
  if (userId) {
    if (!company.text || !position.text || !designation.text) {
      await ctx.reply(lang === "ru" ? "❌ Ошибка: вы не предоставили все необходимые данные" : "❌ Error: you did not provide all the required information")
      return
    }
    await updateUserSoul(userId.toString(), company.text, position.text, designation.text)
    const thankYouMessage = await ctx.reply(lang === "ru" ? "🙏 Спасибо за предоставленную информацию" : "🙏 Thank you for providing the information")
    messageIds.push(thankYouMessage.message_id)

    // Удаление всех сообщений из текущего диалога
    await ctx.deleteMessages(messageIds)

    // Сообщение об успешном получении информации
    await ctx.reply(
      lang === "ru"
        ? `✅ Аватар успешно получил информацию: \n\n <b>Компания:</b> \n ${company.text} \n\n <b>Должность:</b> \n ${position.text} \n\n <b>Навыки:</b> \n ${designation.text}`
        : `✅ Avatar has successfully received the information: \n\n <b>Company:</b> \n ${company.text} \n\n <b>Position:</b> \n ${position.text} \n\n <b>Skills:</b> \n ${designation.text}`,
      {
        parse_mode: "HTML",
      },
    )
  } else {
    await ctx.reply(lang === "ru" ? "❌ Ошибка: не удалось отправить информацию аватару" : "❌ Error: failed to send information to the avatar")
  }

  return
}
