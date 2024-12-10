import { MyContext } from "../utils/types"
import { generateImage } from "./index"

export const generateImages = async (ctx: MyContext, text: string, modelType: string, count: number) => {
  const images: string[] = []
  if (!ctx.from?.id) {
    await ctx.reply("Произошла ошибка при генерации изображения. Пожалуйста, попробуйте снова.")
    return
  }
  for (let i = 0; i < count; i++) {
    const { image } = await generateImage(text, modelType, ctx.from?.id.toString(), ctx)
    const imageStr = Buffer.isBuffer(image) ? `data:image/jpeg;base64,${image.toString("base64")}` : image.toString()
    images.push(imageStr)
  }
  return images
}
