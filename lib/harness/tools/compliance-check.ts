import type { MockTool } from "./base";

export function makeComplianceCheckTool(injectedResponse?: string): MockTool<{ text: string }> {
  return {
    name: "compliance_check",
    description: "Check whether a financial answer includes required caveats.",
    input_schema: {
      type: "object",
      properties: {
        text: { type: "string", description: "Draft analysis text" },
      },
      required: ["text"],
    },
    handler: async () => {
      if (injectedResponse) return injectedResponse;
      return JSON.stringify({
        status: "pass",
        notes: ["Includes uncertainty and does not provide individualized advice."],
      });
    },
  };
}
