import { MyContext } from "../../utils/types"
import { Conversation } from "@grammyjs/conversations"

import { generateNeuroImage } from "../../helpers/generateNeuroImage"
import { models } from "../../core/replicate"

async function get100Conversation(conversation: Conversation<MyContext>, ctx: MyContext) {
  const model_type = models["neuro_coder"].key
  console.log(model_type)

  const message =
    "This is a high-resolution photograph of a bald, bearded man NEUROCODER with a stern expression, set against a brightly lit, modern background. The man's skin is a warm, medium brown tone, and his eyes are a striking blue. His face is adorned with intricate, teal tribal tattoos that extend from his forehead to his cheeks, and he has a small red dot on his forehead. He wears a richly detailed, teal-colored robe with gold embroidery and intricate patterns, which is draped over his shoulders. Around his neck hangs a large, ornate golden pendant with an intricate design, adding to his regal appearance. Behind him, there is a large, glowing, circular mandala pattern made up of blue light, which adds a magical and otherworldly element to the image. The forest background is blurred, with greenery and hints of sunlight filtering through the trees, creating a serene and mystical atmosphere. The overall color palette is dominated by blues and greens, with highlights of gold from the embroidery and the glowing pendant. The photograph exudes a sense of power and mysticism, blending elements of fantasy and nature. Cinematic Lighting, ethereal light, intricate details, extremely detailed, incredible details, full colored, complex details, insanely detailed and intricate, hypermaximalist, extremely detailed with rich colors. masterpiece, best quality, aerial view, HDR, UHD, unreal engine. plump looking at the camera, smooth thighs, (glittery jewelry) dark Fantasy background, glittery jewelry, Representative, fair skin, beautiful face, Rich in details High quality, gorgeous, glamorous, 8k, super detail, gorgeous light and shadow, detailed decoration, detailed lines"

  if (!message || !ctx.from?.id) return

  const generatingMessage = await ctx.reply("Генерация изображения началась...")

  if (!ctx?.chat?.id) {
    await ctx.reply("Ошибка при генерации ")
    return
  }

  await generateNeuroImage(message, model_type, ctx.from.id, ctx, 100)

  await ctx.api.deleteMessage(ctx.chat?.id || "", generatingMessage.message_id)
  return
}

export { get100Conversation }
