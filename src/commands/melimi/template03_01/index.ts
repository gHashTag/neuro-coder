import { Context, InputFile } from "grammy";

import ffmpeg from "fluent-ffmpeg";
import ffmpegInstaller from "@ffmpeg-installer/ffmpeg";
import path from "path";
import fs from "fs";
import { makeTextLayers, overlayPhotoOnVideo, toShortVideo } from "../../helpers";

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

const template03_01 = async (ctx: Context): Promise<void> => {
  try {
    await ctx.reply("Video creation started");

    const inputFilePath = path.resolve(__dirname, "../assets/input/");
    const outputFilePath = path.resolve(__dirname, "../assets/output/");
    const photoTempPath = path.resolve(__dirname, "../assets/temp/photo");
    const tempFilePath = path.resolve(__dirname, "../assets/temp/video");
    const folder = "blouses";
    const logoPath = path.resolve(__dirname, "../assets/logo");

    try {
      await checkAccess(inputFilePath, fs.constants.R_OK); // Проверка прав на чтение
      await checkAccess(path.dirname(outputFilePath), fs.constants.W_OK); // Проверка прав на запись в директорию
      console.log("Access check passed");
    } catch (err) {
      console.error("Access check failed:", err);
      throw err;
    }
    await makeTextLayers("", `${photoTempPath}/photo.png`, false, `${logoPath}/01.png`);
    await toShortVideo(`${inputFilePath}/${folder}/0.mp4`, `${tempFilePath}/video.mp4`);
    await overlayPhotoOnVideo(`${tempFilePath}/video.mp4`, `${photoTempPath}/photo.png`, `${outputFilePath}/video.mp4`);
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

export default template03_01;
