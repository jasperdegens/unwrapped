export type WrappedCardKind = string

export type WrappedMedia =
	| { kind: 'url'; src: string; alt?: string }
	| { kind: 'svg'; svg: string; alt?: string }
	| { kind: 'jsx'; jsx: string; alt?: string } // feature flag if needed

export type WrappedHighlight = { label: string; value: string }

export interface WrappedCard {
	kind: WrappedCardKind
	order: number
	leadInText: string // setup: "This cycle, your biggest bag…"
	revealText: string // payoff: "…$23,481 in ETH. giga-chad."
	highlights?: WrappedHighlight[] // small stats (symbol → $usd, etc.)
	footnote?: string // disclaimers: "heuristic PnL"
	media?: WrappedMedia // url | svg | jsx
}

export interface WrappedCardCollection {
	address: `0x${string}`
	cards: WrappedCard[]
	timestamp: string
}
