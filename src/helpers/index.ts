/* eslint-disable @typescript-eslint/no-explicit-any */
import ffmpeg from "fluent-ffmpeg"
import sharp from "sharp"
import os from "os"
import axios from "axios"
import ffmpegInstaller from "@ffmpeg-installer/ffmpeg"
import path from "path"
import RunwayML from "@runwayml/sdk"
import { openai } from "../core/openai"
import { MyContext, MyContextWithSession, Step } from "../utils/types"

import { createWriteStream, promises as fs } from "fs"

import { InputFile, MiddlewareFn } from "grammy"
import { createUser, supabase } from "../core/supabase"
import { bot } from ".."
import { ElevenLabsClient } from "elevenlabs"
import { v4 as uuid } from "uuid"

import { triggerWord } from "../commands/neuro_broker/mock"
import { replicate } from "../core/replicate"

if (!process.env.CREATOMATE_API_KEY) {
  throw new Error("CREATOMATE_API_KEY is not set")
}

if (!process.env.REPLICATE_API_TOKEN) {
  throw new Error("REPLICATE_API_TOKEN is not set")
}

if (!process.env.ELEVENLABS_API_KEY) {
  throw new Error("ELEVENLABS_API_KEY is not set")
}

if (!process.env.PIXEL_API_KEY) {
  throw new Error("PIXEL_API_KEY is not set")
}

if (!process.env.OPENAI_API_KEY) {
  throw new Error("OPENAI_API_KEY is not set")
}

if (!process.env.RUNWAY_API_KEY) {
  throw new Error("RUNWAY_API_KEY is not set")
}

const Creatomate = require("creatomate")

const clientRunway = new RunwayML({ apiKey: process.env.RUNWAY_API_KEY })

const client = new Creatomate.Client(process.env.CREATOMATE_API_KEY)

console.log("Environment check:", {
  nodeEnv: process.env.NODE_ENV,
  elevenLabsKeyExists: !!process.env.ELEVENLABS_API_KEY,
  elevenLabsKeyPrefix: process.env.ELEVENLABS_API_KEY?.substring(0, 5),
})

console.log("ELEVENLABS_API_KEY:", process.env.ELEVENLABS_API_KEY?.substring(0, 5) + "...")

console.log("Initializing ElevenLabs client...")
export const elevenlabs = new ElevenLabsClient({
  apiKey: process.env.ELEVENLABS_API_KEY,
})
console.log("ElevenLabs client initialized")

export const isDev = process.env.NODE_ENV === "development"

ffmpeg.setFfmpegPath(ffmpegInstaller.path)

export async function sizePhoto(photoPath: string, outputPath: string): Promise<string> {
  try {
    const photo = sharp(photoPath)
    await photo.resize(720, 1280).toFile(outputPath)
    return outputPath
  } catch (error) {
    console.error(`Ошибка в sizePhoto:`, error)
    throw error
  }
}

export async function overlayPhotoOnVideo(inputVideoPath: string, inputPhotoPath: string, outputVideoPath: string): Promise<void> {
  return new Promise((resolve, reject) => {
    ffmpeg(inputVideoPath)
      .input(inputPhotoPath)
      .complexFilter([
        {
          filter: "overlay",
          options: {
            x: 0,
            y: 0,
            enable: `between(t,0,20)`,
          },
        },
      ])
      .outputOptions("-pix_fmt", "yuv420p")
      .outputOptions("-c:a", "copy")
      .save(outputVideoPath)
      .on("end", () => {
        resolve()
      })
      .on("error", (err) => {
        reject(err)
      })
  })
}

export async function makePhotoOnPhoto(backgroundPath: string, overlayPath: string, outputPath: string): Promise<string> {
  try {
    const background = sharp(backgroundPath)
    const overlayBuffer = await sharp(overlayPath).toBuffer()

    const output = await background.composite([{ input: overlayBuffer, blend: "over" }])
    await output.png().toFile(outputPath)
    return outputPath
  } catch (error) {
    console.error(`Ошибка в makePhotoOnPhoto:`, error)
    throw error
  }
}

export function createSVGWithWhiteText(width: number, height: number, text: string) {
  const sentences = text.split(/(?<=[.!?])\s+/) // Разбиваем текст на предложения
  const lines: string[] = []
  const maxWidth = width * 0.8 // 80% от ширины SVG
  const fontSize = 40
  const lineHeight = 60

  // Функция для измерения ширины текста (приблизительно)
  function getTextWidth(text: string): number {
    return text.length * (fontSize * 0.6) // Приблизительный расчет
  }

  sentences.forEach((sentence) => {
    const words = sentence.split(" ")
    let currentLine = ""

    words.forEach((word) => {
      const testLine = currentLine ? `${currentLine} ${word}` : word
      if (getTextWidth(testLine) <= maxWidth) {
        currentLine = testLine
      } else {
        lines.push(currentLine)
        currentLine = word
      }
    })

    if (currentLine) {
      lines.push(currentLine)
    }
  })

  // Вычисляем начальную позицию Y для текста, чтобы он был центрирован
  const startY = (height - lines.length * lineHeight) / 2

  const textElements = lines
    .map((line, index) => {
      const y = startY + index * lineHeight
      const parts = line.split(/(\p{Emoji_Presentation}|\p{Emoji}\uFE0F)/gu)

      return `
        <text x="50%" y="${y}" text-anchor="middle" dominant-baseline="middle" class="title">
          ${parts
            .map((part, i) => {
              if (i % 2 === 0) {
                return escapeXml(part)
              } else {
                return `<tspan class="emoji">${part}</tspan>`
              }
            })
            .join("")}
        </text>
      `
    })
    .join("")

  return `
    <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
      <style>
        @import url('https://fonts.googleapis.com/css2?family=Roboto:wght@700&amp;display=swap');
        .title { 
          font-family: 'Roboto', sans-serif;
          font-size: ${fontSize}px; 
          font-weight: 600;
          font-style: normal;
          fill: white;
        }
        .emoji {
          fill: none;
        }
      </style>
      ${textElements}
    </svg>
  `
}

