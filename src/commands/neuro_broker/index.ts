import { Context, InputFile } from "grammy";
import { createSlideshow as createSlideshowVideo, SlideshowOptions } from 'slideshow-video';

import { createAudioFileFromText, createRender, delay, deleteFileFromSupabase, generateImageNeuroBroker, generateImagesForNeuroBroker, getAudioDuration, getMeditationSteps, getSellVillaSteps, mergeAudioFiles, translateText } from "../helpers";
import { Step } from "src/utils/types";
import { InputMediaPhoto } from "grammy/types";
import { getVideoUrl, uploadVideo } from "../../core/supabase/video";
import path from "path";
import fs from "fs";
import { englishImages, stepsData } from "./mock";


interface SlideshowResponse {
  filePath: string;
  numberTrack: number;
}



const neuro_broker = async (ctx: Context): Promise<void> => {
  try {
    // Отправляем уведомление пользователю, что бот печатает
    await ctx.replyWithChatAction("typing");

    // Проверяем, есть ли информация о пользователе
    if (!ctx.from) throw new Error("User not found");
 
    // // Получаем шаги медитации
    // const sellVillaSteps = await getSellVillaSteps({
    //   prompt: `Create a viral description for Instagram reels in one paragraph 40 seconds long without numbers. Always answer with letters, without using numbers. Create 7 coherent steps with very short one-sentence abstracts on the topic of creating a short video script to sell a luxury ${type}. Every description should be trigger word ${triggerWord}. Answer in json format. The structure should be as follows:
    
    //         {
    //           "activities": [
    //             {
    //               "activity": "Creating a short video script to sell a luxury ${type} in location: ${location}",
    //               "description": ${description},
    //               "steps": [
    //                 {
    //                   "step": "Step 1",
    //                   "details": ${outdoorDescription},
    //                 },
    //                 {
    //                   "step": "Step 2",
    //                   "details": ${kitchenDescription},
    //                 },
    //                 {
    //                   "step": "Step 3",
    //                   "details": ${bedroomDescription},
    //                 },
    //                 {
    //                   "step": "Step 4",
    //                   "details": ${bathroomDescription},
    //                 },
    //                 {
    //                   "step": "Step 5",
    //                   "details": ${livingRoomDescription},
    //                 },
    //                 {
    //                   "step": "Step 6",
    //                   "details": ${officeDescription},
    //                 },
    //                 {
    //                   "step": "Step 7",
    //                   "details": ${diningRoomDescription},
    //                 }
    //               ]
    //             }
    //           ]
    //         }
    
    //         Ensure that the steps are coherent and flow logically from one to the next, creating an engaging narrative for the video.`,
    //         location,
    //         type
    //       });
    
    // console.log(sellVillaSteps, "sellVillaSteps");

    // const stepsData: Step[] = await Promise.all(
    //   sellVillaSteps.activities[0].steps.map(async (step: { step: string; details: string }, index: number) => ({
    //     step: `Step ${index + 1}`,
    //     details: {
    //       en: step.details,
    //     },
    //     voiceOver: {
    //       en: `${sellVillaSteps.activities[0].description} Write the word ${triggerWord} and get access directly to the developer.`,
    //       ru: await translateText(`${sellVillaSteps.activities[0].description} Напишите комментарий слово ${triggerWord} и получите доступ напрямую к застройщику.`, "ru"),
    //       zh: await translateText(`${sellVillaSteps.activities[0].description} 寫下單字 ${triggerWord} 並獲得開發人員的存取權。`, "zh"),
    //     },
    //   })),
    // );
    // console.log(JSON.stringify(stepsData, null, 2), "stepsData");

    // Генерация английской версии
    // const englishImages = await generateImagesForNeuroBroker(stepsData, "en", false);
    // console.log(englishImages, "englishImages");

    // const ownerImage = await generateImageNeuroBroker("Photograph, man, model pose, minimalist, beard, profound gaze, solid white environment, studio lights setting");
    // console.log(ownerImage, "ownerImage");

  
   
    const newArray = [...englishImages]
  

    const englishMediaGroup: InputMediaPhoto[] = newArray.map((image) => ({
      type: "photo",
      media: new InputFile(image.imagePath),
      caption: image.text,
    }));
    // Отправляем группу изображений пользователю
    await ctx.replyWithMediaGroup(englishMediaGroup);

    
    const images = newArray.map((img) => img.imagePath)
   

 const languages = ['en', 'ru', 'zh'];
  for (const lang of languages) {
    console.log(lang, 'lang')
    const voiceOver = stepsData[0].voiceOver[lang];
    console.log(voiceOver, 'voiceOver')
    const audioFile1 = `../audio/audio${1}.mp3`;
    const audioStream2 = await createAudioFileFromText(voiceOver)
    console.log(audioStream2, 'audioStream2')
    const audioPath = path.join(__dirname, `../${audioStream2}`);
    console.log(audioPath, 'audioPath')
    const audioDuration = await getAudioDuration(audioPath);
    console.log(audioDuration, 'audioDuration')
    console.log(`Длина аудио файла: ${audioDuration} секунд`);
    // Количество изображений в слайд-шоу
    const numberOfImages = newArray.length;
    const imageDuration = audioDuration / numberOfImages;
    console.log(`Длина изображения: ${imageDuration} секунд`);
    const mergedAudioFile = `src/audio/mergedAudioFile_${lang}.mp3`;
    await mergeAudioFiles(audioFile1, audioStream2, mergedAudioFile);
    const options: SlideshowOptions = {
      imageOptions: {
          imageDuration: imageDuration * 1000, 
      },
      ffmpegOptions: {
          streamCopyAudio: true
      },
      outputOptions: {
          outputDir: 'src/videos'
      }
    };
   

      const videoOutput: Partial<SlideshowResponse> = await createSlideshowVideo(
        images,
        mergedAudioFile,
        options
      );
      
      try {
        if (videoOutput && videoOutput.filePath) {
          console.log("File path:", videoOutput.filePath);
      
          if (!ctx.from) throw new Error("No user");
          const fileName = `${ctx.from.id}_${Date.now()}.mp4`;
          await uploadVideo(videoOutput.filePath, ctx.from.id.toString(), "neuro_broker", fileName);
          const videoUrl = await getVideoUrl("neuro_broker", fileName);
          
          if (!videoUrl) throw new Error("No video url");
          if (lang !== 'zh') {
            const render = await createRender({ template_id: "10f7cf9f-9c44-479b-ad65-ea8b9242ccb1", modifications: { "Video-1": videoUrl } });
            console.log(render, "render");
            await ctx.replyWithVideo(render[0].url, {
              caption: `Video ${lang.toUpperCase()} NeuroBroker`,
            });
            //await setHistory("neuro_broker", "Video EN NeuroBroker", videoUrl, "neuro_broker", "video");
            await deleteFileFromSupabase("neuro_broker", fileName);
        } else {
          await ctx.replyWithVideo(new InputFile(videoOutput.filePath), {
            caption: `Video ${lang.toUpperCase()} NeuroBroker`,
          });
        }
          // return;
        } else {
          console.error("File path is undefined. Please check the input parameters and ensure the video was created successfully.");
        }
      } catch (error) {
        console.error("Error creating slideshow video:", error);
      } finally {
        // Путь к директории, содержимое которой нужно удалить
        const directory = path.join(__dirname, '../../videos');
        const audio = path.join(__dirname, `../../audio/ledov`);

        // Проверяем, существует ли директория
        if (fs.existsSync(directory) && fs.existsSync(audio)) {
          // Читаем содержимое директории
          const files = fs.readdirSync(directory);
          const audioFiles = fs.readdirSync(audio);

          // Удаляем каждый файл и поддиректорию
          for (const file of files) {
            const filePath = path.join(directory, file);
            const stat = fs.lstatSync(filePath);

            if (stat.isDirectory()) {
              // Если это директория, удаляем ее рекурсивно
              fs.rmSync(filePath, { recursive: true, force: true });
            } else {
              // Если это файл, удаляем его
              fs.unlinkSync(filePath);
            }
          }

          for (const file of audioFiles) {
            const filePath = path.join(audio, file);
            fs.unlinkSync(filePath);
          }

          console.log('Содержимое директории успешно удалено');
      
        } else {
          console.error('Директория не существует:', directory);
        }
        return;
      }
  }
  } catch (error) {
    // В случае ошибки, пробрасываем её дальше
    throw error;
  }
};

export default neuro_broker;
