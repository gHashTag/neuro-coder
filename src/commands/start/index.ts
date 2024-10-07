import { InputFile } from "grammy";
import { MyContext } from "../../utils/types";

async function start(ctx: MyContext) {
  const photoPath = "assets/neurocoder/neurocoder.png";
  const isRu = ctx.from?.language_code === "ru";

  const captionRu =
    "👋 Привет!\n" +
    "Я Дмитрий НейроКодер, создатель этого бота, и я здесь, чтобы помочь вам освоить создание нейроботов и автоворонок для Telegram и ВКонтакте, а также продвинуть вашу личность или бренд в социальных медиа через создание вирусного контента 🚀\n\n" +
    "Чем могу помочь вам сегодня?\n" +
    "- Узнать о наших курсах и тарифах\n" +
    "- Записаться на бесплатный урок\n" +
    "- Получить информацию о текущих акциях и скидках\n" +
    "- Задать вопрос о создании ботов\n\n" +
    "Просто выберите нужный пункт или напишите свой вопрос, и я с радостью помогу вам! 🤖\n\n" +
    '<a href="https://www.instagram.com/neuro_coder">Instagram</a> | <a href="https://www.youtube.com/@neuro_coder_ai_bot">YouTube</a> | <a href="https://vk.com/neuro_coder">VK</a> | <a href="https://t.me/neuro_coder_ai">Channel</a> | <a href="http://t.me/neuro_coder_group">Group</a>';

  const captionEn =
    "👋 Hello!\n" +
    "I am Dmitry NeuroCoder, the creator of this bot, and I am here to help you master the creation of neurobots and sales funnels for Telegram and VKontakte, as well as promote your personality or brand on social media through the creation of viral content 🚀\n\n" +
    "How can I help you today?\n" +
    "- Learn about our courses and rates\n" +
    "- Sign up for a free lesson\n" +
    "- Get information about current promotions and discounts\n" +
    "- Ask a question about creating bots\n\n" +
    "Just choose the desired item or write your question, and I will be happy to help you! 🤖\n\n" +
    '<a href="https://www.instagram.com/neuro_coder">Instagram</a> | <a href="https://www.youtube.com/@neuro_coder_ai_bot">YouTube</a> | <a href="https://vk.com/neuro_coder">VK</a> | <a href="https://t.me/neuro_coder_ai">Channel</a> | <a href="http://t.me/neuro_coder_group">Group</a>';

  await ctx.replyWithPhoto(new InputFile(photoPath), {
    caption: isRu ? captionRu : captionEn,
    parse_mode: "HTML",
    // reply_markup: keyboard,
  });
}

export { start };
