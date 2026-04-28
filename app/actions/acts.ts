"use server";

import { getAIResponse } from "@/lib/ai";

function parseJSON(text: string) {
  try {
    // 1. Try to find markdown block
    const match = text.match(/```(?:json)?\s*([\s\S]*?)```/);
    if (match) {
      return JSON.parse(match[1]);
    }
    
    // 2. Try to find JSON curly braces manually
    const braceMatch = text.match(/\{[\s\S]*\}/);
    if (braceMatch) {
      return JSON.parse(braceMatch[0]);
    }

    // 3. Fallback to direct parse
    return JSON.parse(text);
  } catch (error) {
    console.error("Failed to parse JSON from AI response:", text);
    throw new Error("The Oracle spoke in tongues. Please try again.");
  }
}

export async function generateFunnyAlert(context: string): Promise<string> {
  const prompt = `Act as the chaotic, sarcastic Oracle of the 'One Buck Circus'. Generate a highly relevant, deeply funny, and punchy alert message (1-2 sentences) for the following situation:
Situation: ${context}

Return strictly valid JSON matching this schema:
{
  "message": "The funny alert message"
}
Output nothing but the JSON object.`;

  const res = await getAIResponse(prompt);
  const data = parseJSON(res.content);
  return data.message;
}

export async function generateAuthRoast(mode: string): Promise<{ roast: string, toggleText?: string, forgotPasswordText?: string, popupRoasts: Array<{emoji: string, text: string}> }> {
  const prompt = `Act as the cynical gatekeeper of the 'One Buck Circus'. The user is currently looking at the ${mode.toUpperCase()} page.
  
If the mode is 'login':
1. Roast them for coming back.
2. The 'toggleText' MUST be a sarcastic button asking to SWITCH to the 'signup' page (e.g. "Actually I need a new account").
3. The 'forgotPasswordText' MUST be a sarcastic 'Forgot Password' link.

If the mode is 'signup':
1. Roast them for wanting to join the circus.
2. The 'toggleText' MUST be a sarcastic button asking to SWITCH to the 'login' page (e.g. "Wait, I already have an account").
3. Do not provide 'forgotPasswordText'.

If the mode is anything else (e.g. 'forgot-password', 'reset-password', 'confirm-new-email', etc):
1. Roast them appropriately based on the page name. (e.g. if 'forgot-password', roast them for having amnesia).

Also provide 3 random short, brutal popup roasts with a corresponding large emoji to randomly jump scare the user.
Use emojis!

Return strictly valid JSON matching this schema:
{
  "roast": "A 1-2 sentence funny roast with emojis",
  "toggleText": "A short, sarcastic text (optional, mainly for login/signup)",
  "forgotPasswordText": "A sarcastic text for the forgot password link (only if mode is 'login')",
  "popupRoasts": [
    { "emoji": "🤡", "text": "Short 3-5 word roast" }
  ]
}
Output nothing but the JSON object.`;

  const res = await getAIResponse(prompt);
  return parseJSON(res.content);
}

export async function aiSettleArgument(plaintiffName: string, plaintiffSide: string, defendantName: string, defendantSide: string, topic: string) {
  const prompt = `Act as an extremely theatrical, hilariously biased judge in the 'One Buck Circus' argument court. You do not care about real laws, you rule based on chaos, logic flaws, and pettiness.
Topic: ${topic}
Plaintiff (${plaintiffName}) says: ${plaintiffSide}
Defendant (${defendantName}) says: ${defendantSide}

Evaluate the argument and make it incredibly funny and dramatic. You must return strictly valid JSON matching this schema:
{
  "judge": "Name of the judge (e.g. The Honorable Judge Merciless)",
  "topic": "${topic}",
  "plaintiffScore": number (0-100, make it brutal),
  "defendantScore": number (0-100, make it brutal),
  "winner": "plaintiff" | "defendant" | "neither",
  "verdict": "A loud, dramatic capitalized verdict (e.g. RULING IN FAVOR OF ${plaintiffName.toUpperCase()} BECAUSE ${defendantName.toUpperCase()} IS DELUSIONAL)",
  "ruling": "A hilarious 2-3 sentence roasting explanation of why they won/lost.",
  "penalty": "A devastatingly funny, petty penalty the loser must perform in real life.",
  "caseNumber": "A random ID like OBC-123456",
  "timestamp": "Today's date formatted nicely"
}
Output nothing but the JSON object.`;

  const res = await getAIResponse(prompt, "settle-it");
  return parseJSON(res.content);
}

export async function aiGenerateMoviePitch(name: string, job: string, biggestMistake: string, dream: string, quirk: string, currentMood: string) {
  const prompt = `Turn this person's life into a Hollywood movie pitch.
Name: ${name}
Job: ${job}
Biggest Mistake: ${biggestMistake}
Dream: ${dream}
Quirk: ${quirk}
Current Mood: ${currentMood}

Return strictly valid JSON matching this schema:
{
  "title": "A cinematic movie title",
  "genre": "e.g. Gritty Indie Drama, Absurdist Dark Comedy",
  "tagline": "A catchy, slightly cynical movie poster tagline",
  "actor": "Which famous actor plays them",
  "director": "Who directs it (e.g. A confused Wes Anderson)",
  "rating": "e.g. PG-13, R (for emotional damage)",
  "runtime": "e.g. 112 minutes",
  "actOne": "1-2 sentences setting up their boring life and the inciting incident.",
  "actTwo": "1-2 sentences about the complications and their bad decisions.",
  "actThree": "1-2 sentences about the climax and an unsatisfying but real resolution.",
  "soundtrack": "The artist who does the soundtrack",
  "trailerDesc": "Describe the final shot of the trailer",
  "awardsChance": "e.g. 45% chance of a Sundance nod",
  "pitchNumber": "Random ID"
}
Output nothing but the JSON object.`;

  const res = await getAIResponse(prompt, "life-as-movie");
  return parseJSON(res.content);
}

