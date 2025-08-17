'use client'
import { useSearchParams } from 'next/navigation'
import { useEffect, useState } from 'react'
import { LoadingComponent } from '@/components/LoadingComponent'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { GradientText } from '@/components/ui/shadcn-io/gradient-text'
import { WrappedCardPresentation } from '@/components/WrappedCardPresentation'
import { useWrappedCard } from '@/providers/wrapped-card-provider'

const targetCardKeys = ['account-metadata', 'top-traded', 'top-tokens', 'nft-entourage'] //'recommendations']

// Generator display names for better UX
const generatorDisplayNames: Record<string, string> = {
	'account-metadata': 'Account Overview',
	'top-tokens': 'Token Holdings',
	'nft-entourage': 'NFT Collection',
	'best-trade': 'Best Trade',
}

// Move regex to top level to avoid performance issues
const ADDRESS_REGEX = /^0x[a-fA-F0-9]{40}$/

export default function Home() {
	const [address, setAddress] = useState('')
	const [error, setError] = useState<string | null>(null)
	const [isLoading, setIsLoading] = useState(false)
	const [loadingProgress, setLoadingProgress] = useState(0)
	const [generatedCards, setGeneratedCards] = useState<any[]>([])
	const [failedGenerators, setFailedGenerators] = useState<string[]>([])
	const [currentGenerator, setCurrentGenerator] = useState<string>('')
	const [generatorProgress, setGeneratorProgress] = useState<
		Record<string, 'pending' | 'processing' | 'completed' | 'failed'>
	>({})
	const searchParams = useSearchParams()
	const { setCollection, setAddress: setProviderAddress } = useWrappedCard()

	useEffect(() => {
		// Check if there's an address parameter in the URL
		const addressParam = searchParams.get('address')
		if (addressParam) {
			setAddress(addressParam)
		}

		// Check if there's an error parameter
		const errorParam = searchParams.get('error')
		if (errorParam === 'invalid-address') {
			setError('Invalid wallet address format. Please enter a valid 0x address.')
		}
	}, [searchParams])

	const generateCards = async (walletAddress: string) => {
		setIsLoading(true)
		setLoadingProgress(0)
		setGeneratedCards([])
		setFailedGenerators([])
		setError(null)

		// Initialize generator progress
		const initialProgress: Record<string, 'pending' | 'processing' | 'completed' | 'failed'> = {}
		targetCardKeys.forEach((key) => {
			initialProgress[key] = 'pending'
		})
		setGeneratorProgress(initialProgress)

		// Set the address in the provider
		setProviderAddress(walletAddress)

		const totalGenerators = targetCardKeys.length
		let completedCount = 0

		try {
			// Generate all cards in parallel
			const generationPromises = targetCardKeys.map(async (generatorId) => {
				setCurrentGenerator(generatorId)
				setGeneratorProgress((prev) => ({ ...prev, [generatorId]: 'processing' }))
				try {
					const response = await fetch('/api/generate', {
						method: 'POST',
						headers: {
							'Content-Type': 'application/json',
						},
						body: JSON.stringify({
							address: walletAddress,
							generatorId,
						}),
					})

					if (!response.ok) {
						throw new Error(`Failed to generate ${generatorId}`)
					}

					const result = await response.json()

					if (result.success && result.card) {
						setGeneratedCards((prev) => [...prev, result.card])
						setGeneratorProgress((prev) => ({ ...prev, [generatorId]: 'completed' }))
					} else {
						throw new Error(`No card data returned for ${generatorId}`)
					}

					completedCount++
					setLoadingProgress((completedCount / totalGenerators) * 100)

					return result.card
				} catch (error) {
					console.error(`Error generating ${generatorId}:`, error)
					setFailedGenerators((prev) => [...prev, generatorId])
					setGeneratorProgress((prev) => ({ ...prev, [generatorId]: 'failed' }))
					completedCount++
					setLoadingProgress((completedCount / totalGenerators) * 100)
					return null
				}
			})

			// Wait for all generators to complete (success or failure)
			const results = await Promise.allSettled(generationPromises)

			// Filter out failed generations and create collection
			const successfulCards = results
				.filter(
					(result): result is PromiseFulfilledResult<any> => result.status === 'fulfilled' && result.value !== null
				)
				.map((result) => result.value)

			if (successfulCards.length > 0) {
				// Create collection and update provider
				const collection = {
					address: walletAddress as `0x${string}`,
					cards: successfulCards,
					timestamp: new Date().toISOString(),
				}

				setCollection(collection)
			} else {
				setError('Failed to generate any cards. Please try again.')
			}
		} catch (error) {
			console.error('Error during card generation:', error)
			setError('An unexpected error occurred. Please try again.')
		} finally {
			setIsLoading(false)
		}
	}

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault()
		if (!address.trim()) return

		// Validate address format
		if (!ADDRESS_REGEX.test(address)) {
			setError('Invalid wallet address format. Please enter a valid 0x address.')
			return
		}

		generateCards(address)
	}

	// If we have generated cards, show the presentation
	if (generatedCards.length > 0 && !isLoading) {
		const collection = {
			address: address as `0x${string}`,
			cards: generatedCards,
			timestamp: new Date().toISOString(),
		}

		return <WrappedCardPresentation collection={collection} />
	}

	return (
		<main className="min-h-screen flex flex-col items-center justify-center text-slate-200">
			<div className="mx-auto max-w-xl px-6 py-24 text-center">
				<GradientText
					className="text-6xl font-bold mb-4 transition-all duration-[1500ms] ease-in-out "
					gradient={'linear-gradient(90deg, #22d3ee 0%, #a78bfa 50%, #4ade80 100%)'}
					text="wallet unwrapped"
				/>

				<p className="mt-3 text-slate-300 text-lg font-mono">
					Drop your addy, get your on-chain wrapped.
					<br />
					<span className="text-slate-200">No cap.</span>
				</p>

				{error && (
					<div className="mt-6 p-4 bg-red-500/20 border border-red-500/30 rounded-lg">
						<p className="text-red-300 text-sm">{error}</p>
					</div>
				)}

				{isLoading ? (
					<LoadingComponent
						isLoading={isLoading}
						loadingProgress={loadingProgress}
						generatedCards={generatedCards}
						targetCardKeys={targetCardKeys}
						generatorProgress={generatorProgress}
						currentGenerator={currentGenerator}
						failedGenerators={failedGenerators}
						generatorDisplayNames={generatorDisplayNames}
					/>
				) : (
					<Card className="mt-8 border-none w-full p-0">
						<CardContent className="py-6 px-0">
							<form className="flex items-center gap-2" onSubmit={handleSubmit}>
								<Input
									name="address"
									value={address}
									onChange={(e) => setAddress(e.target.value)}
									placeholder="0x... wallet address"
									className="flex-1 bg-slate-700/50 border-slate-600 text-slate-100 font-mono"
								/>
								<Button type="submit" size="lg" className="backdrop-blur-md border border-slate-600">
									<GradientText
										className="text-lg font-bold"
										gradient="linear-gradient(90deg, #22d3ee 0%, #a78bfa 50%, #4ade80 100%)"
										text="Analyze"
									/>
								</Button>
							</form>
						</CardContent>
					</Card>
				)}

				<div className="mt-8 space-y-2">
					<div className="text-xs text-slate-400 font-mono">No wallet connection required. Privacy focused.</div>
					<div className="text-xs text-slate-500 font-mono">On-chain analytics platform</div>
				</div>
			</div>
		</main>
	)
}
