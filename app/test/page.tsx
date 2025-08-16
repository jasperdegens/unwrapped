'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'

const GENERATORS = [
	{ id: 'top-tokens', name: 'Top Tokens', description: 'Shows top 5 tokens by USD value', order: 10 },
	{ id: 'nft-entourage', name: 'NFT Entourage', description: 'Gallery of top 4 NFTs by value', order: 15 },
	{ id: 'best-trade', name: 'Best Trade', description: 'Highest positive PnL trade from last 365 days', order: 20 },
	{ id: 'account-metadata', name: 'Account Metadata', description: 'Account metadata', order: 1 },
]

export default function TestPage() {
	const [address, setAddress] = useState('0xA92DE6e0c17d4d9f006804b73b7b9726F0EC3842')
	const [loading, setLoading] = useState(false)
	const [result, setResult] = useState<any>(null)
	const [error, setError] = useState<string | null>(null)
	const [testingGenerator, setTestingGenerator] = useState<string | null>(null)

	const testGeneration = async () => {
		setLoading(true)
		setError(null)
		setResult(null)

		try {
			console.log('[v0] Testing generation for:', address)
			// const response = await fetch('/api/generate', {
			// 	method: 'POST',
			// 	headers: { 'Content-Type': 'application/json' },
			// 	body: JSON.stringify({ address, force: true }),
			// })

			// const data = await response.json()
			// console.log('[v0] Generation response:', data)

			// if (!response.ok) {
			// 	throw new Error(data.error || 'Generation failed')
			// }

			// setResult(data)
		} catch (err) {
			console.log('[v0] Generation error:', err)
			setError(err instanceof Error ? err.message : 'Unknown error')
		} finally {
			setLoading(false)
		}
	}

	const testSingleGenerator = async (generatorId: string) => {
		setTestingGenerator(generatorId)
		setError(null)
		setResult(null)

		try {
			console.log('[v0] Testing single generator:', generatorId, 'for:', address)
			const response = await fetch('/api/generate', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ address, generatorId }),
			})

			const data = await response.json()
			console.log('[v0] Single generator response:', data)

			if (!response.ok) {
				throw new Error(data.error || 'Generator test failed')
			}

			setResult(data)
		} catch (err) {
			console.log('[v0] Single generator error:', err)
			setError(err instanceof Error ? err.message : 'Unknown error')
		} finally {
			setTestingGenerator(null)
		}
	}

	return (
		<div className="min-h-screen relative">
			<div className="relative z-10 container mx-auto px-4 py-8">
				<Card className="max-w-4xl mx-auto bg-slate-800/50 backdrop-blur-sm border-slate-600">
					<CardHeader>
						<CardTitle className="text-2xl font-bold text-center text-slate-100">Generator Test Lab</CardTitle>
					</CardHeader>
					<CardContent className="space-y-6">
						<div className="space-y-2">
							<label htmlFor="address" className="text-sm font-medium text-slate-300">
								Wallet Address to Test
							</label>
							<Input
								value={address}
								onChange={(e) => setAddress(e.target.value)}
								placeholder="0x..."
								className="bg-slate-700/50 border-slate-600 text-slate-100"
							/>
						</div>

						<div className="space-y-4">
							<h3 className="text-lg font-semibold text-slate-200">Test All Generators</h3>
							<Button
								onClick={testGeneration}
								disabled={loading || !address}
								className="w-full bg-slate-600 hover:bg-slate-500 text-slate-100 font-bold"
							>
								{loading ? 'Generating All Cards...' : 'Test Full Generation'}
							</Button>
						</div>

						<div className="space-y-4">
							<h3 className="text-lg font-semibold text-slate-200">Test Individual Generators</h3>
							<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
								{GENERATORS.map((gen) => (
									<Card key={gen.id} className="bg-slate-700/50 border-slate-600">
										<CardHeader className="pb-2">
											<CardTitle className="text-sm text-slate-100">{gen.name}</CardTitle>
										</CardHeader>
										<CardContent className="space-y-3">
											<p className="text-xs text-slate-400">{gen.description}</p>
											<Button
												onClick={() => testSingleGenerator(gen.id)}
												disabled={testingGenerator === gen.id || !address}
												size="sm"
												className="w-full bg-slate-600 hover:bg-slate-500 text-slate-100"
											>
												{testingGenerator === gen.id ? 'Testing...' : 'Test'}
											</Button>
										</CardContent>
									</Card>
								))}
							</div>
						</div>

						{error && (
							<div className="p-4 bg-red-900/50 border border-red-500/50 rounded-lg">
								<p className="text-red-300 font-mono text-sm">Error: {error}</p>
							</div>
						)}

						{result && (
							<div className="p-4 bg-green-900/50 border border-green-500/50 rounded-lg">
								<p className="text-green-300 font-bold mb-2">Test Successful</p>
								<div className="space-y-3">
									<div className="text-sm text-slate-300 space-y-1">
										{result.count !== undefined ? (
											<>
												<p>Cards Generated: {result.count}</p>
												<p>Wrapped ID: {result.wrappedId}</p>
												<p>
													Storage URL:{' '}
													<a
														href={result.url}
														target="_blank"
														className="text-blue-400 hover:underline"
														rel="noreferrer"
													>
														{result.url}
													</a>
												</p>
											</>
										) : (
											<>
												<p>Generator: {result.generatorId}</p>
												<p>Address: {result.address}</p>
												<p>Timestamp: {result.timestamp}</p>
											</>
										)}
									</div>
									<details className="bg-slate-700/50 rounded p-3">
										<summary className="text-slate-200 cursor-pointer font-mono text-sm">View JSON Output</summary>
										<pre className="mt-2 text-xs text-slate-300 overflow-auto max-h-96">
											{JSON.stringify(result, null, 2)}
										</pre>
									</details>
								</div>
							</div>
						)}
					</CardContent>
				</Card>
			</div>
		</div>
	)
}
