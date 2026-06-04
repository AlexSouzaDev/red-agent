import type { AttackScenario, AgentTrace } from "../attacks/types";
import { buildInjectedTask, buildInjectedTools } from "./injector";
import type { VictimAgent } from "./agents/base";

export async function runScenario(
  agent: VictimAgent,
  scenario: AttackScenario,
): Promise<AgentTrace> {
  const task = buildInjectedTask(scenario);
  const tools = buildInjectedTools(scenario);
  return agent.run(task, tools);
}
