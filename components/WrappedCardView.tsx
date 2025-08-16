"use client"

import type { WrappedCard } from "@/types/wrapped"
import { motion } from "framer-motion"

export function WrappedCardView({ card }: { card: WrappedCard }) {
  return (
    <motion.div
      initial={{ y: 24, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ type: "spring", stiffness: 120, damping: 16 }}
      className="relative rounded-2xl p-6 bg-neutral-950/70 border border-neutral-800 shadow-lg overflow-hidden"
    >
      <p className="text-xs uppercase tracking-wider text-neutral-400">{card.leadInText}</p>
      <h2 className="mt-2 text-3xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 via-emerald-300 to-rose-300">
        {card.revealText}
      </h2>

      {card.media?.kind === "url" && (
        <img
          className="mt-4 w-full rounded-xl ring-1 ring-neutral-800"
          src={card.media.src || "/placeholder.svg"}
          alt={card.media.alt ?? ""}
        />
      )}
      {card.media?.kind === "svg" && (
        <div className="mt-4 [&>svg]:w-full [&>svg]:h-auto" dangerouslySetInnerHTML={{ __html: card.media.svg }} />
      )}

      {!!card.highlights?.length && (
        <ul className="mt-4 grid gap-2 sm:grid-cols-2">
          {card.highlights.map((h, i) => (
            <li
              key={i}
              className="rounded-lg border border-neutral-800 bg-neutral-900/60 p-3 flex items-center justify-between"
            >
              <span className="text-sm text-neutral-400">{h.label}</span>
              <span className="font-semibold">{h.value}</span>
            </li>
          ))}
        </ul>
      )}

      {card.footnote && <p className="mt-3 text-xs text-neutral-500">{card.footnote}</p>}
    </motion.div>
  )
}
