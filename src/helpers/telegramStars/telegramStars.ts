import { supabase } from "../../core/supabase"
import { MyContext } from "../../interfaces"

export async function refundUser(ctx: MyContext, paymentAmount: number) {
  if (!ctx.from) {
    throw new Error("User not found")
  }
  const balance = await getUserBalance(ctx.from.id)
  console.log("balance", balance)
  // Возвращаем средства пользователю
  const newBalance = balance + paymentAmount
  console.log("newBalance", newBalance)
  await updateUserBalance(ctx.from.id, newBalance)

  // Отправляем сообщение пользователю
  const isRu = ctx.from.language_code === "ru"
  await ctx.reply(
    isRu
      ? `Возвращено ${paymentAmount.toFixed(2)} ⭐️ на ваш счет.\nВаш баланс: ${newBalance.toFixed(2)} ⭐️`
      : `${paymentAmount.toFixed(2)} ⭐️ have been refunded to your account.\nYour balance: ${newBalance.toFixed(2)} ⭐️`,
    {
      reply_markup: {
        remove_keyboard: true,
      },
    },
  )
}

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

export { incrementBalance, getUserBalance, updateUserBalance, calculateStars, sendInsufficientStarsMessage, sendBalanceMessage }
