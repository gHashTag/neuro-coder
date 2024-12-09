import { MyContext } from "../../utils/types"

export async function buy(ctx: MyContext) {
  const isRu = ctx.from?.language_code === "ru"
  ctx.reply(
    isRu
      ? `<b>Цифровой аватар - 5645 ⭐️</b>
    Возможность генерировать 400 фото со своим лицом в Telegram-боте месяц

<b>НейроСтарт - 55 ⭐️ в месяц</b>
    Доступ к самообучению по нейросетям, GPT-4. Основы ИИ для повышения продуктивности.
    
<b>НейроБаза - 565 ⭐️ в месяц</b>
    Обучение нейросетям и языкам программирования (JavaScript, TypeScript, Python, React, React Native). Видеоуроки, текстовые материалы, отслеживание прогресса.
    
<b>НейроУченик - 5655 ⭐️ в месяц</b>
    Курс по созданию нейро-ботов в Телеграм и ВКонтакте. 4 онлайн урока, практические занятия, домашние задания, чат с куратором.
    
<b>НейроЭксперт - 16955 ⭐️ в месяц</b>
    Расширенный курс по созданию нейро-ботов. 12 вебинаров, углубленные практические занятия, персональная поддержка куратора, доступ к закрытому сообществу выпускников.`
      : `<b>Digital avatar for 5645 ⭐️</b>
      The ability to generate 400 photos with your face in the Telegram bot for a month

<b>NeuroStart - 55 ⭐️ per month</b>
    Access to self-learning on neural networks, GPT-4. AI basics for productivity enhancement.
    
<b>NeuroBase - 565 ⭐️ per month</b>
    Training in neural networks and programming languages (JavaScript, TypeScript, Python, React, React Native). Video tutorials, text materials, progress tracking.
    
<b>NeuroStudent - 5655 ⭐️ per month</b>
    Course on creating neuro-bots in Telegram and VKontakte. 4 online lessons, practical exercises, homework, chat with a curator.
    
<b>NeuroExpert - 16955 ⭐️ per month</b>
    Advanced course on creating neuro-bots. 12 webinars, in-depth practical exercises, personal curator support, access to a closed community of graduates.`,
    {
      reply_markup: {
        inline_keyboard: [
          [{ text: isRu ? "Цифровой аватар" : "Digital avatar", callback_data: "buy_avatar" }],
          [
            { text: isRu ? "НейроСтарт" : "NeuroStart", callback_data: "buy_start" },
            { text: isRu ? "НейроБаза" : "NeuroBase", callback_data: "buy_base" },
          ],
          [
            { text: isRu ? "НейроУченик" : "NeuroStudent", callback_data: "buy_student" },
            { text: isRu ? "НейроЭксперт" : "NeuroExpert", callback_data: "buy_expert" },
          ],
        ],
      },
      parse_mode: "HTML",
    },
  )
}
