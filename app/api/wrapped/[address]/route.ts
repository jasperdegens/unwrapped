import { type NextRequest, NextResponse } from "next/server"
import { getLatestDeck } from "@/lib/storage"

export async function GET(_req: NextRequest, { params }: { params: { address: string } }) {
  const address = params.address?.toLowerCase()
  if (!/^0x[a-fA-F0-9]{40}$/.test(address ?? "")) {
    return NextResponse.json({ error: "ngmi: bad address" }, { status: 400 })
  }
  const deck = await getLatestDeck(address)
  if (!deck) return NextResponse.json({ error: "no wrap yet—hit /api/generate" }, { status: 404 })
  return NextResponse.json(deck)
}
