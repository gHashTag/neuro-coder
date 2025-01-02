import { getReferalsCount } from "../../core/supabase"
import { MyContext } from "../../interfaces"

export async function inviteCommand(ctx: MyContext) {
  const isRu = ctx.from?.language_code === "ru"

  const botUsername = ctx.botInfo.username
  const telegram_id = ctx.from?.id?.toString() || ""

  const inviteCount = await getReferalsCount(telegram_id)

  const introText = isRu
    ? `🎁 Пригласите друга и откройте для себя новые возможности! Отправьте ему эту ссылку, и пусть он присоединится к нашему сообществу. 
    \nЧто вы получите?
    - Бонусные звезды для использования в боте.
    - Доступ к эксклюзивным функциям и возможностям.
    - Повышение уровня и доступ к новым функциям.
    \n<b>Рефаралы:</b> ${inviteCount}`
    : `🎁  Invite a friend and unlock new opportunities! Send them this link and let them join our community. 🎁 What do you get?
    - Bonus stars for use in the bot.
    - Access to exclusive features and capabilities.
    - Level up and access to new features.
    \n<b>Referrals:</b> ${inviteCount}`

  const linkText = `<a href="https://t.me/${botUsername}?start=${telegram_id}">https://t.me/${botUsername}?start=${telegram_id}</a>`

  await ctx.reply(introText, { parse_mode: "HTML" })
  await ctx.reply(linkText, { parse_mode: "HTML" })
  return
}
