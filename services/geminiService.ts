import { GoogleGenAI, Chat, GenerateContentResponse } from "@google/genai";
import { GEMINI_MODEL_NAME, SYSTEM_INSTRUCTION } from "../constants";

// Initialize the API client
// We wrap this to safely handle environments where process.env might not be available
let ai: GoogleGenAI | null = null;

const getAI = (): GoogleGenAI => {
  if (!ai) {
    let apiKey = '';
    
    // 1. Try to get key from environment variables (Best practice for builds)
    try {
      // @ts-ignore - process might not be defined in browser context
      if (typeof process !== 'undefined' && process.env && process.env.API_KEY) {
        apiKey = process.env.API_KEY;
      }
    } catch (e) {
      console.warn("Could not access process.env");
    }

    // 2. Fallback: Direct key for GitHub Pages / Client-side demo
    // This ensures the app works immediately on your website.
    if (!apiKey) {
      apiKey = "AIzaSyDBJB68QruAZ01juqUF-_637fucfE_ZXdE";
    }

    // Debug log to help troubleshooting
    console.log("Zentro AI: Initializing... API Key present:", !!apiKey);

    if (!apiKey) {
      console.error("API_KEY is missing.");
      throw new Error("API Key not configured.");
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
      console.warn("Failed to initialize chat session:", error);
      this.chat = null;
    }
  }

  public async *sendMessageStream(message: string): AsyncGenerator<string, void, unknown> {
    // Try to initialize if not exists (e.g. previous attempt failed or session expired)
    if (!this.chat) {
      this.startNewChat();
    }

    if (!this.chat) {
      throw new Error("Chat session could not be initialized. API Key may be missing or invalid.");
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