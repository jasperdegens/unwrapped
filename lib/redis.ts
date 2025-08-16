import { createClient } from 'redis'
import type { WrappedCard } from '@/types/wrapped'

// Initialize Redis client
let redis: ReturnType<typeof createClient> | null = null

// Initialize Redis connection
async function getRedisClient() {
	if (!redis) {
		redis = createClient({
			url: process.env.REDIS_URL || 'redis://localhost:6379',
		})

		redis.on('error', (err) => {
			console.error('[Redis] Client error:', err)
		})

		await redis.connect()
	}
	return redis
}

// Generate a unique key for storing cards
function generateCardKey(generatorId: string, address: string): string {
	return `card:${generatorId}:${address.toLowerCase()}`
}

// Store a card in Redis
export async function storeCard(generatorId: string, address: string, card: WrappedCard): Promise<void> {
	try {
		const client = await getRedisClient()
		const lowerAddress = address.toLowerCase()
		const key = generateCardKey(generatorId, lowerAddress)
		const data = {
			generatorId,
			address: lowerAddress,
			card,
			timestamp: new Date().toISOString(),
		}

		// Store with 24 hour expiration
		await client.setEx(key, 86400, JSON.stringify(data))
		console.log(`[Redis] Stored card for ${generatorId}:${lowerAddress}`)
	} catch (error) {
		console.error('[Redis] Error storing card:', error)
		// Don't throw - Redis failures shouldn't break the main flow
	}
}

// Retrieve a card from Redis
export async function getCard(generatorId: string, address: string): Promise<WrappedCard | null> {
	try {
		const client = await getRedisClient()
		const key = generateCardKey(generatorId, address)
		const data = await client.get(key)

		if (data) {
			const parsed = JSON.parse(data) as {
				generatorId: string
				address: string
				card: WrappedCard
				timestamp: string
			}
			console.log(`[Redis] Retrieved cached card for ${generatorId}:${address}`)
			return parsed.card
		}

		return null
	} catch (error) {
		console.error('[Redis] Error retrieving card:', error)
		return null
	}
}

// Check if Redis is available
export function isRedisAvailable(): boolean {
	return !!process.env.REDIS_URL
}
