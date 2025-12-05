import { GoogleGenAI, Chat, GenerateContentResponse } from "@google/genai";
import { GEMINI_MODEL_NAME, SYSTEM_INSTRUCTION } from "../constants";

// Initialize the API client
// Ideally this would be outside a function if we were sure the env var is present at load time,
// but inside ensures we capture it if it's injected slightly later in some environments.
let ai: GoogleGenAI | null = null;

const getAI = (): GoogleGenAI => {
  if (!ai) {
    const apiKey = process.env.API_KEY;
    if (!apiKey) {
      console.error("API_KEY is missing from environment variables.");
      throw new Error("API Key not found. Please check your configuration.");
    }
    ai = new GoogleGenAI({ apiKey });
  }
  return ai;
};

export class GeminiService {
  private chat: Chat | null = null;

  constructor() {
    this.startNewChat();
  }

  public startNewChat() {
    try {
      const client = getAI();
      this.chat = client.chats.create({
        model: GEMINI_MODEL_NAME,
        config: {
          systemInstruction: SYSTEM_INSTRUCTION,
        },
      });
    } catch (error) {
      console.error("Failed to initialize chat:", error);
    }
  }

  public async *sendMessageStream(message: string): AsyncGenerator<string, void, unknown> {
    if (!this.chat) {
      this.startNewChat();
    }

    if (!this.chat) {
      throw new Error("Chat session could not be initialized.");
    }

    try {
      const resultStream = await this.chat.sendMessageStream({ message });

      for await (const chunk of resultStream) {
        const responseChunk = chunk as GenerateContentResponse;
        if (responseChunk.text) {
          yield responseChunk.text;
        }
      }
    } catch (error) {
      console.error("Error sending message:", error);
      throw error;
    }
  }
}

export const geminiService = new GeminiService();
