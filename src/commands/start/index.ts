import { MyContext } from "../../utils/types"

export async function start(ctx: MyContext) {
  // Запускаем нейро-квест
  await ctx.conversation.enter("neuroQuest")
}
