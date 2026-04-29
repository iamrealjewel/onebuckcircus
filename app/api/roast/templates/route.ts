import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { NextResponse } from "next/server";
import { getAIResponse } from "@/lib/ai";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user) return new NextResponse("Unauthorized", { status: 401 });

  const prompt = `Act as the Master of Ceremonies in the 'One Buck Circus'. Generate 6 short, punchy, and hilariously brutal roast templates (insults) that friends can use to roast each other. 
  
  Styles: 1 self-deprecating, 1 about their intelligence, 1 about their career, 1 about their fashion, 2 random savage burns.
  
  Keep them under 15 words each.
  
  Return strictly valid JSON: {"templates": ["Roast 1", "Roast 2", ...]}
  Output nothing but the JSON.`;

  try {
    const res = await getAIResponse(prompt, "roast-buddy");
    const match = res.content.match(/```(?:json)?\s*([\s\S]*?)```/);
    const rawJson = match ? match[1] : res.content;
    const data = JSON.parse(rawJson);
    
    return NextResponse.json({ templates: data.templates || [] });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ templates: [
      "You're like a cloud. When you disappear, it's a beautiful day.",
      "I'd roast you, but my mom told me not to burn trash.",
      "Your life is the 'Before' picture in an antidepressant ad.",
      "I've seen more charisma in a wet paper bag.",
      "You're the human equivalent of a participation trophy.",
      "If I wanted to kill myself, I'd climb your ego and jump to your IQ."
    ] });
  }
}
