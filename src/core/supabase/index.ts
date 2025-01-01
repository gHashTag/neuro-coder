import { createClient } from "@supabase/supabase-js"

if (!process.env.SUPABASE_URL) {
  throw new Error("SUPABASE_URL is not set")
}

if (!process.env.SUPABASE_SERVICE_KEY) {
  throw new Error("SUPABASE_SERVICE_KEY is not set")
}

// Создаем клиент с service role key
export const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY)

interface CreateUserData {
  username: string
  telegram_id: string
  first_name?: string | null
  last_name?: string | null
  is_bot?: boolean
  language_code?: string
  photo_url?: string | null
  chat_id?: number | null
  mode?: string
  model?: string
  count?: number
  limit?: number
  aspect_ratio?: string
  balance?: number
  inviter?: string | null
}

export const createUser = async (userData: CreateUserData) => {
  const { username, telegram_id, first_name, last_name, is_bot, language_code, photo_url, chat_id, mode, model, count, limit, aspect_ratio, balance, inviter } =
    userData

  let inviterUser
  if (inviter) {
    const { data: checkInviter, error: fetchError } = await supabase.from("users").select("user_id").eq("user_id", inviter).maybeSingle()

    if (fetchError) throw new Error(`Ошибка при проверке инвайтера: ${fetchError.message}`)
    inviterUser = checkInviter
  }

  const isInviter = inviter && inviterUser

  const { data: existingUser, error } = await supabase.from("users").select("*").eq("telegram_id", telegram_id.toString()).maybeSingle()

  if (error) {
    throw new Error(`Ошибка при проверке существующего пользователя: ${error.message}`)
  }

  if (existingUser) {
    const updates = {
      username,
      first_name,
      last_name,
      is_bot,
      language_code,
      photo_url,
      chat_id,
      mode,
      model,
      count,
      limit,
      aspect_ratio,
      balance,
      ...(!existingUser.inviter && isInviter ? { inviter } : {}),
    }

    const { error: updateError } = await supabase.from("users").update(updates).eq("telegram_id", telegram_id.toString())

    if (updateError) {
      throw new Error(`Ошибка при обновлении пользователя: ${updateError.message}`)
    }
  } else {
    // Создаем базовый объект пользователя без inviter
    const newUser = {
      username,
      telegram_id,
      first_name,
      last_name,
      is_bot,
      language_code,
      photo_url,
      chat_id,
      mode,
      model,
      count,
      limit,
      aspect_ratio,
      balance,
      ...(isInviter ? { inviter } : {}),
    }

    const { error: insertError } = await supabase.from("users").insert([newUser])

    if (insertError) {
      throw new Error(`Ошибка при добавлении пользователя: ${insertError.message}`)
    }
  }

  return existingUser
}

export const getUid = async (telegram_id: string | number): Promise<string | null> => {
  try {
    if (!telegram_id) {
      console.warn("No telegram_id provided to getUid")
      return null
    }

    const { data, error } = await supabase.from("users").select("user_id").eq("telegram_id", telegram_id.toString()).maybeSingle()

    if (error) {
      console.error("Error getting user_id:", error)
      return null
    }

    return data?.user_id || null
  } catch (error) {
    console.error("Error in getUid:", error)
    return null
  }
}
export const updateUserSoul = async (telegram_id: string, company: string, position: string, designation: string) => {
  const { error } = await supabase.from("users").update({ company, position, designation }).eq("telegram_id", telegram_id.toString())
  if (error) {
    throw new Error(`Ошибка при обновлении пользователя: ${error.message}`)
  }
}

export const updateUserVoice = async (telegram_id: string, voice_id_elevenlabs: string) => {
  const { error } = await supabase.from("users").update({ voice_id_elevenlabs }).eq("telegram_id", telegram_id.toString())
  if (error) {
    throw new Error(`Ошибка при обновлении пользователя: ${error.message}`)
  }
}

export const getVoiceId = async (telegram_id: string) => {
  const { data, error } = await supabase.from("users").select("voice_id_elevenlabs").eq("telegram_id", telegram_id.toString()).maybeSingle()
  if (error) {
    throw new Error(`Ошибка при получении voice_id_elevenlabs: ${error.message}`)
  }
  return data?.voice_id_elevenlabs
}

export const getReferalsCount = async (telegram_id: string) => {
  try {
    // Сначала получаем UUID пользователя
    const { data: userData, error: userError } = await supabase.from("users").select("user_id").eq("telegram_id", telegram_id.toString()).single()

    if (userError) {
      console.error("Ошибка при получении user_id:", userError)
      return 0
    }

    // Теперь ищем рефералов по UUID
    const { data, error } = await supabase.from("users").select("inviter").eq("inviter", userData.user_id)

    if (error) {
      console.error("Ошибка при получении рефералов:", error)
      return 0
    }

    return data?.length || 0
  } catch (error) {
    console.error("Ошибка в getReferalsCount:", error)
    return 0
  }
}
// Определяем тип для обновлений и экспортируем его
export type ModelTrainingUpdate = {
  status?: string
  error?: string
  model_url?: string
  replicate_training_id?: string
}

export interface ModelTraining {
  user_id: string
  model_name: string
  trigger_word: string
  zip_url: string
  model_url?: string
  replicate_training_id?: string
  status?: string
  error?: string
}

export const createModelTraining = async (training: ModelTraining) => {
  const { error } = await supabase.from("model_trainings").insert(training)
  if (error) throw new Error(`Ошибка при создании записи о тренировке: ${error.message}`)
}

export const updateModelTraining = async (user_id: string, model_name: string, updates: ModelTrainingUpdate) => {
  const { error } = await supabase.from("model_trainings").update(updates).eq("user_id", user_id).eq("model_name", model_name).eq("status", "processing")
  if (error) throw new Error(`Ошибка при обновлении записи о тренировке: ${error.message}`)
}

export const getUserModel = async (telegram_id: string): Promise<string> => {
  const { data, error } = await supabase.from("users").select("model").eq("telegram_id", telegram_id.toString()).single()

  if (error) {
    console.error("Error getting user model:", error)
    return "gpt-4o"
  }

  return data?.model || "gpt-4o"
}
