import type { WrappedCardGeneratorSpec } from '@/types/generator'

export const TopTradedGen: WrappedCardGeneratorSpec = {
	kind: 'top-traded',
	version: 1,
	order: 10,
	dataPrompt: `
Look at the user's profile and show the NFT or NFT collection they have traded the most and return 1 of the NFTs along with it's metadata image url.
`,
	mediaPrompt: `
Look at the NFTs in the highlights and return the first image url. If there is no image url, generate an SVG.
`,
}
