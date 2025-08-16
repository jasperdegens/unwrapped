'use client'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useWrappedCard } from '@/providers/wrapped-card-provider'

export function WrappedCardExample() {
	const {
		collection,
		isLoading,
		error,
		generationStatus,
		hasCards,
		cardCount,
		isGenerating,
		pollingId,
		setCollection,
		addCard,
		setGenerationStatus,
		setError,
		clearError,
		startPolling,
		stopPolling,
	} = useWrappedCard()

	const handleCreateExampleCollection = () => {
		const exampleCollection = {
			address: '0x1234567890123456789012345678901234567890' as `0x${string}`,
			cards: [
				{
					kind: 'top-tokens',
					order: 1,
					leadInText: 'This cycle, your biggest bag...',
					revealText: '...$23,481 in ETH. giga-chad.',
					highlights: [
						{ label: 'ETH', value: '$23,481' },
						{ label: 'APY', value: '156%' },
					],
				},
			],
			timestamp: new Date().toISOString(),
		}

		setCollection(exampleCollection)
		clearError()
	}

	const handleAddExampleCard = () => {
		if (!collection) return

		const newCard = {
			kind: 'best-trade',
			order: collection.cards.length + 1,
			leadInText: 'Your most profitable trade...',
			revealText: '...was selling that rug for 10x. pure luck.',
			highlights: [
				{ label: 'Profit', value: '$15,420' },
				{ label: 'ROI', value: '1000%' },
			],
		}

		addCard(newCard)
	}

	const handleStartPolling = () => {
		// Simulate starting polling for a blob
		const mockId = `mock-blob-id-${Date.now()}`
		const mockAddress = '0x1234567890123456789012345678901234567890'

		startPolling(mockId, mockAddress)
	}

	const handleSimulateGeneration = () => {
		// Simulate the generation process
		setGenerationStatus('pending')

		// Create empty collection to track progress
		const emptyCollection = {
			address: '0x1234567890123456789012345678901234567890' as `0x${string}`,
			cards: [],
			timestamp: new Date().toISOString(),
		}
		setCollection(emptyCollection)

		// Simulate generation progress
		setTimeout(() => {
			setGenerationStatus('generating')
			addCard({
				kind: 'top-tokens',
				order: 1,
				leadInText: 'This cycle, your biggest bag...',
				revealText: '...$23,481 in ETH. giga-chad.',
			})
		}, 1000)

		setTimeout(() => {
			addCard({
				kind: 'best-trade',
				order: 2,
				leadInText: 'Your most profitable trade...',
				revealText: '...was selling that rug for 10x. pure luck.',
			})
		}, 2000)

		setTimeout(() => {
			setGenerationStatus('completed')
		}, 3000)
	}

	const handleClearCollection = () => {
		setCollection(null)
		setGenerationStatus('idle')
		clearError()
		stopPolling()
	}

	const handleSimulateError = () => {
		setError('Something went wrong while generating your wrapped!')
	}

	return (
		<div className="p-6 space-y-6">
			<Card>
				<CardHeader>
					<CardTitle>WrappedCard Provider Example</CardTitle>
				</CardHeader>
				<CardContent className="space-y-4">
					<div className="flex gap-2 flex-wrap">
						<Button onClick={handleCreateExampleCollection}>Create Example Collection</Button>
						<Button onClick={handleAddExampleCard} disabled={!collection}>
							Add Example Card
						</Button>
						<Button onClick={handleStartPolling} disabled={!!pollingId}>
							Start Polling
						</Button>
						<Button onClick={handleSimulateGeneration}>Simulate Generation</Button>
						<Button onClick={handleClearCollection} variant="outline">
							Clear Collection
						</Button>
						<Button onClick={handleSimulateError} variant="destructive">
							Simulate Error
						</Button>
					</div>

					<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
						<Card>
							<CardHeader>
								<CardTitle className="text-sm">Current Collection</CardTitle>
							</CardHeader>
							<CardContent>
								{collection ? (
									<div className="space-y-2">
										<p>
											<strong>Address:</strong> {collection.address}
										</p>
										<p>
											<strong>Cards:</strong> {cardCount}
										</p>
										<p>
											<strong>Has Cards:</strong> {hasCards ? 'Yes' : 'No'}
										</p>
										<p>
											<strong>Timestamp:</strong> {collection.timestamp}
										</p>
									</div>
								) : (
									<p className="text-muted-foreground">No collection created yet</p>
								)}
							</CardContent>
						</Card>

						<Card>
							<CardHeader>
								<CardTitle className="text-sm">Status & State</CardTitle>
							</CardHeader>
							<CardContent>
								<p>
									<strong>Generation Status:</strong> {generationStatus}
								</p>
								<p>
									<strong>Loading:</strong> {isLoading ? 'Yes' : 'No'}
								</p>
								<p>
									<strong>Is Generating:</strong> {isGenerating ? 'Yes' : 'No'}
								</p>
								<p>
									<strong>Polling ID:</strong> {pollingId || 'None'}
								</p>
								{error && (
									<p className="text-red-500">
										<strong>Error:</strong> {error}
									</p>
								)}
							</CardContent>
						</Card>
					</div>

					{collection && hasCards && (
						<Card>
							<CardHeader>
								<CardTitle className="text-sm">Cards ({cardCount})</CardTitle>
							</CardHeader>
							<CardContent>
								<div className="space-y-3">
									{collection.cards.map((card, index) => (
										<div key={`${card.kind}-${card.order}-${index}`} className="p-3 border rounded-lg">
											<div className="flex justify-between items-start mb-2">
												<span className="font-mono text-sm text-muted-foreground">{card.kind}</span>
												<span className="text-sm font-medium">#{card.order}</span>
											</div>
											<p className="font-medium mb-1">{card.leadInText}</p>
											<p className="text-muted-foreground">{card.revealText}</p>
											{card.highlights && card.highlights.length > 0 && (
												<div className="flex gap-2 mt-2">
													{card.highlights.map((highlight, hIndex) => (
														<span
															key={`${card.kind}-${card.order}-highlight-${hIndex}`}
															className="px-2 py-1 bg-muted rounded text-xs"
														>
															{highlight.label}: {highlight.value}
														</span>
													))}
												</div>
											)}
										</div>
									))}
								</div>
							</CardContent>
						</Card>
					)}
				</CardContent>
			</Card>
		</div>
	)
}
