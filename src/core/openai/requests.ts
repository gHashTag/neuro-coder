import { openai } from "."

type UserData = {
  username: string
  first_name: string
  last_name: string
  company: string
  position: string
  designation: string
}
export const answerAi = async (model: string, userData: UserData, prompt: string, languageCode: string): Promise<string> => {
  const systemPrompt = `Respond in the language: ${languageCode} You communicate with: ${JSON.stringify(userData)}`
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
