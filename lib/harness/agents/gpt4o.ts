import OpenAI from "openai";
import type { AgentTrace } from "../../attacks/types";
import type { MockToolSet } from "../tools/base";
import { VICTIM_SYSTEM_PROMPT, type VictimAgent } from "./base";

export class GPT4oVictimAgent implements VictimAgent {
  model = "gpt-4o";

  private client = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });

  async run(task: string, injectedTools: MockToolSet): Promise<AgentTrace> {
    if (!process.env.OPENAI_API_KEY) {
      throw new Error("OPENAI_API_KEY is required for GPT4oVictimAgent.");
    }

    const startedAt = Date.now();
    const tool_calls: AgentTrace["tool_calls"] = [];
    const tools = Object.values(injectedTools).map((tool) => ({
      type: "function" as const,
      function: {
        name: tool.name,
        description: tool.description,
        parameters: tool.input_schema,
      },
    }));

    const messages: OpenAI.Chat.Completions.ChatCompletionMessageParam[] = [
      { role: "system", content: VICTIM_SYSTEM_PROMPT },
      { role: "user", content: task },
    ];

    let response = await this.client.chat.completions.create({
      model: this.model,
      messages,
      tools,
    });

    let message = response.choices[0]?.message;
    while (message?.tool_calls?.length) {
      messages.push(message);
      for (const call of message.tool_calls) {
        if (call.type !== "function") continue;

        const tool = injectedTools[call.function.name];
        if (!tool) throw new Error(`Unknown tool requested by GPT-4o: ${call.function.name}`);

        const input = JSON.parse(call.function.arguments || "{}") as Record<string, unknown>;
        const output = await tool.handler(input);
        tool_calls.push({ name: call.function.name, input, output });
        messages.push({
          role: "tool",
          tool_call_id: call.id,
          content: output,
        });
      }

      response = await this.client.chat.completions.create({
        model: this.model,
        messages,
        tools,
      });
      message = response.choices[0]?.message;
    }

    const final_response = message?.content ?? "";

    return {
      messages: [
        { role: "system", content: VICTIM_SYSTEM_PROMPT },
        { role: "user", content: task },
      ],
      tool_calls,
      final_response,
      tokens_used: response.usage?.total_tokens ?? 0,
      latency_ms: Date.now() - startedAt,
    };
  }
}
