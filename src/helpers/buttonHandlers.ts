import { MyContext } from "../utils/types"

export const generateMoreImagesButtons = async (ctx: MyContext, promptId: string) => {
  const isRu = ctx.from?.language_code === "ru"

  await ctx.reply(isRu ? `🤔 Сгенерировать еще?` : `🤔 Generate more?`, {
    reply_markup: {
      inline_keyboard: [
        [
          { text: "1", callback_data: `generate_1_${promptId}` },
          { text: "2", callback_data: `generate_2_${promptId}` },
        ],
        [
          { text: "3", callback_data: `generate_3_${promptId}` },
          { text: "4", callback_data: `generate_4_${promptId}` },
        ],
        [{ text: isRu ? "⬆️ Улучшить промпт" : "⬆️ Improve prompt", callback_data: `improve_${promptId}` }],
      ],
    },
  })
}