import { Scenes } from "telegraf"
import { MyContext } from "../../interfaces"
import { getUserBalance, imageToPromptCost, sendBalanceMessage } from "../../helpers/telegramStars"
import { generateImageToPrompt } from "../../services/generateImageToPrompt"

if (!process.env.HUGGINGFACE_TOKEN) {
  throw new Error("HUGGINGFACE_TOKEN is not set")
}

export const imageToPromptWizard = new Scenes.WizardScene<MyContext>(
  "imageToPromptWizard",
  async (ctx) => {
    const isRu = ctx.from?.language_code === "ru"
    console.log("CASE: imageToPromptCommand")
    if (!ctx.from?.id) {
      await ctx.reply("User ID not found")
      return ctx.scene.leave()
    }

    const userId = ctx.from.id
    const currentBalance = await getUserBalance(userId)

    await sendBalanceMessage(currentBalance, imageToPromptCost, ctx, isRu)

    await ctx.reply(isRu ? "Пожалуйста, отправьте изображение для генерации промпта" : "Please send an image to generate a prompt")
    return ctx.wizard.next()
  },
  async (ctx) => {
    const isRu = ctx.from?.language_code === "ru"
    console.log("Waiting for photo message...")
    const imageMsg = ctx.message

    if (!imageMsg || !("photo" in imageMsg) || !imageMsg.photo) {
      console.log("No photo in message")
      await ctx.reply(isRu ? "Пожалуйста, отправьте изображение" : "Please send an image")
      return ctx.scene.leave()
    }

    await ctx.reply(isRu ? "⏳ Генерирую промпт..." : "⏳ Generating prompt...")

    const photoSize = imageMsg.photo[imageMsg.photo.length - 1]
    console.log("Getting file info for photo:", photoSize.file_id)
    const file = await ctx.telegram.getFile(photoSize.file_id)
    ctx.session.mode = "image_to_prompt"
    const imageUrl = `https://api.telegram.org/file/bot${process.env.BOT_TOKEN}/${file.file_path}`
    if (ctx.from) {
      await generateImageToPrompt(imageUrl, ctx.from.id, ctx, isRu)
    }
    return ctx.scene.leave()
  },
)

export default imageToPromptWizard
