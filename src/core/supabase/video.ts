import { supabase } from ".";
import fs from "fs";

export async function uploadVideo(filePath: string, telegram_id: string, bucket: string, fileName: string) {
  try {
    const file = fs.readFileSync(filePath);
    const { data, error } = await supabase.storage.from(bucket).upload(fileName, file, {
      upsert: true,
    });

    if (error) {
      console.error("Ошибка при загрузке видео:", error.message);
      return;
    }

    console.log("Видео успешно загружено:", data);
    return data;
  } catch (error) {
    console.error("Ошибка при загрузке видео:", error);
    return;
  }
}

export async function getVideoUrl(bucket: string, fileName: string) {
  try {
    const { data } = await supabase.storage.from(bucket).getPublicUrl(fileName);
    return data.publicUrl;
  } catch (e) {
    console.error("Ошибка при получении видео URL:", e);
    return;
  }
}
