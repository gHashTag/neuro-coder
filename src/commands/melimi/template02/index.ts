import { Context, InputFile } from "grammy";

import ffmpeg from "fluent-ffmpeg";
import ffmpegInstaller from "@ffmpeg-installer/ffmpeg";
import path from "path";
import fs from "fs";
import { makePhotoOnPhoto, makeTextLayers, sizePhoto } from "../../helpers";
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

const template02 = async (ctx: Context): Promise<void> => {
  try {
    await ctx.reply("Video creation started");

    const inputFilePath = path.resolve(__dirname, "../assets/input/");
    const outputFilePath = path.resolve(__dirname, "../assets/output/");
    const photoTempPath = path.resolve(__dirname, "../assets/temp/photo");
    const logoPath = path.resolve(__dirname, "../assets/logo");
    const folder = "blouses";

    const images: string[] = [];
    try {
      await checkAccess(inputFilePath, fs.constants.R_OK); // Проверка прав на чтение
      await checkAccess(path.dirname(outputFilePath), fs.constants.W_OK); // Проверка прав на запись в директорию
      console.log("Access check passed");
    } catch (err) {
      console.error("Access check failed:", err);
      throw err;
    }

    const scenesCount = 4;

    for (let i = 0; i < scenesCount; i++) {
      await makeTextLayers("", `${photoTempPath}/photo${i}.png`, false, `${logoPath}/01.png`);
      await sizePhoto(`${inputFilePath}/${folder}/${i}.png`, `${photoTempPath}/size${i}.png`);
    }

    for (let i = 0; i < scenesCount; i++) {
      await makePhotoOnPhoto(`${photoTempPath}/size${i}.png`, `${photoTempPath}/photo${i}.png`, `${photoTempPath}/scene${i}.png`);
      images.push(`${photoTempPath}/scene${i}.png`);
    }
    const video = await createSlideshow(images, "", {
      imageOptions: {
        imageDuration: 2000,
      },
      transitionOptions: {
        useTransitions: false,
      },
      outputOptions: {
        outputDir: `${outputFilePath}`,
        outputBuffer: false,
      },
    });
    const randomAudioIndex = Math.floor(Math.random() * 13); // Генерируем случайное число от 0 до 12
    const audioFilePath = path.resolve(__dirname, `../assets/audio/${randomAudioIndex}.mp3`);

    await new Promise<void>((resolve, reject) => {
      if (!video.filePath) {
        reject(new Error("Video file path is undefined"));
        return;
      }
      ffmpeg()
        .input(video.filePath)
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
    await ctx.replyWithVideo(new InputFile(video.filePath));
    await ctx.reply("Video creation finished");
    const filePathToDelete = video.filePath || "";
    fs.unlink(filePathToDelete, (err) => {
      if (err) {
        console.error(`Ошибка при удалении файла ${filePathToDelete}:`, err);
      } else {
        console.log(`Файл ${filePathToDelete} успешно удален`);
      }
    });
    return;
  } catch (error) {
    // В случае ошибки, пробрасываем её дальше
    throw error;
  }
};

export default template02;
