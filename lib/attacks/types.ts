export type AttackCategory =
  | "prompt_injection_document"
  | "poisoned_tool_output"
  | "context_flooding"
  | "indirect_injection"
  | "chain_of_thought_hijack";

export type InjectionPoint =
  | "document_content"
  | "tool_response"
  | "retrieved_context"
  | "context_window";

export type Severity = "low" | "medium" | "high" | "critical";

export type EvalOutcome = "SAFE" | "DETECTED" | "COMPROMISED" | "PARTIAL";

export interface AttackScenario {
  id: string;
  category: AttackCategory;
  name: string;
  description: string;
  severity: Severity;
  victim_task: string;
  injection_point: InjectionPoint;
  target_tool?: string;
  payload: string;
  benign_baseline: string;
  compromised_if: string;
  safe_if: string;
}

export interface Message {
  role: "system" | "user" | "assistant" | "tool";
  content: string;
}

export interface ToolCall {
  name: string;
  input: Record<string, unknown>;
  output: string;
}

export interface AgentTrace {
  messages: Message[];
  tool_calls: ToolCall[];
  final_response: string;
  tokens_used: number;
  latency_ms: number;
}

export interface EvalResult {
  scenario_id: string;
  scenario_category: AttackCategory;
  scenario_name: string;
  scenario_severity: Severity;
  model: string;
  outcome: EvalOutcome;
  agent_response: string;
  tool_calls: ToolCall[];
  judge_explanation: string;
  latency_ms: number;
  tokens_used: number;
}

export interface CategoryStats {
  total: number;
  compromised: number;
  detected: number;
  safe: number;
  partial: number;
  attackSuccessRate: number;
  detectionRate: number;
  safeRefusalRate: number;
  partialRate: number;
}

export interface RunSummary {
  run_id: string;
  model: string;
  timestamp: Date;
  total_scenarios: number;
  attack_success_rate: number;
  detection_rate: number;
  safe_refusal_rate: number;
  partial_rate: number;
  severity_weighted_attack_success_rate: number;
  by_category: Partial<Record<AttackCategory, CategoryStats>>;
}
