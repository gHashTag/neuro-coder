import { ConversationFlavor } from "@grammyjs/conversations"
import { Context, SessionFlavor } from "grammy"

export interface Step {
  step: string
  details: {
    en: string
  }
  voiceOver: {
    en: string
    ru: string
    zh: string
  }
}

export type MyContext = Context & ConversationFlavor

export type SessionData = {
  melimi00: {
    videos: string[]
    texts: string[]
  }
}

export type MyContextWithSession = MyContext & SessionFlavor<SessionData>
