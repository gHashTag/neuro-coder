import { VideoModel } from "interfaces/cost.interface"

export const starCost = 0.016

// Определяем стоимость для каждой модели
export const MODEL_PRICES: Record<VideoModel, number> = {
  minimax: 0.5,
  haiper: 0.05,
  ray: 0.45,
  "i2vgen-xl": 0.45,
}

export const trainingCostInStars = 20 / starCost
export const promptGenerationCost = 0.048 / starCost
export const textToImageGenerationCost = 0.12 / starCost
export const imageNeuroGenerationCost = 0.12 / starCost
export const textToVideoGenerationCost = 0.99 / starCost
export const textToVideoCost = 0.99 / starCost
export const speechGenerationCost = 0.12 / starCost
export const textToSpeechCost = 0.12 / starCost
export const imageToVideoCost = 0.99 / starCost
export const imageToVideoGenerationCost = 0.99 / starCost
export const imageToPromptCost = 0.03 / starCost
export const voiceConversationCost = 0.99 / starCost

export function calculateFinalPrice(model: VideoModel): number {
  const basePrice = MODEL_PRICES[model]
  const interest = 0.5 // 50% interest
  return Math.floor((basePrice * (1 + interest)) / starCost)
}
