'use client'
import { useSearchParams } from 'next/navigation'
import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'

export default function Home() {
	const [address, setAddress] = useState('')
	const [error, setError] = useState<string | null>(null)
	const searchParams = useSearchParams()

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

	return (
		<main className="min-h-screen text-slate-200">
			<div className="mx-auto max-w-xl px-6 py-24 text-center">
				<h1 className="text-6xl font-black leading-tight text-slate-100 mb-2 font-sans">wallet unwrapped</h1>

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

				<Card className="mt-8 bg-slate-800/50 border-slate-600">
					<CardContent className="p-6">
						<form
							className="flex items-center gap-2"
							action="/w"
							method="get"
							onSubmit={(e) => {
								e.preventDefault()
								const f = e.currentTarget as HTMLFormElement
								const input = f.querySelector('input[name="address"]') as HTMLInputElement
								if (!input?.value) return
								window.location.href = `/w/${input.value}`
							}}
						>
							<Input
								name="address"
								value={address}
								onChange={(e) => setAddress(e.target.value)}
								placeholder="0x... wallet address"
								className="flex-1 bg-slate-700/50 border-slate-600 text-slate-100 font-mono"
							/>
							<Button type="submit" size="lg" className="bg-slate-600 hover:bg-slate-500 text-slate-100 font-sans">
								Analyze
							</Button>
						</form>
					</CardContent>
				</Card>

				<div className="mt-8 space-y-2">
					<div className="text-xs text-slate-400 font-mono">No wallet connection required. Privacy focused.</div>
					<div className="text-xs text-slate-500 font-mono">On-chain analytics platform</div>
				</div>

				<div className="mt-12 text-xs text-slate-500 max-w-md mx-auto font-mono">
					<p>Built for transparency. DYOR. Not financial advice.</p>
				</div>
			</div>
		</main>
	)
}
