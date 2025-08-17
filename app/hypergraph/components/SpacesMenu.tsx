'use client'

import { useSpaces } from '@graphprotocol/hypergraph-react'
import Link from 'next/link'
import { useMemo } from 'react'
import { NavigationMenuContent, NavigationMenuLink } from '@/components/ui/NavigationMenu'

export function SpacesMenu() {
	const { data: publicSpaces, isPending: publicSpacesPending } = useSpaces({ mode: 'public' })
	const { data: privateSpaces, isPending: privateSpacesPending } = useSpaces({ mode: 'private' })

	const isLoading = publicSpacesPending || privateSpacesPending

	const hydratedPublicSpaces = useMemo(() => {
		if (publicSpaces?.find((space) => space.id === process.env.NEXT_PUBLIC_HYPERGRAPH_SPACE_ID)) {
			return publicSpaces
		}

		return [
			{
				id: process.env.NEXT_PUBLIC_HYPERGRAPH_SPACE_ID,
				name: 'unwrapped',
				spaceAddress: process.env.NEXT_PUBLIC_HYPERGRAPH_SPACE_ID,
			},
			...(publicSpaces || []),
		]
	}, [publicSpaces])

	if (isLoading) {
		return (
			<NavigationMenuContent className="text-white backdrop-blur bg-white/80">
				<ul className="grid w-[300px] gap-3 p-4 ">
					<li className="text-sm text-muted-foreground">Loading spaces...</li>
				</ul>
			</NavigationMenuContent>
		)
	}

	return (
		<NavigationMenuContent className="text-white backdrop-blur bg-white/80">
			<ul className="grid w-[300px] gap-3 p-4 bg-white text-black rounded-md">
				{/* Private Spaces Section */}
				<li>
					<div className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">Private Spaces</div>
					{privateSpaces && privateSpaces.length > 0 ? (
						<div className="space-y-1">
							{privateSpaces.map((space) => (
								<NavigationMenuLink asChild key={space.id}>
									<Link
										href={`/hypergraph/${space.id}?mode=private`}
										className="block select-none space-y-1 rounded-md p-2 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground"
									>
										<div className="text-sm font-medium leading-none">{space.name}</div>
									</Link>
								</NavigationMenuLink>
							))}
						</div>
					) : (
						<div className="text-sm text-muted-foreground p-2">No private spaces found</div>
					)}
				</li>

				{/* Separator */}
				<li className="border-t border-border my-2" />

				{/* Public Spaces Section */}
				<li>
					<div className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">Public Spaces</div>
					{hydratedPublicSpaces && hydratedPublicSpaces.length > 0 ? (
						<div className="space-y-1">
							{hydratedPublicSpaces.map((space) => (
								<NavigationMenuLink asChild key={space.id}>
									<Link
										href={`/hypergraph/${space.id}?mode=public`}
										className="block select-none space-y-1 rounded-md p-2 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground"
									>
										<div className="text-sm font-medium leading-none">{space.name}</div>
									</Link>
								</NavigationMenuLink>
							))}
						</div>
					) : (
						<div className="text-sm text-muted-foreground p-2">No public spaces found</div>
					)}
				</li>
			</ul>
		</NavigationMenuContent>
	)
}
