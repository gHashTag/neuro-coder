import { Context, InputFile } from "grammy";

import ffmpeg from "fluent-ffmpeg";
import ffmpegInstaller from "@ffmpeg-installer/ffmpeg";
import path from "path";
import fs from "fs";
import { makePhotoOnPhoto, makeTextLayers, sizePhoto } from "../../helpers";
import axios from "axios";

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

const neurocoder_test = async (ctx: Context): Promise<void> => {
  try {
    await ctx.reply("Video creation started");

    const inputFilePath = path.resolve(__dirname, "../assets/input/");
    const outputFilePath = path.resolve(__dirname, "../assets/output/");
    const photoTempPath = path.resolve(__dirname, "../assets/temp/photo");
    const logoPath = path.resolve(__dirname, "../assets/logo/");
    const folder = "news";

    const images: string[] = [];
    try {
      await checkAccess(inputFilePath, fs.constants.R_OK); // Проверка прав на чтение
      await checkAccess(path.dirname(outputFilePath), fs.constants.W_OK); // Проверка прав на запись в директорию
      console.log("Access check passed");
    } catch (err) {
      console.error("Access check failed:", err);
      throw err;
    }

    const scenesCount = 1;

    for (let i = 0; i < scenesCount; i++) {
      await makeTextLayers("Шоппинг новой коллекции стал проще!", `${photoTempPath}/photo${i}.png`, false, `${logoPath}/01.png`, "neurocoder", 100);
      await sizePhoto(`${inputFilePath}/${folder}/${i}.png`, `${photoTempPath}/size${i}.png`);
    }

    const createShortVideo = async () => {
      console.log(inputFilePath, outputFilePath);
      console.log("Merging started");

      for (let i = 0; i < scenesCount; i++) {
        await makePhotoOnPhoto(`${photoTempPath}/size${i}.png`, `${photoTempPath}/photo${i}.png`, `${photoTempPath}/scene${i}.png`);
        images.push(`${photoTempPath}/scene${i}.png`);
        await ctx.replyWithPhoto(new InputFile(`${photoTempPath}/scene${i}.png`));
      }
    };

    await createShortVideo();

    // const uploadAudioToTelegram = async (filePath: string): Promise<string> => {
    //   const message = await ctx.replyWithAudio(new InputFile(filePath));
    //   const fileId = message.audio?.file_id;
    //   if (!fileId) throw new Error("Failed to upload audio to Telegram");
    //   return fileId;
    // };

    // const voiceFileId = await uploadAudioToTelegram(path.resolve(__dirname, "../assets/audio/synclabs/voice.mp3"));
    // const file = await ctx.api.getFile(voiceFileId);
    // const filePath = file.file_path;
    // const voiceFileLink = `https://api.telegram.org/file/bot${process.env.BOT_TOKEN}/${filePath}`;

    // const createVoiceSyncLabs = async (): Promise<string | null> => {
    //   const url = "https://api.synclabs.so/voices/create";
    //   const body = {
    //     name: "TestNameSynclabs",
    //     description: `Voice created from Telegram voice message`,
    //     inputSamples: [voiceFileLink],
    //   };

    //   try {
    //     const response = await axios.post(url, body, {
    //       headers: {
    //         "x-api-key": process.env.SYNCLABS_API_KEY as string,
    //         "Content-Type": "application/json",
    //       },
    //     });

    //     console.log(response.data, "response");
    //     if (response.status === 200) {
    //       console.log(response.data, "response.data");
    //       return response.data.id;
    //     } else {
    //       console.error(`Error: ${response.status} ${response.statusText}`);
    //       return null;
    //     }
    //   } catch (error) {
    //     console.error(error);
    //     return null;
    //   }
    // };

    // const voiceIdSyncLabs = await createVoiceSyncLabs();
    // console.log("createVoiceSyncLabs", voiceIdSyncLabs);

    // const text =
    //   "В мире онлайн-предпринимательства все стремятся быть хозяевами своего времени, но многие сталкиваются с трудностями из-за нехватки инструментов и навыков.";
    // const voiceId = "bc4e1f5f-a480-4483-a3e5-4a62962a65e3"; // Пример voiceId

    // try {
    //   const audioUrl = await generateVoice(text, voiceId);
    //   console.log("Голос успешно сгенерирован:", audioUrl);
    //   await ctx.reply(`Голос успешно сгенерирован: ${audioUrl}`);
    // } catch (err) {
    //   console.error("Ошибка при генерации голоса:", err);
    //   await ctx.reply("Ошибка при генерации голоса");
    // }

    // await ctx.reply("Video creation finished");
    return;
  } catch (error) {
    // В случае ошибки, пробрасываем её дальше
    throw error;
  }
};

export default neurocoder_test;
