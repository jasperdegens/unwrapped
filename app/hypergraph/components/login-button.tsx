'use client'
import { useHypergraphApp } from '@graphprotocol/hypergraph-react'
import { Button } from '@/components/ui/button'

function LoginButton() {
	const { redirectToConnect } = useHypergraphApp()
	return (
		<Button
			onClick={() => {
				redirectToConnect({
					storage: localStorage,
					connectUrl: 'https://connect.geobrowser.io/',
					successUrl: `${window.location.origin}/hypergraph/authenticate-success`,
					// your app id (any valid uuid)
					appId: process.env.NEXT_PUBLIC_HYPERGRAPH_APP_ID,
					redirectFn: (url: URL) => {
						window.location.href = url.toString()
					},
				})
			}}
		>
			Authenticate with Connect
		</Button>
	)
}

export function LoginPrompt() {
	return (
		<div>
			<LoginButton />
		</div>
	)
}
