import { GoogleGenAI, Type } from "@google/genai";
import { AnalysisResult } from "../types";

// Lazily create the client so the app can still render if the API key is missing.
const getAiClient = () => {
  const apiKey = (import.meta as any).env?.VITE_API_KEY || process.env.API_KEY;
  if (!apiKey) {
    throw new Error("Missing Gemini API key (VITE_API_KEY).");
  }
  return new GoogleGenAI({ apiKey });
};

/**
 * Extracts text content from a document/image using Gemini Vision
 */
export const digitizeDocument = async (base64Image: string): Promise<string> => {
  try {
    const cleanBase64 = base64Image.replace(/^data:image\/(png|jpeg|jpg|webp);base64,/, '');

    const response = await getAiClient().models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: [
          {
            inlineData: {
              mimeType: 'image/jpeg',
              data: cleanBase64
            }
          },
          {
            text: "Transcribe the text from this document. If it is a photo of an activity or object, describe what is happening in detail so it can be used for a resume."
          }
        ]
      }
    });

    return response.text || "";
  } catch (error) {
    console.error("Vision API Error:", error);
    throw new Error("Failed to read document.");
  }
};

/**
 * Analyzes text to extract skills and career paths
 */
export const analyzeExperience = async (text: string): Promise<AnalysisResult> => {
  try {
    const prompt = `
      Analyze the following user experience description (hobbies, jobs, or resume text):
      "${text}"

      Target Audience: High School / College Students.
      Tone: Encouraging, Professional but Modern.

      Task:
      1. **Vibe Check**: Give them a cool 2-3 word archetype title (e.g., "Chaos Coordinator", "Tech Wizard"). Pick a matching Emoji.
      2. **Badges**: Award 3 "Video Game Style" achievement badges based on their skills (e.g., "Bug Hunter" for coding, "Team Tank" for leadership). Give each a color hex code.
      3. **Skills**: Identify professional skills (Soft/Hard/Tools) with 0-100 scores.
      4. **Elevator Pitch**: Write a punchy 30-second introduction script they can say in an interview.
      5. **Resume**: Rewrite 3-4 bullet points using strong action verbs.
      6. **Careers**: Suggest 3 career paths with salary/outlook.
      7. **Boss Battle Prep**: Generate 3 likely interview questions for these roles, with a short "Pro Tip" on how to answer.

      Return strictly JSON.
    `;

    const response = await getAiClient().models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            summary: { type: Type.STRING },
            vibe: { type: Type.STRING },
            vibeEmoji: { type: Type.STRING },
            badges: {
              type: Type.ARRAY,
              items: {
                 type: Type.OBJECT,
                 properties: {
                    name: { type: Type.STRING },
                    emoji: { type: Type.STRING },
                    description: { type: Type.STRING },
                    color: { type: Type.STRING }
                 }
              }
            },
            skills: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  name: { type: Type.STRING },
                  category: { type: Type.STRING, enum: ['Soft Skill', 'Hard Skill', 'Tool/Tech'] },
                  score: { type: Type.INTEGER }
                }
              }
            },
            elevatorPitch: { type: Type.STRING },
            resumePoints: { type: Type.ARRAY, items: { type: Type.STRING } },
            careers: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  title: { type: Type.STRING },
                  matchPercentage: { type: Type.INTEGER },
                  description: { type: Type.STRING },
                  avgSalary: { type: Type.STRING },
                  outlook: { type: Type.STRING }
                }
              }
            },
            interviewQuestions: {
               type: Type.ARRAY,
               items: {
                  type: Type.OBJECT,
                  properties: {
                     question: { type: Type.STRING },
                     tip: { type: Type.STRING }
                  }
               }
            }
          }
        }
      }
    });

    const jsonText = response.text;
    if (!jsonText) throw new Error("No data returned");
    
    return JSON.parse(jsonText) as AnalysisResult;

  } catch (error) {
    console.error("Analysis Error:", error);
    throw new Error("Failed to analyze experience.");
  }
};