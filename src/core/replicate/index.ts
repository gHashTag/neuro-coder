import Replicate from "replicate"

export const replicate = new Replicate({
  auth: process.env.REPLICATE_API_TOKEN,
})

export const modelPricing: Record<string, string> = {
  "black-forest-labs/flux-1.1-pro": "$0.040 / image",
  "black-forest-labs/flux-1.1-pro-ultra": "$0.060 / image",
  "black-forest-labs/flux-canny-dev": "$0.025 / image",
  "black-forest-labs/flux-canny-pro": "$0.050 / image",
  "black-forest-labs/flux-depth-dev": "$0.025 / image",
  "black-forest-labs/flux-depth-pro": "$0.050 / image",
  "black-forest-labs/flux-dev": "$0.025 / image",
  "black-forest-labs/flux-dev-lora": "$0.032 / image",
  "black-forest-labs/flux-fill-dev": "$0.040 / image",
  "black-forest-labs/flux-fill-pro": "$0.050 / image",
  "black-forest-labs/flux-pro": "$0.055 / image",
  "black-forest-labs/flux-redux-dev": "$0.025 / image",
  "black-forest-labs/flux-redux-schnell": "$0.003 / image",
  "black-forest-labs/flux-schnell": "$0.003 / image",
  "black-forest-labs/flux-schnell-lora": "$0.020 / image",
  "ideogram-ai/ideogram-v2": "$0.080 / image",
  "ideogram-ai/ideogram-v2-turbo": "$0.050 / image",
  "luma/photon": "$0.030 / image",
  "luma/photon-flash": "$0.010 / image",
  "recraft-ai/recraft-20b": "$0.022 / image",
  "recraft-ai/recraft-20b-svg": "$0.044 / image",
  "recraft-ai/recraft-v3": "$0.040 / image",
  "recraft-ai/recraft-v3-svg": "$0.080 / image",
  "stability-ai/stable-diffusion-3": "$0.035 / image",
  "stability-ai/stable-diffusion-3.5-large": "$0.065 / image",
  "stability-ai/stable-diffusion-3.5-large-turbo": "$0.040 / image",
  "stability-ai/stable-diffusion-3.5-medium": "$0.035 / image",
}

interface ModelConfig {
  key: string
  word: string
  description: {
    ru: string
    en: string
  }
  getInput: (prompt: string, aspect_ratio?: string) => Record<string, any>
  price: number
}

export const models: Record<string, ModelConfig> = {
  flux: {
    key: "black-forest-labs/flux-1.1-pro-ultra",
    word: "ultra realistic photograph, 8k uhd, high quality",
    description: {
      ru: "🎨 Flux - фотореалистичные изображения высокого качества",
      en: "🎨 Flux - photorealistic high quality images",
    },
    getInput: (prompt, aspect_ratio) => ({
      prompt,
      size: aspect_ratio === "1:1" ? "1024x1024" : aspect_ratio === "16:9" ? "1365x768" : "1365x1024",
      aspect_ratio: aspect_ratio,
      negative_prompt: "nsfw, erotic, violence, bad anatomy",
    }),
    price: 0.06,
  },
  sdxl: {
    key: "stability-ai/sdxl:7762fd07cf82c948538e41f63f77d685e02b063e37e496e96eefd46c929f9bdc",
    word: "ultra realistic photograph, 8k uhd, high quality",
    description: {
      ru: "🎨 SDXL - фотореалистичные изображения высокого качества",
      en: "🎨 SDXL - photorealistic high quality images",
    },
    getInput: (prompt, aspect_ratio) => ({
      width: aspect_ratio === "1:1" ? 1024 : 1024,
      height: aspect_ratio === "1:1" ? 1024 : 768,
      prompt,
      refine: "expert_ensemble_refiner",
      apply_watermark: false,
      num_inference_steps: 25,
      negative_prompt:
        "nsfw, erotic, violence, bad anatomy, bad hands, text, error, missing fingers, extra digit, fewer digits, cropped, worst quality, low quality, normal quality, jpeg artifacts, signature, watermark, username, blurry",
    }),
    price: 0.04,
  },
  sd3: {
    key: "stability-ai/stable-diffusion-3.5-large-turbo",
    word: "",
    description: {
      ru: "🎨 SD3 - фотореалистичные изображения высокого качества",
      en: "🎨 SD3 - photorealistic high quality images",
    },
    getInput: (prompt, aspect_ratio) => ({
      prompt,
      aspect_ratio: aspect_ratio === "1:1" ? "1:1" : aspect_ratio === "16:9" ? "16:9" : "3:2",
      negative_prompt:
        "nsfw, erotic, violence, bad anatomy, bad hands, text, error, missing fingers, extra digit, fewer digits, cropped, worst quality, low quality, normal quality, jpeg artifacts, signature, watermark, username, blurry",
    }),
    price: 0.04,
  },
  recraft: {
    key: "recraft-ai/recraft-v3",
    word: "",
    description: {
      ru: "🎨 Recraft - фотореалистичные изображения высокого качества",
      en: "🎨 Recraft - photorealistic high quality images",
    },
    getInput: (prompt, aspect_ratio) => ({
      prompt,
      width: aspect_ratio === "1:1" ? 1024 : 1024,
      height: aspect_ratio === "1:1" ? 1024 : 768,
      negative_prompt:
        "nsfw, erotic, violence, bad anatomy, bad hands, text, error, missing fingers, extra digit, fewer digits, cropped, worst quality, low quality, normal quality, jpeg artifacts, signature, watermark, username, blurry",
    }),
    price: 0.022,
  },
  photon: {
    key: "luma/photon",
    word: "",
    description: {
      ru: "🎨 Photon - фотореалистичные изображения высокого качества",
      en: "🎨 Photon - photorealistic high quality images",
    },
    getInput: (prompt) => ({
      prompt,
    }),
    price: 0.03,
  },
}
