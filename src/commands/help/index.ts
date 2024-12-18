import { MyContext } from "../../utils/types"

export async function helpConversation(ctx: MyContext) {
  await ctx.conversation.enter("neuroQuest")
}