export async function makeTextLayers(
  text: string,
  outputPath: string,
  isTop: boolean,
  logoPath: string,
  reelsType?: string,
  logoTopPadding?: number,
): Promise<string> {
  try {
    const width = 720
    const height = 1280
    const layersPath = path.resolve(__dirname, "../assets/layers/")

    let svgBuffer: Buffer
    if (reelsType === "lifehack") {
      svgBuffer = await fs.readFile(`${layersPath}/lifehack.png`)
    } else if (reelsType === "sciencepop") {
      svgBuffer = await fs.readFile(`${layersPath}/sciencepop.png`)
    } else if (reelsType === "didyouknow") {
      svgBuffer = await fs.readFile(`${layersPath}/didyouknow.png`)
    } else if (reelsType === "math") {
      svgBuffer = await fs.readFile(`${layersPath}/math.png`)
    } else if (reelsType === "english") {
      svgBuffer = await fs.readFile(`${layersPath}/english.png`)
    } else if (reelsType === "cheatsheet") {
      svgBuffer = await fs.readFile(`${layersPath}/cheatsheet.png`)
    } else if (reelsType === "neuronews") {
      svgBuffer = await fs.readFile(`${layersPath}/neuronews.png`)
    } else if (reelsType && reelsType.includes("neurotop")) {
      const themeIndex = reelsType.split("_")[1]
      svgBuffer = await fs.readFile(`${layersPath}/neurotop${themeIndex}.png`)
    } else if (reelsType === "neurocoder") {
      const svgImage = createYellowAndWhiteText(width, 700, escapeXml(text))
      svgBuffer = Buffer.from(svgImage)
    } else {
      const svgImage = createSVGWithWhiteText(width, 600, escapeXml(text))
      svgBuffer = Buffer.from(svgImage)
    }
    const outputFilePath = outputPath.endsWith(".png") ? outputPath : `${outputPath}.png`

    // Загружаем логотип
    const logoBuffer = await fs.readFile(logoPath)

    // Загружаем изображение description
    const descriptionPath = path.resolve(__dirname, "./melimi/assets/logo/")
    const descriptionBuffer = await fs.readFile(`${descriptionPath}/description.png`)

    // Изменяем размер логотипа
    const resizedLogoBuffer = await sharp(logoBuffer)
      .resize({ width: Math.floor(width * 0.7), height: Math.floor(height * 0.3), fit: "inside" })
      .toBuffer()

    // Изменяем размер изображения description
    const resizedDescriptionBuffer = await sharp(descriptionBuffer)
      .resize({ width: Math.floor(width * 0.7), height: Math.floor(height * 0.1), fit: "inside" })
      .toBuffer()

    // Получаем размеры измененного логотипа
    const logoMetadata = await sharp(resizedLogoBuffer).metadata()
    const logoWidth = logoMetadata.width || Math.floor(height * 0.2)
    const logoHeight = logoMetadata.height || Math.floor(height * 0.2)

    // Получаем размеры измененного изображения description
    const descriptionMetadata = await sharp(resizedDescriptionBuffer).metadata()
    const descriptionWidth = descriptionMetadata.width || Math.floor(height * 0.3)

    // Вычисляем позицию логотипа (в верхнем центре)
    const logoLeft = Math.floor((width - logoWidth) / 2)
    const logoTop = logoTopPadding ? logoTopPadding : -20

    // Вычисляем позицию основного текста (под логотипом)
    const textTop = !reelsType ? logoTop + logoHeight + 290 : reelsType === "neurocoder" ? height / 2 - 200 : 0

    // Вычисляем позицию изображения description (под основным текстом)
    const descriptionLeft = Math.floor((width - descriptionWidth) / 2)
    const descriptionTop = 1030

    await sharp({
      create: {
        width: width,
        height: height,
        channels: 4,
        background: { r: 0, g: 0, b: 0, alpha: 0.4 },
      },
    })
      .composite([
        {
          input: resizedLogoBuffer,
          top: logoTop,
          left: logoLeft,
        },
        {
          input: svgBuffer,
          top: textTop,
          left: 0,
        },
        ...(reelsType && reelsType !== "neurocoder" && reelsType !== "neuronews"
          ? [
              {
                input: resizedDescriptionBuffer,
                top: descriptionTop,
                left: descriptionLeft,
              },
            ]
          : []),
      ])
      .png()
      .toFile(outputFilePath)

    return outputFilePath
  } catch (error) {
    console.error(`Ошибка в makeTextLayers:`, error)
    throw error
  }
}

export async function toShortVideo(videoPath: string, outputPath: string, width = 720, height = 1280): Promise<string> {
  return new Promise((resolve, reject) => {
    ffmpeg(videoPath)
      .videoFilters(`crop=${width}:${height}`)
      .noAudio() // Удаляем аудио кодек с видео
      .duration(3)
      .output(outputPath)
      .on("start", (commandLine) => {
        console.log("FFmpeg process started:", commandLine)
      })
      .on("progress", (progress) => {
        console.log("Processing: " + Math.round(progress.percent || 0) + "% done")
      })
      .on("end", () => {
        console.log("FFmpeg process completed")
        resolve(outputPath)
      })
      .on("error", (err) => {
        console.error("FFmpeg error:", err)
        reject(err)
      })
      .run()
  })
}

export function createYellowAndWhiteText(width: number, height: number, text: string) {
  const sentences = text.split(/(?<=[.!?])\s+/) // Разбиваем текст на предложения
  const lines: string[] = []
  const maxWidth = width * 0.85 // Увеличено до 95% от ширины SVG
  const fontSize = 52 // Увеличен размер шрифта
  const lineHeight = 50 // Увеличена высота строки

  // Функция для измерения ширины текста (приблизительно)
  function getTextWidth(text: string): number {
    return text.length * (fontSize * 0.6) // Приблизительный расчет
  }

  sentences.forEach((sentence) => {
    const words = sentence.split(" ")
    let currentLine = ""

    words.forEach((word) => {
      const testLine = currentLine ? `${currentLine} ${word}` : word
      if (getTextWidth(testLine) <= maxWidth) {
        currentLine = testLine
      } else {
        lines.push(currentLine)
        currentLine = word
      }
    })

    if (currentLine) {
      lines.push(currentLine)
    }
  })

  // Вычисляем начальную позицию Y для текста, чтобы он был центрирован
  const startY = (height - lines.length * lineHeight) / 2

  const textElements = lines
    .map((line, index) => {
      const y = startY + index * lineHeight
      const parts = line.split(/(\p{Emoji_Presentation}|\p{Emoji}\uFE0F)/gu)

      return `
        <text x="50%" y="${y}" text-anchor="middle" dominant-baseline="middle" class="title">
          ${parts
            .map((part, i) => {
              if (i % 2 === 0) {
                if (index === 0) {
                  return `<tspan fill="#FFFF00" font-weight="bold">${escapeXml(part)}</tspan>` // Изменен цвет на более яркий желтый
                } else {
                  return `<tspan fill="#FFFFFF" font-weight="bold">${escapeXml(part)}</tspan>` // Добавлен белый цвет для остальных строк
                }
              } else {
                return `<tspan class="emoji">${part}</tspan>`
              }
            })
            .join("")}
        </text>
      `
    })
    .join("")

  return `
    <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
      <style>
        @import url('https://fonts.googleapis.com/css2?family=Roboto:wght@700&amp;display=swap');
        .title { 
          font-family: 'Roboto', sans-serif;
          font-size: ${fontSize}px; 
          font-weight: 900;
          font-style: normal;
        }
        .emoji {
          fill: none;
        }
      </style>
      <rect width="100%" height="100%" fill="rgba(0,0,0)"/>
      ${textElements}
    </svg>
  `
}

