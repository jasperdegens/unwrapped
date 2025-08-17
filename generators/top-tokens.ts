import type { WrappedCardGeneratorSpec } from '@/types/generator'

export const TopTokensGen: WrappedCardGeneratorSpec = {
	kind: 'top-tokens',
	version: 1,
	order: 10,
	requires: ['tokens', 'prices'],
	dataPrompt: `
	Produce a concise, crypto-native profile with:
1) The wallet’s **total account balance in USD**.
2) The **top 4 tokens by USD value** (symbol + USD).
3) A funny, crypto-themed **persona label** that best fits the user’s holdings/behavior.

DATA TASKS
- Fetch fungible token balances for the wallet and current USD prices.
- Compute totalBalanceUsd = Σ(balanceQty * priceUsd).
- Identify top 4 tokens by USD value (descending).
- (If available) Use recent tx metadata (≤ 365 days) to inform persona (e.g., turnover, recent buys).

HEURISTICS
- **Stablecoins (stable share)**: USDC, USDT, DAI, TUSD, USDP, LUSD, FRAX, FDUSD (case-insensitive).
- **Blue-chips**: ETH, WETH, WBTC, stETH, cbETH, rETH (and similar LSTs).
- **Meme tilt** (optional): If ≥ 30% in well-known memes (e.g., PEPE, SHIB, FLOKI) mark as “meme-leaning”.
- **Turnover** (if txs available): more swaps/mints in last 30–90 days ⇒ risk-on.
- **Holding style** (if txs available): few sells, long intervals ⇒ diamond hands.

CHOOSE ONE PRIMARY PERSONA (most fitting rule wins; keep it witty):
- **Stable Chad** — stablecoins ≥ 60% of USD value.
- **Diamond Hands** — low turnover, long holds, minimal selling (or stables 30–60% with few sells).
- **Blue-Chip Believer** — blue-chips ≥ 70% of USD value.
- **Ape Mode** — stables ≤ 20% AND many new buys/swaps in last 30–90 days.
- **Meme Lord** — memes ≥ 30% of USD value (or obvious meme tilt).
- **Balanced Bag Holder** — none of the above dominate; diversified mix.

COPY RULES
- **leadInText**: setup line, ≤ ~120 chars (e.g., “Trading archetype unlocked:”).
- **revealText**: payoff line with persona + stack (e.g., “Stable Chad with a $23,481 stack — zen AF.”). Funny, degen-friendly, but respectful.
- **highlights**: exactly the top 1–4 tokens as rows:  
  [ { "label": "<SYMBOL>", "value": "$<USD rounded>" }, ... ]
- Use "$12,345" formatting (commas; ≤2 decimals).
- UPPERCASE token symbols; shorten nothing except large numbers.
- Optional **footnote** for caveats (e.g., “Prices are approximate; vibes only.”).
- No personal info beyond public on-chain data.

FALLBACKS
- If no priced tokens are found (or total < $5):  
  leadInText: "Archetype loading…"  
  revealText: "Tiny stack today — tomorrow we send."  
  footnote: "Based on current token balances; NFTs not included."
`,
	mediaPrompt: `
	You are to generate a creative SVG that tries to capture the key highlights of the account. Include 100 shapes. Have the color scheme match the persona. Try to make decals and shapes that represent the persona of this account.
	`,
}
