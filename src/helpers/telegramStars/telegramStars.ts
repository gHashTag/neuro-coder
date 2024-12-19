import { supabase } from "../../core/supabase"
import { MyContext } from "../../utils/types"

const starCost = 0.016

const imageGenerationCost = 0.12
const textToVideoCost = 0.99
const trainingCostInDollars = 15
const imageToVideoCost = 0.99
const textToSpeechCost = 0.1

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

const trainingCostInStars = Math.ceil(trainingCostInDollars / starCost)

const sendBalanceMessage = async (ctx: MyContext, isRu: boolean, newBalance: number) => {
  await ctx.reply(
    isRu
      ? `Изображение сгенерировано.\nСтоимость: ${imageGenerationCost.toFixed(3)} ⭐️\nВаш новый баланс: ${newBalance.toFixed(3)} ⭐️`
      : `Image generated.\nCost: ${imageGenerationCost.toFixed(3)} ⭐️\nYour new balance: ${newBalance.toFixed(3)} ⭐️`,
  )
}

const sendCurrentBalanceMessage = async (ctx: MyContext, isRu: boolean, currentBalance: number) => {
  await ctx.reply(isRu ? `Ваш текущий баланс: ${currentBalance.toFixed(5)} ⭐️` : `Your current balance: ${currentBalance.toFixed(5)} ⭐️`)
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
}
