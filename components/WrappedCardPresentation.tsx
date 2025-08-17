'use client'

import { PlusIcon, ShareIcon } from 'lucide-react'
import Link from 'next/link'
import { useCallback, useEffect, useState } from 'react'
import { ShareModal } from '@/components/ShareModal'
import { WrappedCardGallery } from '@/components/WrappedCardGallery'
import { WrappedCardView } from '@/components/WrappedCardView'
import { useWrappedCard } from '@/providers/wrapped-card-provider'
import type { WrappedCardCollection } from '@/types/wrapped'
import { Button } from './ui/button'
import { GradientText } from './ui/shadcn-io/gradient-text'

interface WrappedCardPresentationProps {
	collection: WrappedCardCollection
	className?: string
}

export function WrappedCardPresentation({ collection, className = '' }: WrappedCardPresentationProps) {
	const [phase, setPhase] = useState<'waiting' | 'intro1' | 'intro2' | 'ready' | 'reveal' | 'stack'>('waiting')
	const [currentCardIndex, setCurrentCardIndex] = useState(0)
	const [showingDetails, setShowingDetails] = useState(false)
	const [isTransitioning, setIsTransitioning] = useState(false)
	const [isShareModalOpen, setIsShareModalOpen] = useState(false)
	const [fadeOut, setFadeOut] = useState(false)
	const [shareLink, setShareLink] = useState('')
	const { setCollection } = useWrappedCard()
	const { cards, address } = collection
	const truncatedAddress = address ? `${address.slice(0, 6)}...${address.slice(-4)}` : '0x...0000'

	// Generate share URL
	useEffect(() => {
		setShareLink(`${window.location.origin}/share?address=${encodeURIComponent(address)}`)
	}, [address])

	useEffect(() => {
		if (collection) {
			setCollection(collection)
		}
	}, [collection, setCollection])

	const transitionToPhase = useCallback((nextPhase: string) => {
		setFadeOut(true)
		setIsTransitioning(true)
		setTimeout(() => {
			if (nextPhase === 'intro2') setPhase('intro2')
			else if (nextPhase === 'ready') setPhase('ready')
			else if (nextPhase === 'reveal') setPhase('reveal')
			setFadeOut(false)
			setTimeout(() => setIsTransitioning(false), 100)
		}, 1500)
	}, [])

	const transitionToNextCard = useCallback(() => {
		setFadeOut(true)
		setIsTransitioning(true)
		setTimeout(() => {
			setCurrentCardIndex((prev) => prev + 1)
			setShowingDetails(false)
			setFadeOut(false)
			setTimeout(() => setIsTransitioning(false), 100)
		}, 1500)
	}, [])

	const transitionToShowingDetails = useCallback(() => {
		setFadeOut(true)
		setIsTransitioning(true)
		setTimeout(() => {
			setShowingDetails(true)
			setFadeOut(false)
			setTimeout(() => setIsTransitioning(false), 100)
		}, 1500)
	}, [])

	useEffect(() => {
		if (phase === 'waiting') {
			const timer = setTimeout(() => {
				setPhase('intro1')
			}, 2000)
			return () => clearTimeout(timer)
		}

		if (phase === 'intro1') {
			const timer = setTimeout(() => {
				transitionToPhase('intro2')
			}, 3500)
			return () => clearTimeout(timer)
		}

		if (phase === 'intro2') {
			const timer = setTimeout(() => {
				transitionToPhase('ready')
			}, 3500)
			return () => clearTimeout(timer)
		}

		// Note: 'ready' phase doesn't auto-advance - requires user interaction

		if (phase !== 'reveal' || showingDetails) return

		const timer = setTimeout(() => {
			transitionToShowingDetails()
		}, 2000)

		return () => clearTimeout(timer)
	}, [phase, showingDetails, transitionToPhase, transitionToShowingDetails])

	const handleNext = useCallback(() => {
		if (!showingDetails) return

		if (currentCardIndex < cards.length - 1) {
			transitionToNextCard()
		} else {
			setPhase('stack')
		}
	}, [showingDetails, currentCardIndex, cards.length, transitionToNextCard])

	const advancePhase = useCallback(() => {
		if (phase === 'intro1') transitionToPhase('intro2')
		else if (phase === 'intro2') transitionToPhase('ready')
		else if (phase === 'ready') transitionToPhase('reveal')
	}, [phase, transitionToPhase])

	const handleKeyPress = useCallback(
		(event: KeyboardEvent) => {
			if (isTransitioning) return // Prevent interaction during transitions

			const key = event.key

			// Handle skip to stack phase
			if (key === 's' || key === 'S') {
				setPhase('stack')
				return
			}

			// Handle intro phases
			if ((phase === 'intro1' || phase === 'intro2') && (key === 'ArrowRight' || key === 'Enter' || key === ' ')) {
				advancePhase()
				return
			}

			// Handle ready phase
			if (phase === 'ready' && (key === 'Enter' || key === ' ')) {
				advancePhase()
				return
			}

			// Handle reveal phase
			if (phase === 'reveal' && showingDetails && key === 'ArrowRight') {
				handleNext()
				return
			}

			// Handle escape
			if (key === 'Escape') {
				setPhase('stack')
			}
		},
		[phase, showingDetails, handleNext, advancePhase, isTransitioning]
	)

	useEffect(() => {
		window.addEventListener('keydown', handleKeyPress)
		return () => window.removeEventListener('keydown', handleKeyPress)
	}, [handleKeyPress])

	if (phase === 'stack') {
		return (
			<>
				<div className={className}>
					<div className="w-full pt-8 pb-4 text-center">
						<GradientText
							className="text-3xl font-bold mb-6 block"
							gradient="linear-gradient(90deg, #22d3ee 0%, #a78bfa 50%, #4ade80 100%)"
							text={`${truncatedAddress} Unwrapped`}
						/>
						<div className="flex items-center flex-row justify-center gap-4">
							<Button
								type="button"
								variant="default"
								onClick={() => setIsShareModalOpen(true)}
								className="backdrop-blur-md border border-slate-600 text-white"
							>
								<ShareIcon className="w-4 h-4" />
								Share your unwrapped
							</Button>
							<Link href="/create">
								<Button type="button" variant="default" className="backdrop-blur-md border border-slate-600 text-white">
									<PlusIcon className="w-4 h-4" />
									Create a card
								</Button>
							</Link>
						</div>
					</div>
					<WrappedCardGallery cards={cards} />
				</div>

				<ShareModal isOpen={isShareModalOpen} onClose={() => setIsShareModalOpen(false)} shareUrl={shareLink} />
			</>
		)
	}

	const currentCard = cards[currentCardIndex]
	const isWaiting = phase === 'waiting'
	const isIntro1 = phase === 'intro1' && !isTransitioning && !fadeOut
	const isIntro2 = phase === 'intro2' && !isTransitioning && !fadeOut
	const isReady = phase === 'ready' && !isTransitioning && !fadeOut
	const isLeadIn = phase === 'reveal' && !showingDetails && !isTransitioning && !fadeOut
	const isCardDetails = phase === 'reveal' && showingDetails && !isTransitioning && !fadeOut

	return (
		<div className={`${className} min-h-screen flex items-center justify-center`}>
			<div className="relative w-[448px] flex items-center justify-center">
				{/* Waiting phase - no text */}
				<div
					className={`absolute inset-0 flex items-center justify-center transition-all duration-1000 ease-in-out ${
						isWaiting ? 'opacity-100 scale-100 z-30' : 'opacity-0 scale-95 pointer-events-none -z-10'
					}`}
				>
					{/* Empty - just black background */}
				</div>

				{/* First intro slide */}
				<div
					className={`absolute inset-0 flex items-center justify-center transition-all duration-[1500ms] ease-in-out ${
						isIntro1 ? 'opacity-100 scale-100 z-20' : 'opacity-0 scale-95 pointer-events-none -z-10'
					}`}
				>
					<div className="text-center">
						<GradientText
							className="text-5xl font-bold mb-4 transition-all duration-[1500ms] ease-in-out "
							gradient={'linear-gradient(90deg, #22d3ee 0%, #a78bfa 50%, #4ade80 100%)'}
							text={`Hello ${truncatedAddress}`}
						/>
						<p className="text-xl text-white/80 transition-all duration-[1500ms] ease-in-out delay-100">
							You've had quite the year...
						</p>
					</div>
				</div>

				{/* Second intro slide */}
				<div
					className={`absolute inset-0 flex items-center justify-center transition-all duration-[1500ms] ease-in-out ${
						isIntro2 ? 'opacity-100 scale-100 z-20' : 'opacity-0 scale-95 pointer-events-none -z-10'
					}`}
				>
					<div className="text-center">
						<GradientText
							className="text-5xl font-bold mb-4 transition-all duration-[1500ms] ease-in-out "
							gradient={'linear-gradient(90deg, #22d3ee 0%, #a78bfa 50%, #4ade80 100%)'}
							text="Let's dive into"
						/>
						<p className="text-xl text-white/80 transition-all duration-[1500ms] ease-in-out delay-100">
							Your biggest wins and hardest blows
						</p>
					</div>
				</div>

				{/* Ready to go phase */}
				<div
					className={`absolute inset-0 flex items-center justify-center transition-all duration-[1500ms] ease-in-out ${
						isReady ? 'opacity-100 scale-100 z-10' : 'opacity-0 scale-95 pointer-events-none -z-10'
					}`}
				>
					<div className="text-center">
						<GradientText
							className="text-5xl font-bold mb-4 transition-all duration-[1500ms] ease-in-out "
							gradient={'linear-gradient(90deg, #22d3ee 0%, #a78bfa 50%, #4ade80 100%)'}
							text="Ready to go?"
						/>
						<p className="text-xl text-white/80 transition-all duration-[1500ms] ease-in-out delay-100">
							Press SPACE to continue
						</p>
					</div>
				</div>

				{/* Lead-in text phase */}
				<div
					className={`absolute inset-0 flex items-center justify-center transition-all duration-[1500ms] ease-in-out ${
						isLeadIn ? 'opacity-100 scale-100 z-10' : 'opacity-0 scale-95 pointer-events-none -z-10'
					}`}
				>
					<div className="text-center">
						<h2 className="text-4xl font-bold transition-all duration-[1500ms] ease-in-out crypto-heading">
							{currentCard.leadInText}
						</h2>
					</div>
				</div>

				{/* Card details phase */}
				<div
					className={`absolute inset-0 transition-all duration-[1500ms] ease-in-out ${
						isCardDetails ? 'opacity-100 scale-100 z-10' : 'opacity-0 scale-105 pointer-events-none -z-10'
					}`}
				>
					{isCardDetails && (
						<div className="w-full min-h-[800px] transform -translate-y-1/2" onClick={handleNext}>
							<WrappedCardView card={currentCard} />
						</div>
					)}
				</div>
			</div>

			{isIntro1 || isIntro2 || isReady ? (
				<div className="absolute bottom-8 left-1/2 -translate-x-1/2">
					<p className="text-white/60 text-sm transition-all duration-500 ease-in-out">→ or SPACE to continue</p>
				</div>
			) : showingDetails ? (
				<div className="absolute bottom-8 left-1/2 -translate-x-1/2">
					<p className="text-white/60 text-sm transition-all duration-500 ease-in-out">→ for next, S to skip</p>
				</div>
			) : null}
		</div>
	)
}
