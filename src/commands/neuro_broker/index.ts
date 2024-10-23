import { Context, InputFile } from "grammy"
import { createSlideshow as createSlideshowVideo, SlideshowOptions } from "slideshow-video"

import {
  createAudioFileFromText,
  createRender,
  delay,
  deleteFileFromSupabase,
  generateImageNeuroBroker,
  generateImagesForNeuroBroker,
  getAudioDuration,
  getMeditationSteps,
  getSellVillaSteps,
  mergeAudioFiles,
  translateText,
} from "../helpers"
import { Step } from "src/utils/types"
import { InputMediaPhoto } from "grammy/types"
import { getVideoUrl, uploadVideo } from "../../core/supabase/video"
import path from "path"
import fs from "fs"
import {
  bathroomDescription,
  bedroomDescription,
  description,
  diningRoomDescription,
  kitchenDescription,
  livingRoomDescription,
  location,
  officeDescription,
  outdoorDescription,
  stepsData,
  triggerWord,
  type,
} from "./mock"
import { setHistory } from "../../core/supabase/ai"

interface SlideshowResponse {
  filePath: string
  numberTrack: number
}

const createReels = async (ctx: Context): Promise<void> => {
  try {
    // Отправляем уведомление пользователю, что бот печатает
    await ctx.replyWithChatAction("typing")

    // Проверяем, есть ли информация о пользователе
    if (!ctx.from) throw new Error("User not found")

    // // Получаем шаги медитации
    const sellVillaSteps = await getSellVillaSteps({
      prompt: `Create a viral creative description for Instagram reels in one paragraph 40 seconds long without numbers. Always answer with letters, without using numbers. Create a creative sales description every time. Create 7 coherent steps with very short one-sentence abstracts on the topic of creating a short video script to sell a luxury ${type}. Every description should be trigger word ${triggerWord}. Answer in json format. The structure should be as follows:
    
            {
              "activities": [
                {
                  "activity": "Creating a short video script to sell a luxury ${type} in location: ${location}",
                  "description": ${description},
                  "steps": [
                    {
                      "step": "Step 1",
                      "details": ${outdoorDescription},
                    },
                    {
                      "step": "Step 2",
                      "details": ${kitchenDescription},
                    },
                    {
                      "step": "Step 3",
                      "details": ${bedroomDescription},
                    },
                    {
                      "step": "Step 4",
                      "details": ${bathroomDescription},
                    },
                    {
                      "step": "Step 5",
                      "details": ${livingRoomDescription},
                    },
                    {
                      "step": "Step 6",
                      "details": ${officeDescription},
                    },
                    {
                      "step": "Step 7",
                      "details": ${diningRoomDescription},
                    }
                  ]
                }
              ]
            }
    
            Ensure that the steps are coherent and flow logically from one to the next, creating an engaging narrative for the video.`,
      location,
      type,
    })

    console.log(sellVillaSteps, "sellVillaSteps")

    const stepsData: Step[] = await Promise.all(
      sellVillaSteps.activities[0].steps.map(async (step: { step: string; details: string }, index: number) => ({
        step: `Step ${index + 1}`,
        details: {
          en: step.details,
        },
        voiceOver: {
          en: `${sellVillaSteps.activities[0].description} Write the word ${triggerWord} and get access directly to the developer.`,
          ru: await translateText(
            `${sellVillaSteps.activities[0].description} Напишите комментарий слово ${triggerWord} и получите доступ напрямую к застройщику.`,
            "ru",
          ),
          zh: await translateText(`${sellVillaSteps.activities[0].description} 寫下單字 ${triggerWord} 並獲得開發人員的存取權。`, "zh"),
          ar: await translateText(`${sellVillaSteps.activities[0].description} اكتب الكلمة ${triggerWord} واحصل على وصول مباشر إلى المطور.`, "ar"),
        },
      })),
    )
    console.log(JSON.stringify(stepsData, null, 2), "stepsData")

    const englishImages = await generateImagesForNeuroBroker(stepsData, "en", false)
    console.log(englishImages, "englishImages")

    // const ownerImage = await generateImageNeuroBroker(
    //   "Photograph, man, model pose, minimalist, beard, profound gaze, solid white environment, studio lights setting",
    // );

    const newArray = [...englishImages]

    const mediaGroup: InputMediaPhoto[] = newArray.map((image) => ({
      type: "photo",
      media: new InputFile(image.imagePath),
      caption: image.text,
    }))
    // Отправляем группу изображений пользователю
    await ctx.replyWithMediaGroup(mediaGroup)

    const images = newArray.map((img) => img.imagePath)

    const languages = ["en", "ru", "zh", "ar"]
    for (const lang of languages) {
      const voiceOver = stepsData[0].voiceOver[lang]
      const audioFile1 = `../audio/audio${3}.mp3`
      const audioStream2 = await createAudioFileFromText({ text: voiceOver, voice_id: "PVKVligmzACf89A0Cegd" })
      const audioPath = path.join(__dirname, `../${audioStream2}`)
      const audioDuration = await getAudioDuration(audioPath)
      const numberOfImages = newArray.length
      const imageDuration = audioDuration / numberOfImages
      const mergedAudioFile = `src/audio/mergedAudioFile_${lang}.mp3`

      await mergeAudioFiles(audioFile1, audioStream2, mergedAudioFile)
      const options: SlideshowOptions = {
        imageOptions: {
          imageDuration: imageDuration * 1000,
        },
        ffmpegOptions: {
          streamCopyAudio: true,
        },
        outputOptions: {
          outputDir: "src/videos",
        },
      }

      const videoOutput: Partial<SlideshowResponse> = await createSlideshowVideo(images, mergedAudioFile, options)

      try {
        if (videoOutput && videoOutput.filePath) {
          console.log("File path:", videoOutput.filePath)

          if (!ctx.from) throw new Error("No user")
          const fileName = `${ctx.from.id}_${Date.now()}.mp4`
          await uploadVideo(videoOutput.filePath, ctx.from.id.toString(), "neuro_broker", fileName)
          const videoUrl = await getVideoUrl("neuro_broker", fileName)

          if (!videoUrl) throw new Error("No video url")
          if (lang !== "zh" && lang !== "ar") {
            const render = await createRender({ template_id: "10f7cf9f-9c44-479b-ad65-ea8b9242ccb1", modifications: { "Video-1": videoUrl } })
            console.log(render, "render")
            await ctx.replyWithVideo(render[0].url, {
              caption: `Video ${lang.toUpperCase()} NeuroBroker`,
            })
            await setHistory({
              brand: "neuro_broker",
              response: `Video ${lang.toUpperCase()} NeuroBroker`,
              video_url: render[0].url,
              command: "neuro_broker",
              type: "video",
              voice_id: "PVKVligmzACf89A0Cegd",
              chat_id: ctx.from.id.toString(),
              lang: lang,
              trigger: triggerWord,
            })
            await deleteFileFromSupabase("neuro_broker", fileName)
          } else {
            await ctx.replyWithVideo(new InputFile(videoOutput.filePath), {
              caption: `Video ${lang.toUpperCase()} NeuroBroker`,
            })
            await setHistory({
              brand: "neuro_broker",
              response: `Video ${lang.toUpperCase()} NeuroBroker`,
              video_url: videoUrl,
              command: "neuro_broker",
              type: "video",
              voice_id: "PVKVligmzACf89A0Cegd",
              chat_id: ctx.from.id.toString(),
              lang: lang,
              trigger: triggerWord,
            })
          }
          // return;
        } else {
          console.error("File path is undefined. Please check the input parameters and ensure the video was created successfully.")
        }
      } catch (error) {
        console.error("Error creating slideshow video:", error)
      } finally {
        // Путь к директории, содержимое которой нужно удалить
        const directory = path.join(__dirname, "../../videos")
        const audio = path.join(__dirname, `../../audio/ledov`)

        // Проверяем, существует ли директория
        if (fs.existsSync(directory) && fs.existsSync(audio)) {
          // Читаем содержимое директории
          const files = fs.readdirSync(directory)
          const audioFiles = fs.readdirSync(audio)

          // Удаляем каждый файл и поддиректорию
          for (const file of files) {
            const filePath = path.join(directory, file)
            const stat = fs.lstatSync(filePath)

            if (stat.isDirectory()) {
              // Если это директория, удаляем ее рекурсивно
              fs.rmSync(filePath, { recursive: true, force: true })
            } else {
              // Если это файл, удаляем его
              fs.unlinkSync(filePath)
            }
          }

          for (const file of audioFiles) {
            const filePath = path.join(audio, file)
            fs.unlinkSync(filePath)
          }

          console.log("Содержимое директории успешно удалено")
        } else {
          console.error("Директория не существует:", directory)
        }
      }
    }
  } catch (error) {
    // В случае ошибки, пробрасываем её дальше
    throw error
  }
}

const neuro_broker = async (ctx: Context): Promise<void> => {
  const count = 7
  for (let i = 0; i < count; i++) {
    await createReels(ctx)
  }
}

export default neuro_broker
