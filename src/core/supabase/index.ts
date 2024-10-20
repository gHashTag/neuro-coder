import { createClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.SUPABASE_URL
const supabaseKey = process.env.SUPABASE_ANON_KEY
export const supabase = createClient(supabaseUrl || "", supabaseKey || "")

export const createUser = async (username: string, telegram_id: string) => {
  // Проверяем, существует ли пользователь с данным telegram_id
  const { data: existingUser, error } = await supabase.from("users").select("username").eq("telegram_id", telegram_id).maybeSingle()

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
  } else {
    // Если пользователь не существует, создаем новую запись
    const { error: insertError } = await supabase.from("users").insert({ username, telegram_id })

    if (insertError) {
      // Если произошла ошибка при вставке, выбрасываем её
      throw new Error(`Ошибка при добавлении пользователя: ${insertError.message}`)
    }
  }
}

export const updateUserSoul = async (telegram_id: string, company: string, position: string, designation: string) => {
  const { error } = await supabase.from("users").update({ company, position, designation }).eq("telegram_id", telegram_id)
  if (error) {
    throw new Error(`Ошибка при обновлении пользователя: ${error.message}`)
  }
}

export const updateUserVoice = async (telegram_id: string, voice_id_synclabs: string) => {
  const { error } = await supabase.from("users").update({ voice_id_synclabs }).eq("telegram_id", telegram_id)
  if (error) {
    throw new Error(`Ошибка при обновлении пользователя: ${error.message}`)
  }
}
