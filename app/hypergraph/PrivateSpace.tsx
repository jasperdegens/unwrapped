'use client'

import {
	HypergraphSpaceProvider,
	preparePublish,
	publishOps,
	useCreateEntity,
	useHypergraphApp,
	useQuery,
	useSpace,
	useSpaces,
} from '@graphprotocol/hypergraph-react'
import { useId, useState } from 'react'
import { WrappedCard, WrappedCardCollection } from '@/app/schema'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { useWrappedCard } from '@/providers/wrapped-card-provider'

export function PrivateSpaceWrapper({ spaceid }: Readonly<{ spaceid: string }>) {
	return (
		<HypergraphSpaceProvider space={spaceid}>
			<PrivateSpace />
		</HypergraphSpaceProvider>
	)
}

function PrivateSpace() {
	const { name, ready, id: spaceId } = useSpace({ mode: 'private' })
	const { data: collections } = useQuery(WrappedCardCollection, { mode: 'private' })
	const { data: cards } = useQuery(WrappedCard, { mode: 'private' })
	const { data: publicSpaces } = useSpaces({ mode: 'public' })
	const [selectedSpace, setSelectedSpace] = useState<string>('')
	const createCollection = useCreateEntity(WrappedCardCollection)
	const createCard = useCreateEntity(WrappedCard)

	// Access the WrappedCard provider
	const {
		collection: currentWrappedCollection,
		hasCards,
		cardCount,
		isLoading: isGenerating,
		generationStatus,
	} = useWrappedCard()

	// Generate unique IDs for form elements
	const collectionAddressId = useId()
	const collectionTimestampId = useId()

	// Form state for creating new collections (manual override)
	const [collectionAddress, setCollectionAddress] = useState('')
	const [collectionTimestamp, setCollectionTimestamp] = useState('')

	const { getSmartSessionClient } = useHypergraphApp()

	if (!ready) {
		return (
			<div className="flex items-center justify-center min-h-screen">
				<div className="text-center">
					<div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
					<p className="text-muted-foreground">Loading space...</p>
				</div>
			</div>
		)
	}

	const handleCreateCollection = (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault()
		const timestamp = collectionTimestamp || new Date().toISOString()
		createCollection({
			address: collectionAddress,
			timestamp,
			cards: [], // Will be populated with cards
		})
		setCollectionAddress('')
		setCollectionTimestamp('')
	}

	const publishToPublicSpace = async (collection: WrappedCardCollection) => {
		if (!selectedSpace) {
			alert('No space selected')
			return
		}
		try {
			const { ops } = await preparePublish({ entity: collection, publicSpace: selectedSpace })
			const smartSessionClient = await getSmartSessionClient()
			if (!smartSessionClient) {
				throw new Error('Missing smartSessionClient')
			}
			const publishResult = await publishOps({
				ops,
				space: selectedSpace,
				name: 'Publish Wrapped Collection',
				walletClient: smartSessionClient,
			})
			console.log(publishResult, ops)
			alert('Collection published to public space')
		} catch (error) {
			console.error(error)
			alert('Error publishing collection to public space')
		}
	}

	const publishCardToPublicSpace = async (card: WrappedCard) => {
		if (!selectedSpace) {
			alert('No space selected')
			return
		}
		try {
			const { ops } = await preparePublish({ entity: card, publicSpace: selectedSpace })
			const smartSessionClient = await getSmartSessionClient()
			if (!smartSessionClient) {
				throw new Error('Missing smartSessionClient')
			}
			const publishResult = await publishOps({
				ops,
				space: selectedSpace,
				name: 'Publish Wrapped Card',
				walletClient: smartSessionClient,
			})
			console.log(publishResult, ops)
			alert('Card published to public space')
		} catch (error) {
			console.error(error)
			alert('Error publishing card to public space')
		}
	}

	const publishCurrentWrappedToPublicSpace = async () => {
		if (!(selectedSpace && currentWrappedCollection)) {
			alert('No space selected or no wrapped collection available')
			return
		}

		try {
			// Create the collection entity first
			const collectionEntity = await createCollection({
				address: currentWrappedCollection.address,
				timestamp: currentWrappedCollection.timestamp,
				cards: [], // Will be populated below
			})

			// Create card entities for each card in the collection
			const cardEntities = []
			for (const card of currentWrappedCollection.cards) {
				const cardEntity = await createCard({
					kind: card.kind,
					order: card.order,
					leadInText: card.leadInText,
					revealText: card.revealText,
					highlights: card.highlights ? JSON.stringify(card.highlights) : undefined,
					footnote: card.footnote,
					media: card.media ? JSON.stringify(card.media) : undefined,
					createdAt: new Date().toISOString(),
					updatedAt: new Date().toISOString(),
				})
				cardEntities.push(cardEntity)
			}

			// Update the collection with the card references
			// Note: You might need to implement this based on your schema
			// collectionEntity.cards = cardEntities

			// Publish the collection to public space
			const { ops } = await preparePublish({ entity: collectionEntity, publicSpace: selectedSpace })
			const smartSessionClient = await getSmartSessionClient()
			if (!smartSessionClient) {
				throw new Error('Missing smartSessionClient')
			}
			const publishResult = await publishOps({
				ops,
				space: selectedSpace,
				name: 'Publish Current Wrapped Collection',
				walletClient: smartSessionClient,
			})
			console.log(publishResult, ops)
			alert('Current wrapped collection published to public space!')
		} catch (error) {
			console.error(error)
			alert('Error publishing current wrapped collection to public space')
		}
	}

	return (
		<div className="min-h-screen bg-background">
			<div className="container mx-auto px-4 py-8 max-w-6xl">
				{/* Header */}
				<div className="mb-8">
					<p className="text-slate-600 mt-1 text-sm">Private Space</p>
					<h1 className="text-3xl font-bold text-slate-900">{name}</h1>
					<p className="text-slate-600 mt-1 text-sm">ID: {spaceId}</p>
					<p className="text-muted-foreground mt-6">
						Manage your wrapped card collections and publish them to public spaces
					</p>
				</div>

				<div className="grid gap-8 lg:grid-cols-2">
					{/* Current Wrapped Collection from Provider */}
					<div className="space-y-6">
						<Card>
							<CardHeader>
								<CardTitle>Current Wrapped Collection</CardTitle>
								<p className="text-sm text-muted-foreground">From WrappedCard Provider</p>
							</CardHeader>
							<CardContent>
								{currentWrappedCollection ? (
									<div className="space-y-4">
										<div className="p-4 border border-border rounded-lg bg-muted/50">
											<div className="flex items-center justify-between mb-3">
												<h3 className="font-medium text-foreground">Collection Status</h3>
												<Badge variant={isGenerating ? 'secondary' : 'default'}>{generationStatus}</Badge>
											</div>
											<p className="text-sm text-muted-foreground mb-2">Address: {currentWrappedCollection.address}</p>
											<p className="text-sm text-muted-foreground mb-2">
												Timestamp: {currentWrappedCollection.timestamp}
											</p>
											<p className="text-sm text-muted-foreground mb-3">
												Cards: {cardCount} {hasCards ? '(Ready)' : '(Generating...)'}
											</p>

											{hasCards && (
												<div className="space-y-3">
													<div className="space-y-2">
														<label htmlFor="space" className="text-xs font-medium text-muted-foreground">
															Select Public Space to Publish
														</label>
														<select
															name="space"
															value={selectedSpace}
															onChange={(e) => setSelectedSpace(e.target.value)}
															className="w-full px-3 py-2 border border-input bg-background rounded-md text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent"
														>
															<option value="">Choose a public space...</option>
															{publicSpaces?.map((space) => (
																<option key={space.id} value={space.id}>
																	{space.name}
																</option>
															))}
														</select>
													</div>

													<Button
														onClick={publishCurrentWrappedToPublicSpace}
														disabled={!selectedSpace}
														className="w-full"
													>
														Publish Current Wrapped to Public Space
													</Button>
												</div>
											)}
										</div>

										{/* Display current cards */}
										{hasCards && (
											<div className="space-y-3">
												<h4 className="font-medium text-sm">Current Cards:</h4>
												{currentWrappedCollection.cards.map((card, index) => (
													<div
														key={`${card.kind}-${card.order}-${index}`}
														className="p-3 border border-border rounded-lg bg-background"
													>
														<div className="flex items-center justify-between mb-2">
															<h5 className="font-medium text-sm">{card.kind}</h5>
															<Badge variant="outline">Order: {card.order}</Badge>
														</div>
														<p className="text-sm text-foreground mb-1">{card.leadInText}</p>
														<p className="text-sm font-medium text-foreground">{card.revealText}</p>
														{card.highlights && (
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
										)}
									</div>
								) : (
									<div className="text-center py-8">
										<p className="text-muted-foreground">
											{isGenerating ? 'Generating wrapped cards...' : 'No wrapped collection available'}
										</p>
										{isGenerating && <p className="text-sm text-muted-foreground mt-1">Status: {generationStatus}</p>}
									</div>
								)}
							</CardContent>
						</Card>

						{/* Manual Collection Creation (Fallback) */}
						<Card>
							<CardHeader>
								<CardTitle>Create Manual Collection</CardTitle>
								<p className="text-sm text-muted-foreground">Fallback for manual collection creation</p>
							</CardHeader>
							<CardContent>
								<form onSubmit={handleCreateCollection} className="space-y-4">
									<div className="space-y-2">
										<label htmlFor={collectionAddressId} className="text-sm font-medium text-card-foreground">
											Wallet Address
										</label>
										<Input
											id={collectionAddressId}
											type="text"
											value={collectionAddress}
											onChange={(e) => setCollectionAddress(e.target.value)}
											placeholder="0x..."
											required
										/>
									</div>
									<div className="space-y-2">
										<label htmlFor={collectionTimestampId} className="text-sm font-medium text-card-foreground">
											Timestamp (optional)
										</label>
										<Input
											id={collectionTimestampId}
											type="datetime-local"
											value={collectionTimestamp}
											onChange={(e) => setCollectionTimestamp(e.target.value)}
										/>
									</div>
									<Button type="submit" className="w-full" disabled={!collectionAddress.trim()}>
										Create Collection
									</Button>
								</form>
							</CardContent>
						</Card>
					</div>

					{/* Collections and Cards List */}
					<div className="space-y-6">
						{/* Collections */}
						<Card>
							<CardHeader>
								<CardTitle>Your Collections ({collections?.length || 0})</CardTitle>
							</CardHeader>
							<CardContent>
								{collections && collections.length > 0 ? (
									<div className="space-y-4">
										{collections.map((collection) => (
											<div key={collection.id} className="border border-border rounded-lg p-4 bg-background">
												<div className="flex items-center justify-between mb-3">
													<h3 className="font-medium text-foreground">Collection</h3>
													<Badge variant="secondary">{collection.address}</Badge>
												</div>
												<p className="text-xs text-muted-foreground mb-2">ID: {collection.id}</p>
												<p className="text-sm text-muted-foreground mb-3">Created: {collection.timestamp}</p>

												<div className="space-y-3">
													<div className="space-y-2">
														<label htmlFor="space" className="text-xs font-medium text-muted-foreground">
															Select Public Space to Publish
														</label>
														<select
															name="space"
															value={selectedSpace}
															onChange={(e) => setSelectedSpace(e.target.value)}
															className="w-full px-3 py-2 border border-input bg-background rounded-md text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent"
														>
															<option value="">Choose a public space...</option>
															{publicSpaces?.map((space) => (
																<option key={space.id} value={space.id}>
																	{space.name}
																</option>
															))}
														</select>
													</div>

													<Button
														onClick={() => publishToPublicSpace(collection)}
														disabled={!selectedSpace}
														variant="outline"
														size="sm"
														className="w-full"
													>
														Publish Collection
													</Button>
												</div>
											</div>
										))}
									</div>
								) : (
									<div className="text-center py-8">
										<p className="text-muted-foreground">No collections created yet</p>
										<p className="text-sm text-muted-foreground mt-1">Create your first collection using the form</p>
									</div>
								)}
							</CardContent>
						</Card>

						{/* Cards */}
						<Card>
							<CardHeader>
								<CardTitle>Your Cards ({cards?.length || 0})</CardTitle>
							</CardHeader>
							<CardContent>
								{cards && cards.length > 0 ? (
									<div className="space-y-4">
										{cards.map((card) => (
											<div key={card.id} className="border border-border rounded-lg p-4 bg-background">
												<div className="flex items-center justify-between mb-3">
													<h3 className="font-medium text-foreground">{card.kind}</h3>
													<Badge variant="outline">Order: {card.order}</Badge>
												</div>
												<p className="text-xs text-muted-foreground mb-2">ID: {card.id}</p>
												<p className="text-sm text-foreground mb-2">{card.leadInText}</p>
												<p className="text-sm font-medium text-foreground mb-3">{card.revealText}</p>

												{card.highlights && (
													<p className="text-xs text-muted-foreground mb-2">Highlights: {card.highlights}</p>
												)}
												{card.footnote && (
													<p className="text-xs text-muted-foreground mb-2">Footnote: {card.footnote}</p>
												)}
												{card.media && <p className="text-xs text-muted-foreground mb-2">Media: {card.media}</p>}

												<div className="space-y-3">
													<div className="space-y-2">
														<label htmlFor="space" className="text-xs font-medium text-muted-foreground">
															Select Public Space to Publish
														</label>
														<select
															name="space"
															value={selectedSpace}
															onChange={(e) => setSelectedSpace(e.target.value)}
															className="w-full px-3 py-2 border border-input bg-background rounded-md text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent"
														>
															<option value="">Choose a public space...</option>
															{publicSpaces?.map((space) => (
																<option key={space.id} value={space.id}>
																	{space.name}
																</option>
															))}
														</select>
													</div>

													<Button
														onClick={() => publishCardToPublicSpace(card)}
														disabled={!selectedSpace}
														variant="outline"
														size="sm"
														className="w-full"
													>
														Publish Card
													</Button>
												</div>
											</div>
										))}
									</div>
								) : (
									<div className="text-center py-8">
										<p className="text-muted-foreground">No cards created yet</p>
										<p className="text-sm text-muted-foreground mt-1">Create your first card using the form</p>
									</div>
								)}
							</CardContent>
						</Card>
					</div>
				</div>
			</div>
		</div>
	)
}
