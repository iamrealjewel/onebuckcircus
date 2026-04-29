const ai = require('./lib/ai');

async function test() {
  const prompt = `Act as an emotionless clerk issuing a "Breakup Receipt" for a relationship.
From: Jewel
Regarding: Ex
Duration: 12 months
Type: Romantic
Red Flags: toxic, mean
Best Memory: eating pizza

Return strictly valid JSON matching this schema:
{
  "receiptNumber": "Random ID",
  "from": "Jewel",
  "regarding": "Ex",
  "type": "Romantic",
  "items": [
    { "label": "Time invested", "value": "e.g. 1.5 years", "note": "Non-refundable" }
  ],
  "subtotal": "e.g. 1.5 years",
  "tax": "Emotional damage",
  "refundStatus": "e.g. DENIED (permanently)",
  "lesson": "1 sentence cynical lesson learned.",
  "closingStatement": "Official sounding statement closing the account.",
  "futureDiscount": "A slightly hopeful sign-off.",
  "timestamp": "Today's date"
}
Output nothing but the JSON object.`;

  console.log("Calling getAIResponse...");
  const res = await ai.getAIResponse(prompt, "breakup-receipt");
  console.log("Response:", res);
}

test();
