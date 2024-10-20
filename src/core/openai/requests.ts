import { openai } from "."

export const answerAi = async (model: string, prompt: string, languageCode: string) => {
  const systemPrompt = `Respond in the language: ${languageCode}`
  const response = await openai.chat.completions.create({
    model: model,
    messages: [
      {
        role: "system",
        content: systemPrompt,
      },
      {
        role: "user",
        content: prompt,
      },
    ],
  })
  return response.choices[0].message.content
}
