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
    throw new Error(`The Oracle is currently clouded by mist: ${error.message}.`);
  }
}
