import { MyContext } from "../../utils/types"
import { InlineKeyboard } from "grammy"

export async function handleLevel1(ctx: MyContext) {
  const isRu = ctx.from?.language_code === "ru"

  await ctx.reply(
    isRu
      ? `🌟 Выберите свою модель ИИ! 🌟

Хотите, чтобы ваш бот стал еще умнее? \n🤖 С помощью команды /select_model вы можете выбрать модель ИИ, которая будет генерировать текст специально для вас! 🧠✨

🔍 Что это значит?
Модель ИИ — это как мозг компьютера, который помогает ему понимать и выполнять задачи. Выбор модели позволяет боту лучше справляться с вашими запросами и создавать более точные и интересные тексты.

💡 Как это работает?
1. Введите команду /select_model в нашем боте.
2. Выберите одну из доступных моделей.
3. Наслаждайтесь улучшенными текстами, созданными специально для вас!

📈 Преимущества:
Более точные и персонализированные тексты.
Возможность экспериментировать с разными стилями и подходами.
Улучшение взаимодействия с ботом.
`
      : `🌟 Select your AI model! 🌟

Want your bot to become even smarter? \n🤖 With the /select_model command, you can choose an AI model that will generate text specifically for you! 🧠✨

🔍 What does this mean?
An AI model is like a computer's brain that helps it understand and perform tasks. Choosing a model allows the bot to better handle your requests and create more accurate and interesting texts.

💡 How does it work?
1. Enter the /select_model command in our bot.
2. Choose one of the available models.
3. Enjoy improved texts created especially for you!

📈 Benefits:
More accurate and personalized texts.
Ability to experiment with different styles and approaches.
Improved interaction with the bot.`,
    {
      reply_markup: new InlineKeyboard().text(isRu ? "➡️ Далее" : "➡️ Next", "level_2"),
    },
  )
}

export async function handleLevel2(ctx: MyContext) {
  const isRu = ctx.from?.language_code === "ru"

  await ctx.reply(
    isRu
      ? `🎉 Пригласите друга и получите бонусы! 🎉

Хотите получить больше возможностей с нашим ботом? Теперь это проще простого! Используйте команду /invite, чтобы пригласить своих друзей и получить крутые бонусы! 🎁✨

🤝 Как это работает?
1. Введите команду /invite в нашем боте.
2. Поделитесь уникальной ссылкой с друзьями.
3. Получите бонусы, когда ваши друзья начнут использовать бота!

🎁 Что вы получите?
Дополнительные звезды для использования в боте.
Эксклюзивные функции и возможности.
Повышение уровня и доступ к новым функциям.

👥 Почему это здорово?
Делитесь полезным инструментом с друзьями.
Получайте награды за активность.
Расширяйте сообщество пользователей и открывайте новые горизонты вместе!`
      : `🎉 Invite friends and get bonuses! 🎉

Want to get more features with our bot? Now it's easier than ever! Use the /invite command to invite your friends and get cool bonuses! 🎁✨

🤝 How does it work?
1. Enter the /invite command in our bot.
2. Share a unique link with your friends.
3. Get bonuses when your friends start using the bot!

🎁 What do you get?
Additional stars for use in the bot.
Exclusive features and capabilities.
Level up and access to new features.

👥 Why is it great?
Share a useful tool with your friends.
Get rewards for activity.
Expand the user community and open new horizons together!`,
    {
      reply_markup: new InlineKeyboard().text(isRu ? "➡️ Далее" : "➡️ Next", "level_3"),
    },
  )
}

