import gemini from "../config/gemini.js";

export const testGeminiConnection = async (): Promise<string> => {
  console.log("Sending request to Gemini...");

  const response = await gemini.models.generateContent({
    model: "gemini-3.5-flash-lite",
    contents: "Reply with exactly: Gemini connection successful",
  });

  console.log("Gemini response received.");

  return response.text ?? "Gemini returned an empty response";
};
