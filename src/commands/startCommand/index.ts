import { MyContext, MyConversation } from "../../utils/types"

export async function startCommand(conversation: MyConversation, ctx: MyContext) {
  // Запускаем нейро-квест
  console.log("CASE: start")
  await ctx.conversation.enter("neuroQuest")
  return
}
