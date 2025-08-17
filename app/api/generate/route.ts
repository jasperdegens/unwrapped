import { type NextRequest, NextResponse } from 'next/server'
import { AccountMetadataGen } from '@/generators/account-metadata'
import { BestTradeGen } from '@/generators/best-trade'
import { NFTEntourageGen } from '@/generators/nft-entourage'
import { RecommendationsGen } from '@/generators/nft-recommendations'
import { TopTokensGen } from '@/generators/top-tokens'
import { TopTradedGen } from '@/generators/top-traded'
import { buildWrappedCard } from '@/lib/builder'
import { deps } from '@/lib/deps'
import { getCollection, setCardInCollection } from '@/lib/redis'
import { nowIso } from '@/lib/util'

export const runtime = 'nodejs'

// Move regex to top level to avoid performance issues
const ADDRESS_REGEX = /^0x[a-fA-F0-9]{40}$/

const generatorMap = {
	'top-tokens': TopTokensGen,
	'best-trade': BestTradeGen,
	'nft-entourage': NFTEntourageGen,
	'account-metadata': AccountMetadataGen,
	recommendations: RecommendationsGen,
	'top-traded': TopTradedGen,
}

export async function POST(req: NextRequest) {
	try {
		const { address, generatorId } = await req.json()
		console.log('[v0] Single generator test request:', {
			address,
			generatorId,
		})

		if (!ADDRESS_REGEX.test(address ?? '')) {
			console.log('[v0] Invalid address format:', address)
			return NextResponse.json({ error: 'invalid address format' }, { status: 400 })
		}

		const generator = generatorMap[generatorId as keyof typeof generatorMap]
		if (!generator) {
			console.log('[v0] Unknown generator:', generatorId)
			return NextResponse.json({ error: `unknown generator: ${generatorId}` }, { status: 400 })
		}

		const addrLower = address.toLowerCase()

		// Check Redis cache first if available
		const cachedCollection = await getCollection(addrLower)
		// check for card to see if it exists
		const cachedCard = cachedCollection?.cards.find((c) => c.kind === generator.kind)
		if (cachedCard) {
			console.log(`[v0] Returning cached card for ${generatorId}:${addrLower}`)
			return NextResponse.json({
				success: true,
				generatorId,
				address: addrLower,
				card: cachedCard,
				timestamp: new Date().toISOString(),
				cached: true,
			})
		}

		const snapshotAt = nowIso()
		console.log(`[v0] Generating new card for ${generatorId}:${addrLower}`)

		const card = await buildWrappedCard(deps, generator, { address: addrLower as `0x${string}`, snapshotAt })
		console.log('[v0] Card generated:', card)

		if (card) {
			// Store the generated card in Redis if available
			await setCardInCollection(address, card)
		}

		console.log(`[v0] Generator ${generatorId} completed successfully`)

		return NextResponse.json({
			success: true,
			generatorId,
			address: addrLower,
			card,
			timestamp: snapshotAt,
			cached: false,
		})
	} catch (error) {
		console.log('[v0] Single generator test error:', error)
		const errorMessage = error instanceof Error ? error.message : 'Unknown error'
		return NextResponse.json(
			{
				error: errorMessage,
				details: error instanceof Error ? error.stack : undefined,
			},
			{ status: 500 }
		)
	}
}
