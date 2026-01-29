declare module '@google/genai' {
  export class GoogleGenAI {
    constructor(options: { apiKey: string });
    models: {
      generateContent(params: {
        model: string;
        contents: Array<{ role: 'user' | 'model'; parts: Array<{ text: string }> }>;
        config?: {
          systemInstruction?: string;
          temperature?: number;
          maxOutputTokens?: number;
        };
      }): Promise<{ text?: string }>;
    };
  }
}
