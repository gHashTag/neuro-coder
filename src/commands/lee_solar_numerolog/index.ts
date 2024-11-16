import { MyContext } from "../../utils/types"
import { generateImage } from "../../helpers"
import { Conversation } from "@grammyjs/conversations"
import { InlineKeyboard } from "grammy"
import { generateMoreImagesButtons } from "../../helpers/buttonHandlers"

const leeSolarNumerolog = async (conversation: Conversation<MyContext>, ctx: MyContext): Promise<void> => {
  const isRu = ctx.from?.language_code === "ru"
  const keyboard = new InlineKeyboard().text(isRu ? "Отменить генерацию" : "Cancel generation", "cancel")
  const model_type = "lee_solar"

  await ctx.reply(isRu ? "Генерация изображения началась..." : "Image generation started...", { reply_markup: keyboard })

  const prompt = `hyper realistic illustrations, 3D renders. This is a digital painting in a fantasy style, featuring a mystical scene. At the center is a woman with long, flowing hair, wearing a sheer, ethereal gown that blends seamlessly with the surrounding environment. She sits on a cloud-like surface, her back slightly arched, and her eyes closed as if in deep contemplation or meditation. Surrounding her is an array of magical symbols and numbers, including the numbers 1, 2, 3, 4, 5, 6, 7, 8 and 9 in glowing, neon colors. These symbols are floating and swirling around her, creating a sense of cosmic energy and divination.
The background is a swirling mix of deep blues, purples, and oranges, with stars and galaxies scattered throughout, enhancing the ethereal atmosphere. There is a large, glowing circular symbol in the background, resembling an astrological chart or a mandala, with intricate details and numbers. To the left of the woman, there is a small table with a glowing candle, and a book with a golden cover, both adding to the mystical ambiance.
The overall texture is smooth and soft, with a blend of light and shadow that creates depth and dimension. The image exudes a sense of mystery, spirituality, and cosmic connection.
Cinematic Lighting, ethereal light, intricate details, extremely detailed, incredible details, full colored, complex details, insanely detailed and intricate, hypermaximalist, extremely detailed with rich colors. masterpiece, best quality, aerial view, HDR, UHD, unreal engine. plump looking at the camera, smooth thighs, (glittery jewelry) ((acrylic illustration, by artgerm, by kawacy, by John Singer Sargenti) dark Fantasy background, glittery jewelry, Representative, fair skin, beautiful face, Rich in details High quality, gorgeous, glamorous, 8k, super detail, gorgeous light and shadow, detailed decoration, detailed lines`

  if (!ctx.from?.id.toString()) {
    await ctx.reply("Произошла ошибка при генерации изображения. Пожалуйста, попробуйте снова.")
    return
  }

  const { image, prompt_id } = await generateImage(prompt, model_type, ctx.from?.id.toString(), ctx)

  await ctx.replyWithPhoto(image)

  await generateMoreImagesButtons(ctx, prompt_id)
}

export default leeSolarNumerolog
