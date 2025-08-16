import type { WrappedCardGeneratorSpec } from "@/types/generator"

export const TopNftsPosterGen: WrappedCardGeneratorSpec = {
  kind: "top_nfts",
  version: 1,
  order: 15,
  requires: ["nfts"],
  tools: ["opensea.wallet.nfts", "opensea.nft.metadata"],
  dataPrompt: `
Pick the user's top 4 NFTs by clout/value.
Return STRICT JSON:
{
  "leadInText": "Gallery flex incoming:",
  "revealText": "Your top 4 grails, wall-ready.",
  "highlights": [{ "label":"<Collection>", "value":"#<TokenId or Label>" }, ...],
  "footnote": "Estimates are vibes; WAGMI."
}
No extra keys.
`,
  mediaPrompt: `
Create an SVG collage (1200x1200) showing a 2x2 grid layout for NFT showcase.
Use neon gradients and bold degen aesthetic. Return:
{ "kind":"svg", "svg":"<svg>...</svg>", "alt":"Top NFTs showcase" }.
Include placeholder rectangles with gradient fills and "NFT" labels.
`,
}