export function createSVGWithHighlightedText(width: number, height: number, text: string) {
  const words = text.split(" ")
  const lines: string[] = []
  let currentLine = ""
  const maxWidth = width * 0.9 // 90% от ширины SVG
  const fontSize = 50
  const lineHeight = 80
  const paddingX = 10 // Горизонтальный отступ

  // Функция для измерения ширины текста (приблизи��ельно)
  function getTextWidth(text: string): number {
    return text.length * (fontSize * 0.6) // Приблизительный расчет
  }

  words.forEach((word) => {
    const testLine = currentLine ? `${currentLine} ${word}` : word
    if (getTextWidth(testLine) <= maxWidth) {
      currentLine = testLine
    } else {
      lines.push(currentLine)
      currentLine = word
    }
  })
  if (currentLine) {
    lines.push(currentLine)
  }

  const startY = (height - lines.length * lineHeight) / 2

  const textElements = lines
    .map((line, index) => {
      const lineWidth = getTextWidth(line)
      const rectX = (width - lineWidth) / 2 - paddingX

      const wordsInLine = line.split(" ")
      const coloredWords = wordsInLine
        .map((word, wordIndex) => {
          const colorClass = wordIndex % 2 === 0 ? "white-text" : "yellow-text"
          return `<tspan class="${colorClass}">${word}</tspan>`
        })
        .join(" ")
      return `
        <g transform="translate(0, ${startY + index * lineHeight})">
          <rect x="${rectX + 10}" y="${-lineHeight / 2 - 25}" width="${lineWidth + paddingX * 2}" height="${lineHeight}" fill="transparent" rx="10" ry="10"/>
          <text x="50%" y="0" text-anchor="middle" dominant-baseline="middle" class="title">${coloredWords}</text>
        </g>
      `
    })
    .join("")

  // <rect width="100%" height="100%" fill="rgba(0,0,0,0.5)"/> <!-- Полупрозрачный черный фон -->
  return `
        <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
          <style>
            @import url('https://fonts.googleapis.com/css2?family=Roboto:wght@700&amp;display=swap');
            .title { 
              font-family: 'Roboto', sans-serif;
              font-size: ${fontSize}px; 
              font-weight: 700;
            }
            .white-text {
              fill: #FFFFFF;
            }
            .yellow-text {
              fill: #FFFF00;
            }
          </style>
          ${textElements}
        </svg>
      `
}

export async function addTextOnImage({ imagePath, text, step }: { imagePath: string; text: string; step: string }) {
  try {
    let buffer: Buffer

    try {
      console.log(`Попытка загрузки изображения для шага ${step}: ${imagePath}`)
      const response = await axios.get(imagePath, {
        responseType: "arraybuffer",
        timeout: 15000, // Увеличим таймаут до 15 секунд
      })
      buffer = Buffer.from(response.data, "binary")
      console.log(`Изображение успешно загружено для шага ${step}`)
    } catch (downloadError: any) {
      console.error(`Ошибка загрузки и��ображения для шага ${step}:`, downloadError.message)
      if (downloadError.response) {
        console.error(`Статус ответа: ${downloadError.response.status}`)
        console.error(`Заголовки ответа:`, downloadError.response.headers)
      }
      throw downloadError
    }

    const width = 1024
    const height = 1792

    const svgImage = createSVGWithHighlightedText(width, height, text)
    const svgBuffer = Buffer.from(svgImage)

    const outputFileName = `src/images/slide-${step}.png`
    const outputPath = path.join(process.cwd(), outputFileName)

    const image = await sharp(buffer)
      .resize(width, height, { fit: "cover", position: "center" })
      .composite([
        {
          input: svgBuffer,
          top: 0,
          left: 0,
        },
      ])
      .toFile(outputPath)
    return { image, outputPath }
  } catch (error: any) {
    console.error(`Ошибка в addTextOnImage для шага ${step}:`, error.message)
    throw error
  }
}
export async function generateImagesForMeditation(steps: Step[], language: "en" | "es") {
  const imagesWithText: { imagePath: string; text: string }[] = []
  console.log("Начинаем генерацию изображений для медитации")
  console.log(steps, "steps")

  for (const step of steps) {
    try {
      const prompt = `Boosts cellular energy, enhancing your meditation experience. photorealism, bohemian style, pink and blue pastel color, hyper-realistic`

      const isModelFlux = false
      const model = isModelFlux
        ? "black-forest-labs/flux-pro"
        : "stability-ai/stable-diffusion:db21e45d3f7023abc2a46ee38a23973f6dce16bb082a930b0c49861f96d1e5bf"
      const input = {
        prompt,
        negative_prompt: "nsfw, erotic, violence, people, animals",
        guidance_scale: 7.5,
        num_inference_steps: 50,
        aspect_ratio: "9:16",
      }

      let retries = 11
      let output

      while (retries > 0) {
        try {
          console.log(`Попытка генерации изображения для шага ${step.step} (осталось попыток: ${retries})`)
          output = await replicate.run(model, { input })
          console.log(output, "✅ выход output")
          if (output && output[0]) {
            console.log(`Изображение успешно сгенерировано для шага ${step.step}`)
            break
          }
        } catch (error: any) {
          console.error(`Ошибка при генерации изображения для шага ${step.step}:`, error.message)
          retries--
          if (retries === 0) {
            throw error
          }
        }
      }

      if (output) {
        const imagePath = output
        console.log(imagePath, "imagePath")
        const text = step.details[language]
        console.log(text, "text")
        console.log(step, "step")
        try {
          const processedImage = await addTextOnImage({ imagePath, text, step: step.step })

          if (processedImage) {
            imagesWithText.push({ imagePath: processedImage.outputPath, text })
            console.log(`Изображение успешно обработано и сохранено для шага ${step.step}`)
          }
        } catch (error: any) {
          console.error(`шибка при обработке изображения для шага ${step.step}:`, error.message)
          throw error // Перебрасываем ошибку, чтобы использовать запасное изображение
        }
      } else {
        throw new Error(`Не удалось сгенерировать изображение для шага ${step.step}`)
      }
    } catch (error: any) {
      console.error(`Ошибка при работе с шагом ${step.step}:`, error.message)
      // Используем запасное изображение только если не удалось сгенерировать или обработать изображение
      // const fallbackImagePath = path.join(process.cwd(), "src/assets/fallback-image.jpg");
      // const text = `${step.details}`;
      // try {
      //   const processedImage = await addTextOnImage({ imagePath: fallbackImagePath, text, step: step.step });
      //   if (processedImage) {
      //     imagesWithText.push({ imagePath: processedImage.outputPath, text });
      //     console.log(`Использовано запасное изображение для шага ${step.step}`);
      //   }
      // } catch (fallbackError: any) {
      //   console.error(`Ошибка при использовании запасного изображения для шага ${step.step}:`, fallbackError.message);
      // }
    }
  }

  console.log(`Генерация изображений завершена. Всего изображений: ${imagesWithText.length}`)
  return imagesWithText
}

async function downloadImage(url: string, outputPath: string): Promise<string> {
  try {
    const response = await axios.get(url, { responseType: "arraybuffer" })
    await fs.writeFile(outputPath, response.data)
    console.log("Image downloaded successfully:", outputPath)
    return outputPath // Возвращаем путь к загруженному изображению
  } catch (error) {
    console.error("Error downloading image:", error)
    throw error // Перебрасываем ошибку, чтобы обработать её выше
  }
}

