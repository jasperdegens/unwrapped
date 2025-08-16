export async function createMcpClient({ allowedTools }: { allowedTools?: string[] }) {
  // connect to OpenSea MCP server; filter tool access to allowedTools
  // return { tools, router } to feed to AI SDK
  return {
    tools: [], // list of tool specs
    router: {}, // handler for tool calls
  }
}
