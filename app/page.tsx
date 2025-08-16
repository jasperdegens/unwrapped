"use client"
import DegenGradient from "@/components/DegenGradient"

export default function Home() {
  return (
    <main className="min-h-screen text-neutral-200">
      <DegenGradient />
      <div className="mx-auto max-w-xl px-6 py-24 text-center">
        <h1 className="text-6xl font-black leading-tight bg-clip-text text-transparent bg-gradient-to-r from-orange-400 via-emerald-400 to-blue-400 mb-2">
          wallet wrapped
        </h1>
        <div className="text-lg font-bold text-emerald-400 mb-4">🚀 2024 DEGEN EDITION 🚀</div>

        <p className="mt-3 text-neutral-400 text-lg">
          drop your addy, flex your lore.
          <br />
          <span className="text-emerald-400">bags, wins, rugs</span>—unfiltered degen analytics
        </p>

        <form
          className="mt-8 flex items-center gap-2"
          action="/w"
          method="get"
          onSubmit={(e) => {
            e.preventDefault()
            const f = e.currentTarget as HTMLFormElement
            const input = f.querySelector('input[name="address"]') as HTMLInputElement
            if (!input?.value) return
            window.location.href = `/w/${input.value}`
          }}
        >
          <input
            name="address"
            placeholder="0xYourAddy... (paste that wallet)"
            className="flex-1 rounded-lg bg-neutral-900/80 backdrop-blur border border-emerald-500/30 px-4 py-3 text-sm outline-none focus:ring-2 ring-emerald-400/40 focus:border-emerald-400/60 transition-all"
          />
          <button className="rounded-lg bg-gradient-to-r from-emerald-500 to-emerald-400 text-black font-bold px-6 py-3 hover:from-emerald-400 hover:to-emerald-300 transition-all transform hover:scale-105 shadow-lg shadow-emerald-500/25">
            🚀 ape in
          </button>
        </form>

        <div className="mt-8 space-y-2">
          <div className="text-xs text-neutral-500">no wallet connect. no kyc. just pure degen vibes.</div>
          <div className="text-xs text-emerald-400/60">💎🙌 diamond hands only 🙌💎</div>
        </div>

        <div className="mt-12 text-xs text-neutral-600 max-w-md mx-auto">
          <p>⚠️ Not financial advice. DYOR. We're all gonna make it... probably.</p>
        </div>
      </div>
    </main>
  )
}
