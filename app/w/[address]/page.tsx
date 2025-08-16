import DegenGradient from "@/components/DegenGradient"
import { WrappedCardView } from "@/components/WrappedCardView"

async function getDeck(address: string) {
  const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL ?? ""}/api/wrapped/${address}`, { cache: "no-store" })
  return res.ok ? await res.json() : null
}

export default async function WrappedPage({ params }: { params: { address: string } }) {
  const deck = await getDeck(params.address)
  return (
    <main className="min-h-screen text-neutral-200">
      <DegenGradient />
      <div className="mx-auto max-w-3xl px-6 py-16">
        {!deck ? (
          <div className="text-center text-neutral-400">no wrap yet—hit generate on the home page, anon.</div>
        ) : (
          <>
            <header className="mb-6">
              <h1 className="text-2xl font-bold">
                wrap for <span className="font-mono">{params.address}</span>
              </h1>
              <p className="text-sm text-neutral-500">snapshot {new Date(deck.snapshotAt).toLocaleString()}</p>
            </header>

            <div className="grid gap-6">
              {deck.cards.map((c: any, i: number) => (
                <WrappedCardView key={i} card={c} />
              ))}
            </div>
          </>
        )}
      </div>
    </main>
  )
}
