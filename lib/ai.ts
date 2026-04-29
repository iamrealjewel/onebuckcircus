import { prisma } from "./prisma";

export async function getAIResponse(prompt: string, actId?: string) {
  // 1. Find the best model to use
  let aiModel = null;
  
  if (actId) {
    const act = await prisma.act.findUnique({
      where: { id: actId },
      include: { aiModel: true }
    });
    if (act?.aiModel?.isActive) {
      aiModel = act.aiModel;
    }
  }
  
  if (!aiModel) {
    aiModel = await prisma.aIModel.findFirst({
      where: { isActive: true, isGlobalDefault: true }
    });
  }
  
  if (!aiModel) {
    throw new Error("No active AI model found in the circus.");
  }

  // 2. Real API Call
  const apiKey = aiModel.apiKey;
  const apiUrl = aiModel.apiUrl || "https://api.groq.com/openai/v1";
  const modelName = aiModel.modelName;

  try {
    console.log(`[Circus Oracle] Invoking ${aiModel.name} (${modelName})...`);

    // Handle Anthropic vs OpenAI style (simplified)
    const isAnthropic = aiModel.name.toLowerCase().includes("anthropic");
    const endpoint = isAnthropic ? `${apiUrl}/messages` : `${apiUrl}/chat/completions`;
    
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    };

    if (isAnthropic) {
      headers["x-api-key"] = apiKey;
      headers["anthropic-version"] = "2023-06-01";
    } else {
      headers["Authorization"] = `Bearer ${apiKey}`;
    }

    const body = isAnthropic ? {
      model: modelName,
      max_tokens: 1024,
      messages: [{ role: "user", content: prompt }]
    } : {
      model: modelName,
      response_format: { type: "json_object" },
      messages: [
        { 
          role: "system", 
          content: "You are the Circus Oracle for 'One Buck Circus'. You MUST output strictly valid JSON format. Never include unescaped quotes." 
        },
        { role: "user", content: prompt }
      ]
    };

    const res = await fetch(endpoint, {
      method: "POST",
      headers,
      body: JSON.stringify(body)
    });

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      throw new Error(`Oracle Error (${res.status}): ${JSON.stringify(errorData)}`);
    }

    const data = await res.json();
    
    // Extract content based on provider
    let content = "";
    if (isAnthropic) {
      content = data.content[0]?.text || "";
    } else {
      content = data.choices[0]?.message?.content || "";
    }

    return {
      content,
      model: aiModel.name,
      timestamp: new Date().toISOString()
    };
  } catch (error: any) {
    console.error("[Circus Oracle] Failure:", error.message);
    
    // FALLBACK: If the Oracle is down, don't crash the circus.
    const messages = [
      "The Oracle is currently busy juggling chainsaws. Try again later.",
      "The Crystal Ball is out of service. A monkey is fixing it.",
      "Silence from the mist. The Ringmaster says: 'Just fix the error!'",
      "The Oracle is on a coffee break with the Bearded Lady."
    ];
    const fallbackMsg = messages[Math.floor(Math.random() * messages.length)];
    
    // Return a mock response that looks like AI JSON
    return {
      content: JSON.stringify({ 
        message: fallbackMsg, 
        roast: fallbackMsg,
        trashTalk: fallbackMsg,
        verdict: "ORACLE ERROR",
        ruling: fallbackMsg,
        judge: "The Sarcastic Stand-in",
        penalty: "Pay the Ringmaster 1 virtual buck.",
        topic: "Something went wrong",
        plaintiffScore: 0,
        defendantScore: 0,
        winner: "neither",
        title: "The Silent Circus",
        genre: "Error Comedy",
        tagline: "When the Oracle fails, the monkey takes over.",
        mainRoast: fallbackMsg,
        survivalChance: 0,
        popupRoasts: [
          { emoji: "🤡", text: "The API is down!" },
          { emoji: "🙈", text: "Oracle is blind!" }
        ],
        topPick: { name: "Error-o-matic", meaning: "Missing Key", reason: "AI Failure" },
        names: []
      }),
      model: "Emergency Fallback",
      timestamp: new Date().toISOString()
    };
  }
}
