import { supabase } from "../../core/supabase"
import { MyContext } from "../../interfaces"

const starCost = 0.016

const trainingCostInStars = 20 / starCost
const promptGenerationCost = 0.048 / starCost
const textToImageGenerationCost = 0.12 / starCost
const imageNeuroGenerationCost = 0.12 / starCost
const textToVideoGenerationCost = 0.99 / starCost
const textToVideoCost = 0.99 / starCost
const speechGenerationCost = 0.12 / starCost
const textToSpeechCost = 0.12 / starCost
const imageToVideoCost = 0.99 / starCost
const imageToVideoGenerationCost = 0.99 / starCost
const imageToPromptCost = 0.03 / starCost
const voiceConversationCost = 0.99 / starCost

async function incrementBalance({ telegram_id, amount }: { telegram_id: string; amount: number }) {
  const { data, error } = await supabase.from("users").select("balance").eq("telegram_id", telegram_id).single()

  if (error || !data) {
    throw new Error("Не удалось получить текущий баланс")
  }

  const newBalance = data.balance + amount

  const { error: updateError } = await supabase.from("users").update({ balance: newBalance }).eq("telegram_id", telegram_id.toString())

  if (updateError) {
    throw new Error("Не удалось обновить баланс")
  }
}

async function getUserBalance(userId: number): Promise<number> {
  console.log("userId", userId)
  const { data, error } = await supabase
    .from("users")
    .select("balance, telegram_id, user_id, first_name, last_name, username")
    .eq("telegram_id", userId.toString())
    .single()
  console.log("data", data)
  if (error) {
    if (error.code === "PGRST116") {
      console.error(`Пользователь с ID ${userId} не найден.`)
      throw new Error("Пользователь не найден")
    }
    console.error("Ошибка при получении баланса:", error)
    throw new Error("Не удалось получить баланс пользователя")
  }

  return data?.balance || 0
}

// Функция для обновления баланса пользователя
async function updateUserBalance(userId: number, newBalance: number): Promise<void> {
  const { error } = await supabase.from("users").update({ balance: newBalance }).eq("telegram_id", userId.toString())

  if (error) {
    console.error("Ошибка при обновлении баланса:", error)
    throw new Error("Не удалось обновить баланс пользователя")
  }
}

function calculateStars(paymentAmount: number, starCost: number): number {
  return Math.floor(paymentAmount / starCost)
}

async function sendInsufficientStarsMessage(ctx: MyContext, isRu: boolean) {
  const message = isRu
    ? "Недостаточно звезд для генерации изображения. Пополните баланс вызвав команду /buy."
    : "Insufficient stars for image generation. Top up your balance by calling the /buy command."

  await ctx.reply(message)
}

const sendBalanceMessage = async (newBalance: number, cost: number, ctx: MyContext, isRu: boolean) => {
  await ctx.reply(
    isRu
      ? `Стоимость: ${cost.toFixed(2)} ⭐️\nВаш баланс: ${newBalance.toFixed(2)} ⭐️`
      : `Cost: ${cost.toFixed(2)} ⭐️\nYour balance: ${newBalance.toFixed(2)} ⭐️`,
  )
}

export {
  incrementBalance,
  starCost,
  getUserBalance,
  updateUserBalance,
  calculateStars,
  trainingCostInStars,
  sendInsufficientStarsMessage,
  textToImageGenerationCost,
  sendBalanceMessage,
  textToVideoCost,
  imageToVideoCost,
  textToSpeechCost,
  speechGenerationCost,
  promptGenerationCost,
  imageNeuroGenerationCost,
  imageToPromptCost,
  textToVideoGenerationCost,
  imageToVideoGenerationCost,
  voiceConversationCost,
}
