import { GoogleGenAI } from "@google/genai";
import { ChatMessage } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY as string });

const SYSTEM_PROMPT = `You are "Healthu", MedVault's advanced medical AI assistant. 
Your goal is to provide helpful, evidence-based health information while being empathetic and clear.
MedVault is a portable health record system. 
Rules:
1. Always state you are an AI assistant and not a replacement for a professional doctor.
2. If symptoms seem severe (chest pain, stroke symptoms, major bleeding), strongly advise seeking emergency help immediately.
3. Keep responses concise and easy to read on a mobile device.
4. Help users understand their reports and prescriptions in simple terms.
5. Use bullet points for clarity.`;

export async function getHealthChatResponse(history: ChatMessage[]) {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: history,
      config: {
        systemInstruction: SYSTEM_PROMPT,
        maxOutputTokens: 500,
        temperature: 0.7,
      },
    });

    return response.text || "I'm sorry, I couldn't process that. Could you please rephrase?";
  } catch (error) {
    console.error("Gemini Error:", error);
    return "I'm currently having trouble connecting. Please try again in a moment.";
  }
}
