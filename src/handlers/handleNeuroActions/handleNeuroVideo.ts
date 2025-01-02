import { getPrompt } from "../../core/supabase/ai"
import { MyContext } from "../../interfaces"

export async function handleNeuroVideo(ctx: MyContext, data: string, isRu: boolean) {
  try {
    if (!ctx || !ctx.from) {
      await ctx.reply(isRu ? "Ошибка идентификации пользователя" : "User identification error")
      return
    }
    // Обработка создания видео из нейро-изображения
    const promptId = data.replace("neuro_video_", "")
    const promptData = await getPrompt(promptId)

    if (!promptData) {
      await ctx.reply(isRu ? "Не удалось найти информацию о промпте" : "Could not find prompt information")
      return
    }

    await ctx.conversation.enter("imageToVideo")
  } catch (error) {
    console.error("Error starting video generation:", error)
    await ctx.reply(
      isRu
        ? "Произошла ошибка при запуске генерации видео. Пожалуйста, попробуйте позже."
        : "An error occurred while starting video generation. Please try again later.",
    )
  }
}
