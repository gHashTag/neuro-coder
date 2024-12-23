import { Context, SessionFlavor } from "grammy"
import { Conversation, ConversationFlavor } from "@grammyjs/conversations"

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

export interface SessionData {
  melimi00: {
    videos: string[]
    texts: string[]
  }
  text: string
}

// Определяем тип контекста
export type MyContext = Context & SessionFlavor<SessionData> & ConversationFlavor

// Если необходимо, определите MyConversation
export type MyConversation = Conversation<MyContext>

export type MyContextWithSession = MyContext & SessionFlavor<SessionData>

export interface GenerationResult {
  image: string | Buffer
  prompt_id: number
}
