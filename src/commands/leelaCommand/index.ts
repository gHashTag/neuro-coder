import { Context } from "telegraf"

import ffmpeg from "fluent-ffmpeg"
import ffmpegInstaller from "@ffmpeg-installer/ffmpeg"
import { promises as fs } from "fs"
import path from "path"
import { createSlideshow, generateImagesForMeditation, getMeditationSteps } from "../../helpers"

ffmpeg.setFfmpegPath(ffmpegInstaller.path)

const leelaCommand = async (ctx: Context): Promise<void> => {
  try {
    // Отправляем уведомление пользователю, что бот печатает
    await ctx.sendChatAction("typing")

    // Проверяем, есть ли информация о пользователе
    if (!ctx.from) throw new Error("User not found")

    // Получаем шаги медитации
    const meditationSteps = await getMeditationSteps({
      prompt: `Create 4 coherent steps with very short one-sentence abstracts on the topic of meditation with the addition of selling Leela Chakra Ai application, where the third step must mention Leela Chakra Ai. Answer in json format. The structure should be as follows:
    
              {
                "activities": [
                  {
                    "activity": "Meditation for Inner Peace",
                    "description": "A journey to tranquility and cellular rejuvenation.",
                    "steps": [
                      {
                        "step": "Step 1",
                        "details": "One-sentence description of step 1."
                      },
                      {
                        "step": "Step 2",
                        "details": "One-sentence description of step 2."
                      },
                      {
                        "step": "Step 3",
                        "details": "One-sentence description mentioning Leela Chakra game."
                      },
                      {
                        "step": "Step 4",
                        "details": "One-sentence description of step 4."
                      }
                    ]
                  }
                ]
              }
    
              Ensure that the steps are coherent and flow logically from one to the next, incorporating the Leela Chakra supplement naturally into the meditation process.`,
    })
    console.log(meditationSteps, "meditationSteps")

    // Генерируем изображения для шагов медитации
    const images = await generateImagesForMeditation(meditationSteps.activities[0].steps, "en")
    console.log(images, "images")

    // Проверяем, были ли сгенерированы изображения
    if (images.length === 0) throw new Error("No images found")

    // Создаем группу медиа для отправки изображений
    // const mediaGroup: InputMediaPhoto[] = images.map((image) => ({
    //   type: "photo",
    //   media: new InputFile(image.imagePath),
    //   caption: image.text,
    // }))

    // Отправляем группу изображений пользователю
    // await ctx.replyWithMediaGroup(mediaGroup)

    // Получаем пути к изображениям
    const imagePaths = images.map((img) => img.imagePath)
    // Определяем путь для выходного видеофайла
    const outputPath = path.join(process.cwd(), "src", "images", "slideshow.mp4")

    // Создаем слайд-шоу из изображений
    await createSlideshow(imagePaths, "src/audio/audio.mp3", outputPath)

    // Ждем 1 секунду после создания слайд-шоу
    await new Promise((resolve) => setTimeout(resolve, 1000))

    // Отправляем видео пользователю
    // await ctx.replyWithVideo(new InputFile(outputPath), {
    //   caption: "Video meditation",
    // })

    // Удаляем временные файлы
    await fs.unlink(outputPath)
    for (const image of images) {
      await fs.unlink(image.imagePath)
    }
  } catch (error) {
    // В случае ошибки, пробрасываем её дальше
    throw error
  }
}

export { leelaCommand }
// async function testSlideshow() {
//   const imageDir = path.join(process.cwd(), "src", "images");
//   const images = [
//     path.join(imageDir, "slide-Step 1.png"),
//     path.join(imageDir, "slide-Step 2.png"),
//     path.join(imageDir, "slide-Step 3.png"),
//     path.join(imageDir, "slide-Step 4.png"),
//   ];
//   const outputPath = path.join(imageDir, "test-slideshow.mp4");

//   try {
//     console.log("Starting slideshow creation...");
//     await createSlideshow(images, "src/audio/audio.mp3", outputPath);
//     console.log(`Slideshow created successfully at: ${outputPath}`);
//   } catch (error) {
//     console.error("Error creating slideshow:", error);
//   }
// }

// testSlideshow();