export async function handleLevel3(ctx: MyContext) {
  const isRu = ctx.from?.language_code === "ru"

  await ctx.reply(
    isRu
      ? `🖼️ Создайте изображение из текста! 🖼️

Вы когда-нибудь хотели увидеть, как ваши слова превращаются в изображения? С нашим ботом это возможно! 
Используйте команду /text_to_image, чтобы создать уникальные изображения из текстовых описаний! 🎨✨

📝 Как это работает?
1. Введите команду /text_to_image в нашем боте.
Опишите, что вы хотите увидеть.
3. Получите изображение, созданное на основе вашего описания!

🌟 Почему это круто?
Превратите свои идеи в визуальные шедевры.
Делитесь уникальными изображениями с друзьями.
Используйте изображения для вдохновения и творчества.

📸 Примеры использования:
Создайте обложку для своей книги.
Визуализируйте свои мечты и цели.
Поделитесь своими креативными идеями в социальных сетях.`
      : `🖼️ Create an image from text! 🖼️

Ever wanted to see your words turn into images? With our bot, it's possible! 
Use the /text_to_image command to create unique images from text descriptions! 🎨✨

📝 How does it work?
1. Enter the /text_to_image command in our bot.
Describe what you want to see.
3. Get an image created based on your description!

🌟 Why is it cool?
Turn your ideas into visual masterpieces.
Share unique images with your friends.
Use images for inspiration and creativity.

📸 Examples of use:
Create a cover for your book.
Visualize your dreams and goals.
Share your creative ideas on social media.`,
    {
      reply_markup: new InlineKeyboard().text(isRu ? "➡️ Далее" : "➡️ Next", "level_4"),
    },
  )
}

export async function handleLevel4(ctx: MyContext) {
  const isRu = ctx.from?.language_code === "ru"

  await ctx.reply(
    isRu
      ? `🔍 Получите описание из изображения! 🔍

Хотите узнать, как ваш бот может описать изображение? С помощью команды /image_to_prompt вы можете получить текстовое описание любого изображения! 🖼️✨

📷 Как это работает?
1. Введите команду /image_to_prompt в нашем боте.
2. Загрузите изображение, которое хотите описать.
3. Получите текстовое описание, созданное на основе изображения!

💡 Почему это полезно?
Узнайте больше о содержимом изображения.
Используйте описания для создания контента.
Делитесь интересными находками с друзьями.

🖌️ Примеры использования:
Создайте текстовые описания для своих фотографий.
Получите идеи для написания статей или постов.
Используйте описания для улучшения SEO вашего контента.`
      : `🔍 Get a description from an image! 🔍

Want to know how your bot can describe an image? With the /image_to_prompt command, you can get a text description of any image! �️✨

📷 How does it work?
1. Enter the /image_to_prompt command in our bot.
2. Upload the image you want to describe.
3. Get a text description created based on the image!

💡 Why is it useful?
Learn more about the content of the image.
Use descriptions to create content.
Share interesting discoveries with your friends.

🖌️ Examples of use:
Create text descriptions for your photos.
Get ideas for writing articles or posts.
Use descriptions to improve the SEO of your content.
      `,
    {
      reply_markup: new InlineKeyboard().text(isRu ? "➡️ Далее" : "➡️ Next", "level_5"),
    },
  )
}

export async function handleLevel5(ctx: MyContext) {
  const isRu = ctx.from?.language_code === "ru"

  await ctx.reply(
    isRu
      ? `📸 Обучите модель FLUX на своих фотографиях! 📸

Хотите, чтобы ваш бот стал еще умнее и персонализированным? С помощью команды /train_flux_model вы можете обучить модель FLUX на ваших собственных фотографиях! 🤖✨

🖼️ Как это работает?
1. Введите команду /train_flux_model в нашем боте.
2. Загрузите свои фотографии для обучения.
3. Получите персонализированную модель, которая понимает ваши уникальные особенности!

🔍 Почему это важно?
Создайте уникальную модель, которая понимает вас лучше.
Используйте модель для создания персонализированного контента.
Улучшите взаимодействие с ботом, сделав его более адаптированным к вашим нуждам.

💡 Примеры использования:
Используйте модель для анализа и улучшения фотографий.
Делитесь уникальными результатами с друзьями и семьей.`
      : `📸 Train the FLUX model on your photos! 📸

Want your bot to become even smarter and more personalized? With the /train_flux_model command, you can train the FLUX model on your own photos! 🤖✨

🖼️ How does it work?
1. Enter the /train_flux_model command in our bot.
2. Upload your photos for training.
3. Get a personalized model that understands your unique features!

🔍 Why is it important?
Use the model to create personalized content.
Improve interaction with the bot, making it more adapted to your needs.
💡 Examples of use:
Create personalized avatars or images.
Use the model for analysis and improvement of photos.
Share unique results with your friends and family.`,
    {
      reply_markup: new InlineKeyboard().text(isRu ? "➡️ Далее" : "➡️ Next", "level_6"),
    },
  )
  return
}