export async function generateImagesForNeuroBroker(steps: Step[]) {
  const imagesWithText: { imagePath: string; text: string }[] = []
  console.log(imagesWithText, "imagesWithText")
  console.log("Начинаем генерацию изображений для медитации")
  console.log(steps, "steps")

  for (const step of steps) {
    try {
      // const model = "ghashtag/so_origin_kata:e82316f373dea8e2e97748d7dbfe269895a70e2891c18a2403a2080c942bb5b2"
      // const model = "ghashtag/artrio:46074c6d3a8074f6564be098ec32b4e1c9e03e661d9386b4e66a898fb535d702"
      const model = "ghashtag/modeva:c37189f6adde9084209e850c631d88a5d8de1e94f226e7c7ed2a9446f46897aa"
      console.log(model, "model")
      const input = {
        prompt: step.details.en,
        model: "dev",
        lora_scale: 1,
        num_outputs: 1,
        aspect_ratio: "9:16",
        output_format: "png",
        guidance_scale: 3.5,
        output_quality: 90,
        prompt_strength: 0.8,
        extra_lora_scale: 1,
        num_inference_steps: 28,
      }
      console.log(input, "input")

      let retries = 11
      let output

      while (retries > 0) {
        try {
          console.log(`Попытка генерации изображения для шага ${step.step} (осталось попыток: ${retries})`)
          output = await replicate.run(model, { input })
          console.log(output, "✅ выход output")
          if (output && output[0]) {
            console.log(`Изображение успешно сгенерировано для шага ${step.step}`)
            break
          }
        } catch (error: any) {
          console.error(`Ошибка при генерации изображения для шага ${step.step}:`, error.message)
          retries--
          if (retries === 0) {
            throw error
          }
        }
      }

      if (output) {
        const imagePath = output
        console.log(imagePath, "imagePath")
        // const text = step.details[language];
        // console.log(text, "text");
        console.log(step, "step")
        try {
          // const processedImage = await addTextOnImage({ imagePath, text, step: step.step });

          // if (processedImage) {
          //   imagesWithText.push({ imagePath: processedImage.outputPath, text });
          //   console.log(`Изображение успешно обработано и сохранено для шага ${step.step}`);
          // }
          const outputFilePath = path.join(__dirname, `../images/output_step_${step.step}.png`)
          console.log(outputFilePath, "outputFilePath")
          const localImagePath = await downloadImage(imagePath, outputFilePath)

          // Добавляем локальный путь к изображению в массив
          imagesWithText.push({ imagePath: localImagePath, text: "" }) // Оставьте текст пустым или удалите его

          console.log(`Изображение успешно обработано и сохранено для шага ${step.step}`)
        } catch (error: any) {
          console.error(`Oшибка при обработке изображения для шага ${step.step}:`, error.message)
          throw error // Перебрасываем ошибку, чтобы использовать запасное изображение
        }
      } else {
        throw new Error(`Не удалось сгенерировать изображение для шага ${step.step}`)
      }
    } catch (error: any) {
      console.error(`Ошибка при работе с шагом ${step.step}:`, error.message)
      // Используем запасное изображение только если не удалось сгенерировать или обработать изображение
      // const fallbackImagePath = path.join(process.cwd(), "src/assets/fallback-image.jpg");
      // const text = `${step.details}`;
      // try {
      //   const processedImage = await addTextOnImage({ imagePath: fallbackImagePath, text, step: step.step });
      //   if (processedImage) {
      //     imagesWithText.push({ imagePath: processedImage.outputPath, text });
      //     console.log(`Использовано запасное изображение для шага ${step.step}`);
      //   }
      // } catch (fallbackError: any) {
      //   console.error(`Ошибка при использовании запасного изображения для шага ${step.step}:`, fallbackError.message);
      // }
    }
  }

  console.log(`Генерация изображений завершена. Всего изображений: ${imagesWithText.length}`)
  return imagesWithText
}

export async function generateImageNeuroBroker(prompt: string) {
  const imagesWithText: { imagePath: string; text: string }[] = []
  console.log(imagesWithText, "imagesWithText")
  console.log("Начинаем генерацию изображений для медитации")

  try {
    const model = "ghashtag/neuro_broker:7abc7b18d0ef212b979eebeb46577d3192c6280c88d876c52ba5a2300f9283a0"

    console.log(model, "model")
    const input = {
      prompt,
      model: "dev",
      lora_scale: 1,
      num_outputs: 1,
      aspect_ratio: "9:16",
      output_format: "png",
      guidance_scale: 3.5,
      output_quality: 90,
      prompt_strength: 0.8,
      extra_lora_scale: 1,
      num_inference_steps: 28,
    }
    console.log(input, "input")

    let retries = 11
    let output

    while (retries > 0) {
      try {
        console.log(`Попытка генерации изображения (осталось попыток: ${retries})`)
        output = await replicate.run(model, { input })
        console.log(output, "✅ выход output")
        if (output && output[0]) {
          console.log(`Изображение успешно сгенерировано`)
          break
        }
      } catch (error: any) {
        console.error(`Ошибка при генерации изображения:`, error.message)
        retries--
        if (retries === 0) {
          throw error
        }
      }
    }

    if (output) {
      const imagePath = output
      console.log(imagePath, "imagePath")
      try {
        // const processedImage = await addTextOnImage({ imagePath, text, step: step.step });

        // if (processedImage) {
        //   imagesWithText.push({ imagePath: processedImage.outputPath, text });
        //   console.log(`Изображение успешно обработано и сохранено для шага ${step.step}`);
        // }
        const outputFilePath = path.join(__dirname, `../images/output_step_${uuid()}.png`)
        console.log(outputFilePath, "outputFilePath")
        const localImagePath = await downloadImage(imagePath, outputFilePath)

        // Добавляем локальный путь к изображению в массив
        imagesWithText.push({ imagePath: localImagePath, text: "" }) // Оставьте текст пустым или удалите его

        console.log(`Изображение успешно обработано`)
      } catch (error: any) {
        console.error(`шибка при обработке изображения:`, error.message)
        throw error // Перебрасываем ошибку, чтобы использовать запасное изображение
      }
    } else {
      throw new Error(`Не удалось сгенерировать изображения}`)
    }
  } catch (error: any) {
    console.error(`Ошибка при работе:`, error.message)
    throw error
  }

  console.log(`Генерация изображений завершена`)
  return imagesWithText
}

// export async function generateImagesForMeditation(steps: Step[]) {
//   const imagesWithText: { imagePath: string; text: string }[] = [];
//   console.log(imagesWithText, "imagesWithText");

//   for (const step of steps) {
//     try {
//       const prompt = `Boosts cellular energy, enhancing your meditation experience. photorealism, bohemian style, pink and blue pastel color, hyper-realistic`;

//       //"stability-ai/stable-diffusion:db21e45d3f7023abc2a46ee38a23973f6dce16bb082a930b0c49861f96d1e5bf";

//       const input = {
//         prompt,
//         aspect_ratio: "9:16",
//         negative_prompt: "nsfw, erotic, violence, people, animals",
//       };
//       const output = await replicate.run(model, { input });
//       console.log(output, "output");
//       if (output) {
//         const imagePath = output.toString();
//         const text = `${step.details}`;

//         const processedImage = await addTextOnImage({ imagePath, text, step: step.step });
//         if (processedImage) {
//           imagesWithText.push({ imagePath: processedImage.outputPath, text });
//         }
//       }
//     } catch (error) {
//       console.error("Error generating image:", error);
//       // Используем запасное изображение
//       // const text = `${step.details}`;
//       // const processedImage = await addTextOnImage({ imagePath: fallbackImagePath, text });
//       // if (processedImage) {
//       //     imagesWithText.push({ imagePath: processedImage.outputPath, text });
//       // }
//     }
//   }
//   return imagesWithText;
// }

// export async function generateImagesForMeditation(steps: Step[]) {
//   const imagesWithText: { imagePath: string; text: string }[] = [];
//   console.log(imagesWithText, "imagesWithText");

//   for (const step of steps) {
//     try {
//       const prompt = `Boosts cellular energy, enhancing your meditation experience. photorealism, bohemian style, pink and blue pastel color, hyper-realistic`;

//       const response = await openai.images.generate({
//         model: "dall-e-3",
//         prompt: prompt,
//         n: 1,
//         size: "1024x1792",
//       });

