"use client"

import { useState, useEffect } from "react"
import { WrappedCardView } from "@/components/WrappedCardView"
import { WrappedCardGallery } from "@/components/WrappedCardGallery"
import type { WrappedCard } from "@/types/wrapped"

interface WrappedCardPresentationProps {
  cards: WrappedCard[]
  className?: string
}

export function WrappedCardPresentation({ cards, className = "" }: WrappedCardPresentationProps) {
  const [phase, setPhase] = useState<"reveal" | "stack">("reveal")
  const [currentCardIndex, setCurrentCardIndex] = useState(0)
  const [showingDetails, setShowingDetails] = useState(false)
  const address = cards[0]?.address || ""
  const truncatedAddress = address ? `${address.slice(0, 6)}...${address.slice(-4)}` : ""

  useEffect(() => {
    if (phase !== "reveal" || showingDetails) return

    const timer = setTimeout(() => {
      setShowingDetails(true)
    }, 2000)

    return () => clearTimeout(timer)
  }, [phase, currentCardIndex, showingDetails])

  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      if (phase === "reveal" && showingDetails && event.key === "ArrowRight") {
        handleNext()
      }
      if (event.key === "Escape") {
        setPhase("stack")
      }
    }

    window.addEventListener("keydown", handleKeyPress)
    return () => window.removeEventListener("keydown", handleKeyPress)
  }, [phase, showingDetails, currentCardIndex, cards.length])

  const handleNext = () => {
    if (!showingDetails) return

    if (currentCardIndex < cards.length - 1) {
      setCurrentCardIndex((prev) => prev + 1)
      setShowingDetails(false)
    } else {
      setPhase("stack")
    }
  }

  if (phase === "stack") {
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

  return (
    <div className={`${className} min-h-screen flex items-center justify-center bg-black`}>
      <div className="relative w-96 h-[500px] flex items-center justify-center">
        {/* Lead-in text phase */}
        <div
          className={`absolute inset-0 flex items-center justify-center transition-all duration-1000 ${
            showingDetails ? "opacity-0 scale-95 pointer-events-none -z-10" : "opacity-100 scale-100 z-10"
          }`}
        >
          <div className="text-center">
            <h2 className="text-4xl font-bold text-white">{currentCard.leadInText}</h2>
          </div>
        </div>

        {/* Card details phase */}
        <div
          className={`absolute inset-0 transition-all duration-1000 ${
            showingDetails ? "opacity-100 scale-100 z-10" : "opacity-0 scale-105 pointer-events-none -z-10"
          }`}
        >
          <div className="w-full h-full">
            <WrappedCardView card={currentCard} />
          </div>
        </div>
      </div>

      {showingDetails && (
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2">
          <p className="text-white/60 text-sm">→ or ESC</p>
        </div>
      )}
    </div>
  )
}
