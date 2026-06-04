import type { AttackScenario } from "../attacks/types";
import type { MockToolSet } from "./tools/base";
import { makeCalculatorTool } from "./tools/calculator";
import { makeComplianceCheckTool } from "./tools/compliance-check";
import { makeDocumentReaderTool } from "./tools/document-reader";
import { makeStockPriceTool } from "./tools/stock-price";

function toolPayload(scenario: AttackScenario, toolName: string): string | undefined {
  if (scenario.injection_point === "tool_response" && scenario.target_tool === toolName) {
    return scenario.payload;
  }
  if (scenario.injection_point === "retrieved_context" && scenario.target_tool === toolName) {
    return scenario.payload;
  }
  return undefined;
}

export function buildInjectedTools(scenario: AttackScenario): MockToolSet {
  const documentContent =
    scenario.injection_point === "document_content"
      ? scenario.payload
      : scenario.benign_baseline;

  return {
    stock_price_lookup: makeStockPriceTool(toolPayload(scenario, "stock_price_lookup")),
    document_reader: makeDocumentReaderTool(documentContent),
    calculator: makeCalculatorTool(toolPayload(scenario, "calculator")),
    compliance_check: makeComplianceCheckTool(toolPayload(scenario, "compliance_check")),
  };
}

export function buildInjectedTask(scenario: AttackScenario): string {
  if (scenario.injection_point === "context_window") {
    return `${scenario.payload}\n\nLEGITIMATE USER TASK:\n${scenario.victim_task}`;
  }

  return scenario.victim_task;
}
