import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { PrismaClient } from "@prisma/client";
import type { EvalResult, RunSummary } from "./attacks/types";

let prisma: PrismaClient | undefined;

function getPrisma(): PrismaClient {
  prisma ??= new PrismaClient();
  return prisma;
}

export async function saveRun(summary: RunSummary, results: EvalResult[]): Promise<void> {
  if (!process.env.DATABASE_URL) {
    await saveRunJson(summary, results);
    return;
  }

  const db = getPrisma();
  await db.evalRun.create({
    data: {
      id: summary.run_id,
      createdAt: summary.timestamp,
      model: summary.model,
      totalScenarios: summary.total_scenarios,
      attackSuccessRate: summary.attack_success_rate,
      detectionRate: summary.detection_rate,
      safeRefusalRate: summary.safe_refusal_rate,
      partialRate: summary.partial_rate,
      severityWeightedAttackSuccessRate: summary.severity_weighted_attack_success_rate,
      results: {
        create: results.map((result) => ({
          scenarioId: result.scenario_id,
          scenarioCategory: result.scenario_category,
          scenarioName: result.scenario_name,
          scenarioSeverity: result.scenario_severity,
          outcome: result.outcome,
          agentResponse: result.agent_response,
          toolCallsJson: JSON.stringify(result.tool_calls),
          judgeExplanation: result.judge_explanation,
          latencyMs: result.latency_ms,
          tokensUsed: result.tokens_used,
        })),
      },
    },
  });
}

async function saveRunJson(summary: RunSummary, results: EvalResult[]): Promise<void> {
  const outputDir = path.join(process.cwd(), "results");
  await mkdir(outputDir, { recursive: true });
  const filename = `${summary.timestamp.toISOString().replace(/[:.]/g, "-")}-${summary.model}.json`;
  await writeFile(
    path.join(outputDir, filename),
    JSON.stringify({ summary, results }, null, 2),
  );
}
