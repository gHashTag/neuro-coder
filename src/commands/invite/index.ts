import { getReferalsCount } from "../../core/supabase"
import { MyContext } from "../../utils/types"

export async function invite(ctx: MyContext) {
  const isRu = ctx.from?.language_code === "ru"

  const botUsername = await ctx.me.username
  const telegram_id = ctx.from?.id?.toString() || ""

  const inviteCount = await getReferalsCount(telegram_id)

  const text = isRu
    ? `Чтобы пригласить друга, отправьте ему эту ссылку: 
<b><code>https://t.me/${botUsername}?start=${telegram_id}</code></b>
Пусть он присоединится к нам и получит массу удовольствия! 
    
    😊 <b>Рефералов:</b> ${inviteCount}`
    : `To invite a friend, send them this link:

🌟 <b><code>https://t.me/${botUsername}?start=${telegram_id}</code></b>

Let them join us and have a great time! 
    
    😊 <b>Referrals:</b> ${inviteCount}`
  await ctx.reply(text, { parse_mode: "HTML" })
}
