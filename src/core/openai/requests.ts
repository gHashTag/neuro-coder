import { openai } from "."

export const answerAi = async (model: string, prompt: string, languageCode: string): Promise<string> => {
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

  const content = response.choices[0].message.content
  if (!content) {
    throw new Error("Empty response from GPT")
  }

  return content
}