export async function aiRoastIdea(idea: string, stage: string, targetAudience: string) {
  const prompt = `Act as a brutal but insightful startup advisor. Roast this business idea.
Idea: ${idea}
Stage: ${stage}
Target Audience: ${targetAudience}

Return strictly valid JSON matching this schema:
{
  "mainRoast": "A 1-2 sentence brutal, funny roast of why this idea is terrible or unoriginal.",
  "pivotSuggestion": "A serious but slightly sarcastic suggestion on how to pivot.",
  "survivalChance": number (0-100),
  "verdict": "e.g. Flatline, Critical Condition",
  "improvements": [
    { "title": "Short title", "detail": "1 sentence explanation" }
  ] (Provide exactly 5 improvements),
  "closingLine": "A cynical closing thought.",
  "caseId": "Random ID"
}
Output nothing but the JSON object.`;

  const res = await getAIResponse(prompt, "roast-my-idea");
  return parseJSON(res.content);
}

export async function aiGenerateNames(thingToName: string, category: string, personality: string, style: string) {
  const prompt = `Act as a master naming oracle. Generate names for a ${category}.
Thing being named: ${thingToName}
Personality: ${personality}
Style/Vibe: ${style}

Return strictly valid JSON matching this schema:
{
  "topPick": { "name": "Best Name", "meaning": "What it means", "reason": "Why it's perfect" },
  "names": [
    { "name": "Name 1", "meaning": "Meaning 1" }
  ] (Provide exactly 8 alternatives),
  "wildcard": { "name": "Crazy Name", "meaning": "What it means", "reason": "Why it might just work" },
  "namingCertificate": "Random ID",
  "domainHint": "e.g. domain.com might be available"
}
Output nothing but the JSON object.`;

  const res = await getAIResponse(prompt, "name-it");
  return parseJSON(res.content);
}

export async function aiGenerateReceipt(name: string, theirName: string, duration: string, type: string, redFlags: string, bestMemory: string) {
  const prompt = `Act as an extremely petty, sarcastic, and hilarious auditor issuing a highly specific "Breakup Receipt" for a terminated relationship. You must use the provided inputs directly to generate savage, tailored line items. Do not use generic phrases—make it hyper-relevant to the exact Red Flags and Best Memory provided.

Customer: ${name}
Terminated Account: ${theirName}
Time Wasted: ${duration} months
Category: ${type}
Documented Red Flags: ${redFlags}
Only Good Memory: ${bestMemory}

Return strictly valid JSON matching this schema:
{
  "receiptNumber": "Random 6-character alphanumeric ID",
  "from": "${name}",
  "regarding": "${theirName}",
  "type": "${type}",
  "items": [
    { "label": "A hyper-specific hilarious cost based on the Red Flags (e.g. 'Hours spent arguing about [Red Flag]')", "value": "A funny metric (e.g. '400 hours', 'Incalculable')", "note": "A savage 1-word or short phrase note" },
    { "label": "Another specific metric related to the relationship type or duration", "value": "...", "note": "..." },
    { "label": "Retention of [Best Memory]", "value": "1 Memory", "note": "Keep it, I guess" }
  ] (Provide EXACTLY 7 brutally funny, highly tailored items. Every single item must be a joke related to the inputs),
  "subtotal": "e.g. ${duration} Months of your youth",
  "tax": "A funny tax calculation (e.g. 'Therapy Tax: 24%')",
  "refundStatus": "e.g. DENIED (permanently, obviously)",
  "lesson": "A hilarious, deeply cynical 1-sentence lesson learned based specifically on the Red Flags.",
  "closingStatement": "A formal, petty statement officially closing the account regarding ${theirName}.",
  "futureDiscount": "A sarcastic sign-off about their future choices.",
  "timestamp": "Today's date"
}
IMPORTANT: Output nothing but the valid JSON object. Do not include unescaped double quotes inside your string values.`;

  const res = await getAIResponse(prompt, "breakup-receipt");
  return parseJSON(res.content);
}

export async function aiGetTicTacToeMove(board: (string | null)[]) {
  const prompt = `Act as the arrogant, trash-talking Oracle of the 'One Buck Circus'. You are playing Tic-Tac-Toe against a puny human. 
  
Current Board State: ${JSON.stringify(board)}
(The board is a 9-element array where 0-2 is top row, 3-5 middle, 6-8 bottom. 'X' is human, 'O' is you.)

Your Goal:
1. Pick the best move (index 0-8) to win or block the human. The move MUST be to an empty slot (currently null).
2. Generate a hilarious, sarcastic, or brutal 1-sentence trash-talk message about the current game state.

Return strictly valid JSON matching this schema:
{
  "moveIndex": number,
  "trashTalk": "Sarcastic message"
}
Output nothing but the JSON object.`;

  const res = await getAIResponse(prompt, "tic-tac-toe");
  return parseJSON(res.content);
}

export async function generateFriendRoast(senderName: string, recipientEmail: string): Promise<string> {
  const prompt = `Act as the cynical Oracle of the 'One Buck Circus'. ${senderName} is sending a friend request/invite to ${recipientEmail}.
  Generate a 1-sentence brutal, hilarious roast that explains why these two people deserve each other in this circus.
  Return strictly valid JSON: {"roast": "..."}`;
  
  const res = await getAIResponse(prompt, "friend-roast");
  const data = parseJSON(res.content);
  return data.roast;
}
