import axios, { AxiosRequestConfig } from "axios";
import { supabase } from "./index";

// Удалите старый импорт
// import fetch from "node-fetch";

// Используйте динамический импорт внутри асинхронной функции
async function fetchWithAxios(url: string, options: AxiosRequestConfig) {
  try {
    const response = await axios({
      url,
      method: options.method,
      headers: options.headers,
      data: options.data,
    });
    return {
      ok: response.status >= 200 && response.status < 300,
      status: response.status,
      statusText: response.statusText,
      json: async () => response.data,
    };
  } catch (error) {
    throw error;
  }
}

export const getHistory = async (brand: string, command: string, type: string) => {
  const { data, error } = await supabase
    .from("clips")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(10)
    .eq("brand", brand)
    .eq("command", command)
    .eq("type", type);

  if (error) {
    console.error("Error fetching lifehacks history:", error);
    return [];
  }

  console.log(data);
  return data;
};

export const setHistory = async (brand: string, response: string, video_url: string, command: string, type: string, voice_id = "", chat_id = "") => {
  // Удаление символов # и *
  const sanitizeResponse = (text: string) => {
    return text.replace(/[#*]/g, "");
  };

  const sanitizedResponse = sanitizeResponse(response);

  console.log("Sanitized response:", sanitizedResponse, "!!!!!!!!!!end");
  const { error } = await supabase.from("clips").insert({
    brand: brand,
    response: sanitizedResponse, // Используем очищенный текст
    video_url: video_url,
    command: command,
    type: type,
    voice_id: voice_id,
    chat_id: chat_id,
  });

  if (error) {
    console.error("Error setting lifehack history:", error);
    return false;
  }

  return true;
};

export const incrementGeneratedImages = async (telegram_id: string) => {
  const { data, error } = await supabase.from("users").select("count").eq("telegram_id", telegram_id).single();

  if (error && error.code === "PGRST116") {
    const { error: insertError } = await supabase.from("users").insert({ telegram_id: telegram_id, count: 1 });

    if (insertError) {
      console.error("Ошибка при добавлении нового telegram_id:", insertError);
      return false;
    }
  } else if (data) {
    const newCount = data.count + 1;
    const { error: updateError } = await supabase.from("users").update({ count: newCount }).eq("telegram_id", telegram_id);

    if (updateError) {
      console.error("Ошибка при обновлении count для telegram_id:", updateError);
      return false;
    }
  } else {
    console.error("Ошибка при проверке существования telegram_id:", error);
    return false;
  }

  return true;
};

export const getGeneratedImages = async (telegram_id: string) => {
  const { data, error } = await supabase.from("users").select("count, limit").eq("telegram_id", telegram_id).single();

  if (error || !data) {
    console.log("Ошибка при получении count для telegram_id:", error);
    return { count: 0, limit: 2 };
  }

  return { count: Number(data.count), limit: Number(data.limit) };
};

export const getAspectRatio = async (telegram_id: string) => {
  const { data, error } = await supabase.from("users").select("aspect_ratio").eq("telegram_id", telegram_id).single();

  if (error || !data) {
    console.error("Ошибка при получении aspect_ratio для telegram_id:", error);
    return null;
  }

  return data.aspect_ratio;
};

export const setAspectRatio = async (telegram_id: string, aspect_ratio: string) => {
  const { error } = await supabase.from("users").update({ aspect_ratio: aspect_ratio }).eq("telegram_id", telegram_id);

  if (error) {
    console.error("Ошибка при установке aspect_ratio для telegram_id:", error);
    return false;
  }
  return true;
};

// Пример использования fetchWithDynamicImport
export async function createVoiceSyncLabs({ fileUrl, username }: { fileUrl: string; username: string }): Promise<string | null> {
  const url = "https://api.synclabs.so/voices/create";
  const body = JSON.stringify({
    name: username,
    description: `Voice created from Telegram voice message`,
    inputSamples: [fileUrl],
    webhookUrl: `${process.env.SUPABASE_URL}/functions/v1/synclabs-video`,
  });

  try {
    const response = await fetchWithAxios(url, {
      method: "POST",
      headers: {
        "x-api-key": process.env.SYNC_LABS_API_KEY as string,
        "Content-Type": "application/json",
      },
      data: body,
    });

    if (response.ok) {
      const result = (await response.json()) as { id: string };
      console.log(result, "result");
      return result.id;
    } else {
      console.error(`Error: ${response.status} ${response.statusText}`);
      return null;
    }
  } catch (error) {
    console.error(error);
    return null;
  }
}

export const savePrompt = async (prompt: string, model_type: string) => {
  // Проверяем, существует ли уже такой промпт в таблице
  const { data: existingPrompt, error: selectError } = await supabase.from("prompts_history").select("prompt_id").eq("prompt", prompt).maybeSingle();

  if (selectError) {
    console.error("Ошибка при проверке существующего промпта:", selectError);
    return null;
  }

  if (existingPrompt) {
    // Если промпт уже существует, возвращаем его prompt_id
    return existingPrompt.prompt_id;
  }

  // Если промпт не существует, добавляем его в таблицу
  const { error } = await supabase.from("prompts_history").insert({ prompt: prompt, model_type: model_type }).single();
  if (error) {
    console.error("Ошибка при сохранении промпта:", error);
    return null;
  }

  const { data: newPrompt, error: newError } = await supabase.from("prompts_history").select("prompt_id").eq("prompt", prompt).maybeSingle();
  if (newError || !newPrompt) {
    console.error("Ошибка при получении prompt_id для нового промпта:", newError);
    return null;
  }
  return newPrompt.prompt_id;
};

export const getPrompt = async (prompt_id: string) => {
  const { data, error } = await supabase.from("prompts_history").select("*").eq("prompt_id", prompt_id).single();

  if (error || !data) {
    console.error("Ошибка при получении промпта по prompt_id:", error);
    return null;
  }

  return data;
};
