'use client'

import { useCallback, useEffect, useState } from 'react'
import { WrappedCardGallery } from '@/components/WrappedCardGallery'
import { WrappedCardView } from '@/components/WrappedCardView'
import type { WrappedCardCollection } from '@/types/wrapped'

interface WrappedCardPresentationProps {
	collection: WrappedCardCollection
	className?: string
}

export function WrappedCardPresentation({ collection, className = '' }: WrappedCardPresentationProps) {
	const [phase, setPhase] = useState<'waiting' | 'intro1' | 'intro2' | 'ready' | 'reveal' | 'stack'>('waiting')
	const [currentCardIndex, setCurrentCardIndex] = useState(0)
	const [showingDetails, setShowingDetails] = useState(false)
	const [isTransitioning, setIsTransitioning] = useState(false)
	const { cards, address } = collection
	const truncatedAddress = address ? `${address.slice(0, 6)}...${address.slice(-4)}` : '0x...0000'

	const transitionToPhase = useCallback((nextPhase: string) => {
		setIsTransitioning(true)
		setTimeout(() => {
			if (nextPhase === 'intro2') setPhase('intro2')
			else if (nextPhase === 'ready') setPhase('ready')
			else if (nextPhase === 'reveal') setPhase('reveal')
			setIsTransitioning(false)
		}, 3500) // Increased fade out duration to 3.5s
	}, [])

	const transitionToNextCard = useCallback(() => {
		setIsTransitioning(true)
		setTimeout(() => {
			setCurrentCardIndex((prev) => prev + 1)
			setShowingDetails(false)
			setIsTransitioning(false)
		}, 3500) // Increased fade out duration to 3.5s
	}, [])

	const transitionToShowingDetails = useCallback(() => {
		setIsTransitioning(true)
		setTimeout(() => {
			setShowingDetails(true)
			setIsTransitioning(false)
		}, 3500) // Increased fade out duration to 3.5s
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
			<div className={className}>
				<div className="w-full pt-8 pb-4 text-center">
					<h1 className="text-3xl font-bold text-white">{truncatedAddress} Unwrapped</h1>
				</div>
				<WrappedCardGallery cards={cards} />
			</div>
		)
	}

	const currentCard = cards[currentCardIndex]
	const isWaiting = phase === 'waiting'
	const isIntro1 = phase === 'intro1' && !isTransitioning
	const isIntro2 = phase === 'intro2' && !isTransitioning
	const isReady = phase === 'ready' && !isTransitioning
	const isLeadIn = phase === 'reveal' && !showingDetails && !isTransitioning
	const isCardDetails = phase === 'reveal' && showingDetails && !isTransitioning

	return (
		<div className={`${className} min-h-screen flex items-center justify-center bg-black`}>
			<div className="relative w-96 h-[500px] flex items-center justify-center">
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
					className={`absolute inset-0 flex items-center justify-center transition-all duration-[3500ms] ease-in-out ${
						isIntro1 ? 'opacity-100 scale-100 z-20' : 'opacity-0 scale-95 pointer-events-none -z-10'
					}`}
				>
					<div className="text-center">
						<h2 className="text-4xl font-bold text-white mb-4 transition-all duration-[3500ms] ease-in-out">
							Hello {truncatedAddress}
						</h2>
						<p className="text-xl text-white/80 transition-all duration-[3500ms] ease-in-out delay-200">
							You've had quite the year...
						</p>
					</div>
				</div>

				{/* Second intro slide */}
				<div
					className={`absolute inset-0 flex items-center justify-center transition-all duration-[3500ms] ease-in-out ${
						isIntro2 ? 'opacity-100 scale-100 z-20' : 'opacity-0 scale-95 pointer-events-none -z-10'
					}`}
				>
					<div className="text-center">
						<h2 className="text-4xl font-bold text-white mb-4 transition-all duration-[3500ms] ease-in-out">
							Let's dive into
						</h2>
						<p className="text-xl text-white/80 transition-all duration-[3500ms] ease-in-out delay-200">
							Your biggest wins and biggest Ls
						</p>
					</div>
				</div>

				{/* Ready to go phase */}
				<div
					className={`absolute inset-0 flex items-center justify-center transition-all duration-[3500ms] ease-in-out ${
						isReady ? 'opacity-100 scale-100 z-10' : 'opacity-0 scale-95 pointer-events-none -z-10'
					}`}
				>
					<div className="text-center">
						<h2 className="text-4xl font-bold text-white transition-all duration-[3500ms] ease-in-out">Ready to go?</h2>
						<p className="text-xl text-white/80 transition-all duration-[3500ms] ease-in-out delay-200">
							Click ENTER or SPACE to continue
						</p>
					</div>
				</div>

				{/* Lead-in text phase */}
				<div
					className={`absolute inset-0 flex items-center justify-center transition-all duration-[3500ms] ease-in-out ${
						isLeadIn ? 'opacity-100 scale-100 z-10' : 'opacity-0 scale-95 pointer-events-none -z-10'
					}`}
				>
					<div className="text-center">
						<h2 className="text-4xl font-bold text-white transition-all duration-[3500ms] ease-in-out">
							{currentCard.leadInText}
						</h2>
					</div>
				</div>

				{/* Card details phase */}
				<div
					className={`absolute inset-0 transition-all duration-[3500ms] ease-in-out ${
						isCardDetails ? 'opacity-100 scale-100 z-10' : 'opacity-0 scale-105 pointer-events-none -z-10'
					}`}
				>
					{isCardDetails && (
						<div className="w-full h-full">
							<WrappedCardView card={currentCard} />
						</div>
					)}
				</div>
			</div>

			{isIntro1 || isIntro2 || isReady ? (
				<div className="absolute bottom-8 left-1/2 -translate-x-1/2">
					<p className="text-white/60 text-sm transition-all duration-500 ease-in-out">
						→ or ENTER or SPACE to continue
					</p>
				</div>
			) : showingDetails ? (
				<div className="absolute bottom-8 left-1/2 -translate-x-1/2">
					<p className="text-white/60 text-sm transition-all duration-500 ease-in-out">→ or ESC</p>
				</div>
			) : null}
		</div>
	)
}
