import { put, list, get } from "@vercel/blob"
import type { WrappedCard } from "@/types/wrapped"

type WrappedDeck = {
  address: string
  snapshotAt: string // ISO
  version: number
  cards: WrappedCard[]
  summary?: Record<string, unknown>
}

const hasBlob = Boolean(process.env.BLOB_READ_WRITE_TOKEN)
const mem = new Map<string, WrappedDeck>()

function key(addressLower: string, snapshotAt: string) {
  return `wrapped/${addressLower}/${snapshotAt}.json`
}

export async function saveDeck(deck: WrappedDeck): Promise<{ url: string }> {
  const k = key(deck.address.toLowerCase(), deck.snapshotAt)
  const body = JSON.stringify(deck, null, 2)

  if (hasBlob) {
    const { url } = await put(k, body, {
      access: "public",
      contentType: "application/json",
      addRandomSuffix: false,
    })
    return { url }
  } else {
    mem.set(k, deck)
    return { url: `mem://${k}` }
  }
}

export async function getLatestDeck(addressLower: string): Promise<WrappedDeck | null> {
  const prefix = `wrapped/${addressLower}/`
  if (hasBlob) {
    const { blobs } = await list({ prefix })
    const latest = blobs.sort((a, b) => (a.pathname > b.pathname ? -1 : 1))[0]
    if (!latest) return null
    const res = await get(latest.url)
    return (await res.json()) as WrappedDeck
  } else {
    const keys = [...mem.keys()]
      .filter((k) => k.startsWith(prefix))
      .sort()
      .reverse()
    if (!keys.length) return null
    return mem.get(keys[0]) ?? null
  }
}
