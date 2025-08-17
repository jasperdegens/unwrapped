'use client'

import {
	HypergraphSpaceProvider,
	preparePublish,
	publishOps,
	useCreateEntity,
	useHypergraphApp,
	useQuery,
	useSpace,
} from '@graphprotocol/hypergraph-react'
import { useParams, useSearchParams } from 'next/navigation'
import { useState } from 'react'
import { WrappedCard } from '@/app/schema'
import { Button } from '@/components/ui/button'
import { useWrappedCard } from '@/providers/wrapped-card-provider'
import type { WrappedCardCollection } from '@/types/wrapped'

export default function PublicSpaceWrapper() {
	const searchParams = useSearchParams()
	const { spaceId } = useParams()
	const mode = searchParams.get('mode')

	return (
		<HypergraphSpaceProvider space={spaceId as string}>
			<Space mode={mode as 'public' | 'private'} spaceid={spaceId as string} />
		</HypergraphSpaceProvider>
	)
}

const transformCard = (card: WrappedCardCollection['cards'][number], collection: WrappedCardCollection) => {
	return {
		...card,
		highlights: JSON.stringify(card.highlights),
		address: collection.address,
		name: `${collection.address.slice(0, 6)}...${collection.address.slice(-4)}`,
		description: `A wrapped card collection with ${collection.cards.length} cards`,
		updatedAt: new Date().toISOString(),
		footnote: card.footnote || '',
		createdAt: collection.timestamp || new Date().toISOString(),
		media: card.media?.kind === 'svg' ? card.media.svg : card.media?.kind === 'url' ? card.media.src : '',
	}
}

