'use client'
import { DegenGradient } from '@/components/DegenGradient'
import { WrappedCardPresentation } from '@/components/WrappedCardPresentation'
import type { WrappedCard } from '@/types/wrapped'

const mockCards: WrappedCard[] = [
	{
		kind: 'top_tokens',
		order: 1,
		leadInText: 'Your largest position this cycle was...',
		revealText: '$23,481 in ETH. Strong conviction play.',
		highlights: [
			{ label: 'Token', value: 'ETH' },
			{ label: 'Peak Value', value: '$23,481' },
			{ label: 'Current Value', value: '$19,203' },
			{ label: 'Hold Duration', value: '247 days' },
		],
		footnote: 'Based on on-chain transaction analysis.',
		media: {
			kind: 'url',
			src: '/ethereum-diamond-hands.png',
			alt: 'Ethereum position',
		},
	},
	{
		kind: 'best_trade',
		order: 2,
		leadInText: 'Your most profitable trade of the year...',
		revealText: 'PEPE position returned 420% gains. Well executed.',
		highlights: [
			{ label: 'Entry', value: '$1,200' },
			{ label: 'Exit', value: '$6,240' },
			{ label: 'Profit', value: '+$5,040' },
			{ label: 'ROI', value: '420%' },
		],
		footnote: 'Performance calculated from transaction history.',
		media: {
			kind: 'url',
			src: '/frog-money-rocket.png',
			alt: 'PEPE gains',
		},
	},
	{
		kind: 'top_nfts',
		order: 3,
		leadInText: 'Your notable NFT acquisition was...',
		revealText: 'Acquired CryptoPunk for 2.5 ETH. Strategic purchase.',
		highlights: [
			{ label: 'Collection', value: 'CryptoPunks' },
			{ label: 'Purchase Price', value: '2.5 ETH' },
			{ label: 'Floor Price', value: '4.2 ETH' },
			{ label: 'Unrealized Gains', value: '+68%' },
		],
		footnote: 'NFT rarity calculated using trait analysis.',
		media: {
			kind: 'url',
			src: '/pixelated-punk.png',
			alt: 'CryptoPunk NFT',
		},
	},
	{
		kind: 'portfolio_summary',
		order: 4,
		leadInText: 'Your 2024 portfolio performance...',
		revealText: 'Portfolio up 156% year-to-date. Solid performance.',
		highlights: [
			{ label: 'Total Invested', value: '$12,500' },
			{ label: 'Current Value', value: '$32,000' },
			{ label: 'Unrealized P&L', value: '+$19,500' },
			{ label: 'Best Month', value: 'March (+89%)' },
		],
		footnote: 'Portfolio tracking includes DeFi, NFTs, and spot holdings.',
		media: {
			kind: 'url',
			src: '/placeholder-r4rva.png',
			alt: 'Portfolio performance chart',
		},
	},
	{
		kind: 'defi_degen',
		order: 5,
		leadInText: 'Your highest yield DeFi position was...',
		revealText: 'Yield farming achieved 420% APY. High risk, high reward.',
		highlights: [
			{ label: 'Protocol', value: 'SushiSwap' },
			{ label: 'LP Tokens', value: 'ETH-USDC' },
			{ label: 'Peak APY', value: '420%' },
			{ label: 'Rewards Earned', value: '$3,200' },
		],
		footnote: 'DeFi yields are variable and subject to impermanent loss.',
		media: {
			kind: 'url',
			src: '/placeholder-17yaf.png',
			alt: 'DeFi yield farming',
		},
	},
]

export default function TestCardsPage() {
	return (
		<div className="min-h-screen relative overflow-hidden bg-slate-900">
			<div className="absolute inset-0 backdrop-blur-sm bg-slate-800/10 z-0"></div>

			<DegenGradient />

			<div className="relative z-10 container mx-auto px-4 py-12">
				<div className="text-center mb-8">
					<h1 className="text-5xl font-black text-slate-100 mb-4 transform -rotate-1 drop-shadow-lg">Card Preview</h1>
					<p className="text-slate-300 text-lg mb-4 font-medium">View the reveal sequence or browse cards</p>
				</div>

				<WrappedCardPresentation cards={mockCards} />
			</div>
		</div>
	)
}
