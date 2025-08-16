"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { WrappedCardView } from "@/components/WrappedCardView"
import { WrappedCardStack } from "@/components/WrappedCardStack"
import type { WrappedCard } from "@/types/wrapped"

interface WrappedCardPresentationProps {
  cards: WrappedCard[]
  className?: string
}

export function WrappedCardPresentation({ cards, className = "" }: WrappedCardPresentationProps) {
  const [phase, setPhase] = useState<"reveal" | "stack">("reveal")
  const [currentCardIndex, setCurrentCardIndex] = useState(0)
  const [showingDetails, setShowingDetails] = useState(false)
  const [isAnimating, setIsAnimating] = useState(false)

  useEffect(() => {
    if (phase !== "reveal" || isAnimating || showingDetails) return

    const timer = setTimeout(() => {
      // Show details after 2 seconds of lead-in
      setShowingDetails(true)
    }, 2000)

    return () => clearTimeout(timer)
  }, [phase, currentCardIndex, showingDetails, isAnimating])

  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      if (phase === "reveal" && showingDetails && event.key === "ArrowRight") {
        handleNext()
      }
    }

    window.addEventListener("keydown", handleKeyPress)
    return () => window.removeEventListener("keydown", handleKeyPress)
  }, [phase, showingDetails, currentCardIndex, cards.length])

  const handleNext = () => {
    if (!showingDetails) return

    if (currentCardIndex < cards.length - 1) {
      setIsAnimating(true)
      setTimeout(() => {
        setCurrentCardIndex((prev) => prev + 1)
        setShowingDetails(false)
        setIsAnimating(false)
      }, 500)
    } else {
      // All cards revealed, move to stack phase
      setPhase("stack")
    }
  }

  const skipToStack = () => {
    setPhase("stack")
  }

  const resetToReveal = () => {
    setPhase("reveal")
    setCurrentCardIndex(0)
    setShowingDetails(false)
    setIsAnimating(false)
  }

  if (phase === "stack") {
    return (
      <div className={className}>
        <div className="text-center mb-6">
          <Button onClick={resetToReveal} variant="outline" className="btn-crypto bg-transparent">
            ← Watch Reveal Again
          </Button>
        </div>
        <WrappedCardStack cards={cards} />
      </div>
    )
  }

  const currentCard = cards[currentCardIndex]

  return (
    <div className={`${className} min-h-screen flex flex-col items-center justify-center relative`}>
      {/* Skip button */}
      <div className="absolute top-8 right-8 z-50">
        <Button onClick={skipToStack} variant="outline" className="btn-degen bg-transparent">
          Skip to Cards →
        </Button>
      </div>

      {/* Progress indicator */}
      <div className="absolute top-8 left-8 z-50">
        <Badge variant="secondary" className="bg-purple-900/30 border-2 border-purple-400/30 px-4 py-2">
          {currentCardIndex + 1} / {cards.length}
        </Badge>
      </div>

      {/* Card reveal area */}
      <div className="relative w-96 h-[500px] flex items-center justify-center">
        {/* Lead-in text phase */}
        <div
          className={`absolute inset-0 flex items-center justify-center transition-all duration-1000 ${
            showingDetails ? "opacity-0 scale-95 pointer-events-none" : "opacity-100 scale-100"
          }`}
        >
          <div className="text-center p-8 bg-gradient-to-br from-purple-900/40 to-pink-900/40 backdrop-blur-lg rounded-3xl border-2 border-purple-400/30 shadow-2xl">
            <h2 className="text-3xl font-bold text-white mb-4 animate-pulse">{currentCard.leadInText}</h2>
            <div className="w-12 h-1 bg-gradient-to-r from-purple-400 to-pink-400 mx-auto rounded-full animate-pulse"></div>
          </div>
        </div>

        {/* Card details phase */}
        <div
          className={`absolute inset-0 transition-all duration-1000 ${
            showingDetails ? "opacity-100 scale-100" : "opacity-0 scale-105 pointer-events-none"
          } ${isAnimating ? "animate-pulse" : ""}`}
        >
          <div className="w-full h-full overflow-hidden">
            <WrappedCardView card={currentCard} />
          </div>
        </div>
      </div>

      {showingDetails && (
        <div className="mt-8 text-center animate-fade-in">
          <p className="text-purple-200 text-lg font-medium mb-4">{currentCard.revealText}</p>
          <Button onClick={handleNext} className="btn-crypto" size="lg">
            {currentCardIndex < cards.length - 1 ? "Next Card →" : "View All Cards →"}
          </Button>
          <p className="text-purple-300 text-sm mt-2">or press → arrow key</p>
        </div>
      )}
    </div>
  )
}
