import { type NextRequest, NextResponse } from 'next/server'
import { buildWrappedCard } from '@/lib/builder'
import { deps } from '@/lib/deps'
import { setCardInCollection } from '@/lib/redis'
import { nowIso } from '@/lib/util'
import type { WrappedCardGeneratorSpec } from '@/types/generator'

// Move regex to top level to avoid performance issues
const ADDRESS_REGEX = /^0x[a-fA-F0-9]{40}$/

export async function POST(req: NextRequest) {
	try {
		const { dataPrompt, mediaPrompt, address, generatorName } = (await req.json()) as WrappedCardGeneratorSpec & {
			address: string
			generatorName: string
		}

		if (!ADDRESS_REGEX.test(address ?? '')) {
			console.log('[v0] Invalid address format:', address)
			return NextResponse.json({ error: 'invalid address format' }, { status: 400 })
		}

		// Create a custom generator spec
		const customGenerator: WrappedCardGeneratorSpec = {
			kind: generatorName || 'custom',
			version: 1,
			order: 999, // High order to show last
			dataPrompt: dataPrompt || '',
			mediaPrompt: mediaPrompt || '',
		}

		const addrLower = address.toLowerCase()

		const snapshotAt = nowIso()
		console.log(`[v0] Generating new custom card for ${generatorName}:${addrLower}`)

		const card = await buildWrappedCard(deps, customGenerator, { address: addrLower as `0x${string}`, snapshotAt })
		console.log('[v0] Custom card generated:', card)

		if (card) {
			// Store the generated card in Redis if available
			await setCardInCollection(address, card)
		}

		console.log(`[v0] Custom generator ${generatorName} completed successfully`)

		return NextResponse.json({
			success: true,
			generatorName,
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
