import { type NextRequest, NextResponse } from "next/server"
import { deps } from "@/lib/deps"
import { buildWrappedCard } from "@/lib/builder"
import { saveDeck } from "@/lib/storage"
import { shortAddr, nowIso } from "@/lib/util"
import { TopTokensGen } from "@/generators/top-tokens"
import { BestTradeGen } from "@/generators/best-trade"
import { TopNftsPosterGen } from "@/generators/top-nfts"

export const runtime = "nodejs"

const registry = [TopTokensGen, BestTradeGen, TopNftsPosterGen]

export async function POST(req: NextRequest) {
  const { address, force } = await req.json()
  if (!/^0x[a-fA-F0-9]{40}$/.test(address ?? "")) {
    return NextResponse.json({ error: "invalid address, anon" }, { status: 400 })
  }

  const snapshotAt = nowIso()
  const addrLower = address.toLowerCase()

  // TODO: caching via Blob list/get if force !== true

  const ctx = undefined // optional pre-normalized context
  const cards = (
    await Promise.all(
      registry.map(async (gen) => {
        try {
          const card = await buildWrappedCard(
            deps as any,
            gen,
            { address: addrLower as `0x${string}`, snapshotAt },
            ctx,
          )
          return card
        } catch {
          return null
        }
      }),
    )
  ).filter(Boolean)

  const deck = { address: addrLower, snapshotAt, version: 1, cards: cards as any[] }
  const { url } = await saveDeck(deck)

  return NextResponse.json({
    wrappedId: `${addrLower}:${snapshotAt}`,
    url,
    count: cards.length,
    short: shortAddr(addrLower),
  })
}