//       if (response.data[0].url) {
//         const imagePath = response.data[0].url;
//         const text = `${step.details}`;
//         const processedImage = await addTextOnImage({ imagePath, text, step: step.step });
//         if (processedImage) {
//           imagesWithText.push({ imagePath: processedImage.outputPath, text });
//         }
//       }
//     } catch (error) {
//       console.error("Error generating image:", error);
//       // Используем запасное изображение
//       // const text = `${step.details}`;
//       // const processedImage = await addTextOnImage({ imagePath: fallbackImagePath, text });
//       // if (processedImage) {
//       //     imagesWithText.push({ imagePath: processedImage.outputPath, text });
//       // }
//     }
//   }
//   return imagesWithText;
// }

export async function getSlides({ prompt, scenesCount = 3, isDescription = false }: { prompt: string; scenesCount?: number; isDescription?: boolean }) {
  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: isDescription
            ? `DON'T USE EMOJI In onScreenTitle. don't use markdown syntax(DON'T USE * AND #). You need to use smiles(emoji) in videoDescription. You are a professional marketer who creates attractive and selling scenarios for Instagram videos.You need to write some interesting text for videos that will get a lot of views. For example, some life hacks for school, tips, motivation, and so on. This text will be posted in the comments to the video. Return it in json format. in videoDescription, you need to write useful information, and not describe what is happening in the video. The videoDescription cannot be longer than 4096 characters. Form the text beautifully, make indents. Example: {
            "reels": {
            "onScreenTitle": "onScreenTitle", //don't use emoji
            "videoDescription": "videoDescription" //use emoji
            }
          }`
            : `DONT'T USE EMOJI. You are a professional marketer who creates attractive and selling video scripts for Instagram videos.You need to write a short text, maybe with some kind of plot for ${scenesCount} scenes. No need to mention any discounts or promotions. Create an array of scenes in json format. Example: {
          "scenes": [
            {
              "number": 1,
              "text": "text",
              "onscreenText": "onscreenText",
            },
            {
              "number": 2,
              "text": "text",
              "onscreenText": "onscreenText",
            },
            {
              "number": 3,
              "text": "text",
              "onscreenText": "onscreenText"
            }
          ]
        }`,
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      temperature: 0.7,
      response_format: { type: "json_object" },
    })
    console.log(completion, "completion")

    const content = completion.choices[0].message.content
    if (content === null) {
      throw new Error("Received null content from OpenAI")
    }

    console.log(content)
    return JSON.parse(content)
  } catch (error) {
    console.error("Error:", error)
    throw error // Перебрасываем ошибку, чтобы она могла быть обработана выше
  }
}

export async function getSubtitles(prompt: string, videoDuration: number) {
  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: `You are a professional subtitle writer. Write subtitles for the given text. Don't use markdown syntax. The video duration is ${videoDuration} seconds. Your answer should be in json format. this text will be used in the .srt fileю Example:
          "subtitles":
          [
            {
              "endTime": "00:00:2,000",
              "startTime": "00:00:0,000",
              "text": "This is the first sentence"
            },
            {
          "endTime": "00:00:2,000",
          "startTime": "00:00:0,000",
          "text": "This is the first sentence"
        }
]`,
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      temperature: 0.7,
      response_format: { type: "json_object" },
    })
    console.log(completion, "completion")

    const content = completion.choices[0].message.content
    if (content === null) {
      throw new Error("Received null content from OpenAI")
    }

    console.log(content)
    return JSON.parse(content)
  } catch (error) {
    console.error("Error:", error)
    throw error // Перебрасываем ошибку, чтобы она могла быть обработана выше
  }
}

export async function getSellVillaSteps({ prompt, location, type }: { prompt: string; location: string; type: string }) {
  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: `You are a helpful assistant that creates steps for selling a ${type} in a tourist area in location: ${location}. Create a creative sales description every time`,
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      temperature: 0.9,
      response_format: { type: "json_object" },
    })
    console.log(completion, "completion")

    const content = completion.choices[0].message.content
    if (content === null) {
      throw new Error("Received null content from OpenAI")
    }

    console.log(content)
    return JSON.parse(content)
  } catch (error) {
    console.error("Error:", error)
    throw error // Перебрасываем ошибку, чтобы она могла быть обработа��а выше
  }
}

