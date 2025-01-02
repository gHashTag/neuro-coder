import { setAspectRatio } from "../../core/supabase/ai"
import { isRussian } from "../../utils/language"
import { ERROR_MESSAGES, SUCCESS_MESSAGES } from "../../constants/messages"
import { MyContext } from "../../interfaces"

export async function handleAspectRatioChange(ctx: MyContext) {
  try {
    // if (!ctx?.callbackQuery?.data) {
    //   throw new Error("No callback query data")
    // }
    // const aspect_ratio = ctx.callbackQuery.data.replace("size_", "")
    // const userId = ctx.from?.id
    // const isRu = isRussian(ctx)
    // if (!userId) {
    //   await ctx.reply(isRu ? ERROR_MESSAGES.USER_ID_RU : ERROR_MESSAGES.USER_ID_EN)
    //   return
    // }
    // await setAspectRatio(userId, aspect_ratio)
    // await ctx.reply(isRu ? SUCCESS_MESSAGES.SIZE_CHANGED_RU(aspect_ratio) : SUCCESS_MESSAGES.SIZE_CHANGED_EN(aspect_ratio))
    // return
  } catch (error) {
    console.error("Error in aspect ratio handler:", error)
    throw error
  }
}
