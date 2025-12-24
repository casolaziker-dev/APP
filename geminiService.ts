
import { GoogleGenAI, Type } from "@google/genai";
import { QuizQuestion } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export async function generateQuizQuestions(topic: string): Promise<QuizQuestion[]> {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Genera 5 preguntas de trivia sobre el tema: ${topic}. En español.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              question: { type: Type.STRING },
              options: { 
                type: Type.ARRAY, 
                items: { type: Type.STRING },
                minItems: 4,
                maxItems: 4
              },
              correctIndex: { type: Type.INTEGER }
            },
            required: ["question", "options", "correctIndex"]
          }
        }
      }
    });

    return JSON.parse(response.text);
  } catch (error) {
    console.error("Error generating quiz:", error);
    return [{
      question: "¿Cuál es el planeta más grande del sistema solar?",
      options: ["Marte", "Venus", "Júpiter", "Saturno"],
      correctIndex: 2
    }];
  }
}

export async function getWordClue(): Promise<{ word: string, clue: string }> {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: "Genera una palabra común en español y una pista críptica pero resoluble para adivinarla.",
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            word: { type: Type.STRING, description: "La palabra a adivinar (una sola palabra)." },
            clue: { type: Type.STRING, description: "La pista para el usuario." }
          },
          required: ["word", "clue"]
        }
      }
    });
    return JSON.parse(response.text);
  } catch (error) {
    return { word: "SOL", clue: "Estrella que nos da luz de día." };
  }
}

export async function getWordleWord(): Promise<string> {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: "Genera una palabra común de exactamente 5 letras en español para un juego de Wordle. Solo la palabra.",
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            word: { type: Type.STRING, description: "La palabra de 5 letras." }
          },
          required: ["word"]
        }
      }
    });
    const data = JSON.parse(response.text);
    return data.word.toUpperCase().substring(0, 5);
  } catch (error) {
    const fallbacks = ["TEXTO", "MUNDO", "PIANO", "LIBRO", "PLAYA", "FRUTA"];
    return fallbacks[Math.floor(Math.random() * fallbacks.length)];
  }
}