export async function getTriggerReel({ prompt }: { prompt: string }) {
  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: `Ты AI Reel Maker для Instagram
Твоя задача Создать текст озвучки для рилс, который начинается с вопроса-хука, отвечает на этот вопрос в течение 30 секунд. Не нужно говорить название нейросети, это загадка. Отвечай всегда кириллицей. 
 

Примеры:
Представь, что твоё видео может не просто задевать эмоции, но и завораживать звучанием. Искусственный интеллект делает музыку для твоих моментов. На платформе разработчиков SUNO появилась новая функция: создавай музыку на основе своих фото и видео! Всё просто — нейросеть анализирует файл, задаёт тему и создаёт уникальное музыкальное сопровождение. Хочешь попробовать прямо сейчас, пиши 'МУЗЫКА' в комментарии к этому видео!

Стоп платить за искусственный интеллект для озвучки и создания голосов, вот пять сайтов, где это можно сделать бесплатно. Лучшие оставлю на потом, начнем с пятого. tts-free.com предлагает свыше двухсот голосов, похожих на человеческие, на пятидесяти разных языках. Четвертое место занимает AI Voice Generator.com, эффективный инструмент для преобразования текста в аудио, поддерживает свыше ста языков. Третье место у TOPMEDIA.ai.com, нацеленного на создателей контента, предлагает свыше трех тысяч реалистичных голосов и свыше ста языков, а также возможность создавать музыку. Второе место у naturalreaders.com, который предлагает свыше пятидесяти языков, свыше двухсот естественных голосов и множество стилей или эмоций для голосов. Первое место занимает Lovevoice.com, высоко рекомендуемый бесплатный инструмент с более чем двумястами голосами, неограниченным использованием и без затрат. Хочешь попробовать прямо сейчас, пиши "ГОЛОС" в комментарии к этому видео!

Это настоящая революция для монтажа теперь можно удалять или заменять любые объекты из видео с помощью ИИ одним кликом например возьмем этого парня на скейтборде или смесь или руки процесс очень прост вы загружаете свое видео в нейросеть выбираете объекты которые хотите заменить или это может быть фон передний план быстро движущийся объект Меняйте его на все что угодно или просто удаляйте из видео. Хочешь попробовать прямо сейчас, пиши "МОНТАЖ" в комментарии к этому видео!

Теперь можно создавать реалистичные видеоклоны с правдоподобными жестами. Вышла нейросеть, которая генерирует не только липсинг, но и реалистичные жесты, соответствующие темпу и тексту аудио. Разработчики рекомендуют использовать видео, на котором полностью видны руки, в качестве референса. Хочешь попробовать прямо сейчас, пиши "КЛОН" в комментарии к этому видео!

Наконец Адобе выпустила долгожданный видеогенератор FireFly. У данной нейросети имеются настройки частоты кадров, угла обзора, наклона камеры. В готовых видео можно редактировать отдельные элементы. Текстовые запросы возможно создавать, используя загруженные изображения. Максимальная продолжительность видео в HD качестве равна пяти секундам. Хочешь попробовать прямо сейчас, пиши "ОГОНЬ" в комментарии к этому видео!

Чтобы создать такое видео с использованием нейросетей, делаем скриншот видео, заходим в PixaLapse, загружаем его, нажимаем на PicEffects и выбираем эффект. Как только видео сгенерировалось, добавляем его к оригинальному в CapCut и получаем что-то похожее. Хочешь попробовать прямо сейчас, пиши "ПИКА" в комментарии к этому видео!

Чтобы изменить одежду на фото через нейросеть одним нажатием, заходим в виртуальную примерочную color и загружаем фото. Можно выбрать одежду из предложенных или попробовать наряды из онлайн-магазина. К примеру, понравился пиджак. Загружаем его изображение, нажимаем запустить, и все готово. Желаешь попробовать сейчас? Хочешь попробовать прямо сейчас, пиши "ПРИМЕРКА" в комментарии к этому видео!

Не нужно использовать Excel. Rose.Com это таблицы с искусственным интеллектом. Забудьте о сложных формулах и задачах, как в обычном Excel. Просто вводите данные, и сервис все выполнит за вас. Он быстро проанализирует данные, создаст характеристику и все это соберет в один клик. Вы даже можете задать любой вопрос по таблице искусственному интеллекту, и он ответит вам. Хочешь попробовать прямо сейчас, пиши "ТАБЛИЦА" в комментарии к этому видео!


Вышел лучший в мире генератор видео от Мета. Компания только что выпустила нейросеть, создающую ролики ядерного качества. Можно редактировать стиль и визуал видео, генерировать клипы с собственным лицом. Сразу создает все звуковые эффекты, и в результате получается полностью готовый контент. Конкуренты по всему миру вспотели и внимательно наблюдают. Хочешь попробовать прямо сейчас, пиши "МЕТА" в комментарии к этому видео!

Вот это Баста, и сейч��с мы на нем заработаем. Находим на Ютубе любое его шоу ��ли интервью, копируем ссылку и закидываем в сервис Wizard AI, который с помощью нейросети автоматически определяет интересные вирусные моменты, дальше сам нарезает нам это длинное видео, на много коротких, добавляет субтитры и сам монтирует. На выходе имеем десяток готовых рилз. За счет медийного лица Баста такие видео набирают большие просмотры. �� когда у нас есть просмотры, зарабатывать можно за счет продажи рекламы или партнерских программ. Хочешь попробовать прямо сейчас, пиши "БАСТА" в комментарии к этому видео!

Один из самых легких методов получит�� миллионы просмотров на рилсах заключается в повторении контента других блогеров, который получил миллионы просмотров. Но здесь многие ошибаются, копируя контент дословно. Чтобы сделать ваш рилс уникальным, вы можете загрузить его в чат GPT. Он переформулирует сценарий, сохраняя основную мысль, но используя другие слова. Для упрощения создания контента, вы можете отправить ваш рилс моему боту, который преобразует его в текст. Хочешь получить бесплатный доступ к GPT в телеграм  прямо сейчас, пиши "GPT" в комментарии к этому видео!

Могу ли вы различить реального блогера от цифрового Искусственные блогеры в соцсетях становятся все более популярными Это больше чем просто аватары это полноценные цифровые личности создающие контент и взаимодействующие с публикой. Они могут работать без остановки без усталости и не требуют отдыха. Такие цифровые персонажи привлекают сотни тысяч подписчиков и зарабатывают миллионы. Для этого нужно лишь цифровизировать себя и свои знания. С одной стороны это удобно и выгодно с другой стороны возникают беспокойства о потере человеческого в общении. Хочешь прямо сейчас научаться создавать ИИ агентов, пиши "НЕЙРО" в комментарии к этому видео и получи бесплатные уроки по нейросетям!

С помощью этого сервиса ты можешь создавать до пятидесяти рилс в день. Особенность в том, что он самостоятельно монтирует видео благодаря Искусственному Интеллекту. Сервис автома��ически выбирает кадры, соответствующие твоему тексту, озвучив��ет их, добавляет титры, музыку и даже создает анимацию. Особенно отмечается его эффективная работа с русским языком. Хочешь получить доступ прямо сейчас, пиши "ТАЙМФРЕЙМ" в комментарии к этому видео!

Это изменит ваш взгляд на работу. Восемьдесят процентов вашей работы, вероятно, может сделать кто-то другой, вы можете делегировать ее. И вот как. Есть этот инструмент, который вы можете использовать на своем ноутбуке, называется Tango, он легко документирует ваш рабочий процесс и автоматически создает интерактивные руководства. Просто получите расширение и выполняйте свои задачи как обычно, и все. И поверьте мне, вы будете удивлены, как много вещей вы можете поручить другим людям. Хочешь получить доступ прямо сейчас, пиши "ТАНГО" в комментарии к этому видео!


Позвольте мне преобразить вашу жизнь за тридцать секунд с помощью этого инструмента ИИ. Выслушайте меня, если вы устали от постоянной борьбы за создание контента, я понимаю. Попытки найти свою нишу, придумать новые идеи, написать сценарии, снять, смонтировать и затем разместить на всех платформах совершенно изматывают. Однако я нашел инструмент ИИ, который может справиться со всем этим за вас. Просто загрузите любой видео- или аудиофайл, где вы говорите, и увидите, как ИИ немедленно превратит его в контент. Он предлагает сценарии для Instagram-роликов, темы, информационные бюллетени, все, что вам нужно. Он даже может мгновенно генерировать короткие и короткие ролики. Просто говорите, и пусть ИИ сделает все остальное. Хочешь получить доступ прямо сейчас, пиши "МАГИЯ" в комментарии к этому видео!

Это невероятно. Люди утверждают, что это приложение каждый раз делает идеальные снимки. Представьте себе те моменты, когда вы делаете снимок, и он потрясающий, но ваши глаза закрыты. Я нашел решение, друзья мои. Попрощайтесь со стиранием и корректировкой неудачных снимков. Вы просто загружаете свои десять лучших фотографий, и оно использует ИИ, чтобы узнать, как значительно улучшить каждую фотографию. Такая технология поразительна. Оставьте комментарий со словом «ФОТО» ниже, и я поделюсь с вами ссылкой.`,
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      temperature: 0.7,
    })
    console.log(completion, "completion")

    const content = completion.choices[0].message.content
    if (content === null) {
      throw new Error("Received null content from OpenAI")
    }

    console.log(content)
    return content
  } catch (error) {
    console.error("Error:", error)
    throw error // Перебрасываем ошибку, чтобы она могла быть обработана выше
  }
}

export async function getCaptionForNews({ prompt }: { prompt: string }) {
  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: `Ты профессиональный SSM специалист. 
          Твоя задача написать два вида описания для роликов.
          Примеры: 100 символов: Midjourney запускает AI-редактор: 
          редактируйте фото по тексту! #нейроСети #ИИ #искусственныйИнтеллект
          300 символов: Midjourney анонсировала революционный AI фото-редактор! 
          Теперь пользователи могут загружать свои изображения и редактировать их по текстовым описаниям. 
          Просто выделите фрагмент, дайте инструкции нейросети, и она перерисует его, сохраняя композицию, но меняя окружение, текстуры и цвета. 
          #нейроСети #ИИ #искусственныйИнтеллект
          на 300 символов. 
          `,
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      temperature: 0.7,
    })
    console.log(completion, "completion")

    const content = completion.choices[0].message.content
    if (content === null) {
      throw new Error("Received null content from OpenAI")
    }

    console.log(content)
    return content
  } catch (error) {
    console.error("Error:", error)
    throw error // Перебрасываем ошибку, чтобы она могла быть обработана выше
  }
}

