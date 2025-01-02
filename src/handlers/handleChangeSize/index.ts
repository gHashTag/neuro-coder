import { isRussian } from "../../utils/language"
import { MyContextWithSession } from "../../interfaces"

interface AspectRatioHandlerParams {
  ctx: MyContextWithSession
}

export async function handleChangeSize({ ctx }: AspectRatioHandlerParams) {
  try {
    if (!ctx.callbackQuery?.data) {
      throw new Error("No callback query data")
    }
    const isRu = isRussian(ctx)
    await ctx.reply(isRu ? "Выберите размер изображения:" : "Choose image size:", {
      reply_markup: {
        inline_keyboard: [
          [
            { text: "21:9", callback_data: "size_21:9" },
            { text: "16:9", callback_data: "size_16:9" },
            { text: "3:2", callback_data: "size_3:2" },
          ],
          [
            { text: "4:3", callback_data: "size_4:3" },
            { text: "5:4", callback_data: "size_5:4" },
            { text: "1:1", callback_data: "size_1:1" },
          ],
          [
            { text: "4:5", callback_data: "size_4:5" },
            { text: "3:4", callback_data: "size_3:4" },
            { text: "2:3", callback_data: "size_2:3" },
          ],
          [
            { text: "9:16", callback_data: "size_9:16" },
            { text: "9:21", callback_data: "size_9:21" },
          ],
        ],
      },
    })

    return
  } catch (error) {
    console.error("Error in aspect ratio handler:", error)
    throw error
  }
}
