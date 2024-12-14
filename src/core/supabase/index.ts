import { createClient } from "@supabase/supabase-js"

if (!process.env.SUPABASE_URL) {
  throw new Error("SUPABASE_URL is not set")
}

if (!process.env.SUPABASE_SERVICE_KEY) {
  throw new Error("SUPABASE_SERVICE_KEY is not set")
}

// Создаем клиент с service role key
export const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY)

export const createUser = async ({ username, telegram_id, inviter = "" }: { username: string; telegram_id: string; inviter?: string }) => {
  let inviterUser
  if (inviter) {
    const { data: checkInviter, error: fetchError } = await supabase.from("users").select("telegram_id").eq("telegram_id", inviter).maybeSingle()
    if (fetchError) throw new Error(`Ошибка при проверке инвайтера: ${fetchError.message}`)
    inviterUser = checkInviter
  }
  const isInviter = inviter && inviterUser
  // Проверяем, существует ли пользователь с данным telegram_id
  const { data: existingUser, error } = await supabase.from("users").select("*").eq("telegram_id", telegram_id).maybeSingle()

  if (error) {
    throw new Error(`Ошибка при проверке существующего пользователя: ${error.message}`)
  }

  if (existingUser) {
    if (existingUser.username !== username) {
      const { error: updateError } = await supabase.from("users").update({ username }).eq("telegram_id", telegram_id)
      if (updateError) {
        throw new Error(`Ошибка при обновлении пользователя: ${updateError.message}`)
      }
    }

    if (!existingUser.inviter && isInviter) {
      const { error: updateInviterError } = await supabase.from("users").update({ inviter }).eq("telegram_id", telegram_id)
      if (updateInviterError) {
        throw new Error(`Ошибка при обновлении инвайтера: ${updateInviterError.message}`)
      }
    }
  } else {
    const { error: insertError } = await supabase.from("users").insert({ username, telegram_id, inviter: isInviter ? inviter : "" })
    if (insertError) {
      throw new Error(`Ошибка при добавлении пользователя: ${insertError.message}`)
    }
  }
  return existingUser
}

export const getUid = async (telegram_id: string) => {
  const { data, error } = await supabase.from("users").select("user_id").eq("telegram_id", telegram_id).maybeSingle()
  if (error) throw new Error(`Ошибка при получении user_id: ${error.message}`)
  return data?.user_id
}

export const updateUserSoul = async (telegram_id: string, company: string, position: string, designation: string) => {
  const { error } = await supabase.from("users").update({ company, position, designation }).eq("telegram_id", telegram_id)
  if (error) {
    throw new Error(`Ошибка при обновлении пользователя: ${error.message}`)
  }
}

export const updateUserVoice = async (telegram_id: string, voice_id_elevenlabs: string) => {
  const { error } = await supabase.from("users").update({ voice_id_elevenlabs }).eq("telegram_id", telegram_id)
  if (error) {
    throw new Error(`Ошибка при обновлении пользователя: ${error.message}`)
  }
}

export const getVoiceId = async (telegram_id: string) => {
  const { data, error } = await supabase.from("users").select("voice_id_elevenlabs").eq("telegram_id", telegram_id).maybeSingle()
  if (error) {
    throw new Error(`Ошибка при получении voice_id_elevenlabs: ${error.message}`)
  }
  return data?.voice_id_elevenlabs
}

export const getReferalsCount = async (telegram_id: string) => {
  const { data, error } = await supabase.from("users").select("inviter").eq("inviter", telegram_id)
  if (error) throw new Error(`Ошибка при получении рефералов: ${error.message}`)
  return data?.length
}

interface ModelTraining {
  user_id: string
  model_name: string
  trigger_word: string
  zip_url: string
  model_url?: string
  replicate_training_id?: string
  status?: string
}

export const createModelTraining = async (training: ModelTraining) => {
  const { error } = await supabase.from("model_trainings").insert(training)
  if (error) throw new Error(`Ошибка при создании записи о тренировке: ${error.message}`)
}

export const updateModelTraining = async (user_id: string, model_name: string, updates: Partial<ModelTraining>) => {
  const { error } = await supabase.from("model_trainings").update(updates).eq("user_id", user_id).eq("model_name", model_name).eq("status", "processing")
  if (error) throw new Error(`Ошибка при обновлении записи о тренировке: ${error.message}`)
}

export const getUserModel = async (telegram_id: string): Promise<string> => {
  const { data, error } = await supabase.from("users").select("model").eq("telegram_id", telegram_id).single()

  if (error) {
    console.error("Error getting user model:", error)
    return "gpt-3.5-turbo" // дефолтная модель если произошла ошибка
  }

  return data?.model || "gpt-3.5-turbo"
}
