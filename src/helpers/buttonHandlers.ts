import { MyContext } from "../utils/types"

export const buttonHandlers = async (ctx: MyContext, promptId: string) => {
  const isRu = ctx.from?.language_code === "ru"

  await ctx.reply(isRu ? `🤔 Сгенерировать еще?` : `🤔 Generate more?`, {
    reply_markup: {
      inline_keyboard: [
        [
          { text: "1️⃣", callback_data: `generate_1_${promptId}` },
          { text: "2️⃣", callback_data: `generate_2_${promptId}` },
          { text: "3️⃣", callback_data: `generate_3_${promptId}` },
          { text: "4️⃣", callback_data: `generate_4_${promptId}` },
        ],
        [
          { text: isRu ? "⬆️ Улучшить промпт" : "⬆️ Improve prompt", callback_data: `improve_${promptId}` },
          { text: isRu ? "📐 Изменить размер" : "📐 Change size", callback_data: "change_size" },
        ],
      ],
    },
  })
  return
}
