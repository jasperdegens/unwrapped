import { z } from 'zod'
import { type UnifiedCardData, UnifiedCardDataSchema } from '@/schemas/unified'
import type { WrappedCardGeneratorSpec } from '@/types/generator'
import type { WrappedCard, WrappedMedia } from '@/types/wrapped'
import type { BuilderDeps } from './deps'
import { DATA_SYSTEM_PROMPT } from './prompts'

// Standard system prompt templates
const SYSTEM_PROMPTS = {
	data: DATA_SYSTEM_PROMPT,
	media: `Return exactly ONE media object as JSON.`,
} as const

// Media schema for generation
const MediaSchema = z.union([
	z.object({ kind: z.literal('url'), src: z.string().url(), alt: z.string().optional() }),
	z.object({ kind: z.literal('svg'), svg: z.string(), alt: z.string().optional() }),
])

const addVarsToPrompt = (prompt: string, vars: { address: `0x${string}` } & Record<string, unknown>) => {
	// check if prompt contains string template for address, otherwise include at the start of the prompt
	const addressTemplate = /{{address}}/g
	if (addressTemplate.test(prompt)) {
		prompt = prompt.replace(addressTemplate, vars.address)
	} else {
		prompt = `The user's address is: ${vars.address}.\n\n${prompt}`
	}

	// replace all other variables
	for (const [key, value] of Object.entries(vars)) {
		prompt = prompt.replace(`{{${key}}}`, value as string)
	}

	return prompt
}

/**
 * Generate data for a wrapped card using AI or custom processor
 */
async function generateCardData(
	ai: BuilderDeps['ai'],
	generator: WrappedCardGeneratorSpec,
	vars: { address: `0x${string}`; snapshotAt: string }
): Promise<Partial<WrappedCard>> {
	if (generator.dataProcessor) {
		console.log(`[v0] Using dataProcessor for ${generator.kind}`)
		return await generator.dataProcessor({ vars })
	}

	if (generator.dataPrompt) {
		console.log(`[v0] Using dataPrompt for ${generator.kind}`)
		return await ai.callStructuredJSON({
			system: SYSTEM_PROMPTS.data,
			prompt: addVarsToPrompt(generator.dataPrompt, vars),
			schema: UnifiedCardDataSchema,
			vars,
		})
	}

	throw new Error(`Generator "${generator.kind}" missing dataPrompt/dataProcessor`)
}

/**
 * Generate media for a wrapped card using AI or custom processor
 */
async function generateCardMedia(
	ai: BuilderDeps['ai'],
	sanitizeSvg: BuilderDeps['sanitizeSvg'],
	generator: WrappedCardGeneratorSpec,
	vars: { address: `0x${string}`; snapshotAt: string },
	data: UnifiedCardData,
	tmpDir?: string,
	upload?: BuilderDeps['upload'],
	openai?: BuilderDeps['openai']
): Promise<WrappedMedia | undefined> {
	if (generator.mediaProcessor) {
		console.log(`[v0] Using mediaProcessor for ${generator.kind}`)
		return await generator.mediaProcessor({
			vars,
			ai,
			openai,
			data,
			tmpDir: tmpDir || '/tmp',
			upload: upload || (() => Promise.resolve({ url: '' })),
		})
	}

	if (generator.mediaPrompt) {
		console.log(`[v0] Using mediaPrompt for ${generator.kind}`)
		const mediaResult = await ai.callStructuredJSON({
			system: SYSTEM_PROMPTS.media,
			prompt: addVarsToPrompt(generator.mediaPrompt, vars),
			schema: MediaSchema,
			vars,
			context: data,
		})

		// Sanitize SVG if present
		if (mediaResult?.kind === 'svg' && sanitizeSvg) {
			mediaResult.svg = sanitizeSvg(mediaResult.svg)
		}

		return mediaResult
	}

	return undefined
}

/**
 * Validate that generated data contains required fields
 */
function validateCardData(data: Partial<WrappedCard>, generatorKind: string): boolean {
	const hasRequiredFields = !!(data?.leadInText && data?.revealText)

	if (!hasRequiredFields) {
		console.log(`[v0] Card ${generatorKind} missing required text fields`)
		return false
	}

	return true
}

/**
 * Build a complete wrapped card from generator specification
 */
export async function buildWrappedCard(
	deps: BuilderDeps,
	generator: WrappedCardGeneratorSpec,
	vars: { address: `0x${string}`; snapshotAt: string }
): Promise<WrappedCard | null> {
	console.log(`[v0] Building card: ${generator.kind}`)
	const { ai, sanitizeSvg, tmpDir, upload, openai } = deps

	try {
		// 1) Generate card data
		const data = {} //await generateCardData(ai, generator, vars)

		console.log(data)

		// // Validate required fields
		// if (!validateCardData(data, generator.kind)) {
		// 	return null
		// }

		// 2) Generate card media
		const media = await generateCardMedia(
			ai,
			sanitizeSvg,
			generator,
			vars,
			data as UnifiedCardData,
			tmpDir,
			upload,
			openai
		)

		console.log(`[v0] Media generated for ${generator.kind}:`, { hasMedia: !!media })

		// 3) Assemble final card
		const card: WrappedCard = {
			kind: generator.kind,
			order: generator.order,
			leadInText: data.leadInText!,
			revealText: data.revealText!,
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