export async function getAinews({ prompt }: { prompt: string }) {
  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: `Ты ассистент для создания сценариев для инстаграм рилс длинной в 30 секунд. 
          Тебе на вход поступает огромная статья с новостью об искусственном интелекте,
           а ты должен обработать ее и преобразовать в продающий сценарий для рилс сохранив только самое важное и захватывающее. 
           Новости могут быть на разных языках. Твой ответ только русский. 
          Для примера я дам тебе уже готовый сценарий и мы разберем его. 
          
          Новая Claude! Антропик снова на вершине? 
          Anthropic обновили Claude 3.5 Sonnet и представили Claude 3.5 Haiku! 
          Sonnet теперь умеет управлять приложениями и вводить текст, обгоняя ChatGPT-4o в простых задачах. 
          А Haiku сравнялась с флагманом Claude Opus по качеству ответов и остается самой быстрой! 
          Запуск Haiku ожидается в следующем месяце. Не пропустите!
          Первая фраза зацепляет внимание зрителя, а потом идет сама новость длинной ровно 30 секунд чтением. 
          
          Еще пример есть новость про гугл 
          
          'Как выучить что угодно? Гугл поможет!
          Представьте себе учителя, который знает всё и доступен 24/7. Это новый ИИ-инструмент Google - "Learn About"! 
          Он превращает скучное чтение в увлекательный диалог, генерирует персонализированный контент и связывает сложные понятия. 
          Хотите изучить квантовую физику или научиться готовить суши? "Learn About" станет вашим личным репетитором! 
          Но не забывайте проверять информацию - это всё ещё эксперимент. Будущее образования уже здесь.'
          
          Здесь обращаем внимание только на первую фразу. Она цепляет внимание, ведь люди хотят получить большее за меньшее время. 
          Используй и такие приемы в фразах-затравках. Если сообщение имеет эмодзи, то убери их.
          
          В конец обязательно добавляй "Хочешь больше знать про нейросети? Пиши слово "Нейро" комментарием к этому видео!"`,
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      temperature: 0.7,
    })
    console.log(completion, "completion")

    const content = completion.choices[0].message.content
    if (content === null) {
      throw new Error("Received null content from OpenAI")
    }

    console.log(content)
    return content
  } catch (error) {
    console.error("Error:", error)
    throw error // Перебрасываем ошибку, чтобы она могла быть обработана выше
  }
}

export async function getMeditationSteps({ prompt }: { prompt: string }) {
  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: "You are a helpful assistant that creates meditation steps with LeelaChakra application integration.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      temperature: 0.7,
      response_format: { type: "json_object" },
    })
    console.log(completion, "completion")

    const content = completion.choices[0].message.content
    if (content === null) {
      throw new Error("Received null content from OpenAI")
    }

    console.log(content)
    return JSON.parse(content)
  } catch (error) {
    console.error("Error:", error)
    throw error // Перебрасываем ошибку, чтобы она могла быть обработана выше
  }
}

if (!process.env.OPENAI_API_KEY) {
  throw new Error("OPENAI_API_KEY is not set")
}

export async function translateText(text: string, targetLang: string): Promise<string> {
  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4o", // или другая подходящая модель
      messages: [
        {
          role: "system",
          content: `You are a professional translator. Don't translate the trigger **word ${triggerWord}** and leave it in English. Always answer with letters, without using numbers. Translate the following text to ${targetLang}. Preserve the original meaning and tone as much as possible. ${
            targetLang === "ru" &&
            "In Cyrillic all words. Правильно писать **на острове Пхукет**. Это связано с тем, что острова, в том числе Пхук��т, в русском языке чаще всего употребляют��я с предлогом «на»."
          }`,
        },
        {
          role: "user",
          content: text,
        },
      ],
      temperature: 0.3,
    })

    const translatedText = completion.choices[0].message.content
    // console.log(translatedText, "translatedText");
    if (translatedText === null) {
      throw new Error("Received null content from OpenAI")
    }

    return translatedText
  } catch (error) {
    console.error("Error in translation:", error)
    throw error
  }
}

function escapeXml(unsafe: string): string {
  return unsafe.replace(/[<>&'"]/g, function (c) {
    switch (c) {
      case "<":
        return "&lt;"
      case ">":
        return "&gt;"
      case "&":
        return "&amp;"
      case "'":
        return "&apos;"
      case '"':
        return "&quot;"
    }
    return c
  })
}

export const generateVoice = async (text: string, voiceId: string) => {
  if (!process.env.SYNCLABS_API_KEY) throw new Error("SYNCLABS_API_KEY is not set")
  try {
    const response = await axios.post(
      "https://api.synclabs.so/speak",
      {
        name: "https://vhuydaxyqogmpjizeokl.supabase.co/storage/v1/object/public/melimi/1006101665_1724945540234.mp4",
        transcript: text,
        voiceId: voiceId,
        webhookUrl: `${process.env.BASE_URL}/api/create-audio`,
      },
      {
        headers: {
          "Content-Type": "application/json",
          "x-api-key": process.env.SYNCLABS_API_KEY,
        },
      },
    )

    if (response.status !== 201) {
      throw new Error("Ошибка при генерации голоса")
    }

    return response.data
  } catch (error) {
    console.error(error)
    throw new Error("Ошибка при генерации голоса")
  }
}

export const pulse = async (ctx: MyContext, image: string, prompt: string, command: string) => {
  try {
    if (process.env.NODE_ENV === "development") return

    const truncatedPrompt = prompt.length > 800 ? prompt.slice(0, 800) : prompt
    const caption = `@${ctx.from?.username || "Пользователь без username"} Telegram ID: ${
      ctx.from?.id
    } сгенерировал изображение с промптом: ${truncatedPrompt} \n\n Команда: ${command}`

    // Если изображение начинается с data:image/, нужно получить только base64
    let imageToSend = image
    if (image.startsWith("data:image/")) {
      imageToSend = image.split(",")[1]
    }

    // Преобразуем base64 в буфер
    const imageBuffer = Buffer.from(imageToSend, "base64")

    // Отправляем как InputFile
    await bot.api.sendPhoto("-4166575919", new InputFile(imageBuffer), { caption })
  } catch (error) {
    console.error("Ошибка при отправке пульса:", error)
    throw new Error("Ошибка при отправке пульса")
  }
}

export const upgradePrompt = async (prompt: string) => {
  const completion = await openai.chat.completions.create({
    model: "gpt-4o",
    messages: [
      {
        role: "system",
        content: "You are a helpful assistant that upgrades the given prompt for image generation. Return only the upgraded prompt. ",
      },
      {
        role: "user",
        content: prompt,
      },
    ],
    temperature: 0.7,
    max_tokens: 1000,
  })

  return completion.choices[0].message.content
}

export const sendPaymentNotification = async (amount: number, stars: number, telegramId: string, language: string, username: string) => {
  try {
    const caption =
      language === "ru"
        ? `💸 Пользователь @${username || "Пользователь без username"} (Telegram ID: ${telegramId}) оплатил ${amount} рублей и получил ${stars} звезд.`
        : `💸 User @${username || "User without username"} (Telegram ID: ${telegramId}) paid ${amount} RUB and received ${stars} stars.`

    await bot.api.sendMessage("-4166575919", caption)
  } catch (error) {
    console.error("Ошибка при отправке уведомления об оплате:", error)
    throw new Error("Ошибка при отправке уведомления об оплате")
  }
}

