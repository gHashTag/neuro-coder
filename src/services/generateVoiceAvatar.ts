import axios, { isAxiosError } from "axios"
import { isDev } from "../helpers"
import { MyContext } from "../interfaces"

interface VoiceAvatarResponse {
  success: boolean
  message: string
}

export async function generateVoiceAvatar(fileUrl: string, telegram_id: number, ctx: MyContext, isRu: boolean): Promise<VoiceAvatarResponse> {
  try {
    const url = `${isDev ? "http://localhost:3000" : process.env.ELESTIO_URL}/generate/create-avatar-voice`

    const response = await axios.post<VoiceAvatarResponse>(
      url,
      {
        fileUrl,
        telegram_id,
        username: ctx.from?.username,
        is_ru: isRu,
      },
      {
        headers: {
          "Content-Type": "application/json",
        },
      },
    )

    console.log("Voice avatar creation response:", response.data)
    return response.data
  } catch (error) {
    if (isAxiosError(error)) {
      console.error("API Error:", error.response?.data || error.message)
      throw new Error(isRu ? "Произошла ошибка при создании голосового аватара" : "Error occurred while creating voice avatar")
    }
    console.error("Unexpected error:", error)
    throw error
  }
}
