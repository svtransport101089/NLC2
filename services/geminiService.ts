
import { GoogleGenAI } from "@google/genai";
import { GroupHeaderData, Member, QuarterlyUpdate } from "../types";

/**
 * Service to analyze leadership reports using Gemini AI.
 * It provides a performance assessment, identifies growth opportunities, and offers strategic advice.
 */
export const analyzeReport = async (
  header: GroupHeaderData,
  members: Member[],
  updates: QuarterlyUpdate[],
): Promise<string> => {
  // Use gemini-3-pro-preview for complex reasoning tasks as per guidelines
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

  const leaderName = header.leaderName || 'Unassigned';
  const coLeaderName = header.coLeader || 'Unassigned';
  
  const prompt = `
    Analyze this leadership report for year ${header.year}.
    
    Leader: ${leaderName}
    Co-Leader: ${coLeaderName}
    Leader Phone: ${header.leaderPhone || 'N/A'}
    Region: ${header.region}
    Members Count: ${members.length}
    
    Quarterly Updates Summary:
    ${updates.map(u => `
      - ${u.category}:
        Q1 (${u.q1}), Q2 (${u.q2}), Q3 (${u.q3}), Q4 (${u.q4})
    `).join('')}
    
    Please provide:
    1. A concise performance assessment.
    2. Key growth opportunities or areas of concern.
    3. Actionable strategic advice for the leadership team.
    
    Format the response in professional markdown with bold highlights.
  `;

  try {
    // Using gemini-3-pro-preview for complex text analysis tasks
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: prompt,
    });
    // Correctly accessing the .text property from GenerateContentResponse
    return response.text || "No analysis available.";
  } catch (error) {
    console.error("AI Analysis failed:", error);
    throw error;
  }
};
