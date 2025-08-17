import { redirect } from 'next/navigation'
import { WrappedCardPresentation } from '@/components/WrappedCardPresentation'
import { getCard } from '@/lib/redis'

// Move regex to top level to avoid performance issues
const ADDRESS_REGEX = /^0x[a-fA-F0-9]{40}$/

interface SharePageProps {
	searchParams: Promise<{ address?: string }>
}

const targetCardKeys = ['account-metadata']

export default async function SharePage({ searchParams }: SharePageProps) {
	const { address } = await searchParams

	if (!address) {
		redirect('/')
	}

	// Validate address format
	if (!ADDRESS_REGEX.test(address)) {
		redirect('/?error=invalid-address')
	}

	try {
		// try and fetch all of the cards in the targetCardKeys array
		const cards = await Promise.all(
			targetCardKeys.map(async (key) => {
				const card = await getCard(key, address)
				return card
			})
		)

		if (cards.some((card) => card !== null)) {
			return (
				<WrappedCardPresentation
					collection={{
						address: address as `0x${string}`,
						cards: [cards[0], cards[0], cards[0], cards[0]],
						//cards.filter((card) => card !== null) as WrappedCard[],
						timestamp: new Date().toISOString(),
					}}
				/>
			)
		}

		// No cards found, redirect to home with address
		redirect(`/?address=${encodeURIComponent(address)}`)
	} catch (error) {
		console.error('Error fetching cards:', error)
		// On error, redirect to home with address
		redirect(`/?address=${encodeURIComponent(address)}`)
	}
}