export async function handleLevel6(ctx: MyContext) {
  const isRu = ctx.from?.language_code === "ru"
  await ctx.reply(
    isRu
      ? `📷 Создайте фотореалистичные изображения с вашим лицом! 📷

После того как вы обучили модель с помощью команды /train_flux_model, вы можете перейти к созданию уникальных изображений с вашим лицом! Используйте команду /neuro_photo, чтобы воплотить свои идеи в жизнь! 🌟✨

🖌️ Как это работает?
1. Убедитесь, что вы обучили модель с помощью /train_flux_model.
2. Введите команду /neuro_photo в нашем боте.
3. Опишите, что вы хотите увидеть, и получите изображение с вашим лицом!

🎨 Почему это круто?
Создавайте персонализированные изображения, которые отражают вашу индивидуальность.
Делитесь уникальными изображениями с друзьями и семьей.
Используйте изображения для творчества и вдохновения.

💡 Примеры использования:
Создайте аватар для социальных сетей.
Визуализируйте свои мечты и цели с вашим участием.
Поделитесь своими креативными идеями в социальных сетях.`
      : `📷 Create photorealistic images with your face! 📷

Once you have trained the model with the /train_flux_model command, you can move on to creating unique images with your face! Use the /neuro_photo command to bring your ideas to life! 🌟✨

🖌️ How does it work?
1. Make sure you have trained the model with /train_flux_model.
2. Enter the /neuro_photo command in our bot.
3. Describe what you want to see and get an image with your face!

🎨 Why is it cool?
Create personalized images that reflect your personality.
Share unique images with friends and family.
Use images for creativity and inspiration.

💡 Use cases:
Create an avatar for social networks.
Visualize your dreams and goals with your participation.
Share your creative ideas on social media.`,
    {
      reply_markup: new InlineKeyboard().text(isRu ? "➡️ Далее" : "➡️ Next", "level_7"),
    },
  )
  return
}

export async function handleLevel7(ctx: MyContext) {
  const isRu = ctx.from?.language_code === "ru"
  await ctx.reply(
    isRu
      ? `🎥 Создайте видео из текста! 🎥

Хотите увидеть, как ваши слова оживают в виде видео? С помощью команды /text_to_video вы можете создавать удивительные видеоролики, которые воплощают ваши идеи в жизнь! 🌟✨

📝 Как это работает?
1. Введите команду /text_to_video в нашем боте.
2. Опишите, что вы хотите увидеть в видео.
3. Получите видеоролик, созданный на основе вашего описания!

🎬 Почему это круто?
Превратите свои идеи в динамичные видеоролики.
Делитесь уникальными видео с друзьями и семьей.
Используйте видео для вдохновения и творчества.

💡 Примеры использования:
Создайте трейлер для своей книги или проекта.
Визуализируйте свои мечты и цели в формате видео.
Поделитесь своими креативными идеями в социальных сетях.`
      : `🎥 Create a video from text! 🎥

Once you have trained the model with the /train_flux_model command, you can move on to creating unique images with your face! Use the /neuro_photo command to bring your ideas to life! 🌟✨

🖌️ How does it work?
1. Make sure you have trained the model with /train_flux_model.
2. Enter the /neuro_photo command in our bot.
3. Describe what you want to see and get an image with your face!

🎨 Why is it cool?
Create personalized images that reflect your personality.
Share unique images with friends and family.
Use images for creativity and inspiration.

💡 Use cases:
Create an avatar for social networks.
Visualize your dreams and goals with your participation.
Share your creative ideas on social media.`,
    {
      reply_markup: new InlineKeyboard().text(isRu ? "➡️ Далее" : "➡️ Next", "level_8"),
    },
  )
  return
}

