import { Configuration, OpenAIApi } from "openai";

const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);

export default async function handler(req, res) {
  const { query } = req.body;

  try {
    const response = await openai.createCompletion({
      model: "text-davinci-002",
      prompt: generatePrompt(query),
      temperature: 0.6,
      max_tokens: 100,
    });

    res.status(200).json({ response: response.data.choices[0].text.trim() });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "An error occurred while processing the request." });
  }
}

function generatePrompt(userInput) {
  return `User: ${userInput} \n`;
}
