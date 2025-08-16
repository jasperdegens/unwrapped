import { openai } from '@ai-sdk/openai'
import { put } from '@vercel/blob'
import {
	experimental_createMCPClient as createMCPClient,
	generateText,
	type experimental_MCPClient as MCPClient,
	Output,
	stepCountIs,
} from 'ai'
import DOMPurify from 'isomorphic-dompurify'
import { OpenAI } from 'openai'
import { z } from 'zod'

export type BuilderDeps = {
	ai: {
		callStructuredJSON: (args: {
			system: string
			prompt: string
			schema: z.ZodTypeAny
			vars?: { address: `0x${string}` } & Record<string, unknown>
			context?: any
			timeoutMs?: number
			openai?: { images: { generate: (opts: any) => Promise<{ data: Array<{ b64_json?: string; url?: string }> }> } }
		}) => Promise<any>
	}
	mcpFactory: () => Promise<MCPClient>
	sanitizeSvg?: (raw: string) => string
	tmpDir: string
	upload: (filePath: string) => Promise<{ url: string }>
	openai?: { images: { generate: (opts: any) => Promise<{ data: Array<{ b64_json?: string; url?: string }> }> } }
}

export const deps: BuilderDeps = {
	ai: {
		async callStructuredJSON({
			system,
			prompt,
			schema,
			vars,
			timeoutMs = 60000,
		}: {
			system: string
			prompt: string
			schema: z.ZodSchema
			vars?: Record<string, any>
			timeoutMs?: number
		}) {
			const controller = new AbortController()
			setTimeout(() => controller.abort(), timeoutMs)

			const openseaClient = await createMCPClient({
				transport: {
					type: 'sse',
					url: 'https://mcp.opensea.io/sse',
					headers: {
						Authorization: `Bearer ${process.env.OPENSEA_API_KEY}`,
					},
				},
			})
			try {
				console.log(prompt)

				const tools = await openseaClient.tools()

				const result = await generateText({
					model: openai(process.env.AI_MODEL || 'gpt-4o'),
					system,
					prompt,
					tools,
					toolChoice: 'auto',
					experimental_output: Output.object({ schema }),
					// onStepFinish: (step) => {
					// 	console.log(step.toolResults?.map((result) => result?.output?.content))
					// 	console.log(step.toolResults?.map((result) => result?.error))
					// },
					abortSignal: controller.signal,
					stopWhen: stepCountIs(20),
				})
				console.log(result.toolCalls)
				console.log(result.toolResults)
				console.log(result)
				return result.resolvedOutput
			} catch (error) {
				if (error instanceof z.ZodError) {
					throw new Error(`AI response validation failed: ${error.message}`)
				}
				console.error(error)
				throw new Error(`AI generation failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
			} finally {
				openseaClient.close()
			}
		},
	},

	async mcpFactory() {
		const openseaClient = await createMCPClient({
			transport: {
				type: 'sse',
				url: 'https://mcp.opensea.io/sse',

				// optional: configure HTTP headers, e.g. for authentication
				headers: {
					Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
				},
			},
		})
		return openseaClient
	},

	sanitizeSvg(raw: string) {
		return DOMPurify.sanitize(raw, {
			USE_PROFILES: { svg: true, svgFilters: true },
			ADD_TAGS: ['animate', 'animateTransform', 'animateMotion'],
			ADD_ATTR: ['dur', 'repeatCount', 'begin', 'end', 'values', 'keyTimes'],
		})
	},

	tmpDir: '/tmp',

	async upload(filePath: string) {
		try {
			// Ensure we're in Node runtime for file operations
			if (typeof process === 'undefined' || !(process.release?.name === 'node')) {
				throw new Error('Custom processors require Node runtime')
			}

			// Read the file and upload to Vercel Blob
			const fs = await import('fs/promises')
			const fileBuffer = await fs.readFile(filePath)

			// Generate a unique filename
			const timestamp = Date.now()
			const randomId = Math.random().toString(36).substring(2, 15)
			const fileName = `wrapped-${timestamp}-${randomId}.png`

			const blob = await put(fileName, fileBuffer, {
				access: 'public',
				contentType: 'image/png',
			})

			return { url: blob.url }
		} catch (error) {
			console.error('Upload failed:', error)
			// Fallback to mock URL for development
			return { url: `https://via.placeholder.com/1200x630/1a1a1a/ffffff?text=Wrapped+Card` }
		}
	},

	get openai() {
		const apiKey = process.env.OPENAI_API_KEY
		if (!apiKey) {
			console.warn('OPENAI_API_KEY not set, OpenAI features disabled')
			return undefined
		}

		try {
			const client = new OpenAI({ apiKey })
			return {
				images: {
					generate: async (opts: any) => {
						const response = await client.images.generate(opts)
						// Map OpenAI response to expected interface
						const mappedData =
							response.data?.map((img) => ({
								b64_json: img.b64_json,
								url: img.url,
							})) || []
						return { data: mappedData }
					},
				},
			}
		} catch (error) {
			console.error('Failed to initialize OpenAI client:', error)
			return undefined
		}
	},
}
