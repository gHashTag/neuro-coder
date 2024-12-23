import { supabase } from "../../core/supabase"
import { MyContext } from "../../utils/types"

const starCost = 0.016

const imageGenerationCost = 0.12 / starCost
const imageNeuroGenerationCost = 0.12 / starCost
const textToVideoCost = 0.99 / starCost
const trainingCostInStars = 50 / starCost
const imageToVideoCost = 0.99 / starCost
const textToSpeechCost = 0.1 / starCost
const voiceCost = 0.3 / starCost
const promptGenerationCost = 0.048 / starCost

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
  const { data, error } = await supabase.from("users").select("balance").eq("telegram_id", userId.toString()).single()

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

const sendBalanceMessage = async (ctx: MyContext, isRu: boolean, newBalance: number) => {
  await ctx.reply(
    isRu
      ? `Изображение сгенерировано.\nСтоимость: ${imageGenerationCost.toFixed(2)} ⭐️\nВаш новый баланс: ${newBalance.toFixed(2)} ⭐️`
      : `Image generated.\nCost: ${imageGenerationCost.toFixed(2)} ⭐️\nYour new balance: ${newBalance.toFixed(2)} ⭐️`,
  )
}

const sendCurrentBalanceMessage = async (ctx: MyContext, isRu: boolean, currentBalance: number) => {
  await ctx.reply(isRu ? `Ваш текущий баланс: ${currentBalance.toFixed(2)} ⭐️` : `Your current balance: ${currentBalance.toFixed(2)} ⭐️`)
  return
}

const sendCostMessage = async (ctx: MyContext, isRu: boolean, cost: number) => {
  await ctx.reply(isRu ? `Стоимость: ${cost.toFixed(2)} ⭐️` : `Cost: ${cost.toFixed(2)} ⭐️`)
  return
}

export {
  incrementBalance,
  starCost,
  getUserBalance,
  updateUserBalance,
  calculateStars,
  trainingCostInStars,
  sendInsufficientStarsMessage,
  imageGenerationCost,
  sendBalanceMessage,
  textToVideoCost,
  sendCurrentBalanceMessage,
  imageToVideoCost,
  textToSpeechCost,
  voiceCost,
  promptGenerationCost,
  imageNeuroGenerationCost,
  sendCostMessage,
}
