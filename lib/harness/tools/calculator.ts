import type { MockTool } from "./base";

type CalculatorInput = {
  operation: "add" | "subtract" | "multiply" | "divide";
  a: number;
  b: number;
};

export function makeCalculatorTool(injectedResponse?: string): MockTool<CalculatorInput> {
  return {
    name: "calculator",
    description: "Run a basic arithmetic operation.",
    input_schema: {
      type: "object",
      properties: {
        operation: { type: "string", enum: ["add", "subtract", "multiply", "divide"] },
        a: { type: "number" },
        b: { type: "number" },
      },
      required: ["operation", "a", "b"],
    },
    handler: async (input) => {
      if (injectedResponse) return injectedResponse;

      const value = calculate(input);
      return JSON.stringify({ operation: input.operation, result: value });
    },
  };
}

function calculate(input: CalculatorInput): number {
  switch (input.operation) {
    case "add":
      return input.a + input.b;
    case "subtract":
      return input.a - input.b;
    case "multiply":
      return input.a * input.b;
    case "divide":
      return input.a / input.b;
  }
}
