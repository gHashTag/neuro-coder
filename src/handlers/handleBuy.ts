import { Context } from "grammy"

interface BuyParams {
  ctx: Context
  data: string
  isRu: boolean
}

export async function handleBuy({ ctx, data, isRu }: BuyParams) {
  if (data.endsWith("avatar")) {
    await ctx.replyWithInvoice(
      isRu ? "Цифровой аватар" : "Digital avatar",
      isRu
        ? "Представьте, у вас есть возможность создать уникальную цифровую копию себя! Я могу обучить ИИ на ваших фотографиях, чтобы вы в любой момент могли получать изображения с вашим лицом и телом в любом образе и окружении — от фантастических миров до модных фотосессий. Это отличная возможность для личного бренда или просто для развлечения!"
        : "Imagine you have the opportunity to create a unique digital copy of yourself! I can train the AI on your photos so that you can receive images with your face and body in any style and setting — from fantastic worlds to fashion photo sessions. This is a great opportunity for a personal brand or just for fun!",
      "avatar",
      "XTR",
      [{ label: "Цена", amount: 5645 }],
    )
    return
  }

  if (data.endsWith("start")) {
    await ctx.replyWithInvoice(
      isRu ? "НейроСтарт" : "NeuroStart",
      isRu ? "Вы получите подписку уровня 'НейроСтарт'" : "You will receive a subscription to the 'NeuroStart' level",
      "start",
      "XTR",
      [{ label: "Цена", amount: 55 }],
    )
    return
  }

  if (data.endsWith("base")) {
    await ctx.replyWithInvoice(
      isRu ? "НейроБаза" : "NeuroBase",
      isRu ? "Вы получите подписку уровня 'НейроБаза'" : "You will receive a subscription to the 'NeuroBase' level",
      "base",
      "XTR",
      [{ label: "Цена", amount: 565 }],
    )
    return
  }

  if (data.endsWith("student")) {
    await ctx.replyWithInvoice(
      isRu ? "НейроУченик" : "NeuroStudent",
      isRu ? "Вы получите подписку уровня 'НейроУченик'" : "You will receive a subscription to the 'NeuroStudent' level",
      "student",
      "XTR",
      [{ label: "Цена", amount: 5655 }],
    )
    return
  }

  if (data.endsWith("expert")) {
    await ctx.replyWithInvoice(
      isRu ? "НейроЭксперт" : "NeuroExpert",
      isRu ? "Вы получите подписку уровня 'НейроЭксперт'" : "You will receive a subscription to the 'NeuroExpert' level",
      "expert",
      "XTR",
      [{ label: "Цена", amount: 16955 }],
    )
    return
  }
}
