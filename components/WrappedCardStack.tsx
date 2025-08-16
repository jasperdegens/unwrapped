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
  const cardRef = useRef<HTMLDivElement>(null)
  const startPos = useRef({ x: 0, y: 0 })

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
    setDragRotation(deltaX * 0.1) // Subtle rotation based on horizontal drag
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

          return (
            <div
              key={`${card.id}-${index}`}
              ref={isTopCard ? cardRef : null}
              className={`absolute transition-all duration-300 ease-out ${
                isTopCard ? "cursor-pointer" : "pointer-events-none"
              }`}
              style={{
                transform: isTopCard
                  ? `translateX(${dragOffset.x}px) translateY(${dragOffset.y + yOffset}px) scale(${scale}) rotate(${dragRotation}deg)`
                  : `translateY(${yOffset}px) scale(${scale}) rotate(${rotation}deg)`,
                zIndex,
              }}
              onMouseDown={isTopCard ? handleMouseDown : undefined}
              onMouseMove={isTopCard ? handleMouseMove : undefined}
              onMouseUp={isTopCard ? handleMouseUp : undefined}
              onTouchStart={isTopCard ? handleTouchStart : undefined}
              onTouchMove={isTopCard ? handleTouchMove : undefined}
              onTouchEnd={isTopCard ? handleTouchEnd : undefined}
            >
              <div className="w-96 h-[500px] overflow-hidden">
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
