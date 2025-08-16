import type { WrappedCardGeneratorSpec } from "@/types/generator"

export const TopTokensGen: WrappedCardGeneratorSpec = {
  kind: "top_tokens",
  version: 1,
  order: 10,
  requires: ["tokens", "prices"],
  tools: ["opensea.wallet.tokens", "opensea.token.prices"],
  dataPrompt: `
Compute the user's top 5 tokens by USD value.
Return STRICT JSON:
{
  "leadInText": "Your heaviest bags this run:",
  "revealText": "<SYMBOL> is king at $<amount> — giga stack.",
  "highlights": [{ "label": "<SYMBOL>", "value": "$<USD rounded>" }, ...],
  "footnote": "Approx prices; degen math."
}
No extra keys or commentary.
`,
  mediaPrompt: `
Craft an SVG (1200x630) horizontal bar chart from "highlights".
Bars labeled by "label", width ∝ USD (parsed from "value"). Return:
{ "kind":"svg", "svg":"<svg>...</svg>" }.
Use bold, neon gradient vibes.
`,
}
