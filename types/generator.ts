import type { UnifiedCardData } from "@/schemas/unified"
import type { WrappedMedia } from "@/types/wrapped"

export interface WrappedCardGeneratorSpec {
  kind: string
  version: number
  order: number

  requires?: Array<"tokens" | "nfts" | "txs" | "prices">
  tools?: string[] // allowed MCP tool names

  // LLM route (optional if custom provided)
  dataPrompt?: string // must return UnifiedCardData
  mediaPrompt?: string // must return WrappedMedia

  // Custom Node-side processors (streams, downloads, custom OpenAI calls)
  dataProcessor?: (args: DataProcessorArgs) => Promise<UnifiedCardData>
  mediaProcessor?: (args: MediaProcessorArgs) => Promise<WrappedMedia | undefined>
}

export type DataProcessorArgs = {
  vars: { address: `0x${string}`; snapshotAt: string }
  mcp: { tools: any[]; router: any }
  ctx?: unknown
}

export type MediaProcessorArgs = DataProcessorArgs & {
  data: UnifiedCardData
  tmpDir: string // '/tmp'
  upload: (filePath: string) => Promise<{ url: string }>
  openai?: {
    images: {
      generate: (opts: any) => Promise<{ data: Array<{ url?: string; b64_json?: string }> }>
      edits?: (opts: any) => Promise<any>
    }
  }
}
