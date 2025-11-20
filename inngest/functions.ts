import { inngest } from "./client";
import { gemini, createAgent } from "@inngest/agent-kit";

export const codeAgentFunction = inngest.createFunction(
  { id: "code-agent" },
  { event: "code-agent/run" },
  async ({ event }) => {
    const userPrompt = String(event.data?.value || "Write a small Next.js component.");

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) throw new Error("GEMINI_API_KEY missing.");

    const agent = createAgent({
      name: "simple-code-agent",
      system: "You are an expert Next.js developer. Provide clean code.",
      model: gemini({ model: "gemini-1.5-flash", apiKey }),
    });

    console.log("➡️ Received prompt:", userPrompt);

    let response = await agent.run(userPrompt);

    let resultText = "";
    if (typeof response === "string") {
      resultText = response;
    } else if (Array.isArray(response.output)) {
      for (const msg of response.output) {
        if (msg.role === "assistant") {
          if (typeof msg.content === "string") resultText += msg.content;
          if (Array.isArray(msg.content))
            resultText += msg.content.map((c) => c.text || "").join("");
        }
      }
    }

    console.log("📝 Final Text Output:", resultText);

    return {
      ok: true,
      input: userPrompt,
      output: resultText,
      timestamp: new Date().toISOString(),
    };
  }
);

export const functions = [codeAgentFunction];
