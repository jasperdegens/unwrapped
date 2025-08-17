'use client'

import { useRouter } from 'next/navigation'
import { useEffect, useId, useState } from 'react'
import { LoadingComponent } from '@/components/LoadingComponent'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { GradientText } from '@/components/ui/shadcn-io/gradient-text'
import { useWrappedCard } from '@/providers/wrapped-card-provider'

export default function CreatePage() {
	const router = useRouter()
	const { collection, addCard } = useWrappedCard()
	const [generatorName, setGeneratorName] = useState('')
	const [dataPrompt, setDataPrompt] = useState('')
	const [mediaPrompt, setMediaPrompt] = useState('')
	const [isLoading, setIsLoading] = useState(false)
	const [error, setError] = useState<string | null>(null)
	const generatorNameId = useId()
	const dataPromptId = useId()
	const mediaPromptId = useId()

	// Redirect if no collection exists
	useEffect(() => {
		if (!collection?.address) {
			router.push('/')
		}
	}, [collection, router])

	// If no collection, show loading
	if (!collection?.address) {
		return (
			<main className="min-h-screen flex flex-col items-center justify-center text-slate-200">
				<div className="text-center">
					<p className="text-slate-300">Loading...</p>
				</div>
			</main>
		)
	}

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault()
		const hasGeneratorName = generatorName.trim()
		const hasDataPrompt = dataPrompt.trim()
		const hasMediaPrompt = mediaPrompt.trim()

		if (!hasGeneratorName) {
			setError('Please enter a generator name')
			return
		}
		if (!hasDataPrompt) {
			setError('Please enter a data prompt')
			return
		}
		if (!hasMediaPrompt) {
			setError('Please enter a media prompt')
			return
		}

		setIsLoading(true)
		setError(null)

		try {
			const response = await fetch('/api/generate/custom', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({
					address: collection.address,
					generatorName,
					dataPrompt,
					mediaPrompt,
				}),
			})

			if (!response.ok) {
				const errorData = await response.json()
				throw new Error(errorData.error || 'Failed to generate card')
			}

			const result = await response.json()

			if (result.success && result.card) {
				// Add the new card to the collection
				addCard(result.card)

				// Redirect back to the wrapped presentation
				router.push(`/share?address=${collection.address}`)
			} else {
				throw new Error('No card data returned')
			}
		} catch (error) {
			console.error('Error generating custom card:', error)
			setError(error instanceof Error ? error.message : 'An unexpected error occurred')
		} finally {
			setIsLoading(false)
		}
	}

	return (
		<main className="min-h-screen flex flex-col items-center justify-center text-slate-200">
			<div className="mx-auto max-w-2xl px-6 py-24 text-center">
				<GradientText
					className="text-6xl font-bold mb-4 transition-all duration-[1500ms] ease-in-out"
					gradient={'linear-gradient(90deg, #22d3ee 0%, #a78bfa 50%, #4ade80 100%)'}
					text="create your own card"
				/>

				<p className="mt-3 text-slate-300 text-lg font-mono">
					Generate a custom card with your own prompts
					<br />
					<span className="text-slate-200">Address: {collection.address}</span>
				</p>

				{error && (
					<div className="mt-6 p-4 bg-red-500/20 border border-red-500/30 rounded-lg">
						<p className="text-red-300 text-sm">{error}</p>
					</div>
				)}

				{isLoading ? (
					<LoadingComponent
						isLoading={isLoading}
						loadingProgress={0}
						generatedCards={[]}
						targetCardKeys={['custom']}
						generatorProgress={{ custom: 'processing' }}
						currentGenerator="custom"
						failedGenerators={[]}
						generatorDisplayNames={{ custom: 'Custom Card' }}
					/>
				) : (
					<Card className="mt-8 border-none w-full p-0">
						<CardContent className="py-6 px-0">
							<form className="space-y-6" onSubmit={handleSubmit}>
								<div className="space-y-2">
									<label htmlFor={generatorNameId} className="block text-sm font-medium text-slate-300 text-left">
										Generator Name
									</label>
									<Input
										id={generatorNameId}
										name="generatorName"
										value={generatorName}
										onChange={(e) => setGeneratorName(e.target.value)}
										placeholder="e.g., My Custom Analysis"
										className="w-full bg-slate-700/50 border-slate-600 text-slate-100 font-mono"
									/>
								</div>

								<div className="space-y-2">
									<label htmlFor={dataPromptId} className="block text-sm font-medium text-slate-300 text-left">
										Data Prompt
									</label>
									<textarea
										id={dataPromptId}
										name="dataPrompt"
										value={dataPrompt}
										onChange={(e) => setDataPrompt(e.target.value)}
										placeholder="Describe what data you want to analyze (e.g., 'Analyze my DeFi trading patterns and show my most profitable strategies')"
										rows={4}
										className="w-full bg-slate-700/50 border border-slate-600 text-slate-100 font-mono rounded-md px-3 py-2 resize-none focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-transparent"
									/>
								</div>

								<div className="space-y-2">
									<label htmlFor={mediaPromptId} className="block text-sm font-medium text-slate-300 text-left">
										Media Prompt
									</label>
									<textarea
										id={mediaPromptId}
										name="mediaPrompt"
										value={mediaPrompt}
										onChange={(e) => setMediaPrompt(e.target.value)}
										placeholder="Describe the visual style you want (e.g., 'Create a futuristic dashboard with neon colors showing trading metrics')"
										rows={4}
										className="w-full bg-slate-700/50 border border-slate-600 text-slate-100 font-mono rounded-md px-3 py-2 resize-none focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-transparent"
									/>
								</div>

								<div className="flex gap-4 pt-4">
									<Button
										type="button"
										variant="outline"
										onClick={() => router.push('/')}
										className="flex-1 backdrop-blur-md border border-slate-600 text-slate-300"
									>
										Cancel
									</Button>
									<Button type="submit" size="lg" className="flex-1 backdrop-blur-md border border-slate-600">
										<GradientText
											className="text-lg font-bold"
											gradient="linear-gradient(90deg, #22d3ee 0%, #a78bfa 50%, #4ade80 100%)"
											text="Generate Card"
										/>
									</Button>
								</div>
							</form>
						</CardContent>
					</Card>
				)}

				<div className="mt-8 space-y-2">
					<div className="text-xs text-slate-400 font-mono">Custom card generation powered by AI</div>
					<div className="text-xs text-slate-500 font-mono">Be specific with your prompts for better results</div>
				</div>
			</div>
		</main>
	)
}
