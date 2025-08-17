'use client'
import { useHypergraphAuth, useSpaces } from '@graphprotocol/hypergraph-react'
import { redirect } from 'next/navigation'
import { LoginPrompt } from './components/login-button'

export default function PrivateSpacePage() {
	const { authenticated, identity } = useHypergraphAuth()

	const { data, isPending } = useSpaces({ mode: 'private' })

	if (!authenticated) {
		return <LoginPrompt />
	}

	if (isPending) {
		return <div>Loading...</div>
	}

	redirect(`/hypergraph/${data?.[0]?.id}?mode=private`)

	return <div>Loading...</div>
	// return <PrivateSpaceWrapper spaceid={data?.[0]?.id || process.env.NEXT_PUBLIC_HYPERGRAPH_SPACE_ID} />
}
