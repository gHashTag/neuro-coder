import { Context, InputFile } from "grammy";

import ffmpeg from "fluent-ffmpeg";
import ffmpegInstaller from "@ffmpeg-installer/ffmpeg";
import path from "path";
import fs from "fs";
import { generateVoice, getSlides, makeTextLayers, overlayPhotoOnVideo, toShortVideo } from "../../helpers";
import { getHistory, setHistory } from "../../../core/supabase/ai";
import { getVideoUrl, uploadVideo } from "../../../core/supabase/video";
import { createSlideshow } from "slideshow-video";

ffmpeg.setFfmpegPath(ffmpegInstaller.path);

const checkAccess = (filePath: string, mode: number) => {
  return new Promise<void>((resolve, reject) => {
    fs.access(filePath, mode, (err) => {
      if (err) {
        reject(err);
      } else {
        resolve();
      }
    });
  });
};

const neurocoder01 = async (ctx: Context): Promise<void> => {
  try {
    await ctx.reply("Video creation started");

    const inputFilePath = path.resolve(__dirname, "../assets/input/");
    const outputFilePath = path.resolve(__dirname, "../assets/output/");
    const photoTempPath = path.resolve(__dirname, "../assets/temp/photo");
    const tempFilePath = path.resolve(__dirname, "../assets/temp/video");
    const videoTxtPath = `${tempFilePath}/video.txt`;
    const folder = "news";
    const logoPath = path.resolve(__dirname, "../assets/logo");
    const scenesCount = 4;

    const images: string[] = [];

    try {
      await checkAccess(inputFilePath, fs.constants.R_OK); // Проверка прав на чтение
      await checkAccess(path.dirname(outputFilePath), fs.constants.W_OK); // Проверка прав на запись в директорию
      console.log("Access check passed");
    } catch (err) {
      console.error("Access check failed:", err);
      throw err;
    }
    // const history = await getHistory("neurocoder", "neurocoder01", "reels");
    const newsText = `🛍️ Шоппинг новой коллекции стал проще! 

Google представил инновационную функцию виртуальной примерки платьев с использованием ИИ. Теперь вы можете увидеть, как платье будет выглядеть на моделях, которые отражают ваш тип фигуры и размер, прежде чем сделать покупку. 

📸 Как это работает:
1. Найдите платья в Google и выберите те с меткой "примерка".
2. Выберите модель, подходящую под ваш тип тела.
3. Оцените платье с разных углов.

👗 Преимущества:
- Более личный и вовлекающий опыт шопинга.
- Уменьшение числа возвратов благодаря информированным решениям.
- Повышение осведомленности о бренде за счет привлечение клиентов.

С данным инструментом вы сможете шопиться с уверенностью! Попробуйте виртуальную примерку и найдите идеальное платье, которое вам подойдет! ✨ `;
    const slides = await getSlides({
      prompt: `НЕЛЬЗЯ СОЗДАВАТЬ БОЛЬШЕ СЦЕН ЧЕМ scenesCount, все сцены должны быть примерно одинакового объёма, не очень длинные. Весь текст должен читаться за 12 секунд, можно немного меньше, но не больше, убери перечисление чего-либо. Разбей данный новостной текст на сцены ${newsText}`,
      scenesCount: scenesCount,
      isDescription: false,
    });
    console.log(slides);

    const randomAudioIndex = Math.floor(Math.random() * 9);

    const audioFilePath = path.resolve(__dirname, `../assets/audio/${randomAudioIndex}.mp3`);

    await fs.promises.writeFile(videoTxtPath, "", "utf8");
    for (let i = 0; i < scenesCount; i++) {
      const scene = slides.scenes[i];
      await makeTextLayers(scene.onscreenText, `${photoTempPath}/photo${i}.png`, false, `${logoPath}/01.png`, "neurocoder", 100);
      const randomVideoIndex = Math.floor(Math.random() * 6);
      images.push(`${photoTempPath}/photo${i}.png`);
      await toShortVideo(`${inputFilePath}/${folder}/${randomVideoIndex}.mp4`, `${tempFilePath}/video${i}.mp4`);
      await overlayPhotoOnVideo(`${tempFilePath}/video${i}.mp4`, `${photoTempPath}/photo${i}.png`, `${tempFilePath}/scene${i}.mp4`);
      const videoFilePath = `${tempFilePath}/scene${i}.mp4`;
      const videoEntry = `file '${videoFilePath}'\n`;

      await fs.promises.appendFile(videoTxtPath, videoEntry, "utf8");
    }

    await new Promise<void>((resolve, reject) => {
      ffmpeg()
        .input(`${tempFilePath}/video.txt`)
        .output(`${tempFilePath}/merged_video.mp4`)
        .inputOptions(["-f concat", "-safe 0"])
        .outputOptions(["-c copy"])
        .on("end", () => {
          console.log("Merging video complete!");
          // Добавляем проверку длительности склеенного видео
          ffmpeg.ffprobe(`${tempFilePath}/merged_video.mp4`, (err, metadata) => {
            if (err) {
              console.error("Error getting video duration:", err);
            } else {
              console.log("Merged video duration:", metadata.format.duration, "seconds");
            }
          });
          resolve();
        })
        .on("error", (err) => {
          console.error("Error:", err);
          reject(err);
        })
        .on("progress", (progress) => {
          console.log("Progress:", Math.round(progress.percent || 0), "% done");
        })
        .run();
    });

    await new Promise<void>((resolve, reject) => {
      ffmpeg()
        .input(`${tempFilePath}/merged_video.mp4`)
        .input(audioFilePath)
        .outputOptions(["-c:v copy", "-c:a aac", "-strict experimental", "-shortest"])
        .output(`${outputFilePath}/final_video.mp4`)
        .on("end", () => {
          console.log("Audio added successfully!");
          resolve();
        })
        .on("error", (err, stdout, stderr) => {
          console.error("Error adding audio:", err);
          console.error("ffmpeg stdout:", stdout);
          console.error("ffmpeg stderr:", stderr);
          reject(err);
        })
        .on("progress", (progress) => {
          console.log("Progress:", Math.round(progress.percent || 0), "% done");
        })
        .run();
    });

    await ctx.replyWithVideo(new InputFile(`${outputFilePath}/final_video.mp4`), { caption: "audio" });
    await ctx.reply(newsText);
    if (!ctx.from) throw new Error("No user");
    // const fileName = `${ctx.from.id}_${Date.now()}_neurocoder01.mp4`;
    // await uploadVideo(`${outputFilePath}/final_video.mp4`, ctx.from.id.toString(), "neurocoder", fileName);
    // const videoUrl = await getVideoUrl("neurocoder", fileName);
    // if (!videoUrl) throw new Error("No video url");

    // const textToSpeach = slides.scenes.map((scene) => scene.text).join(" ");
    // const generateVoiceData = await generateVoice(textToSpeach, "bc4e1f5f-a480-4483-a3e5-4a62962a65e3");
    // await setHistory("neurocoder", slides.scenes[0].text, videoUrl, "neurocoder01", "reels", generateVoiceData.id, ctx.message?.chat.id.toString());
    await ctx.reply("Video creation finished");
    return;
  } catch (error) {
    // В случае ошибки, пробрасываем её дальше
    throw error;
  }
};

export default neurocoder01;
