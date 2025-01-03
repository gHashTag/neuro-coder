export interface Step {
  step: string
  details: {
    en: string
    es: string
  }
  voiceOver?: {
    en: string
    ru: string
    zh: string
  }
}

export interface ImageToVideoResponse {
  success: boolean
  videoUrl?: string
  message?: string
  prompt_id?: number
}

export interface GenerationResult {
  image: string | Buffer
  prompt_id: number
}

export type ModelUrl = `${string}/${string}:${string}`

export interface UserModel {
  model_name: string
  trigger_word: string
  model_url: ModelUrl
  model_key?: ModelUrl
}