export async function handleLevel8(ctx: MyContext) {
  const isRu = ctx.from?.language_code === "ru"
  await ctx.reply(
    isRu
      ? `🎥 Преобразуйте изображение в видео с движением! 🎥
Хотите добавить динамики вашим фотографиям? С помощью команды /image_to_video вы можете превратить статические изображения в захватывающие видеоролики с движением! 🌟✨

🖼️ Как это работает?
1. Введите команду /image_to_video в нашем боте.
2. Загрузите изображение, которое хотите оживить.
3. Получите видеоролик, в котором ваше изображение оживает!

🎬 Почему это круто?
Превратите свои фотографии в динамичные видеоролики.
Делитесь уникальными видео с друзьями и семьей.
Используйте видео для творчества и вдохновения.

💡 Примеры использования:
Создайте анимацию для своих социальных сетей.
Визуализируйте свои идеи и проекты в формате видео.
Поделитесь своими креативными идеями в социальных сетях.`
      : `🎥 Transform an image into a moving video! 🎥
Want to add some action to your photos? With the /image_to_video command, you can turn static images into exciting moving videos! 🌟✨

🖼️ How does it work?
1. Enter the /image_to_video command in our bot.
2. Upload the image you want to animate.
3. Get a video of your image coming to life!

🎬 Why is it cool?
Transform your photos into dynamic videos.
Share unique videos with friends and family.
Use videos for creativity and inspiration.

💡 Use cases:
Create animations for your social networks.
Visualize your ideas and projects in video format.
Share your creative ideas on social networks.`,
    {
      reply_markup: new InlineKeyboard().text(isRu ? "➡️ Далее" : "➡️ Next", "level_9"),
    },
  )
  return
}

export async function handleLevel9(ctx: MyContext) {
  const isRu = ctx.from?.language_code === "ru"
  await ctx.reply(
    isRu
      ? `🎬 Что такое B-roll?
B-roll — это дополнительный видеоматериал, который используется для улучшения основного видео. Он добавляет контекст, глубину и визуальный интерес к вашим проектам.

🖌️ Как это работает?
1. Введите команду /b_roll в нашем боте.
2. Опишите, какой видеоматериал вам нужен.
3. Получите B-roll видео, которое дополнит ваш проект!

💡 Почему это важно?
Улучшите качество своих видеопроектов.
Добавьте визуальный интерес и глубину к вашим историям.
Используйте B-roll для создания профессиональных презентаций.

📈 Примеры использования:
Создайте B-roll для вашего YouTube-канала.
Добавьте визуальные элементы к вашим бизнес-презентациям.
Поделитесь своими креативными идеями в социальных сетях.`
      : `🎥 What is B-roll?
B-roll is additional video material used to improve the main video. It adds context, depth, and visual interest to your projects.

🖌️ How does it work?
1. Enter the /b_roll command in our bot.
2. Describe what video material you need.
3. Get B-roll video that will complement your project!

💡 Why is it important?
Improve the quality of your video projects.
Add visual interest and depth to your stories.
Use B-roll to create professional presentations.

📈 Use cases:
Create B-roll for your YouTube channel.
Add visual elements to your business presentations.
Share your creative ideas on social networks.`,
    {
      reply_markup: new InlineKeyboard().text(isRu ? "➡️ Далее" : "➡️ Next", "level_10"),
    },
  )
  return
}

