import type { WrappedCardGeneratorSpec } from '@/types/generator'

export const TopTokensGen: WrappedCardGeneratorSpec = {
	kind: 'top_tokens',
	version: 1,
	order: 10,
	requires: ['tokens', 'prices'],
	dataPrompt: `
Find the users top 4 tokens by USD value. These are their favorite tokens. 
`,
	//   mediaPrompt: `
	// Craft an SVG (1200x630) horizontal bar chart from "highlights".
	// Bars labeled by "label", width ∝ USD (parsed from "value"). Return:
	// { "kind":"svg", "svg":"<svg>...</svg>" }.
	// Use bold, neon gradient vibes.
	// `,
}
