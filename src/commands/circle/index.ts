import { Context, InputFile } from "grammy"
import { openai } from "../../core/openai"
import sharp from "sharp"
import axios from "axios"
import { InputMediaPhoto } from "grammy/types"
import ffmpeg from "fluent-ffmpeg"
import ffmpegInstaller from "@ffmpeg-installer/ffmpeg"
import { promises as fs } from "fs"
import path from "path"
import * as fal from "@fal-ai/serverless-client"

ffmpeg.setFfmpegPath(ffmpegInstaller.path)

if (!process.env.FAL_KEY) {
  throw new Error("FAL_KEY is not set")
}
fal.config({
  credentials: process.env.FAL_KEY,
})

const clipmaker = async (ctx: Context): Promise<void> => {
  try {
    // Отправляем уведомление пользователю, что бот печатает
    await ctx.replyWithChatAction("typing")

    // Проверяем, есть ли информация о пользователе
    if (!ctx.from) throw new Error("User not found")

    // Определяем путь для выходного видеофайла
    const outputPath = path.join(process.cwd(), "src", "images", "1.mp4")

    // Отправляем видео пользователю
    await ctx.replyWithVideo(new InputFile(outputPath), {
      caption: "Video meditation",
    })
  } catch (error) {
    // В случае ошибки, пробрасываем её дальше
    throw error
  }
}

export default clipmaker

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
