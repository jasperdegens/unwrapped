'use client'
import { useHypergraphAuth, useSpaces } from '@graphprotocol/hypergraph-react'
import { LoginPrompt } from './components/login-button'
import { PrivateSpaceWrapper } from './PrivateSpace'

export default function PrivateSpacePage() {
	const { authenticated, identity } = useHypergraphAuth()

	const { data, isPending } = useSpaces({ mode: 'private' })

	if (!authenticated) {
		return <LoginPrompt />
	}

	return <PrivateSpaceWrapper spaceid={data?.[0]?.id || process.env.NEXT_PUBLIC_HYPERGRAPH_SPACE_ID} />
}
