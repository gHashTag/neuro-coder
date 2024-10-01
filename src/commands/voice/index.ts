import { createVoiceSyncLabs } from "../../core/supabase/ai";
import { Conversation } from "@grammyjs/conversations";
import { MyContext } from "../../utils/types";
import { updateUserVoice } from "../../core/supabase";

export async function voiceConversation(conversation: Conversation<MyContext>, ctx: MyContext) {
  const lang = ctx.from?.language_code || "en";
  const messageIds: number[] = [];

  // Запрашиваем у пользователя голосовое сообщение
  const voiceRequestMessage = await ctx.reply(
    lang === "ru" ? "🎤 Пожалуйста, отправьте голосовое сообщение для аватара." : "🎤 Please send a voice message for the avatar.",
  );
  const voiceMessage = (await conversation.wait()).message;
  if (!voiceMessage || !voiceMessage.voice) {
    await ctx.reply(lang === "ru" ? "❌ Ошибка: вы не отправили голосовое сообщение." : "❌ Error: you did not send a voice message.");
    return;
  }
  messageIds.push(voiceRequestMessage.message_id, voiceMessage.message_id);

  const fileId = voiceMessage.voice.file_id;
  const userId = ctx.from?.id;
  const username = ctx.from?.username || "unknown";

  if (userId) {
    const file = await ctx.api.getFile(fileId);
    const fileUrl = `https://api.telegram.org/file/bot${ctx.api.token}/${file.file_path}`;
    const voiceId = await createVoiceSyncLabs({
      fileUrl,
      username,
    });
    console.log(voiceId, "voiceId");

    if (voiceId) {
      await ctx.reply(
        lang === "ru"
          ? `👁 Голос аватара успешно создан! \n\n <b>Voice ID:</b> ${voiceId}`
          : `👁 Avatar voice created successfully! \n\n <b>Voice ID:</b> ${voiceId}`,
        {
          parse_mode: "HTML",
        },
      );
      await updateUserVoice(userId.toString(), voiceId);
    } else {
      await ctx.reply(lang === "ru" ? "❌ Ошибка при создании голоса." : "❌ Error creating voice.");
    }
  } else {
    await ctx.reply(lang === "ru" ? "❌ Ошибка: не удалось получить информацию о пользователе." : "❌ Error: failed to retrieve user information.");
  }

  // Удаление всех сообщений из текущего диалога
  await ctx.deleteMessages(messageIds);
}
