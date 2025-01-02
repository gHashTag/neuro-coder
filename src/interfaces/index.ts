import { Context, Scenes } from "telegraf"

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
}

export interface MyWizardSession extends Scenes.WizardSessionData {
  selectedModel: string
  text: string
}

export interface MySession extends Scenes.WizardSession<MyWizardSession> {
  selectedModel: string
  text: string
}

export interface MyContext extends Context {
  myContextProp: string
  session: MySession
  scene: Scenes.SceneContextScene<MyContext, MyWizardSession>
  wizard: Scenes.WizardContextWizard<MyContext>
}

export type MyWizardContext = MyContext & Scenes.WizardContext<MyWizardSession>
