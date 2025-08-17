import type { WrappedCardGeneratorSpec } from '@/types/generator'

export const RecommendationsGen: WrappedCardGeneratorSpec = {
	kind: 'recommendations',
	version: 1,
	order: 20,
	dataPrompt: `
get the profile for this account, which includes the latest trades. FInd the 4 trades for token that the wallet address provided currently owns that are worth the most. Look at the traits of these tokens. then search for the top 50 trending NFT tokens. Then with the 4 tokens the user owns, examine the top 50 NFT tokens to see which one is the most similar, and return that token. Make sure to include the collection name as the label, the token name as the value, and the image url as the image for the highlighted data.
`,
	mediaPrompt: `
Look at the highlighted NFTs and return the first image url. If there is no image url, generate an SVG.
`,
}
