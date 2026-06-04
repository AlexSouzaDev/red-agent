export interface MockTool<Input extends Record<string, unknown> = Record<string, unknown>> {
  name: string;
  description: string;
  input_schema: Record<string, unknown>;
  handler: (input: Input) => Promise<string>;
}

export type MockToolSet = Record<string, MockTool<any>>;
