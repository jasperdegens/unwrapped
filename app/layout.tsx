import type { Metadata } from 'next'
import { Fredoka, Space_Mono } from 'next/font/google'
import type React from 'react'
import { WrappedCardProvider } from '@/providers/wrapped-card-provider'
import DegenBG from '@/components/DegenBG'
import './globals.css'

const fredoka = Fredoka({
	subsets: ['latin'],
	weight: ['300', '400', '500', '600', '700'],
	variable: '--font-sans',
	display: 'swap',
})

const spaceMono = Space_Mono({
	subsets: ['latin'],
	weight: ['400', '700'],
	variable: '--font-mono',
	display: 'swap',
})

export const metadata: Metadata = {
	title: 'wallet wrapped - flex your degen lore',
	description:
		'Drop your ETH address and get a sick Spotify Wrapped style summary of your on-chain degeneracy. Bags, wins, rugs—unfiltered.',
	generator: 'wallet-wrapped',
	keywords: ['crypto', 'ethereum', 'wallet', 'defi', 'nft', 'degen', 'wrapped', 'analytics'],
	authors: [{ name: 'degen collective' }],
	openGraph: {
		title: 'wallet wrapped - flex your degen lore',
		description: 'Drop your ETH address and get a sick summary of your on-chain degeneracy',
		type: 'website',
	},
	twitter: {
		card: 'summary_large_image',
		title: 'wallet wrapped - flex your degen lore',
		description: 'Drop your ETH address and get a sick summary of your on-chain degeneracy',
	},
}

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode
}>) {
	return (
		<html lang="en" className={`${fredoka.variable} ${spaceMono.variable} antialiased dark`}>
			<body>
        <DegenBG />
				<WrappedCardProvider>{children}</WrappedCardProvider>
			</body>
		</html>
	)
}
