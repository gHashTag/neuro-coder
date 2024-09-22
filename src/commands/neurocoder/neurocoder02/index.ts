import { Context, InputFile } from "grammy";

import ffmpeg from "fluent-ffmpeg";
import ffmpegInstaller from "@ffmpeg-installer/ffmpeg";
import path from "path";
import fs from "fs";
import { generateVoice, getSlides, getSubtitles, makeTextLayers, overlayPhotoOnVideo, toShortVideo } from "../../helpers";
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

const neurocoder02 = async (ctx: Context): Promise<void> => {
  try {
    await ctx.reply("Video creation started");

    const inputFilePath = path.resolve(__dirname, "../assets/input/");
    const outputFilePath = path.resolve(__dirname, "../assets/output/");
    const photoTempPath = path.resolve(__dirname, "../assets/temp/photo");
    const tempFilePath = path.resolve(__dirname, "../assets/temp/video");
    const videoTxtPath = `${tempFilePath}/video.txt`;
    const folder = "news";
    const logoPath = path.resolve(__dirname, "../assets/logo");

    const images: string[] = [];

    try {
      await checkAccess(inputFilePath, fs.constants.R_OK); // Проверка прав на чтение
      await checkAccess(path.dirname(outputFilePath), fs.constants.W_OK); // Проверка прав на запись в директорию
      console.log("Access check passed");
    } catch (err) {
      console.error("Access check failed:", err);
      throw err;
    }

    let videoDuration = 0;
    await new Promise<void>((resolve, reject) => {
      // Добавляем проверку длительности склеенного видео
      ffmpeg.ffprobe(`${tempFilePath}/merged_video.mp4`, (err, metadata) => {
        if (err) {
          console.error("Error getting video duration:", err);
          reject(err);
        } else {
          videoDuration = metadata.format.duration || 0;
          console.log("Merged video duration:", metadata.format.duration, "seconds");
          resolve();
        }
      });
      resolve();
    });

    const theme = `<b>Как искусственный интеллект улучшает нашу жизнь?</b>
Искусственный интеллект оказывает значительное влияние на различные отрасли и улучшает нашу жизнь. В сфере финансов, алгоритмы ИИ предсказывают рыночные тенденции и помогают инвесторам принимать обоснованные решения, снижая риски. В ритейле, ИИ анализирует покупательское поведение для предложения персонализированных рекомендаций, тем самым улучшая клиентский опыт и увеличивая продажи. В логистике, ИИ оптимизирует маршруты доставки, сокращая время и уменьшая экологический след. Эти примеры — лишь верхушка айсберга потенциала ИИ, который продолжит трансформировать и другие области.`;
    const subtitles = await getSubtitles(`Не нужно писать весь текст, нужно в субтитрах писать лишь какой-то тезис: ${theme}`, videoDuration);
    const scenesCount = subtitles.subtitles.length;
    console.log(subtitles);
    const subtitlesFilePath = path.resolve(__dirname, "./subtitles.srt");
    const subtitlesContent = subtitles.subtitles
      .map((subtitle: any, index: number) => {
        return `${index + 1}\n${subtitle.startTime} --> ${subtitle.endTime}\n${subtitle.text}\n`;
      })
      .join("\n");

    await fs.promises.writeFile(subtitlesFilePath, subtitlesContent, "utf8");
    console.log("Subtitles written to file:", subtitlesFilePath);

    const randomAudioIndex = Math.floor(Math.random() * 9);

    const audioFilePath = path.resolve(__dirname, `../assets/audio/${randomAudioIndex}.mp3`);

    await fs.promises.writeFile(videoTxtPath, "", "utf8");
    for (let i = 0; i < scenesCount; i++) {
      if (i === 0) {
        await makeTextLayers("", `${photoTempPath}/photo${i}.png`, false, `${logoPath}/01.png`, "", 100);
      } else {
        await makeTextLayers("", `${photoTempPath}/photo${i}.png`, false, `${logoPath}/01.png`, "", 100);
      }
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
        .input(`${tempFilePath}/merged_video.mp4`)
        .outputOptions([
          `-vf "subtitles=${subtitlesFilePath}"`, // Используем фильтр для наложения субтитров
          "-c:v libx264", // Кодек для видео
          "-c:a aac", // Кодек для аудио
          "-strict experimental", // Для поддержки кодека AAC
        ])
        .output(`${tempFilePath}/merged_video_with_hard_subtitles.mp4`)
        .on("end", () => {
          console.log("Хард-субтитры успешно добавлены!");
          resolve();
        })
        .on("error", (err) => {
          console.error("Ошибка:", err);
          reject(err);
        })
        .on("progress", (progress) => {
          console.log("Прогресс:", Math.round(progress.percent || 0), "% завершено");
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
    await ctx.reply(theme);
    if (!ctx.from) throw new Error("No user");
    // const fileName = `${ctx.from.id}_${Date.now()}.mp4`;
    // await uploadVideo(`${outputFilePath}/final_video.mp4`, ctx.from.id.toString(), "neurocoder", fileName);
    // const videoUrl = await getVideoUrl("neurocoder", fileName);
    // if (!videoUrl) throw new Error("No video url");

    // await setHistory("neurocoder", slides.scenes[0].text, videoUrl, "neurocoder02", "reels");
    await ctx.reply("Video creation finished");
    return;
  } catch (error) {
    // В случае ошибки, пробрасываем её дальше
    throw error;
  }
};

export default neurocoder02;
