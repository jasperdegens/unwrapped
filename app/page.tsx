'use client'
import { useSearchParams } from 'next/navigation'
import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { GradientText } from '@/components/ui/shadcn-io/gradient-text'
import { WrappedCardPresentation } from '@/components/WrappedCardPresentation'
import { useWrappedCard } from '@/providers/wrapped-card-provider'

const targetCardKeys = ['nft-entourage'] //['account-metadata', 'top-tokens']

// Generator display names for better UX
const generatorDisplayNames: Record<string, string> = {
	'account-metadata': 'Account Overview',
	'top-tokens': 'Token Holdings',
	'nft-entourage': 'NFT Collection',
	'best-trade': 'Best Trade',
}

// Move regex to top level to avoid performance issues
const ADDRESS_REGEX = /^0x[a-fA-F0-9]{40}$/

const loadingTexts = [
	'Unwrapping all your degen trades...',
	'Analyzing your wak NFTs...',
	'Crunching those gas fees...',
	'Decoding your smart contract calls...',
	'Calculating your diamond hands score...',
	'Mapping your DeFi journey...',
	'Processing your bridge transactions...',
	'Analyzing your trading patterns...',
	'Checking your ENS game...',
	'Measuring your protocol interactions...',
	'Counting your smart contract deploys...',
	'Evaluating your bridge nomad status...',
	'Assessing your DeFi degen level...',
	'Calculating your swap frequency...',
	'Measuring your power user score...',
]

export default function Home() {
	const [address, setAddress] = useState('')
	const [error, setError] = useState<string | null>(null)
	const [isLoading, setIsLoading] = useState(false)
	const [loadingProgress, setLoadingProgress] = useState(0)
	const [currentLoadingText, setCurrentLoadingText] = useState(0)
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

	// Cycle through loading texts
	useEffect(() => {
		if (!isLoading) return

		const interval = setInterval(() => {
			setCurrentLoadingText((prev) => (prev + 1) % loadingTexts.length)
		}, 2500)

		return () => clearInterval(interval)
	}, [isLoading])

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
	if (generatedCards.length > 0) {
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
					Enter your wallet address to view analytics.
					<br />
					<span className="text-slate-200">Portfolio insights and transaction history</span>
				</p>

				{error && (
					<div className="mt-6 p-4 bg-red-500/20 border border-red-500/30 rounded-lg">
						<p className="text-red-300 text-sm">{error}</p>
					</div>
				)}

				{isLoading ? (
					<div className="mt-8 space-y-6">
						{/* Loading Text */}
						<div className="text-center">
							<p className="text-xl text-slate-300 font-mono animate-pulse">{loadingTexts[currentLoadingText]}</p>
						</div>

						{/* Progress Bar */}
						<div className="w-full bg-slate-700/50 rounded-full h-3 border border-slate-600 overflow-hidden">
							<div
								className="h-full bg-gradient-to-r from-cyan-400 via-purple-400 to-green-400 rounded-full transition-all duration-500 ease-out relative"
								style={{ width: `${loadingProgress}%` }}
							>
								{/* Animated shimmer effect */}
								<div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-pulse" />
							</div>
						</div>

						{/* Progress Text */}
						<div className="text-center">
							<p className="text-sm text-slate-400 font-mono">{Math.round(loadingProgress)}% Complete</p>
							<p className="text-xs text-slate-500 font-mono mt-1">
								Generated {generatedCards.length} of {targetCardKeys.length} cards
							</p>
							{currentGenerator && (
								<p className="text-xs text-slate-400 font-mono mt-2">
									Currently processing: {generatorDisplayNames[currentGenerator] || currentGenerator}
								</p>
							)}
						</div>

						{/* Generator Status */}
						<div className="space-y-2">
							{targetCardKeys.map((generatorId) => {
								const status = generatorProgress[generatorId] || 'pending'
								const statusColor = {
									pending: 'text-slate-500',
									processing: 'text-cyan-400',
									completed: 'text-green-400',
									failed: 'text-red-400',
								}[status]

								const statusIcon = {
									pending: '⏳',
									processing: '🔄',
									completed: '✅',
									failed: '❌',
								}[status]

								// Add spinning animation for processing state
								const iconClass = status === 'processing' ? 'animate-spin' : ''

								return (
									<div key={generatorId} className="flex items-center justify-between text-xs">
										<span className="text-slate-400 font-mono">
											{generatorDisplayNames[generatorId] || generatorId}
										</span>
										<span className={`font-mono ${statusColor}`}>
											<span className={iconClass}>{statusIcon}</span> {status}
										</span>
									</div>
								)
							})}
						</div>

						{/* Failed Generators */}
						{failedGenerators.length > 0 && (
							<div className="text-center">
								<p className="text-xs text-slate-500 font-mono">
									Some generators failed: {failedGenerators.join(', ')}
								</p>
							</div>
						)}
					</div>
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
