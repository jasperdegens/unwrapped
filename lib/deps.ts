import DOMPurify from "isomorphic-dompurify"
import { createMcpClient } from "@/lib/mcp"

export const deps = {
  ai: {
    async callStructuredJSON({ system, prompt, tools, toolRouter, schema, vars, context, timeoutMs }: any) {
      // wire to Vercel AI SDK with tool-calling + JSON mode
      // for V0 scaffold, stub minimal behavior:
      // throw new Error('ai.callStructuredJSON not implemented');
      // In your repo: use ai SDK, validate with zod.parse, retry on fail
      const raw = {} // <- call model with system+prompt+tools+vars+context
      return schema.parse(raw)
    },
  },
  async mcpFactory(allowedTools?: string[]) {
    return createMcpClient({ allowedTools })
  },
  sanitizeSvg(raw: string) {
    return DOMPurify.sanitize(raw, { USE_PROFILES: { svg: true, svgFilters: true } })
  },
  ensureNodeRuntime() {
    if (typeof process === "undefined" || !(process.release?.name === "node")) {
      throw new Error("Custom processors require Node runtime")
    }
  },
  tmpDir: "/tmp",
  async upload(filePath: string) {
    // wire to @vercel/blob or S3
    // throw new Error('upload not implemented');
    return { url: `blob://${filePath}` }
  },
  openai: undefined as any, // provide if you want images.generate
}
