import { Address, Coinbase } from '@coinbase/coinbase-sdk'
import type { WrappedCardGeneratorSpec } from '@/types/generator'

const prompt = `
Create a Spotify-Wrapped–style **ETH Account Overview** card for the wallet below.

IMPORTANT:
Do not use any tools. You have all of the data you need.

AddressReputationMetadata for this account:
{{addressReputationMetadata}}

TONE
Crypto/degen, playful, respectful. Slang ok: “bags”, “ape”, “WAGMI”, “giga-brain”, “diamond hands”.

DATA RULES
- Use the provided AddressReputationMetadata if available in context. If missing, query ALLOWED_TOOLS to derive approximate values, then proceed.
- Format numbers with thousands separators, e.g., "1,234".
- For day counts, append “d” (e.g., “30d”).
- Keep labels short and values compact (no paragraphs).

PERSONA SELECTION (pick ONE primary that best fits; if tie, choose earlier in this list)
1) **Builder** — smart_contract_deployments ≥ 1 (≥3 → “Protocol Tinkerer” flair)
2) **Bridge Nomad** — bridge_transactions_performed ≥ 10
3) **DeFi Degen** — lend_borrow_stake_transactions ≥ 50
4) **Serial Swapper** — token_swaps_performed ≥ 100
5) **Power User** — total_transactions ≥ 1,000 OR (unique_days_active ≥ 180 AND activity_period_days ≥ 365)
6) **ENS Native** — ens_contract_interactions ≥ 10
7) **Streak Lord** — longest_active_streak ≥ 30 OR current_active_streak ≥ 14
8) **Weekend Warrior** — unique_days_active ≤ 30 but total_transactions ≥ 100 (bursty)
9) **Newcomer** — activity_period_days < 30 OR total_transactions < 20
10) **Balanced Voyager** — fallback when none dominate
11) **Lil Noob** - when all else fails, just say "Lil Noob"

COPY SHAPE
- leadInText: short setup like “On-chain vibe check:”
- revealText: persona + one punch stat, e.g., “Bridge Nomad with 1,245 tx — always on the move.”

HIGHLIGHTS (2-4 items; choose the most interesting/high)
Pick from:
- { label: "Total tx", value: "<total_transactions>" }
- { label: "Active days", value: "<unique_days_active>d" }
- { label: "Longest streak", value: "<longest_active_streak>d" }
- { label: "Current streak", value: "<current_active_streak>d" }
- { label: "Swaps", value: "<token_swaps_performed>" }
- { label: "DeFi ops", value: "<lend_borrow_stake_transactions>" }
- { label: "Bridges", value: "<bridge_transactions_performed>" }
- { label: "Deploys", value: "<smart_contract_deployments>" }
- { label: "ENS calls", value: "<ens_contract_interactions>" }
Order by “wow” factor (bigger counts first), keep labels short.
`

export const AccountMetadataGen: WrappedCardGeneratorSpec = {
	kind: 'account-metadata',
	version: 1,
	order: 1,
	prePrompt: async (vars) => {
		console.log('prePrompt', vars)
		const coinbase = Coinbase.configure({
			apiKeyName: process.env.COINBASE_API_KEY || '',
			privateKey: process.env.COINBASE_PRIVATE_KEY || '',
		})

		const address = new Address(Coinbase.networks.EthereumMainnet, vars.address)

		const reputation = await address.reputation()
		const metadata = reputation.metadata
		return {
			...vars,
			addressReputationMetadata: JSON.stringify(metadata, null, 2),
		}
	},
	dataPrompt: prompt,
	mediaPrompt: `
    You are to generate a creative SVG that tries to capture the key highlights of the account. Include 100 shapes. Have the color scheme match the persona. Try to make decals and shapes that represent the persona of this account. Personas are:
    1) **Builder** — smart_contract_deployments ≥ 1 (≥3 → “Protocol Tinkerer” flair)
    2) **Bridge Nomad** — bridge_transactions_performed ≥ 10
    3) **DeFi Degen** — lend_borrow_stake_transactions ≥ 50
    4) **Serial Swapper** — token_swaps_performed ≥ 100
    5) **Power User** — total_transactions ≥ 1,000 OR (unique_days_active ≥ 180 AND activity_period_days ≥ 365)
    6) **ENS Native** — ens_contract_interactions ≥ 10
    7) **Streak Lord** — longest_active_streak ≥ 30 OR current_active_streak ≥ 14
    8) **Weekend Warrior** — unique_days_active ≤ 30 but total_transactions ≥ 100 (bursty)
    9) **Newcomer** — activity_period_days < 30 OR total_transactions < 20
    10) **Balanced Voyager** — fallback when none dominate
    11) **Lil Noob** - when all else fails, just say "Lil Noob
`,
}
