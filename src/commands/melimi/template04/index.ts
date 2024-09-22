import { Context, InputFile } from "grammy";

import ffmpeg from "fluent-ffmpeg";
import ffmpegInstaller from "@ffmpeg-installer/ffmpeg";
import path from "path";
import fs from "fs";
import { getSlides, makeTextLayers, overlayPhotoOnVideo, toShortVideo } from "../../helpers";

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

const template04 = async (ctx: Context): Promise<void> => {
  try {
    await ctx.reply("Video creation started");

    const inputFilePath = path.resolve(__dirname, "../assets/input/");
    const outputFilePath = path.resolve(__dirname, "../assets/output/");
    const photoTempPath = path.resolve(__dirname, "../assets/temp/photo");
    const logoPath = path.resolve(__dirname, "../assets/logo/");
    const tempFilePath = path.resolve(__dirname, "../assets/temp/video");
    const videoTxtPath = `${tempFilePath}/video.txt`;
    const folder = "blouses";

    try {
      await checkAccess(inputFilePath, fs.constants.R_OK); // Проверка прав на чтение
      await checkAccess(path.dirname(outputFilePath), fs.constants.W_OK); // Проверка прав на запись в директорию
      console.log("Access check passed");
    } catch (err) {
      console.error("Access check failed:", err);
      throw err;
    }

    const scenesCount = 4;
    const textJson = await getSlides({ prompt: "Напиши на русском языке текст для продажи школьных блузок", scenesCount });
    console.log(textJson.scenes);

    for (let i = 0; i < scenesCount; i++) {
      const scene = textJson.scenes[i];
      console.log(`scene ${i}:`, scene);
      await makeTextLayers(scene.onscreenText, `${photoTempPath}/photo${i}.png`, false, `${logoPath}/01.png`);
    }

    await fs.promises.writeFile(videoTxtPath, "", "utf8");
    for (let i = 0; i < scenesCount; i++) {
      await toShortVideo(`${inputFilePath}/${folder}/${i}.mp4`, `${tempFilePath}/video${i}.mp4`);
      await overlayPhotoOnVideo(`${tempFilePath}/video${i}.mp4`, `${photoTempPath}/photo${i}.png`, `${tempFilePath}/scene${i}.mp4`);
      const videoFilePath = `${tempFilePath}/scene${i}.mp4`;
      const videoEntry = `file '${videoFilePath}'\n`;

      await fs.promises.appendFile(videoTxtPath, videoEntry, "utf8");
    }
    await new Promise<void>((resolve, reject) => {
      ffmpeg()
        .input(`${tempFilePath}/video.txt`)
        .output(`${outputFilePath}/video.mp4`)
        .inputOptions(["-f concat", "-safe 0"])
        .outputOptions(["-c copy"])
        .on("end", () => {
          console.log("Merging video complete!");
          // Добавляем проверку длительности склеенного видео
          ffmpeg.ffprobe(`${outputFilePath}/video.mp4`, (err, metadata) => {
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

    const randomAudioIndex = Math.floor(Math.random() * 13); // Генерируем случайное число от 0 до 12
    const audioFilePath = path.resolve(__dirname, `../assets/audio/${randomAudioIndex}.mp3`);

    await new Promise<void>((resolve, reject) => {
      ffmpeg()
        .input(`${outputFilePath}/video.mp4`)
        .input(audioFilePath)
        .outputOptions(["-c:v copy", "-c:a aac", "-strict experimental", "-shortest"])
        .output(`${outputFilePath}/final_video.mp4`)
        .on("end", () => {
          console.log("Audio added to video successfully!");
          resolve();
        })
        .on("error", (err) => {
          console.error("Error adding audio to video:", err);
          reject(err);
        })
        .run();
    });

    await ctx.replyWithVideo(new InputFile(`${outputFilePath}/final_video.mp4`));
    await ctx.replyWithVideo(new InputFile(`${outputFilePath}/video.mp4`));
    await ctx.reply("Video creation finished");
    return;
  } catch (error) {
    // В случае ошибки, пробрасываем её дальше
    throw error;
  }
};

export default template04;
