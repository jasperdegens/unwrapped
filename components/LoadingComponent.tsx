'use client'

import { useEffect, useState } from 'react'

interface LoadingComponentProps {
	isLoading: boolean
	loadingProgress: number
	generatedCards: any[]
	targetCardKeys: string[]
	generatorProgress: Record<string, 'pending' | 'processing' | 'completed' | 'failed'>
	currentGenerator: string
	failedGenerators: string[]
	generatorDisplayNames: Record<string, string>
}

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

export function LoadingComponent({
	isLoading,
	loadingProgress,
	generatedCards,
	targetCardKeys,
	generatorProgress,
	currentGenerator,
	failedGenerators,
	generatorDisplayNames,
}: LoadingComponentProps) {
	const [currentLoadingText, setCurrentLoadingText] = useState(0)

	// Cycle through loading texts
	useEffect(() => {
		if (!isLoading) return

		const interval = setInterval(() => {
			setCurrentLoadingText((prev) => (prev + 1) % loadingTexts.length)
		}, 2500)

		return () => clearInterval(interval)
	}, [isLoading])

	if (!isLoading) return null

	return (
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
							<span className="text-slate-400 font-mono">{generatorDisplayNames[generatorId] || generatorId}</span>
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
					<p className="text-xs text-slate-500 font-mono">Some generators failed: {failedGenerators.join(', ')}</p>
				</div>
			)}
		</div>
	)
}
