import { HypergraphAppProvider } from '@graphprotocol/hypergraph-react'
import type { Metadata } from 'next'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

export const metadata: Metadata = {
	title: 'Hypergraph - Wallet Wrapped',
	description: 'Manage and publish your wrapped card collections to Hypergraph public spaces',
}

export default function HypergraphLayout({
	children,
}: Readonly<{
	children: React.ReactNode
}>) {
	return (
		<HypergraphAppProvider appId={process.env.NEXT_PUBLIC_HYPERGRAPH_APP_ID || ''} mapping={{}}>
			<div className="min-h-screen bg-background text-white">
				{/* Header */}
				<header className="border-b bg-card">
					<div className="container mx-auto px-4 py-4">
						<div className="flex items-center justify-between">
							<div className="flex items-center space-x-4">
								<Link href="/" className="text-xl font-bold text-foreground hover:text-primary transition-colors">
									Wallet Wrapped
								</Link>
								<div className="text-muted-foreground">/</div>
								<span className="text-lg font-semibold text-foreground">Hypergraph</span>
							</div>
							<nav className="flex items-center space-x-4">
								<Link href="/">
									<Button variant="ghost" size="sm">
										← Back to Home
									</Button>
								</Link>
							</nav>
						</div>
					</div>
				</header>

				{children}

				{/* Footer */}
				<footer className="border-t bg-card mt-16">
					<div className="container mx-auto px-4 py-6">
						<div className="text-center text-sm text-muted-foreground">
							<p>Wallet Wrapped - Hypergraph Integration</p>
							<p className="mt-1">Powered by Graph Protocol Hypergraph</p>
						</div>
					</div>
				</footer>
			</div>
		</HypergraphAppProvider>
	)
}
