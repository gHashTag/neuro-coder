import { Context, MemorySessionStorage, SessionFlavor } from "grammy"
import { Conversation, ConversationFlavor } from "@grammyjs/conversations"
import { ChatMembersFlavor } from "@grammyjs/chat-members"
import type { ChatMember } from "grammy/types"

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
  selectedModel?: string
  text?: string
  conversation?: {
    [key: string]: any
  }
}

// Определяем тип контекста
export type MyContext = Context & SessionFlavor<SessionData> & ConversationFlavor & ChatMembersFlavor

// Если необходимо, определите MyConversation
export type MyConversation = Conversation<MyContext>

export type MyContextWithSession = MyContext & SessionFlavor<SessionData>

export interface GenerationResult {
  image: string | Buffer
  prompt_id: number
}

export type MyContextChatMembers = Context & ChatMembersFlavor
// Создаем адаптер для хранения информации о участниках
export const adapter = new MemorySessionStorage<ChatMember>()
