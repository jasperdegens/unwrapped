import DegenBG from '@/components/DegenGradient'
import { WrappedCardView } from '@/components/WrappedCardView'

async function getDeck(address: string) {
	const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL ?? ''}/api/wrapped/${address}`, { cache: 'no-store' })
	return res.ok ? await res.json() : null
}

async function generateDeck(address: string) {
	const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL ?? ''}/api/generate`, {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify({ address, force: false }),
	})
	return res.ok ? await res.json() : null
}

export default async function WrappedPage({ params }: { params: { address: string } }) {
	let deck = await getDeck(params.address)

	if (!deck) {
		console.log('[v0] No deck found, triggering generation for', params.address)
		await generateDeck(params.address)
		// Wait a moment then try to fetch again
		await new Promise((resolve) => setTimeout(resolve, 2000))
		deck = await getDeck(params.address)
	}

	return (
		<main className="min-h-screen text-slate-200">
			<DegenBG />
			<div className="mx-auto max-w-3xl px-6 py-16">
				{deck ? (
					<>
						<header className="mb-6">
							<h1 className="text-2xl font-bold">
								Analytics for <span className="font-mono text-slate-300">{params.address}</span>
							</h1>
							<p className="text-sm text-slate-500">Generated {new Date(deck.snapshotAt).toLocaleString()}</p>
						</header>

						<div className="grid gap-6">
							{deck.cards.map((c: any, i: number) => (
								<WrappedCardView key={i} card={c} />
							))}
						</div>
					</>
				) : (
					<div className="text-center">
						<div className="text-slate-400 mb-4">Generating wallet analytics...</div>
						<div className="text-sm text-slate-300">Processing transaction data and calculating metrics</div>
					</div>
				)}
			</div>
		</main>
	)
}
