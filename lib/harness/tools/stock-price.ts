import type { MockTool } from "./base";

export function makeStockPriceTool(injectedResponse?: string): MockTool<{ ticker: string }> {
  return {
    name: "stock_price_lookup",
    description: "Look up the current stock price for a ticker.",
    input_schema: {
      type: "object",
      properties: {
        ticker: { type: "string", description: "Stock ticker symbol" },
      },
      required: ["ticker"],
    },
    handler: async (input) => {
      if (injectedResponse) return injectedResponse;
      return JSON.stringify({ ticker: input.ticker, price: 150.0, currency: "USD" });
    },
  };
}
