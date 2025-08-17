import { Id } from '@graphprotocol/hypergraph'
import type { Mapping } from '@graphprotocol/hypergraph/mapping'

export const mapping: Mapping = {
	WrappedCard: {
		typeIds: [Id('1fd566f2-bbe9-4183-9fa1-1bdc71be6d18')],
		properties: {
			description: Id('da934e16-e796-4b64-9387-361f9e860197'),
			name: Id('7c5a5edf-fb55-4eae-adfc-e3d586d0f3f3'),
			leadInText: Id('34454778-8f4e-4d78-9d12-51db4e8c3d60'),
			footnote: Id('e7ed1a66-1398-4ec0-9278-994cda81aed0'),
			updatedAt: Id('1e269275-6e84-486e-8694-6df05aa97a32'),
			kind: Id('6414575c-1b48-49c1-bbf1-8e1b3b067b81'),
			highlights: Id('7f1f5874-09e7-4201-a232-f88d6eeea498'),
			media: Id('f08ce15b-76a6-416f-9ee0-6a7fbcc223f1'),
			revealText: Id('97b702f1-81a4-431f-91a5-60e6008b58fa'),
			order: Id('5f658bf4-d6d4-4d38-a04d-4bb233c41045'),
			createdAt: Id('c11c566d-db11-4dfa-b191-dbacf4bda3b8'),
			address: Id('29876806-b7b8-44c9-b04d-7907188ed7fd'),
		},
	},
}
