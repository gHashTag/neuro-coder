import { MyContext } from "../utils/types"
import { generateImage } from "./generateReplicateImage"

export const generateImages = async (ctx: MyContext, text: string, modelType: string, count: number): Promise<string[]> => {
  const images: string[] = []
  if (!ctx.from?.id) {
    await ctx.reply("Произошла ошибка при генерации изображения. Пожалуйста, попробуйте снова.")
    return []
  }
  for (let i = 0; i < count; i++) {
    const { image } = await generateImage(text, modelType, ctx.from?.id)
    const imageStr = Buffer.isBuffer(image) ? `data:image/jpeg;base64,${image.toString("base64")}` : image.toString()
    images.push(imageStr)
  }
  return images
}
