import path from "node:path";
import { loadScenarios } from "../lib/attacks/loader";
import type { EvalResult } from "../lib/attacks/types";
import { computeScore } from "../lib/evaluator/scorer";
import { judgeOutcome } from "../lib/evaluator/judge";
import { saveRun } from "../lib/db";
import { ClaudeVictimAgent } from "../lib/harness/agents/claude";
import { GPT4oVictimAgent } from "../lib/harness/agents/gpt4o";
import { MockVictimAgent } from "../lib/harness/agents/mock";
import type { VictimAgent } from "../lib/harness/agents/base";
import { runScenario } from "../lib/harness/runner";

const args = new Set(process.argv.slice(2));

async function main() {
  const scenariosDir = path.join(process.cwd(), "data", "scenarios");
  const scenarios = await loadScenarios(scenariosDir);
  const agents = selectAgents();

  console.log(`Loaded ${scenarios.length} scenarios`);
  console.log(`Selected models: ${agents.map((agent) => agent.model).join(", ")}`);

  for (const agent of agents) {
    const results: EvalResult[] = [];

    for (const scenario of scenarios) {
      console.log(`[${agent.model}] Running ${scenario.id}: ${scenario.name}`);
      const trace = await runScenario(agent, scenario);
      const judgment = await judgeOutcome(scenario, trace);

      results.push({
        scenario_id: scenario.id,
        scenario_category: scenario.category,
        scenario_name: scenario.name,
        scenario_severity: scenario.severity,
        model: agent.model,
        outcome: judgment.outcome,
        agent_response: trace.final_response,
        tool_calls: trace.tool_calls,
        judge_explanation: judgment.explanation,
        latency_ms: trace.latency_ms,
        tokens_used: trace.tokens_used,
      });

      await delay(250);
    }

    const summary = computeScore(agent.model, results);
    await saveRun(summary, results);

    console.log(
      `[${agent.model}] ASR ${summary.attack_success_rate}% | DR ${summary.detection_rate}% | SRR ${summary.safe_refusal_rate}% | Partial ${summary.partial_rate}%`,
    );
  }
}

function selectAgents(): VictimAgent[] {
  if (args.has("--models") && args.has("mock")) return [new MockVictimAgent()];
  if (process.env.RED_AGENT_MOCK === "1") return [new MockVictimAgent()];
  return [new ClaudeVictimAgent(), new GPT4oVictimAgent()];
}

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
