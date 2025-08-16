import { type NextRequest, NextResponse } from 'next/server'
import { BestTradeGen } from '@/generators/best-trade'
import { NFTEntourageGen } from '@/generators/nft-entourage'
import { TopTokensGen } from '@/generators/top-tokens'
import { buildWrappedCard } from '@/lib/builder'
import { deps } from '@/lib/deps'
import { saveDeck } from '@/lib/storage'
import { nowIso, shortAddr } from '@/lib/util'

const registry = [TopTokensGen, BestTradeGen, NFTEntourageGen]

export async function POST(req: NextRequest) {
	const { address, force } = await req.json()
	console.log('[v0] Generation request received:', { address, force })

	if (!/^0x[a-fA-F0-9]{40}$/.test(address ?? '')) {
		console.log('[v0] Invalid address format:', address)
		return NextResponse.json({ error: 'invalid address, anon' }, { status: 400 })
	}

	const snapshotAt = nowIso()
	const addrLower = address.toLowerCase()
	console.log('[v0] Starting generation for:', { addrLower, snapshotAt })

	// TODO: caching via Blob list/get if force !== true

	const ctx = undefined // optional pre-normalized context
	console.log('[v0] Building cards with', registry.length, 'generators')

	const cards = (
		await Promise.all(
			registry.map(async (gen, index) => {
				try {
					console.log(`[v0] Building card ${index + 1}/${registry.length}: ${gen.kind}`)
					const card = await buildWrappedCard(
						deps as any,
						gen,
						{ address: addrLower as `0x${string}`, snapshotAt },
						ctx
					)
					console.log(`[v0] Card ${gen.kind} built successfully:`, !!card)
					return card
				} catch (error) {
					console.log(`[v0] Card ${gen.kind} failed:`, error)
					return null
				}
			})
		)
	).filter(Boolean)

	console.log('[v0] Cards built:', cards.length, 'successful')

	const deck = { address: addrLower, snapshotAt, version: 1, cards: cards as any[] }
	console.log('[v0] Saving deck with', deck.cards.length, 'cards')

	try {
		const { url } = await saveDeck(deck)
		console.log('[v0] Deck saved successfully:', url)

		return NextResponse.json({
			wrappedId: `${addrLower}:${snapshotAt}`,
			url,
			count: cards.length,
			short: shortAddr(addrLower),
		})
	} catch (error) {
		console.log('[v0] Failed to save deck:', error)
		return NextResponse.json({ error: 'Failed to save deck' }, { status: 500 })
	}
}
