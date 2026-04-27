import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { getAIResponse } from "@/lib/ai";
import { NextResponse } from "next/server";

export async function GET() {
  const session = await getServerSession(authOptions);
  if ((session?.user as any)?.role !== "ADMIN") return new NextResponse("Unauthorized", { status: 401 });

  const prompt = `
    Suggest 5 popular AI model providers for a developer platform. 
    Return ONLY a JSON array of objects with the following keys:
    "name": Provider name (e.g. Google Gemini)
    "modelName": A common model ID (e.g. gemini-1.5-pro)
    "apiUrl": Their standard OpenAI-compatible base URL or their specific one.
    "description": A very short (5 words) selling point.
    
    Example format: [{"name": "Groq", "modelName": "llama-3.1-70b-versatile", "apiUrl": "https://api.groq.com/openai/v1", "description": "Blazing fast inference"}]
  `;

  try {
    const aiRes = await getAIResponse(prompt);
    // Try to extract JSON from the response
    const jsonStr = aiRes.content.match(/\[.*\]/s)?.[0] || aiRes.content;
    const suggestions = JSON.parse(jsonStr);
    return NextResponse.json(suggestions);
  } catch (error: any) {
    console.error("Discovery error:", error);
    return new NextResponse("Failed to consult Oracle", { status: 500 });
  }
}
