import { Conversation } from "@grammyjs/conversations"
import { MyContext } from "../../utils/types"
import { InputFile } from "grammy"
import { generateImage } from "../../helpers/generateImage"

const leeSolarBroker = async (conversation: Conversation<MyContext>, ctx: MyContext) => {
  try {
    await ctx.reply("Введите дату рождения в формате DD.MM.YYYY:")
    const { message } = await conversation.wait()
    const text = message?.text

    if (!text) {
      await ctx.reply("Пожалуйста, введите дату рождения.")
      return
    }

    const model_type = "lee_solar_broker"
    const result = await generateImage(text, model_type, ctx.from?.id.toString() || "")

    if (!result) {
      throw new Error("Не удалось сгенерировать изображение")
    }

    const { image } = result
    if (Buffer.isBuffer(image)) {
      await ctx.replyWithPhoto(new InputFile(image))
    } else {
      await ctx.replyWithPhoto(image)
    }
  } catch (error) {
    console.error("Ошибка в leeSolarBroker:", error)
    await ctx.reply("Произошла ошибка при генерации изображения. Пожалуйста, попробуйте позже.")
  }
}

export default leeSolarBroker