export async function handleLevel10(ctx: MyContext) {
  const isRu = ctx.from?.language_code === "ru"
  await ctx.reply(
    isRu
      ? `🎤 Синхронизируйте движение губ с аудио! 🎤

Хотите добавить реалистичности вашим видео? С помощью команды /lipsync вы можете синхронизировать движение губ с аудио, создавая впечатляющие видеоролики! 🌟✨

🗣️ Как это работает?
1. Введите команду /lipsync в нашем боте.
2. Загрузите аудиофайл, который хотите использовать.
3. Получите видео, где движение губ идеально совпадает с аудио!

🎬 Почему это круто?
Создавайте реалистичные и захватывающие видеоролики.
Делитесь уникальными видео с друзьями и семьей.
Используйте видео для творчества и вдохновения.

💡 Примеры использования:
Создайте музыкальное видео или караоке.
Визуализируйте подкасты или аудиокниги.
Поделитесь своими креативными идеями в социальных сетях.`
      : `🎤 Synchronize lip movement with audio! 🎤

Want to add realism to your videos? With the /lipsync command, you can synchronize lip movement with audio, creating impressive videos! 🌟✨

🗣️ How does it work?
1. Enter the /lipsync command in our bot.
2. Upload the audio file you want to use.
3. Get a video where the lip movement perfectly matches the audio!

🎬 Why is it cool?
Create realistic and captivating videos.
Share unique videos with friends and family.
Use videos for creativity and inspiration.

💡 Use cases:
Create a music video or karaoke.
Visualize podcasts or audiobooks.
Share your creative ideas on social media.`,
    {
      reply_markup: new InlineKeyboard().text(isRu ? "➡️ Далее" : "➡️ Next", "level_11"),
    },
  )
  return
}

export async function handleLevel11(ctx: MyContext) {
  const isRu = ctx.from?.language_code === "ru"
  await ctx.reply(
    isRu
      ? `🎬 Добавьте субтитры к вашему видео! 🎬
Хотите сделать ваше видео более доступным и понятным? С помощью команды /subtitles вы можете легко добавить субтитры к вашим видеороликам! 🌟✨

📝 Как это работает?
1. Введите команду /subtitles в нашем боте.
2. Загрузите видео и текст субтитров.
3. Получите видео с идеально синхронизированными субтитрами!

🎥 Почему это важно?
Сделайте ваше видео доступным для большего количества зрителей.
Улучшите понимание и восприятие вашего контента.
Используйте субтитры для обучения и презентаций.

💡 Примеры использования:
Добавьте субтитры к обучающим видео.
Создайте видео с переводом для международной аудитории.
Поделитесь своими креативными идеями в социальных сетях.`
      : `🎬 Add subtitles to your video! 🎬

Want to make your video more accessible and understandable? With the /subtitles command, you can easily add subtitles to your videos! 🌟✨

📝 How does it work?
1. Enter the /subtitles command in our bot.
2. Upload the video and subtitle text.
3. Get a video with perfectly synchronized subtitles!

🎥 Why is it important?
Make your video accessible to more viewers.
Improve understanding and perception of your content.
Use subtitles for learning and presentations.

💡 Use cases:
Add subtitles to educational videos.
Create a video with translation for an international audience.
Share your creative ideas on social media.`,
    {
      reply_markup: new InlineKeyboard().text(isRu ? "➡️ Далее" : "➡️ Next", "level_12"),
    },
  )
  return
}

export async function handleLevel12(ctx: MyContext) {
  const isRu = ctx.from?.language_code === "ru"
  await ctx.reply(
    isRu
      ? `🎤 Добавьте голос к вашему аватару! 🎤
Хотите, чтобы ваш аватар заговорил? С помощью команды /voice вы можете легко добавить голос к вашему аватару и сделать его более живым и выразительным! 🌟✨

🗣️ Как это работает?
1. Введите команду /voice в нашем боте.
2. Загрузите аудиофайл с голосом, который хотите использовать.
3. Получите аватар, который говорит вашим голосом!

🎧 Почему это круто?
Сделайте ваш аватар более персонализированным и уникальным.
Делитесь говорящими аватарами с друзьями и семьей.
Используйте аватары для презентаций и развлечений.

💡 Примеры использования:
Создайте анимацию с вашим аватаром для социальных сетей.
Озвучьте вашего аватара для видеопроектов.
Поделитесь своими креативными идеями в социальных сетях.`
      : `🎤 Add voice to your avatar! 🎤

Want your avatar to speak? With the /voice command, you can easily add voice to your avatar and make it more lively and expressive! 🌟✨

🗣️ How does it work?
1. Enter the /voice command in our bot.
2. Upload an audio file with the voice you want to use.
3. Get an avatar that speaks in your voice!

🎧 Why is it cool?
Make your avatar more personalized and unique.
Share talking avatars with friends and family.
Use avatars for presentations and entertainment.

💡 Use cases:
Create an animation with your avatar for social networks.
Voice your avatar for video projects.
Share your creative ideas on social media.`,
    {
      reply_markup: new InlineKeyboard().text(isRu ? "➡️ Далее" : "➡️ Next", "level_13"),
    },
  )
  return
}