export const customMiddleware: MiddlewareFn<MyContext> = async (ctx, next) => {
  if (process.env.NODE_ENV === "development") {
    // Пропускаем проверку для режима разработки
    return await next()
  }

  const username = ctx.from?.username || ""
  const telegram_id = ctx.from?.id
  // const chatMember = await bot.api.getChatMember("@neuro_coder_ai", telegram_id || 0)
  // console.log(chatMember, "chatMember")
  // const isSubscribed = chatMember.status === "member" || chatMember.status === "administrator" || chatMember.status === "creator"

  // if (!isSubscribed) {
  //   const isRu = ctx.from?.language_code === "ru"
  //   await ctx.reply(
  //     isRu ? "Пожалуйста, подпишитесь на наш канал, чтобы продолжить использование бота. 😊" : "Please subscribe to our channel to continue using the bot. 😊",
  //     {
  //       reply_markup: {
  //         inline_keyboard: [[{ text: "Подписаться", url: `t.me/neuro_coder_ai` }]],
  //       },
  //     },
  //   )
  //   return
  // }

  if (telegram_id) {
    // Ваша логика здесь
    console.log(username, telegram_id, "username, telegram_id")
    await createUser({ username, telegram_id: telegram_id.toString() })

    // Проверка наличия инвайтера
    const { data: user, error } = await supabase.from("users").select("inviter").eq("telegram_id", telegram_id.toString()).maybeSingle()

    if (error) {
      console.error(`Ошибка при проверке инвайтера: ${error.message}`)
      throw new Error(`Ошибка при проверке инвайтера: ${error.message}`)
    }

    if (!user?.inviter) {
      await ctx.conversation.enter("inviterConversation")
      return
    }
  }

  // Продолжаем выполнение следующих промежуточных обработчиков
  await next()
}

export async function createSlideshow(images: string[], audioPath: string, outputPath: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const command = ffmpeg()

    images.forEach((image, index) => {
      console.log(`Adding image ${index + 1}: ${image}`)
      command.input(image).loop(1)
    })

    // Добавляем аудио файл
    command.input(audioPath)

    command
      .outputOptions("-map", `${images.length}:a`) // Мапим аудио из последнего входного файла
      .outputOptions("-c:a", "aac") // Кодируем аудио в AAC
      .outputOptions("-shortest") // Обрезаем видео до длины самого короткого входного потока
      .outputOptions("-r", "25")
      .output(outputPath)
      .on("start", (commandLine) => {
        console.log("FFmpeg process started:", commandLine)
      })
      .on("progress", (progress) => {
        console.log("Processing: " + JSON.stringify(progress) + progress.percent + "% done")
      })
      .on("end", () => {
        console.log("FFmpeg process completed")
        resolve(outputPath)
      })
      .on("error", (err) => {
        console.error("FFmpeg error:", err)
        reject(err)
      })
      .run()
  })
}

export async function mergeAudioFiles(audioStream1: string, audioStream2: string, outputFile: string): Promise<void> {
  const tempFile1 = path.join(__dirname, audioStream1)
  console.log(tempFile1, "tempFile1")
  const tempFile2 = path.join(__dirname, audioStream2)
  console.log(tempFile2, "tempFile2")
  return new Promise((resolve, reject) => {
    ffmpeg()
      .input(tempFile1)
      .input(tempFile2)
      .complexFilter([
        "[0:a]volume=0.2[a1]",
        "[1:a]volume=1.0[a2]",
        {
          filter: "amix",
          options: {
            inputs: 2,
            duration: "shortest",
            dropout_transition: 0,
          },
          inputs: ["a1", "a2"],
        },
      ])
      .on("end", () => resolve())
      .on("error", (err) => reject(err))
      .save(outputFile)
  })
}

export const createAudioFileFromText = async ({ text, voice_id }: { text: string; voice_id: string }): Promise<string> => {
  // Логируем входные данные
  console.log("Attempting to create audio with:", {
    voice_id,
    textLength: text.length,
    apiKeyPresent: !!process.env.ELEVENLABS_API_KEY,
    apiKeyPrefix: process.env.ELEVENLABS_API_KEY?.substring(0, 5),
  })

  return new Promise<string>(async (resolve, reject) => {
    try {
      // Проверяем наличие API ключа
      if (!process.env.ELEVENLABS_API_KEY) {
        throw new Error("ELEVENLABS_API_KEY отсутствует")
      }

      // Логируем попытку генерации
      console.log("Generating audio stream...")

      const audioStream = await elevenlabs.generate({
        voice: voice_id,
        model_id: "eleven_turbo_v2_5",
        text,
      })

      // Логируем успешную генерацию
      console.log("Audio stream generated successfully")

      const outputPath = path.join(os.tmpdir(), `audio_${Date.now()}.mp3`)
      const writeStream = createWriteStream(outputPath)

      audioStream.pipe(writeStream)

      writeStream.on("finish", () => {
        console.log("Audio file written successfully to:", outputPath)
        resolve(outputPath)
      })

      writeStream.on("error", (error) => {
        console.error("Error writing audio file:", error)
        reject(error)
      })
    } catch (error: any) {
      console.error("Error in createAudioFileFromText:", {
        message: error.message,
        statusCode: error.statusCode,
        stack: error.stack,
      })
      reject(error)
    }
  })
}
export const createRender = async ({ template_id, modifications }: { template_id: string; modifications: Record<string, string> }) => {
  try {
    const options = {
      templateId: template_id,
      modifications: modifications,
    }

    const renders = await client.render(options)
    console.log("Completed:", renders)

    return renders
  } catch (error) {
    console.error("Error creating render:", error)
  }
}

export function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

export async function deleteFileFromSupabase(bucketName: string, fileName: string) {
  try {
    const { data, error } = await supabase.storage.from(bucketName).remove([fileName])

    if (error) {
      console.error("Ошибка при удалении файла из Supabase:", error.message)
    } else {
      console.log("Файл успешно удален из Supabase:", data)
    }
  } catch (error: any) {
    console.error("Ошибка при удалении файла из Supabase:", error.message)
  }
}

export async function getAudioDuration(filePath: string): Promise<number> {
  return new Promise((resolve, reject) => {
    ffmpeg.ffprobe(filePath, (err, metadata) => {
      if (err) {
        reject(err)
      } else {
        const duration = metadata.format.duration || 0
        resolve(duration)
      }
    })
  })
}

export async function imageToVideo(promptImage: string, promptText: string): Promise<void> {
  try {
    // Создаем задачу для генерации видео из изображения
    const imageToVideoTask = await clientRunway.imageToVideo.create({
      model: "gen3a_turbo",
      promptImage: promptImage,
      promptText: promptText,
    })

    const taskId = imageToVideoTask.id
    console.log(`Задача создана с ID: ${taskId}`)

    // Ожидаем завершения задачи
    let task
    do {
      await new Promise((resolve) => setTimeout(resolve, 10000)) // Ждем 10 секунд перед повторной проверкой
      task = await clientRunway.tasks.retrieve(taskId)
      console.log(`Статус задачи: ${task.status}`)
    } while (!["SUCCEEDED", "FAILED"].includes(task.status))

    if (task.status === "SUCCEEDED") {
      console.log("Задача успешно завершена:", task.output)
      return task.output
    } else {
      console.error("Задача завершилась с ошибкой.")
    }
  } catch (error) {
    console.error("Ошибка при создании видео из изображения:", error)
  }
}
