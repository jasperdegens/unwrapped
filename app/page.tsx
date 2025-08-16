"use client"
import DegenGradient from "@/components/DegenGradient"

export default function Home() {
  return (
    <main className="min-h-screen text-neutral-200">
      <DegenGradient />
      <div className="mx-auto max-w-xl px-6 py-24 text-center">
        <h1 className="text-5xl font-black leading-tight bg-clip-text text-transparent bg-gradient-to-r from-sky-400 via-violet-400 to-amber-300">
          wallet wrapped
        </h1>
        <p className="mt-3 text-neutral-400">drop your addy, flex your lore. bags, wins, rugs—unfiltered.</p>

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
            placeholder="0xYourAddy..."
            className="flex-1 rounded-lg bg-neutral-900 border border-neutral-800 px-4 py-3 text-sm outline-none focus:ring-2 ring-emerald-400/40"
          />
          <button className="rounded-lg bg-emerald-500/90 text-black font-bold px-4 py-3 hover:bg-emerald-400">
            ape in
          </button>
        </form>

        <div className="mt-6 text-xs text-neutral-500">no wallet connect. no kyc. just vibes.</div>
      </div>
    </main>
  )
}
