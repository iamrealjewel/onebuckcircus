import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { getAIResponse } from "@/lib/ai";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);

  if (!session || !session.user) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  const { prompt, actId } = await req.json();

  try {
    const response = await getAIResponse(prompt, actId);
    return NextResponse.json(response);
  } catch (error: any) {
    console.error("AI error:", error);
    return new NextResponse(error.message || "Internal Server Error", { status: 500 });
  }
}
