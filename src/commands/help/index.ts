import { MyContext } from "../../utils/types"

export async function help(ctx: MyContext) {
  // Запускаем нейро-квест
  await ctx.conversation.enter("neuroQuest")
}
