export type VideoModel = "minimax" | "haiper" | "ray" | "i2vgen-xl"

export interface VideoModelConfig {
  name: VideoModel
  title: string
  description: string
}

export const VIDEO_MODELS: VideoModelConfig[] = [
  {
    name: "minimax",
    title: "Minimax",
    description: "Оптимальное качество и скорость",
  },
  {
    name: "haiper",
    title: "Haiper",
    description: "Высокое качество, длительность 6 секунд",
  },
  {
    name: "ray",
    title: "Ray",
    description: "Реалистичная анимация",
  },
  {
    name: "i2vgen-xl",
    title: "I2VGen-XL",
    description: "Продвинутая модель для детальной анимации",
  },
]

export type Mode =
  | "neuro_photo"
  | "generate_image"
  | "text_to_video"
  | "image_to_video"
  | "avatar"
  | "image_to_prompt"
  | "text_to_speech"
  | "text_to_image"
  | "text_to_video"
  | "voice"

export type ModeCosts = Required<Record<Mode, number>>
