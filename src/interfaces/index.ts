import { Context, NarrowedContext, Scenes } from "telegraf"
import type { Update, Message } from "telegraf/typings/core/types/typegram"

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

export interface SessionData {
  selectedModel: string
  text: string
  model_type: ModelUrl
  selectedSize: string
  userModel: UserModel
  mode: Mode
}

export type Mode = "neuro_photo" | "generate_image"

export interface MyWizardSession extends Scenes.WizardSessionData {
  data: string
}

export interface MySession extends Scenes.WizardSession<MyWizardSession> {
  selectedModel: string
  prompt: string
  selectedSize: string
  userModel: UserModel
  numImages: number
  telegram_id: number
  mode: Mode
  attempts: number
}

export interface MyContext extends Context {
  myContextProp: string
  session: MySession
  attempts: number
  scene: Scenes.SceneContextScene<MyContext, MyWizardSession>
  wizard: Scenes.WizardContextWizard<MyContext>
}
// Создайте новый тип, объединяющий MyContext и WizardContext
export type MyWizardContext = MyContext & Scenes.WizardContext<MyWizardSession>

export type MyTextMessageContext = NarrowedContext<MyContext, Update.MessageUpdate<Message.TextMessage>>
