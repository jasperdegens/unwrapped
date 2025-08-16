"use client"
import DegenGradient from "@/components/DegenGradient"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"

export default function Home() {
  return (
    <main className="min-h-screen text-slate-200">
      <DegenGradient />
      <div className="mx-auto max-w-xl px-6 py-24 text-center">
        <h1 className="text-6xl font-black leading-tight text-slate-100 mb-2 font-sans">wallet wrapped</h1>
        <div className="text-lg font-bold text-slate-300 mb-4 font-sans">2024 Analytics</div>

        <p className="mt-3 text-slate-300 text-lg font-mono">
          Enter your wallet address to view analytics.
          <br />
          <span className="text-slate-200">Portfolio insights and transaction history</span>
        </p>

        <Card className="mt-8 bg-slate-800/50 border-slate-600">
          <CardContent className="p-6">
            <form
              className="flex items-center gap-2"
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
              <Input
                name="address"
                placeholder="0x... wallet address"
                className="flex-1 bg-slate-700/50 border-slate-600 text-slate-100 font-mono"
              />
              <Button type="submit" size="lg" className="bg-slate-600 hover:bg-slate-500 text-slate-100 font-sans">
                Analyze
              </Button>
            </form>
          </CardContent>
        </Card>

        <div className="mt-8 space-y-2">
          <div className="text-xs text-slate-400 font-mono">No wallet connection required. Privacy focused.</div>
          <div className="text-xs text-slate-500 font-mono">On-chain analytics platform</div>
        </div>

        <div className="mt-12 text-xs text-slate-500 max-w-md mx-auto font-mono">
          <p>Built for transparency. DYOR. Not financial advice.</p>
        </div>
      </div>
    </main>
  )
}
