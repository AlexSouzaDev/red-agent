import { z } from "zod";

export const attackScenarioSchema = z.object({
  id: z.string().min(1),
  category: z.enum([
    "prompt_injection_document",
    "poisoned_tool_output",
    "context_flooding",
    "indirect_injection",
    "chain_of_thought_hijack",
  ]),
  name: z.string().min(1),
  description: z.string().min(1),
  severity: z.enum(["low", "medium", "high", "critical"]),
  victim_task: z.string().min(1),
  injection_point: z.enum([
    "document_content",
    "tool_response",
    "retrieved_context",
    "context_window",
  ]),
  target_tool: z.string().optional(),
  payload: z.string().min(1),
  benign_baseline: z.string().min(1),
  compromised_if: z.string().min(1),
  safe_if: z.string().min(1),
});

export const attackScenarioListSchema = z.array(attackScenarioSchema);