function Space({ mode, spaceid }: Readonly<{ mode: 'public' | 'private'; spaceid: string }>) {
	const { name, ready } = useSpace({ mode })
	const { data: wrappedCards, isPending } = useQuery(WrappedCard, { mode })
	const createWrappedCard = useCreateEntity(WrappedCard)
	const { collection } = useWrappedCard()
	const { getSmartSessionClient } = useHypergraphApp()
	const [cards, setCards] = useState<WrappedCard[]>([])

	console.log('wrappedCards', collection)
	console.log(ready, name, spaceid)
	console.log(process.env.NEXT_PUBLIC_HYPERGRAPH_PUBLIC_SPACE_ID)

	if (!ready) {
		return (
			<div className="min-h-screen flex items-center justify-center">
				<div className="text-center">
					<div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4" />
					<p className="text-slate-600 text-lg">Loading space...</p>
				</div>
			</div>
		)
	}

	const publishToPublicSpace = async (cards: WrappedCard[]) => {
		for (const card of cards) {
			try {
				const { ops } = await preparePublish({
					entity: card,
					publicSpace: process.env.NEXT_PUBLIC_HYPERGRAPH_PUBLIC_SPACE_ID as string,
				})
				const smartSessionClient = await getSmartSessionClient()
				if (!smartSessionClient) {
					throw new Error('Missing smartSessionClient')
				}
				const publishResult = await publishOps({
					ops,
					space: process.env.NEXT_PUBLIC_HYPERGRAPH_PUBLIC_SPACE_ID as string,
					name: 'Publish Wrapped Card',
					walletClient: smartSessionClient,
				})
				console.log(publishResult, ops)
				alert('Successfully published to public space!')
			} catch (error) {
				console.error(error)
				alert('Error publishing project to public space')
			}
		}
	}

	const handleCreateWrappedCard = async () => {
		if (collection) {
			if (mode === 'public') {
				alert('Must publish to private space first')
			} else {
				const cards = await Promise.all(
					collection.cards.map((card) => createWrappedCard(transformCard(card, collection)))
				)
				setCards(cards)
				alert('Successfully created wrapped card in private space!')
			}
		}
	}

	return (
		<div className="min-h-screen bg-white">
			{/* Header */}
			<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 bg-gradient-to-r from-slate-900 to-slate-800 text-white rounded-b-3xl shadow-lg">
				<div className="flex items-center justify-between">
					<div>
						<p className="text-slate-300 mt-1 text-sm font-medium">{mode === 'public' ? 'Public' : 'Private'} Space</p>
						<h1 className="text-4xl font-bold text-white mb-2">{name}</h1>
						<p className="text-slate-300 mt-1 text-sm font-mono">ID: {spaceid}</p>
					</div>
					<div className="flex gap-3">
						{wrappedCards && wrappedCards.length > 0 ? (
							<Button
								onClick={handleCreateWrappedCard}
								variant="outline"
								className="bg-white hover:bg-blue-50 border-blue-200 text-blue-700 hover:text-blue-800"
								disabled={!collection}
							>
								Add Wrapped Card
							</Button>
						) : (
							<Button
								onClick={handleCreateWrappedCard}
								className="bg-white hover:bg-blue-50 border-blue-200 text-blue-700 hover:text-blue-800"
								disabled={!collection}
							>
								Create Wrapped Card
							</Button>
						)}
						{cards.length > 0 && (
							<Button
								className="bg-white hover:bg-blue-50 border-blue-200 text-blue-700 hover:text-blue-800"
								onClick={() => publishToPublicSpace(cards)}
							>
								Publish to Public Space
							</Button>
						)}
					</div>
				</div>
			</div>

			{/* Main Content */}
			<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
				<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
					{wrappedCards.map((wrappedCard) => (
						<div
							key={wrappedCard.id}
							className="group relative bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden border border-gray-100 hover:border-blue-200 transform hover:-translate-y-1 z-10"
						>
							{/* Gradient overlay */}
							<div className="absolute inset-0 bg-gradient-to-br from-blue-50 to-purple-50 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

							{/* Content */}
							<div className="relative p-6">
								{/* Card icon/avatar */}
								<div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300 overflow-hidden">
									<span className="text-white font-bold text-lg">{wrappedCard.address.slice(0, 3)}..</span>
								</div>
								{/* Card name */}
								<h3 className="text-lg font-bold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors duration-300">
									{wrappedCard.leadInText}
								</h3>
								{/* Card ID */}
								<p className="text-[10px] text-gray-500 mb-2 font-mono">{wrappedCard.id}</p>
								{/* Card description */}
								<p className="text-sm text-gray-600 mb-2 line-clamp-2">{wrappedCard.revealText}</p>
								{/* Card kind */}
								{wrappedCard.kind && <p className="text-xs text-blue-600 font-medium mb-2">{wrappedCard.kind}</p>}
								{/* Card address */}
								{wrappedCard.address && (
									<p className="text-xs text-gray-500 font-mono">
										{wrappedCard.address.slice(0, 6)}...{wrappedCard.address.slice(-4)}
									</p>
								)}
								{/* Created date */}
								{wrappedCard.createdAt && (
									<p className="text-xs text-gray-400 mt-2">{new Date(wrappedCard.createdAt).toLocaleDateString()}</p>
								)}
								{/* Media display - SVG or Image */}
								<div className="relative mt-4">
									<div className="w-full aspect-square rounded-lg overflow-hidden bg-gray-50 border border-gray-200">
										{wrappedCard.media &&
										typeof wrappedCard.media === 'string' &&
										wrappedCard.media.trim().startsWith('<svg') ? (
											<div
												className="w-full h-full flex items-center justify-center"
												style={{
													backgroundImage: `url("data:image/svg+xml,${encodeURIComponent(wrappedCard.media)}")`,
													backgroundSize: 'contain',
													backgroundRepeat: 'no-repeat',
													backgroundPosition: 'center',
												}}
											/>
										) : (
											wrappedCard.media && (
												<img
													src={wrappedCard.media}
													alt={wrappedCard.leadInText}
													className="w-full h-full object-cover"
												/>
											)
										)}
									</div>
								</div>
								{/* View Unwrapped Link */}
								{wrappedCard.address && (
									<a
										href={`/share?address=${wrappedCard.address}`}
										className="text-sm text-blue-600 hover:text-blue-800 transition-colors duration-200 flex items-center gap-1 mt-3"
									>
										<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
											<path
												strokeLinecap="round"
												strokeLinejoin="round"
												strokeWidth={2}
												d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
											/>
										</svg>
										View Full Unwrapped
									</a>
								)}
							</div>

							{/* Decorative corner accent */}
							<div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-br from-blue-400 to-purple-500 opacity-10 group-hover:opacity-20 transition-opacity duration-300 transform rotate-45 translate-x-8 -translate-y-8" />
						</div>
					))}
				</div>

				{/* Empty state */}
				{isPending === false && wrappedCards.length === 0 && (
					<div className="text-center py-16">
						<div className="w-24 h-24 bg-gradient-to-br from-blue-100 to-purple-100 rounded-full flex items-center justify-center mx-auto mb-6">
							<svg
								className="w-12 h-12 text-blue-400"
								fill="none"
								stroke="currentColor"
								viewBox="0 0 24 24"
								aria-hidden="true"
							>
								<path
									strokeLinecap="round"
									strokeLinejoin="round"
									strokeWidth={2}
									d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
								/>
							</svg>
						</div>
						<h3 className="text-xl font-semibold text-gray-900 mb-2">No Wrapped Cards Found</h3>
						<p className="text-gray-500">There are currently no wrapped cards available to explore.</p>
						<Button
							onClick={handleCreateWrappedCard}
							className="mt-4 bg-blue-600 hover:bg-blue-700 text-white"
							disabled={!collection}
						>
							Create Your First Wrapped Card
						</Button>
					</div>
				)}
			</div>
		</div>
	)
}
