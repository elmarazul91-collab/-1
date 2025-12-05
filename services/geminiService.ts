import { GoogleGenAI } from "@google/genai";
import { WishRequest } from '../types';

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const generateLuxuryWish = async (request: WishRequest): Promise<string> => {
  const model = 'gemini-2.5-flash';
  
  const prompt = `
    You are a creative director for a high-end luxury lifestyle brand (like Cartier, Rolex, or Four Seasons).
    Write a short, sophisticated, and warm Christmas greeting card message.
    
    Recipient: ${request.recipientName}
    Relationship: ${request.relationship}
    Tone: ${request.tone} (Make it sound expensive, elegant, and timeless)
    
    Constraints:
    - Maximum 40 words.
    - Do not use hashtags.
    - Focus on themes of gold, light, timelessness, and prosperity.
    - Return ONLY the message text.
  `;

  try {
    const response = await ai.models.generateContent({
      model,
      contents: prompt,
    });
    
    return response.text || "May your holidays be as timeless as gold and as deep as the winter night.";
  } catch (error) {
    console.error("Gemini Generation Error:", error);
    return "Wishing you a season of splendor and a new year of prosperity.";
  }
};