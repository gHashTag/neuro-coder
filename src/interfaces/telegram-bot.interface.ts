import { Context, NarrowedContext, Scenes } from "telegraf"
import { ModelUrl, UserModel, Mode } from "./index"
import type { Update, Message } from "telegraf/typings/core/types/typegram"

export interface SessionData {
  selectedModel: string
  text: string
  model_type: ModelUrl
  selectedSize: string
  userModel: UserModel
  mode: Mode
  videoModel: string
  imageUrl: string
  paymentAmount: number
}

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
  videoModel: string
  imageUrl: string
  paymentAmount: number
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
