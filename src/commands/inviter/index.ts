import { MyContext } from "../../utils/types";
import { Conversation } from "@grammyjs/conversations";
import { supabase } from "../../core/supabase";

async function inviterConversation(conversation: Conversation<MyContext>, ctx: MyContext) {
  const isRu = ctx.from?.language_code === "ru";
  await ctx.reply(isRu ? "Пожалуйста, укажите вашего инвайтера. 😊" : "Please specify your inviter. 😊");
  const telegram_id = ctx.from?.id.toString();
  const { message } = await conversation.wait();

  if (message?.text) {
    const inviterUsername = message.text;
    const { data: inviterUser, error: fetchError } = await supabase.from("users").select("telegram_id").eq("username", inviterUsername).maybeSingle();

    if (fetchError) {
      console.error(isRu ? `Ошибка при проверке инвайтера: ${fetchError.message}` : `Error checking inviter: ${fetchError.message}`);
      throw new Error(isRu ? `Ошибка при проверке инвайтера: ${fetchError.message}` : `Error checking inviter: ${fetchError.message}`);
    }

    if (!inviterUser) {
      await ctx.reply(
        isRu ? "Пользователь с таким username не найден. Пожалуйста, попробуйте снова. 😕" : "User with this username not found. Please try again. 😕",
      );
      return;
    }

    const inviterTelegramId = inviterUser.telegram_id;
    const { error: updateError } = await supabase.from("users").update({ inviter: inviterTelegramId }).eq("telegram_id", telegram_id);

    await ctx.reply(isRu ? "Добро пожаловать! 🎉" : "Welcome! 🎉");
    if (updateError) {
      console.error(isRu ? `Ошибка при обновлении инвайтера: ${updateError.message}` : `Error updating inviter: ${updateError.message}`);
      throw new Error(isRu ? `Ошибка при обновлении инвайтера: ${updateError.message}` : `Error updating inviter: ${updateError.message}`);
    }
  }
}

export { inviterConversation };
