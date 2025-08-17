'use server'
import { createClient } from 'redis'
import type { WrappedCard, WrappedCardCollection } from '@/types/wrapped'

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

// Generate a unique key for storing collections
function generateCollectionKey(address: string): string {
	return `collection:${address.toLowerCase()}`
}

// Get entire collection for an address
export async function getCollection(address: string): Promise<WrappedCardCollection | null> {
	try {
		const client = await getRedisClient()
		const key = generateCollectionKey(address)
		const data = await client.get(key)

		if (data) {
			const parsed = JSON.parse(data) as WrappedCardCollection
			console.log(`[Redis] Retrieved collection for ${address}`)
			return parsed
		}

		return null
	} catch (error) {
		console.error('[Redis] Error retrieving collection:', error)
		return null
	}
}

export async function setCollection(collection: WrappedCardCollection): Promise<void> {
	try {
		const client = await getRedisClient()
		const key = generateCollectionKey(collection.address)
		// get existing collection and merge cards based on kind
		const existingCollection = await getCollection(collection.address)
		if (existingCollection) {
			// merge cards based on kind
			collection.cards = [...existingCollection.cards, ...collection.cards]
		}

		// remove duplicates based on kind
		collection.cards = collection.cards.filter(
			(card, index, self) => index === self.findIndex((t) => t.kind === card.kind)
		)

		await client.setEx(key, 86400, JSON.stringify(collection))
	} catch (error) {
		console.error('[Redis] Error setting collection:', error)
	}
}

// Set a card in a collection, replacing existing card if it exists with same kind
export async function setCardInCollection(address: string, card: WrappedCard): Promise<void> {
	try {
		const client = await getRedisClient()
		const key = generateCollectionKey(address)

		// Get existing collection or create new one
		const collection: WrappedCardCollection = (await getCollection(address)) || {
			address: address as `0x${string}`,
			cards: [],
			timestamp: new Date().toISOString(),
		}

		// Check if card with same kind already exists and replace it
		const existingCardIndex = collection.cards.findIndex((c) => c.kind === card.kind)
		if (existingCardIndex !== -1) {
			// Replace existing card
			collection.cards[existingCardIndex] = card
			console.log(`[Redis] Replaced existing card of kind ${card.kind} for ${address}`)
		} else {
			// Add new card
			collection.cards.push(card)
			console.log(`[Redis] Added new card of kind ${card.kind} for ${address}`)
		}

		// Update timestamp
		collection.timestamp = new Date().toISOString()
		console.log('collection cards', collection.cards.length)

		// Store collection with 24 hour expiration
		await client.setEx(key, 86400, JSON.stringify(collection))
		console.log(`[Redis] Stored collection for ${address} with ${collection.cards.length} cards`)
	} catch (error) {
		console.error('[Redis] Error setting card in collection:', error)
		// Don't throw - Redis failures shouldn't break the main flow
	}
}

// Legacy function for backward compatibility - now gets the entire collection
export async function getCard(generatorId: string, address: string): Promise<WrappedCard | null> {
	try {
		const collection = await getCollection(address)
		if (!collection) return null

		// Find card by kind (assuming generatorId maps to card kind)
		const card = collection.cards.find((c) => c.kind === generatorId)
		return card || null
	} catch (error) {
		console.error('[Redis] Error retrieving card:', error)
		return null
	}
}

// Legacy function for backward compatibility - now uses setCardInCollection
export async function storeCard(generatorId: string, address: string, card: WrappedCard): Promise<void> {
	// Map the legacy parameters to the new collection-based approach
	const cardWithKind = {
		...card,
		kind: generatorId,
	}
	await setCardInCollection(address, cardWithKind)
}
