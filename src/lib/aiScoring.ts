// Lightweight AI comparison integration using OpenAI Chat Completions
// This module returns raw parsed JSON from the model; callers should validate/coerce types.
const OPENAI_URL = "https://openrouter.ai/api/v1/chat/completions";
async function callOpenAI(systemPrompt: string, userPrompt: string, apiKey: string, timeout = 15000) {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeout);

  try {
    const model = process.env.OPENAI_MODEL || "gpt-4o-mini";
    const res = await fetch(OPENAI_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model,
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        temperature: 0.0,
        max_tokens: 800,
      }),
      signal: controller.signal,
    });

    clearTimeout(id);

    if (!res.ok) {
      const t = await res.text();
      throw new Error(`OpenAI error ${res.status}: ${t}`);
    }

    const data = await res.json();
    const content = data?.choices?.[0]?.message?.content;
    return content;
  } finally {
    clearTimeout(id);
  }
}

export async function compareResumeToJD_Ai(resumeText: string, jdText: string) {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) throw new Error("OPENAI_API_KEY not configured");

  const systemPrompt = `You are an expert hiring consultant. Return ONLY a single JSON object matching this schema:\n{summary:string, experienceMatch:string[], relevantSkills:string[], technicalSkills:string[], roleDomainExperience:string[], responsibilitiesMatch:string[], relevantProjects:string[], educationCertifications:string[], missingSkills:string[], keyStrengths:string[], overallSuitability:string, recommendations:string[]}\nUse concise, evidence-based bullet points. Prefix each bullet with Strong Match, Partial Match, or Missing / Gap when appropriate. Do not calculate or return scores.`;

  const userPrompt = `Job Description:\n---\n${jdText}\n---\nResume:\n---\n${resumeText}\n---\nRespond with the JSON object only.`;

  const content = await callOpenAI(systemPrompt, userPrompt, apiKey);
  const jsonMatch = content && content.match(/\{[\s\S]*\}/);
  if (!jsonMatch) throw new Error("AI did not return JSON");
  try {
    return JSON.parse(jsonMatch[0]);
  } catch (err) {
    throw new Error("Failed to parse AI JSON response: " + String(err));
  }
}

const aiComparison = { compareResumeToJD_Ai };

export default aiComparison;
