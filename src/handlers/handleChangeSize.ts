import { isRussian } from "../utils/language"
import { ERROR_MESSAGES, SUCCESS_MESSAGES } from "../constants/messages"

// src/handlers/changeSize.ts
import { MyContextWithSession } from "../utils/types"
import { setAspectRatio } from "src/core/supabase/ai"

interface AspectRatioHandlerParams {
  ctx: MyContextWithSession
}

export async function handleChangeSize({ ctx }: AspectRatioHandlerParams) {
  try {
    if (!ctx.callbackQuery?.data) {
      throw new Error("No callback query data")
    }

    const size = ctx.callbackQuery.data.replace("size_", "")
    const userId = ctx.from?.id.toString()
    const isRu = isRussian(ctx)

    if (!userId) {
      await ctx.reply(isRu ? ERROR_MESSAGES.USER_ID_RU : ERROR_MESSAGES.USER_ID_EN)
      return
    }

    await setAspectRatio(userId, size)
    await ctx.reply(isRu ? SUCCESS_MESSAGES.SIZE_CHANGED_RU(size) : SUCCESS_MESSAGES.SIZE_CHANGED_EN(size))
  } catch (error) {
    console.error("Error in aspect ratio handler:", error)
    throw error
  }
}
