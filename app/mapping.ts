import { Id } from '@graphprotocol/hypergraph'
import type { Mapping } from '@graphprotocol/hypergraph/mapping'

export const mapping: Mapping = {
	WrappedCard: {
		typeIds: [Id('700f8216-30f8-4a20-a38b-0639f935cb34')],
		properties: {
			description: Id('3bbf1131-bd00-4436-8612-796c7bf67591'),
			name: Id('37c83566-1c92-417e-a2e0-f5eeecf45492'),
			leadInText: Id('d9a6674e-8d4c-4c30-92ee-52dffbe6dafe'),
			footnote: Id('e94715fc-8b19-45d1-b27b-c5e2ccad4836'),
			updatedAt: Id('f982c677-4455-490f-ae21-276b8f890d31'),
			kind: Id('a924ef70-6aae-4eaa-ab10-2e8c529a6e74'),
			highlights: Id('2ae76312-2e2a-4a16-9c2b-25594f9c75b9'),
			media: Id('997e210e-1aa7-4935-afe4-fd1026e9d222'),
			revealText: Id('361404d1-d39d-4b00-8138-7c84ddf8814d'),
			order: Id('b3827d2d-c814-41a3-9d36-0006f9d30bec'),
			createdAt: Id('3e56887e-9b01-48c1-8f8b-23005d9932dc'),
		},
	},
	WrappedCardCollection: {
		typeIds: [Id('b52f5edc-cb88-472d-931d-e8bb0118c761')],
		properties: {
			address: Id('8ce2f2a2-62db-43c8-8cb2-90fa42f118ac'),
			timestamp: Id('26a1c201-ee1a-4c01-85bb-7363ae757e6f'),
		},
		relations: {
			cards: Id('23dca992-80df-4ac4-a412-f1f6d5270f35'),
		},
	},
}
