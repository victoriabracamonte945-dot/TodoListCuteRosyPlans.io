
import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export async function suggestTasks(input: string) {
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: `Suggest a list of 3-5 sub-tasks or related actions for the following task: "${input}". 
    Make the tone super cute, encouraging, and helpful. Use emojis!`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            task: { type: Type.STRING },
            category: { type: Type.STRING, enum: ['work', 'personal', 'health', 'social'] },
            estimatedTime: { type: Type.STRING }
          },
          required: ['task', 'category', 'estimatedTime']
        }
      }
    }
  });
  
  try {
    return JSON.parse(response.text);
  } catch (e) {
    console.error("Failed to parse AI response", e);
    return [];
  }
}

export async function getCalendarFriendlyFormat(todo: any) {
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: `Convert this task into a Google Calendar link details (summary, description, and suggested start/end time in ISO format): ${JSON.stringify(todo)}`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          summary: { type: Type.STRING },
          description: { type: Type.STRING },
          startTime: { type: Type.STRING },
          endTime: { type: Type.STRING }
        }
      }
    }
  });

  try {
    const data = JSON.parse(response.text);
    // Simple way to create a GCal quick add link
    const base = "https://www.google.com/calendar/render?action=TEMPLATE";
    const dates = `${data.startTime.replace(/[-:]/g, '')}/${data.endTime.replace(/[-:]/g, '')}`;
    return `${base}&text=${encodeURIComponent(data.summary)}&details=${encodeURIComponent(data.description)}&dates=${dates}`;
  } catch (e) {
    return null;
  }
}
