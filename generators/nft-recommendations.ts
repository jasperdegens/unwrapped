import type { WrappedCardGeneratorSpec } from '@/types/generator'

export const RecommendationsGen: WrappedCardGeneratorSpec = {
	kind: 'recommendations',
	version: 1,
	order: 20,
	dataPrompt: `
Look at the NFTs in the wallet address. Then, look for a recommended collection for that user that is similar to the NFTs they own. Highlight two NFTs from the recommended collection, and make sure to include the images in the highlighted data.
`,
	mediaPrompt: `
Look at the highlighted NFTs and return the first image url. If there is no image url, generate an SVG.
`,
}
