import { type NextRequest, NextResponse } from 'next/server'
import { AccountMetadataGen } from '@/generators/account-metadata'
import { BestTradeGen } from '@/generators/best-trade'
import { NFTEntourageGen } from '@/generators/nft-entourage'
import { TopTokensGen } from '@/generators/top-tokens'
import { buildWrappedCard } from '@/lib/builder'
import { deps } from '@/lib/deps'
import { nowIso } from '@/lib/util'

export const runtime = 'nodejs'

const generatorMap = {
	'top-tokens': TopTokensGen,
	'best-trade': BestTradeGen,
	'nft-entourage': NFTEntourageGen,
	'account-metadata': AccountMetadataGen,
}

export async function POST(req: NextRequest) {
	try {
		const { address, generatorId } = await req.json()
		console.log('[v0] Single generator test request:', {
			address,
			generatorId,
		})

		if (!/^0x[a-fA-F0-9]{40}$/.test(address ?? '')) {
			console.log('[v0] Invalid address format:', address)
			return NextResponse.json({ error: 'invalid address format' }, { status: 400 })
		}

		const generator = generatorMap[generatorId as keyof typeof generatorMap]
		if (!generator) {
			console.log('[v0] Unknown generator:', generatorId)
			return NextResponse.json({ error: `unknown generator: ${generatorId}` }, { status: 400 })
		}

		const snapshotAt = nowIso()
		const addrLower = address.toLowerCase()
		console.log(`[v0] Testing generator ${generatorId} for ${addrLower}`)

		const card = await buildWrappedCard(deps, generator, { address: addrLower as `0x${string}`, snapshotAt })
		console.log('[v0] Card:', card)

		console.log(`[v0] Generator ${generatorId} completed successfully`)

		return NextResponse.json({
			success: true,
			generatorId,
			address: addrLower,
			card,
			timestamp: snapshotAt,
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
