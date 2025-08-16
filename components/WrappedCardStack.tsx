"use client"

import type React from "react"

import { useState, useRef } from "react"
import { WrappedCardView } from "@/components/WrappedCardView"
import type { WrappedCard } from "@/types/wrapped"
import { Badge } from "@/components/ui/badge"

interface WrappedCardStackProps {
  cards: WrappedCard[]
  className?: string
}

export function WrappedCardStack({ cards, className = "" }: WrappedCardStackProps) {
  const [cardQueue, setCardQueue] = useState(cards)
  const [isDragging, setIsDragging] = useState(false)
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 })
  const [dragRotation, setDragRotation] = useState(0)
  const [mousePos, setMousePos] = useState({ x: 50, y: 50 })
  const cardRef = useRef<HTMLDivElement>(null)
  const startPos = useRef({ x: 0, y: 0 })

  const handleCardMouseMove = (e: React.MouseEvent, cardElement: HTMLDivElement) => {
    const rect = cardElement.getBoundingClientRect()
    const x = ((e.clientX - rect.left) / rect.width) * 100
    const y = ((e.clientY - rect.top) / rect.height) * 100

    setMousePos({ x, y })

    // Update CSS variables for holographic effects
    cardElement.style.setProperty("--mx", `${x}%`)
    cardElement.style.setProperty("--my", `${y}%`)
    cardElement.style.setProperty("--posx", `${x}%`)
    cardElement.style.setProperty("--posy", `${y}%`)

    // Add subtle 3D rotation based on mouse position
    const rotateX = (y - 50) * 0.1
    const rotateY = (x - 50) * -0.1
    cardElement.style.setProperty("--rx", `${rotateY}deg`)
    cardElement.style.setProperty("--ry", `${rotateX}deg`)
  }

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true)
    startPos.current = { x: e.clientX, y: e.clientY }
    e.preventDefault()
  }

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return

    const deltaX = e.clientX - startPos.current.x
    const deltaY = e.clientY - startPos.current.y

    setDragOffset({ x: deltaX, y: deltaY })
    setDragRotation(deltaX * 0.1)
  }

  const handleMouseUp = () => {
    if (!isDragging) return

    const threshold = 150
    const shouldSwipe = Math.abs(dragOffset.x) > threshold

    if (shouldSwipe) {
      const direction = dragOffset.x > 0 ? 1 : -1
      setDragOffset({ x: direction * 1000, y: dragOffset.y })

      setTimeout(() => {
        // Move current card to bottom of queue
        setCardQueue((prev) => [...prev.slice(1), prev[0]])
        setDragOffset({ x: 0, y: 0 })
        setDragRotation(0)
      }, 300)
    } else {
      // Snap back to center
      setDragOffset({ x: 0, y: 0 })
      setDragRotation(0)
    }

    setIsDragging(false)
  }

  const handleTouchStart = (e: React.TouchEvent) => {
    setIsDragging(true)
    startPos.current = { x: e.touches[0].clientX, y: e.touches[0].clientY }
  }

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging) return

    const deltaX = e.touches[0].clientX - startPos.current.x
    const deltaY = e.touches[0].clientY - startPos.current.y

    setDragOffset({ x: deltaX, y: deltaY })
    setDragRotation(deltaX * 0.1)
  }

  const handleTouchEnd = () => {
    handleMouseUp()
  }

  if (!cardQueue || cardQueue.length === 0) {
    return (
      <div className={`text-center py-12 ${className}`}>
        <p className="text-purple-200 text-lg">No cards to display 🤷‍♂️</p>
      </div>
    )
  }

  return (
    <div className={`relative ${className}`}>
      {/* Card counter */}
      <div className="text-center mb-8">
        <Badge variant="secondary" className="text-sm bg-purple-900/30 border-2 border-purple-400/30 px-4 py-2">
          Swipe to cycle through cards! 📱
        </Badge>
      </div>

      {/* Card stack */}
      <div className="relative max-w-2xl mx-auto h-[600px] flex justify-center items-center">
        {cardQueue.slice(0, 3).map((card, index) => {
          const isTopCard = index === 0
          const zIndex = 30 - index
          const scale = 1 - index * 0.03
          const yOffset = index * 6
          const rotation = index * 1.5

          const getRarity = (card: WrappedCard) => {
            if (card.type === "best-trade") return "rainbow"
            if (card.type === "account-metadata") return "gold"
            return "holo"
          }

          return (
            <div
              key={`${card.id}-${index}`}
              ref={isTopCard ? cardRef : null}
              className={`holo-card absolute transition-all duration-300 ease-out ${
                isTopCard ? "cursor-pointer active" : "pointer-events-none"
              }`}
              data-rarity={getRarity(card)}
              style={{
                transform: isTopCard
                  ? `translateX(${dragOffset.x}px) translateY(${dragOffset.y + yOffset}px) scale(${scale}) rotate(${dragRotation}deg)`
                  : `translateY(${yOffset}px) scale(${scale}) rotate(${rotation}deg)`,
                zIndex,
              }}
              onMouseDown={isTopCard ? handleMouseDown : undefined}
              onMouseMove={
                isTopCard
                  ? (e) => {
                      handleMouseMove(e)
                      if (cardRef.current) {
                        handleCardMouseMove(e, cardRef.current)
                      }
                    }
                  : undefined
              }
              onMouseUp={isTopCard ? handleMouseUp : undefined}
              onTouchStart={isTopCard ? handleTouchStart : undefined}
              onTouchMove={isTopCard ? handleTouchMove : undefined}
              onTouchEnd={isTopCard ? handleTouchEnd : undefined}
            >
              <div className="holo-card__rotator w-96 h-[500px] overflow-hidden">
                <div className="holo-card__shine"></div>
                <div className="holo-card__glare"></div>
                <WrappedCardView card={card} />
              </div>
            </div>
          )
        })}
      </div>

      {/* Instructions */}
      <div className="mt-8 text-center">
        <Badge
          variant="secondary"
          className="text-purple-200 text-lg font-medium bg-purple-900/30 border-2 border-purple-400/30 px-6 py-3"
        >
          Swipe left/right to cycle • Cards respawn! 🔄✨
        </Badge>
      </div>
    </div>
  )
}
