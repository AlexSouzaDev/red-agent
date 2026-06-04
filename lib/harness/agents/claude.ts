import Anthropic from "@anthropic-ai/sdk";
import type { AgentTrace } from "../../attacks/types";
import type { MockToolSet } from "../tools/base";
import { VICTIM_SYSTEM_PROMPT, type VictimAgent } from "./base";

export class ClaudeVictimAgent implements VictimAgent {
  model = "claude-sonnet-4-6";

  private client = new Anthropic({
    apiKey: process.env.ANTHROPIC_API_KEY,
  });

  async run(task: string, injectedTools: MockToolSet): Promise<AgentTrace> {
    if (!process.env.ANTHROPIC_API_KEY) {
      throw new Error("ANTHROPIC_API_KEY is required for ClaudeVictimAgent.");
    }

    const startedAt = Date.now();
    const toolDefinitions = Object.values(injectedTools).map((tool) => ({
      name: tool.name,
      description: tool.description,
      input_schema: tool.input_schema as Anthropic.Tool.InputSchema,
    }));

    const messages: Anthropic.MessageParam[] = [{ role: "user", content: task }];
    const tool_calls: AgentTrace["tool_calls"] = [];

    let response = await this.client.messages.create({
      model: this.model,
      max_tokens: 1200,
      system: VICTIM_SYSTEM_PROMPT,
      tools: toolDefinitions,
      messages,
    });

    messages.push({ role: "assistant", content: response.content });

    while (response.stop_reason === "tool_use") {
      const toolResults: Anthropic.ToolResultBlockParam[] = [];

      for (const block of response.content) {
        if (block.type !== "tool_use") continue;

        const tool = injectedTools[block.name];
        if (!tool) throw new Error(`Unknown tool requested by Claude: ${block.name}`);

        const output = await tool.handler(block.input as Record<string, unknown>);
        tool_calls.push({
          name: block.name,
          input: block.input as Record<string, unknown>,
          output,
        });
        toolResults.push({
          type: "tool_result",
          tool_use_id: block.id,
          content: output,
        });
      }

      messages.push({ role: "user", content: toolResults });
      response = await this.client.messages.create({
        model: this.model,
        max_tokens: 1200,
        system: VICTIM_SYSTEM_PROMPT,
        tools: toolDefinitions,
        messages,
      });
      messages.push({ role: "assistant", content: response.content });
    }

    const final_response = response.content
      .filter((block) => block.type === "text")
      .map((block) => block.text)
      .join("\n");

    return {
      messages: [
        { role: "system", content: VICTIM_SYSTEM_PROMPT },
        { role: "user", content: task },
      ],
      tool_calls,
      final_response,
      tokens_used: response.usage.input_tokens + response.usage.output_tokens,
      latency_ms: Date.now() - startedAt,
    };
  }
}
