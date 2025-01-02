import { getAinews } from "../../helpers"
import { MyContext } from "../../interfaces"

const createAinewsCommand = async (ctx: MyContext): Promise<void> => {
  try {
    const isRu = ctx.from?.language_code === "ru"
    await ctx.sendChatAction("typing")
    await ctx.reply(isRu ? "🎥 Привет! Введите текст, который вы хотите превратить в новость." : "🎥 Hello! Write a text you want to turn into a news.", {
      reply_markup: { force_reply: true },
    })
    // Проверяем, есть ли информация о пользователе
    if (!ctx.from) throw new Error("User not found")

    const msg = await ctx.wait()

    const caption = await getAinews({
      prompt: msg.message?.text || "",
    })
    await ctx.reply(caption)

    // const stepsData: Step[] = await Promise.all(
    //   meditationSteps.activities[0].steps.map(async (step, index) => ({
    //     step: `Step ${index + 1}`,
    //     details: {
    //       en: step.details,
    //       es: await translateText(step.details, "es"),
    //     },
    //   })),
    // )
    // console.log(JSON.stringify(stepsData, null, 2), "stepsData")

    // // Генерация английской версии
    // const englishImages = await generateImagesForMeditation(stepsData, "en")
    // console.log(englishImages, "englishImages")

    // Создаем группу медиа для отправки изображений
    // const englishMediaGroup: InputMediaPhoto[] = englishImages.map((image) => ({
    //   type: "photo",
    //   media: new InputFile(image.imagePath),
    //   caption: image.text,
    // }))
    // // Отправляем группу изображений пользователю
    // await ctx.replyWithMediaGroup(englishMediaGroup)

    // const numberTrack = 10

    // const englishOutputPath = await createSlideshow(
    //   englishImages.map((img) => img.imagePath),
    //   `src/audio/audio${numberTrack}.mp3`,
    //   "output_en.mp4",
    // )
    // console.log(englishOutputPath, "englishOutputPath")
    // // Ждем 1 секунду после создания слайд-шоу
    // await new Promise((resolve) => setTimeout(resolve, 1000))

    // // Отправляем видео пользователю
    // await ctx.replyWithVideo(new InputFile(englishOutputPath), {
    //   caption: "Video EN meditation",
    // })

    // Генерация испанской версии
    // const spanishImages = await generateImagesForMeditation(stepsData, "es")

    // // Создаем группу медиа для отправки изображений
    // const spanishMediaGroup: InputMediaPhoto[] = spanishImages.map((image) => ({
    //   type: "photo",
    //   media: new InputFile(image.imagePath),
    //   caption: image.text,
    // }))

    // await ctx.replyWithMediaGroup(spanishMediaGroup)

    // const spanishOutputPath = await createSlideshow(
    //   spanishImages.map((img) => img.imagePath),
    //   `src/audio/audio${numberTrack}.mp3`,
    //   "output_es.mp4",
    // )

    // // Ждем 1 секунду после создания слайд-шоу
    // await new Promise((resolve) => setTimeout(resolve, 1000))

    // await ctx.replyWithVideo(new InputFile(spanishOutputPath), {
    //   caption: "Video ES meditation",
    // })

    // Удаляем временные файлы
    // await fs.unlink(englishOutputPath)
    // await fs.unlink(spanishOutputPath)
    // for (const image of englishImages) {
    //   await fs.unlink(image.imagePath);
    // }
    // for (const image of spanishImages) {
    //   await fs.unlink(image.imagePath);
    // }
    return
  } catch (error) {
    // В случае ошибки, пробрасываем её дальше
    throw error
  }
}

export { createAinewsCommand }

// async function testSlideshow() {
//     const imageDir = path.join(process.cwd(), "src", "images");
//     const images = [
//         path.join(imageDir, "slide-Step 1.png"),
//         path.join(imageDir, "slide-Step 2.png"),
//         path.join(imageDir, "slide-Step 3.png"),
//         path.join(imageDir, "slide-Step 4.png"),
//     ];
//     const outputPath = path.join(imageDir, "test-slideshow.mp4");

//     try {
//         console.log("Starting slideshow creation...");
//         await createSlideshow(images, outputPath);
//         console.log(`Slideshow created successfully at: ${outputPath}`);
//     } catch (error) {
//         console.error("Error creating slideshow:", error);
//     }
// }

// testSlideshow();
