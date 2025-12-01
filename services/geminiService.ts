import { GoogleGenAI } from "@google/genai";

// Initialize Gemini Client
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

/**
 * Sends the image to Gemini to remove the watermark.
 * We use the edit capability by providing the image and a specific prompt.
 */
export const removeWatermark = async (base64Image: string, locationHint: string = "in the bottom-right corner"): Promise<string> => {
  try {
    // Strip the data:image/ type prefix if present for the API call
    const cleanBase64 = base64Image.replace(/^data:image\/(png|jpeg|jpg|webp);base64,/, '');
    const mimeTypeMatch = base64Image.match(/^data:image\/(png|jpeg|jpg|webp);base64,/);
    const mimeType = mimeTypeMatch ? `image/${mimeTypeMatch[1]}` : 'image/png';

    const model = 'gemini-2.5-flash-image';

    const prompt = `Edit this image to completely remove the watermark, text, or logo located ${locationHint}. Fill in the removed area seamlessly to match the surrounding background texture and lighting. Return ONLY the edited image.`;

    const response = await ai.models.generateContent({
      model: model,
      contents: {
        parts: [
          {
            inlineData: {
              mimeType: mimeType,
              data: cleanBase64,
            },
          },
          {
            text: prompt
          },
        ],
      },
    });

    // Check for image part in response
    if (response.candidates && response.candidates[0].content && response.candidates[0].content.parts) {
      for (const part of response.candidates[0].content.parts) {
        if (part.inlineData && part.inlineData.data) {
          return `data:image/png;base64,${part.inlineData.data}`;
        }
      }
    }

    throw new Error("No image data returned from the model. It might have refused the request.");

  } catch (error) {
    console.error("Gemini API Error:", error);
    throw error;
  }
};