export async function handleLevel13(ctx: MyContext) {
  const isRu = ctx.from?.language_code === "ru"
  await ctx.reply(
    isRu
      ? `🔊 Преобразуйте текст в речь! 🔊

Хотите услышать, как ваши слова оживают? С помощью команды /text_to_speech вы можете легко преобразовать текст в аудио и насладиться звучанием ваших идей! 🌟✨

🗣️ Как это работает?
1. Введите команду /text_to_speech в нашем боте.
2. Введите текст, который хотите озвучить.
3. Получите аудиофайл с вашим текстом, преобразованным в речь!

🎧 Почему это круто?
Слушайте свои заметки и идеи на ходу.
Делитесь аудиофайлами с друзьями и семьей.
Используйте аудио для презентаций и обучения.

💡 Примеры использования:
Создайте аудиокнигу из ваших текстов.
Озвучьте свои статьи или блоги.
Поделитесь своими креативными идеями в социальных сетях.`
      : `🔊 Convert text to speech! 🔊

Want to hear your words come to life? With the /text_to_speech command, you can easily convert text to audio and enjoy the sound of your ideas! 🌟✨

🗣️ How does it work?
1. Enter the /text_to_speech command in our bot.
2. Enter the text you want to voice.
3. Get an audio file with your text, converted to speech!

🎧 Why is it cool?
Listen to your notes and ideas on the go.
Share audio files with friends and family.
Use audio for presentations and learning.

💡 Use cases:
Create an audiobook from your texts.
Voice your articles or blogs.
Share your creative ideas on social media.`,
    {
      reply_markup: new InlineKeyboard().text(isRu ? "➡️ Далее" : "➡️ Next", "quest_complete"),
    },
  )
  return
}

export async function handleQuestComplete(ctx: MyContext) {
  const isRu = ctx.from?.language_code === "ru"

  await ctx.reply(
    isRu
      ? `🎉 НейроКвест завершен! 🎉

Вы успешно прошли все задания и достигли максимального уровня! 🌟✨

🎁 Вам доступны новые функции и возможности в нашем боте.

👥 Спасибо, что были с нами!

🍀 Удачи в прохождении! 🍀

💵 На вашем балансе 1 доллар. Используйте его, чтобы открыть новые возможности!`
      : `🎉 NeuroQuest completed! 🎉

You have successfully completed all tasks and reached the maximum level! 🌟✨

🎁 You have access to new features and capabilities in our bot.

👥 Thank you for being with us!

🍀 Good luck in the quest! 🍀

💵 You have $1 on your balance. Use it to unlock new features!`,
    {
      reply_markup: {
        inline_keyboard: [
          [
            {
              text: isRu ? "💎 Купить подписку" : "💎 Buy subscription",
              callback_data: "buy_subscription",
            },
          ],
        ],
      },
    },
  )
}

export async function handleQuestRules(ctx: MyContext) {
  const isRu = ctx.from?.language_code === "ru"

  await ctx.reply(
    isRu
      ? `📜 Правила НейроКвеста:

1. Выполняйте задания последовательно
2. За каждое выполненное задание вы получаете очки
3. Чем больше очков - тем выше ваш уровень
4. Некоторые задания имеют ограничение по времени
5. За особые достижения вы получаете бонусы

Удачи в прохождении! 🍀`
      : `📜 NeuroQuest Rules:

1. Complete tasks sequentially
2. You get points for each completed task
3. The more points - the higher your level
4. Some tasks have time limits
5. You get bonuses for special achievements

Good luck! 🍀`,
  )
}
