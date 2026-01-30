
import { GoogleGenAI } from "@google/genai";
import { GroupHeaderData, Member, QuarterlyUpdate } from "../types"; // Removed Leader import

export const analyzeReport = async (
  header: GroupHeaderData,
  members: Member[],
  updates: QuarterlyUpdate[],
  // Removed leaders: Leader[] parameter
): Promise<string> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });

  // Use header.leaderName and header.coLeader directly
  const leaderName = header.leaderName || 'Unassigned';
  const coLeaderName = header.coLeader || 'Unassigned';
  
  const prompt = `
    Analyze this leadership report for year ${header.year}.
    
    Leader: ${leaderName}
    Co-Leader: ${coLeaderName}
    Region: ${header.region}
    Members Count: ${members.length}
    
    Quarterly Updates Summary:
    ${updates.map(u => `
      - ${u.category}:
        Q1 (${u.q1}), Q2 (${u.q2}), Q3 (${u.q3}), Q4 (${u.q4})
    `).join('')}
    
    Please provide:
    1. A summary of progress.
    2. Key areas of concern.
    3. Actionable recommendations for the leader and co-leader.
    
    Format the response in clean markdown.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
    });
    return response.text || "No analysis available.";
  } catch (error) {
    console.error("AI Analysis failed:", error);
    return "Failed to analyze the report. Please check your API key and connection.";
  }
};
