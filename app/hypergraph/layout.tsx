'use client'

import { HypergraphAppProvider, useHypergraphApp, useHypergraphAuth } from '@graphprotocol/hypergraph-react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import {
	NavigationMenu,
	NavigationMenuContent,
	NavigationMenuItem,
	NavigationMenuLink,
	NavigationMenuList,
	NavigationMenuTrigger,
} from '@/components/ui/NavigationMenu'
import { mapping } from '../mapping'
import { SpacesMenu } from './components/SpacesMenu'

function HypergraphInnerLayout({ children }: Readonly<{ children: React.ReactNode }>) {
	const navigation = useRouter()

	const { authenticated } = useHypergraphAuth()
	const { redirectToConnect, logout } = useHypergraphApp()

	const handleSignIn = () => {
		redirectToConnect({
			storage: localStorage,
			connectUrl: 'https://connect.geobrowser.io/',
			successUrl: `${window.location.origin}/hypergraph/authenticate-success`,
			redirectFn: (url: URL) => {
				window.location.href = url.toString()
			},
		})
	}
	const handleLogout = () => {
		logout()
		navigation.push('/hypergraph')
	}

	return (
		<div className="min-h-full flex flex-col">
			<nav className="border-b bg-background/80 text-white backdrop-blur supports-[backdrop-filter]:bg-background/80 relative z-[9998] bg-white">
				<div className="container mx-auto px-4">
					<div className="flex h-16 items-center justify-between">
						<NavigationMenu viewport={false}>
							<NavigationMenuList>
								<NavigationMenuItem>
									<NavigationMenuLink
										href="/"
										className="group inline-flex h-9 w-max items-center justify-center rounded-md bg-background px-4 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground disabled:pointer-events-none disabled:opacity-50 data-[state=open]:hover:bg-accent data-[state=open]:text-accent-foreground data-[state=open]:focus:bg-accent data-[state=open]:bg-accent/50 focus-visible:ring-ring/50 outline-none transition-[color,box-shadow] focus-visible:ring-[3px] focus-visible:outline-1"
									>
										Home
									</NavigationMenuLink>
								</NavigationMenuItem>

								<NavigationMenuItem>
									<NavigationMenuLink
										href="/explore-public-knowledge"
										className="group inline-flex h-9 w-max items-center justify-center rounded-md bg-background px-4 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground disabled:pointer-events-none disabled:opacity-50 data-[state=open]:hover:bg-accent data-[state=open]:text-accent-foreground data-[state=open]:focus:bg-accent data-[state=open]:bg-accent/50 focus-visible:ring-ring/50 outline-none transition-[color,box-shadow] focus-visible:ring-[3px] focus-visible:outline-1"
									>
										Explore Public Knowledge
									</NavigationMenuLink>
								</NavigationMenuItem>

								<NavigationMenuItem>
									<NavigationMenuTrigger>My Spaces</NavigationMenuTrigger>
									{authenticated ? (
										<SpacesMenu />
									) : (
										<NavigationMenuContent>
											<div className="w-[240px] py-4 text-center text-muted-foreground">
												<p>
													Sign in to access your
													<br />
													private and public spaces
												</p>
											</div>
										</NavigationMenuContent>
									)}
								</NavigationMenuItem>
							</NavigationMenuList>
						</NavigationMenu>

						{/* Auth Button */}
						<div className="flex items-center space-x-4">
							{authenticated ? (
								<Button onClick={handleLogout} variant="outline">
									Logout
								</Button>
							) : (
								<Button onClick={handleSignIn}>Sign in with Geo Connect</Button>
							)}
						</div>
					</div>
				</div>
			</nav>
			<main className="flex-1 container mx-auto px-4 py-6">{children}</main>
		</div>
	)
}

export default function HypergraphLayout({
	children,
}: Readonly<{
	children: React.ReactNode
}>) {
	const _storage = typeof window !== 'undefined' ? window.localStorage : (undefined as unknown as Storage)

	return (
		<HypergraphAppProvider appId={process.env.NEXT_PUBLIC_HYPERGRAPH_APP_ID || ''} storage={_storage} mapping={mapping}>
			<HypergraphInnerLayout>{children}</HypergraphInnerLayout>
		</HypergraphAppProvider>
	)
}
