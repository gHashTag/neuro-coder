import { createClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.SUPABASE_URL
const supabaseKey = process.env.SUPABASE_ANON_KEY
export const supabase = createClient(supabaseUrl || "", supabaseKey || "")

// Start of Selection
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
    // Если произошла ошибка при запросе, выбрасываем её
    throw new Error(`Ошибка при проверке существующего пользователя: ${error.message}`)
  }

  if (existingUser) {
    // Если пользователь существует, проверяем, совпадает ли username
    if (existingUser.username !== username) {
      // Если username отличается, обновляем его
      const { error: updateError } = await supabase.from("users").update({ username }).eq("telegram_id", telegram_id)

      if (updateError) {
        // Если произошла ошибка при обновлении, выбрасываем её
        throw new Error(`Ошибка при обновлении пользователя: ${updateError.message}`)
      }
    }

    // Проверяем, есть ли inviter у пользователя, если нет, то вставляем
    if (!existingUser.inviter && isInviter) {
      const { error: updateInviterError } = await supabase.from("users").update({ inviter }).eq("telegram_id", telegram_id)

      if (updateInviterError) {
        // Если произошла ошибка при обновлении, выбрасываем её
        throw new Error(`Ошибка при обновлении инвайтера: ${updateInviterError.message}`)
      }
    }
  } else {
    // Если пользователь не существует, создаем новую запись
    const { error: insertError } = await supabase.from("users").insert({ username, telegram_id, inviter: isInviter ? inviter : "" })

    if (insertError) {
      // Если произошла ошибка при вставке, выбрасываем её
      throw new Error(`Ошибка при добавлении пользователя: ${insertError.message}`)
    }
  }
  return existingUser
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
