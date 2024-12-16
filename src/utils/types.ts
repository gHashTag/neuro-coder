import { Context, SessionFlavor } from "grammy"
import { FileFlavor } from "@grammyjs/files"
import { ConversationFlavor } from "@grammyjs/conversations"

interface SessionData {
  melimi00: {
    videos: string[]
    texts: string[]
  }
}

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

export type MyContext = Context & FileFlavor<Context> & ConversationFlavor

export type MyContextWithSession = MyContext & SessionFlavor<SessionData>
