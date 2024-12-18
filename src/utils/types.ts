import { Context, SessionFlavor } from "grammy"
import { Conversation, ConversationFlavor } from "@grammyjs/conversations"

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

export type MyContext = Context & ConversationFlavor

export type MyConversation = Conversation<MyContext & ConversationFlavor>

export type MyContextWithSession = MyContext & SessionFlavor<SessionData>

export interface GenerationResult {
  image: string | Buffer
  prompt_id: number
}
