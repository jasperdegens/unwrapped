import type { WrappedCardGeneratorSpec } from '@/types/generator'

export const BestTradeGen: WrappedCardGeneratorSpec = {
	kind: 'best-trade',
	version: 1,
	order: 20,
	dataPrompt: `
From the last 365 days, pick the single trade with the highest positive PnL (approx).
Return STRICT JSON:
{
  "leadInText": "Your giga-brain move of the year:",
  "revealText": "<token or collection> printed +$<pnl> — chef's kiss.",
  "highlights": [
    { "label":"Entry", "value":"$<price>" },
    { "label":"Now", "value":"$<price>" },
    { "label":"Tx", "value":"<0x...short>" }
  ],
  "footnote":"Heuristic PnL; DYOR."
}
No commentary.
`,
	mediaPrompt: `
If NFT image exists for the winning trade, return:
{ "kind":"url", "src":"<image_url>", "alt":"<collection or token id>" }.
Else return an SVG trophy (1200x630) with bold neon and "+$<pnl>" from context.revealText.
`,
}
