import { z } from "zod"
import type { WrappedCard, WrappedMedia } from "@/types/wrapped"
import type { WrappedCardGeneratorSpec } from "@/types/generator"
import { UnifiedCardDataSchema } from "@/schemas/unified"

type BuilderDeps = {
  ai: {
    callStructuredJSON: (args: {
      system: string
      prompt: string
      tools?: any[]
      toolRouter?: any
      schema: z.ZodTypeAny
      vars?: Record<string, unknown>
      context?: unknown
      timeoutMs?: number
    }) => Promise<any>
  }
  mcpFactory: (allowedTools?: string[]) => Promise<{ tools: any[]; router: any }>
  sanitizeSvg?: (raw: string) => string

  // only used by custom processors:
  ensureNodeRuntime: () => void
  tmpDir: string
  upload: (filePath: string) => Promise<{ url: string }>
  openai?: { images: { generate: (opts: any) => Promise<{ data: Array<{ b64_json?: string; url?: string }> }> } }
}

export async function buildWrappedCard(
  deps: BuilderDeps,
  generator: WrappedCardGeneratorSpec,
  vars: { address: `0x${string}`; snapshotAt: string },
  ctx?: unknown,
): Promise<WrappedCard | null> {
  console.log(`[v0] Building card: ${generator.kind}`)
  const { ai, mcpFactory, sanitizeSvg, ensureNodeRuntime, tmpDir, upload, openai } = deps

  try {
    const mcp = await mcpFactory(generator.tools)
    console.log(`[v0] MCP factory created for ${generator.kind}`)

    // 1) DATA
    let data: any
    if (generator.dataProcessor) {
      console.log(`[v0] Using dataProcessor for ${generator.kind}`)
      data = await generator.dataProcessor({ vars, mcp, ctx })
    } else if (generator.dataPrompt) {
      console.log(`[v0] Using dataPrompt for ${generator.kind}`)
      data = await ai.callStructuredJSON({
        system: `Return STRICT JSON matching the schema. No commentary. Crypto tone allowed.`,
        prompt: generator.dataPrompt,
        tools: mcp.tools,
        toolRouter: mcp.router,
        schema: UnifiedCardDataSchema,
        vars,
        timeoutMs: 15000,
      })
    } else {
      throw new Error(`Generator "${generator.kind}" missing dataPrompt/dataProcessor`)
    }

    console.log(`[v0] Data generated for ${generator.kind}:`, {
      hasLeadIn: !!data?.leadInText,
      hasReveal: !!data?.revealText,
    })

    if (!data?.leadInText || !data?.revealText) {
      console.log(`[v0] Card ${generator.kind} missing required text fields`)
      return null
    }

    // 2) MEDIA
    let media: WrappedMedia | undefined
    if (generator.mediaProcessor) {
      console.log(`[v0] Using mediaProcessor for ${generator.kind}`)
      ensureNodeRuntime()
      media = await generator.mediaProcessor({ vars, mcp, ctx, data, tmpDir, upload, openai })
    } else if (generator.mediaPrompt) {
      console.log(`[v0] Using mediaPrompt for ${generator.kind}`)
      const MediaSchema = z.union([
        z.object({ kind: z.literal("url"), src: z.string().url(), alt: z.string().optional() }),
        z.object({ kind: z.literal("svg"), svg: z.string(), alt: z.string().optional() }),
      ])
      const mediaResult = await ai.callStructuredJSON({
        system: `Return exactly ONE media object as JSON.`,
        prompt: generator.mediaPrompt,
        tools: mcp.tools,
        toolRouter: mcp.router,
        schema: MediaSchema,
        vars,
        context: data,
        timeoutMs: 12000,
      })
      if (mediaResult?.kind === "svg" && sanitizeSvg) mediaResult.svg = sanitizeSvg(mediaResult.svg)
      media = mediaResult
    }

    console.log(`[v0] Media generated for ${generator.kind}:`, { hasMedia: !!media })

    const card = {
      kind: generator.kind,
      order: generator.order,
      leadInText: data.leadInText,
      revealText: data.revealText,
      highlights: data.highlights,
      footnote: data.footnote,
      media,
    }

    console.log(`[v0] Card ${generator.kind} completed successfully`)
    return card
  } catch (error) {
    console.log(`[v0] Error building card ${generator.kind}:`, error)
    throw error
  }
}
