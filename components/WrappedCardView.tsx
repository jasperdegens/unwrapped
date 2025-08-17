'use client'

import { motion } from 'framer-motion'
import { useCallback, useEffect, useRef, useState } from 'react'
import type { WrappedCard } from '@/types/wrapped'

export function WrappedCardView({ card }: { card: WrappedCard }) {
	const [isHovering, setIsHovering] = useState(false)
	const [isInteracting, setIsInteracting] = useState(false)

	// Refs for direct DOM manipulation
	const cardRef = useRef<HTMLDivElement>(null)
	const translaterRef = useRef<HTMLDivElement>(null)
	const rotatorRef = useRef<HTMLDivElement>(null)
	const shineRef = useRef<HTMLDivElement>(null)
	const glareRef = useRef<HTMLDivElement>(null)

	// Animation frame for smooth updates
	const animationFrameRef = useRef<number>(0)
	const lastMousePosition = useRef({ x: 50, y: 50 })

	// Imperative update function for high-performance transforms
	const updateTransforms = useCallback(
		(x: number, y: number) => {
			if (!(rotatorRef.current && shineRef.current && glareRef.current)) return

			// Calculate rotation values with much more subtle limits
			const rotateX = ((y - 50) / 2) * 0.3 // Reduced from 0.5 to 0.3 (60% reduction)
			const rotateY = ((x - 50) / 3.5) * 0.4 // Reduced from 1.0 to 0.4 (60% reduction)
			const pointerFromCenter = Math.sqrt((x - 50) ** 2 + (y - 50) ** 2) / 50

			// Update 3D transforms directly (bypasses React rendering)
			rotatorRef.current.style.transform = `rotateY(${rotateY}deg) rotateX(${rotateX}deg)`

			// Update CSS custom properties for shine effects
			if (cardRef.current) {
				cardRef.current.style.setProperty('--pointer-x', `${x}%`)
				cardRef.current.style.setProperty('--pointer-y', `${y}%`)
				cardRef.current.style.setProperty('--pointer-from-center', Math.min(pointerFromCenter, 1).toString())
			}

			// Update shine and glare opacity directly
			shineRef.current.style.opacity = isInteracting ? '1' : '0'
			glareRef.current.style.opacity = isInteracting ? '0.6' : '0'
		},
		[isInteracting]
	)

	// Throttled mouse move handler with requestAnimationFrame
	const handleMouseMove = useCallback(
		(e: React.MouseEvent<HTMLDivElement>) => {
			if (!cardRef.current) return

			const rect = cardRef.current.getBoundingClientRect()
			const x = ((e.clientX - rect.left) / rect.width) * 100
			const y = ((e.clientY - rect.top) / rect.height) * 100

			// Only update if position changed significantly
			const xDiff = Math.abs(x - lastMousePosition.current.x)
			const yDiff = Math.abs(y - lastMousePosition.current.y)
			if (xDiff > 1 || yDiff > 1) {
				lastMousePosition.current = { x, y }

				// Cancel previous animation frame
				if (animationFrameRef.current) {
					cancelAnimationFrame(animationFrameRef.current)
				}

				// Schedule update for next frame
				animationFrameRef.current = requestAnimationFrame(() => {
					updateTransforms(x, y)
				})

				setIsInteracting(true)
			}
		},
		[updateTransforms]
	)

	const handleMouseEnter = useCallback(() => setIsHovering(true), [])
	const handleMouseLeave = useCallback(() => {
		setIsHovering(false)
		setIsInteracting(false)

		// Cancel any pending animation frame
		if (animationFrameRef.current) {
			cancelAnimationFrame(animationFrameRef.current)
			animationFrameRef.current = 0
		}

		// Force reset transforms when mouse leaves
		if (rotatorRef.current) {
			rotatorRef.current.style.transform = 'rotateY(0deg) rotateX(0deg)'
		}
		if (shineRef.current) {
			shineRef.current.style.opacity = '0'
		}
		if (glareRef.current) {
			glareRef.current.style.opacity = '0'
		}

		// Reset CSS custom properties
		if (cardRef.current) {
			cardRef.current.style.setProperty('--pointer-x', '50%')
			cardRef.current.style.setProperty('--pointer-y', '50%')
			cardRef.current.style.setProperty('--pointer-from-center', '0')
		}

		// Reset mouse position tracking
		lastMousePosition.current = { x: 50, y: 50 }
	}, [])

	// Cleanup animation frame on unmount
	useEffect(() => {
		return () => {
			if (animationFrameRef.current) {
				cancelAnimationFrame(animationFrameRef.current)
			}
		}
	}, [])

	// Memoize static styles that don't change
	const cardContainerStyle = {
		perspective: '2000px',
		transformStyle: 'preserve-3d' as const,
		zIndex: isInteracting ? 120 : 100,
	}

	const translaterStyle = {
		display: 'grid',
		perspective: '2000px',
		transformOrigin: 'center',
		willChange: 'transform',
		transformStyle: 'preserve-3d' as const,
	}

	const rotatorStyle = {
		transformStyle: 'preserve-3d' as const,
		boxShadow: isHovering
			? '0 0 20px 0px #00ffff, 0 0 40px 0px #ff00ff, 0 0 60px 0px #00ff00, inset 0 0 20px rgba(0, 255, 255, 0.1)'
			: '0 0 15px 0px rgba(0, 255, 255, 0.3), 0 0 30px 0px rgba(255, 0, 255, 0.2), inset 0 0 10px rgba(0, 255, 255, 0.05)',
		borderRadius: '12px',
		willChange: 'transform' as const,
		transition: 'box-shadow 0.4s ease, transform 0.6s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
		border: '1px solid rgba(0, 255, 255, 0.3)',
		background: 'linear-gradient(135deg, rgba(0, 0, 0, 0.9) 0%, rgba(20, 20, 40, 0.95) 50%, rgba(0, 0, 0, 0.9) 100%)',
		backdropFilter: 'blur(10px)',
	}

	const frontStyle = {
		backfaceVisibility: 'hidden' as const,
		transformStyle: 'preserve-3d' as const,
	}

	// Static shine styles (only opacity changes imperatively)
	const shineStyle = {
		background: `
			radial-gradient(
				farthest-corner circle at var(--pointer-x) var(--pointer-y),
				rgba(0, 255, 255, 0.1) 0%,
				rgba(255, 0, 255, 0.05) 10%,
				rgba(0, 0, 0, 0) 70%
			)
		`,
		backgroundBlendMode: 'screen',
		backgroundSize: '100% 100%',
		backgroundPosition: 'center',
		filter: 'brightness(calc((var(--pointer-from-center) + 0.7) * 0.7)) contrast(1.1) saturate(1)',
		mixBlendMode: 'screen' as const,
		// clipPath: 'inset(2% 8.5% 52.5% 8.5%)',
		width: '100%',
		display: 'grid',
		gridArea: '1/1',
		imageRendering: 'auto' as const,
		transformStyle: 'preserve-3d' as const,
		opacity: 0, // Will be updated imperatively
		transition: 'opacity 0.3s ease',
	}

	const glareStyle = {
		background: `
			radial-gradient(
				farthest-corner circle at var(--pointer-x) var(--pointer-y),
				rgba(0, 255, 255, 0.1) 0%,
				rgba(255, 0, 255, 0.05) 10%,
				rgba(0, 0, 0, 0.0) 50%
			)
		`,
		backgroundSize: '100% 100%',
		backgroundPosition: 'center',
		mixBlendMode: 'screen' as const,
		width: '100%',
		display: 'grid',
		gridArea: '1/1',
		transformStyle: 'preserve-3d' as const,
		opacity: 0, // Will be updated imperatively
		transition: 'opacity 0.3s ease',
	}

	return (
		<motion.div
			ref={cardRef}
			initial={{ y: 24, opacity: 0 }}
			animate={{ y: 0, opacity: 1 }}
			transition={{ type: 'spring', stiffness: 120, damping: 16 }}
			className={`card relative rounded-xl overflow-visible group cursor-pointer w-full max-w-md mx-auto ${
				isInteracting ? 'interacting' : ''
			} ${isHovering ? 'active' : ''}`}
			onMouseMove={handleMouseMove}
			onMouseEnter={handleMouseEnter}
			onMouseLeave={handleMouseLeave}
			style={cardContainerStyle}
		>
			{/* Card translater - handles 3D positioning */}
			<div ref={translaterRef} className="card__translater w-full relative outline-none" style={translaterStyle}>
				{/* Card rotator - handles 3D rotation and shine effects */}
				<div ref={rotatorRef} className="card__rotator relative rounded-xl outline-none w-full" style={rotatorStyle}>
					{/* Card front content */}
					<div className="card__front relative w-full h-full" style={frontStyle}>
						{/* Main card content */}
						<div className="relative z-10 p-8 rounded-xl">
							{/* Crypto punk header with glitch effect */}
							<div className="relative mb-6">
								<p className="text-sm uppercase tracking-wider text-cyan-400 font-mono font-bold">{card.leadInText}</p>
								{/* Subtle underline effect */}
								<div className="absolute bottom-0 left-0 w-0 h-px bg-gradient-to-r from-cyan-400 to-magenta-400 group-hover:w-full transition-all duration-500" />
							</div>

							{/* Main title with neon glow */}
							<div className="relative mt-3">
								<h2 className="text-4xl font-black font-mono bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 via-magenta-400 to-green-400 relative">
									{card.revealText}
								</h2>
								<h2 className="text-4xl font-black font-mono bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 via-magenta-400 to-green-400 absolute inset-0 top-0 left-0 hover:blur-sm transition-all duration-300 opacity-80">
									{card.revealText}
								</h2>
							</div>

							{card.media?.kind === 'url' && (
								<div className="mt-6 relative group">
									<img
										className="w-full rounded-lg ring-1 ring-cyan-400/30 transition-all duration-300 group-hover:ring-cyan-400/60"
										src={card.media.src || '/placeholder.svg'}
										alt={card.media.alt ?? ''}
									/>
									{/* Crypto punk scan lines overlay */}
									<div className="absolute inset-0 bg-gradient-to-b from-transparent via-cyan-400/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
								</div>
							)}
							{card.media?.kind === 'svg' && (
								// Note: dangerouslySetInnerHTML is necessary here to render SVG content from the API
								// eslint-disable-next-line react/no-danger
								<div className="mt-6 relative group">
									<div
										className="[&>svg]:w-full [&>svg]:h-auto [&>svg]:rounded-lg [&>svg]:ring-1 [&>svg]:ring-cyan-400/30 transition-all duration-300 group-hover:[&>svg]:ring-cyan-400/60"
										dangerouslySetInnerHTML={{ __html: card.media.svg }}
									/>
									{/* Crypto punk scan lines overlay */}
									<div className="absolute inset-0 bg-gradient-to-b from-transparent via-cyan-400/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
								</div>
							)}

							{!!card.highlights?.length && (
								<ul className="mt-6 grid gap-4 sm:grid-cols-2">
									{card.highlights.map((highlight, index) => (
										<li
											key={`${highlight.label}-${highlight.value}-${index}`}
											className="rounded-lg border border-cyan-400/10 bg-gradient-to-br from-cyan-400/3 to-magenta-400/3 p-4 flex items-center justify-between group/item hover:border-cyan-400/25 hover:bg-gradient-to-br hover:from-cyan-400/8 hover:to-magenta-400/8 transition-all duration-300"
										>
											<span className="text-sm text-cyan-300/80 font-mono">{highlight.label}</span>
											<span className="font-bold text-cyan-100/90 font-mono">{highlight.value}</span>
											{/* Subtle hover glow effect */}
											<div className="absolute inset-0 -z-10 bg-gradient-to-r from-cyan-400/5 to-magenta-400/5 rounded-lg opacity-0 group-hover/item:opacity-100 transition-opacity duration-300" />
										</li>
									))}
								</ul>
							)}

							{card.footnote && (
								<div className="mt-4 relative">
									<p className="text-sm text-cyan-400/70 font-mono italic">{card.footnote}</p>
									{/* Subtle underline effect */}
									<div className="absolute bottom-0 left-0 w-0 h-px bg-gradient-to-r from-cyan-400 to-magenta-400 group-hover:w-full transition-all duration-500" />
								</div>
							)}
						</div>

						{/* Card shine effect - crypto punk holo shimmer */}
						<div ref={shineRef} className="card__shine absolute inset-0 pointer-events-none" style={shineStyle} />

						{/* Card glare effect - subtle radial highlight */}
						<div ref={glareRef} className="card__glare absolute inset-0 pointer-events-none" style={glareStyle} />
					</div>
				</div>
			</div>

			{/* Crypto punk grid pattern background */}
			<div className="absolute inset-0 rounded-xl opacity-5 group-hover:opacity-10 transition-opacity duration-300 pointer-events-none">
				<div className="absolute inset-0 bg-[linear-gradient(90deg,transparent_0%,rgba(0,255,255,0.1)_50%,transparent_100%),linear-gradient(0deg,transparent_0%,rgba(0,255,255,0.1)_50%,transparent_100%)] bg-[length:20px_20px]" />
			</div>
		</motion.div>
	)
}
