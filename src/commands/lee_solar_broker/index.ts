import { MyContext } from "../../utils/types"
import { generateImage } from "../../helpers"
import { Conversation } from "@grammyjs/conversations"
import { InlineKeyboard } from "grammy"
import { generateMoreImagesButtons } from "../../helpers/buttonHandlers"

const leeSolarBroker = async (conversation: Conversation<MyContext>, ctx: MyContext): Promise<void> => {
  const isRu = ctx.from?.language_code === "ru"
  const keyboard = new InlineKeyboard().text(isRu ? "Отменить генерацию" : "Cancel generation", "cancel")
  const model_type = "lee_solar"

  await ctx.reply(isRu ? "Генерация изображения началась..." : "Image generation started...", { reply_markup: keyboard })

  const prompt = `This is a high-resolution photograph capturing a woman walking outdoors, likely in a professional setting. The woman is at the center of the image, standing in front of a modern building with large glass windows and a beige stone facade. She has long, straight, light brown hair that frames her face. She is wearing a tailored navy blue suit with a white button-down shirt underneath, which adds a touch of elegance. The suit has a high-waisted, wide-leg pants style with a belt tied around the waist, creating a polished and professional look. She carries a large black leather handbag in her left hand, and her right hand is relaxed by her side.
In the background, several men in suits can be seen walking, some of whom are looking at the woman. One man in particular, positioned slightly behind her, is dressed in a dark suit with a white shirt and a blue tie, giving a formal appearance. The setting suggests a business event or a corporate environment, possibly a conference or a meeting. The lighting is natural, indicating that the photograph was taken during the day. The overall mood of the image is professional and confident, with a hint of formality. 
Cinematic Lighting, ethereal light, intricate details, extremely detailed, incredible details, full colored, complex details, insanely detailed and intricate, hypermaximalist, extremely detailed with rich colors. masterpiece, best quality, aerial view, HDR, UHD, unreal engine. plump looking at the camera, smooth thighs, (glittery jewelry) ((acrylic illustration, by artgerm, by kawacy, by John Singer Sargenti) dark Fantasy background, glittery jewelry, Representative, fair skin, beautiful face, Rich in details High quality, gorgeous, glamorous, 8k, super detail, gorgeous light and shadow, detailed decoration, detailed lines`

  if (!ctx.from?.id.toString()) {
    await ctx.reply("Произошла ошибка при генерации изображения. Пожалуйста, попробуйте снова.")
    return
  }

  const { image, prompt_id } = await generateImage(prompt, model_type, ctx.from?.id.toString(), ctx)

  await ctx.replyWithPhoto(image)

  await generateMoreImagesButtons(ctx, prompt_id)
}

export default leeSolarBroker
