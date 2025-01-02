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

export interface SessionData {
  selectedModel: string
  text: string
  selectedSize: string
}

export interface MyWizardSession extends Scenes.WizardSessionData {
  data: string
}

export interface MySession extends Scenes.WizardSession<MyWizardSession> {
  selectedModel: string
  prompt: string
  selectedSize: string
}

export interface MyContext extends Context {
  myContextProp: string
  session: MySession
  scene: Scenes.SceneContextScene<MyContext, MyWizardSession>
  wizard: Scenes.WizardContextWizard<MyContext>
}
// Создайте новый тип, объединяющий MyContext и WizardContext
export type MyWizardContext = MyContext & Scenes.WizardContext<MyWizardSession>

export type MyTextMessageContext = NarrowedContext<MyContext, Update.MessageUpdate<Message.TextMessage>>
