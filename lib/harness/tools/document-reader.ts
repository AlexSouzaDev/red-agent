import type { MockTool } from "./base";

export function makeDocumentReaderTool(documentContent: string): MockTool<{ document_id: string }> {
  return {
    name: "document_reader",
    description: "Read a controlled financial document by id.",
    input_schema: {
      type: "object",
      properties: {
        document_id: { type: "string", description: "Document identifier" },
      },
      required: ["document_id"],
    },
    handler: async () => documentContent,
  };
}
