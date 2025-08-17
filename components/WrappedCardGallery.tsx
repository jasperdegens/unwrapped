'use client'

import { useEffect, useRef, useState } from 'react'
import { WrappedCardView } from '@/components/WrappedCardView'
import type { WrappedCard } from '@/types/wrapped'

interface WrappedCardGalleryProps {
	cards: WrappedCard[]
	className?: string
}

export function WrappedCardGallery({ cards, className = '' }: WrappedCardGalleryProps) {
	const scrollRef = useRef<HTMLDivElement>(null)
	const [currentIndex, setCurrentIndex] = useState(0)

	const scrollToCard = (index: number) => {
		if (scrollRef.current) {
			const cardWidth = 320
			const gap = 24
			const scrollPosition = index * (cardWidth + gap)
			scrollRef.current.scrollTo({
				left: scrollPosition,
				behavior: 'smooth',
			})
			setCurrentIndex(index)
		}
	}

	const handleScroll = () => {
		if (scrollRef.current) {
			const cardWidth = 320
			const gap = 24
			const scrollLeft = scrollRef.current.scrollLeft
			const newIndex = Math.round(scrollLeft / (cardWidth + gap))
			setCurrentIndex(newIndex)
		}
	}

	useEffect(() => {
		const handleKeyPress = (event: KeyboardEvent) => {
			if (event.key === 'ArrowLeft' && currentIndex > 0) {
				scrollToCard(currentIndex - 1)
			} else if (event.key === 'ArrowRight' && currentIndex < cards.length - 1) {
				scrollToCard(currentIndex + 1)
			}
		}

		window.addEventListener('keydown', handleKeyPress)
		return () => window.removeEventListener('keydown', handleKeyPress)
	}, [currentIndex, cards.length, scrollToCard])

	return (
		<div className={`${className} w-full pt-8`}>
			<div className="relative w-full mx-auto">
				<div
					ref={scrollRef}
					onScroll={handleScroll}
					className="flex gap-12 overflow-x-auto py-20 px-20 sm:px-40 scroll-smooth"
					style={{
						scrollbarWidth: 'none',
						msOverflowStyle: 'none',
						'&::-webkit-scrollbar': { display: 'none' },
					}}
				>
					{cards.map((card, index) => (
						<div
							key={index}
							className={`flex-shrink-0 transition-all duration-300 ${
								index === currentIndex ? 'scale-100' : 'scale-95'
							}`}
						>
							<div className="card-holographic w-full h-full">
								<WrappedCardView card={card} />
							</div>
						</div>
					))}
				</div>
			</div>
		</div>
	)
}
