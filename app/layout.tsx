import type React from "react"
import type { Metadata } from "next"
import { GeistSans } from "geist/font/sans"
import { GeistMono } from "geist/font/mono"
import "./globals.css"

export const metadata: Metadata = {
  title: "wallet wrapped - flex your degen lore",
  description:
    "Drop your ETH address and get a sick Spotify Wrapped style summary of your on-chain degeneracy. Bags, wins, rugs—unfiltered.",
  generator: "wallet-wrapped",
  keywords: ["crypto", "ethereum", "wallet", "defi", "nft", "degen", "wrapped", "analytics"],
  authors: [{ name: "degen collective" }],
  openGraph: {
    title: "wallet wrapped - flex your degen lore",
    description: "Drop your ETH address and get a sick summary of your on-chain degeneracy",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "wallet wrapped - flex your degen lore",
    description: "Drop your ETH address and get a sick summary of your on-chain degeneracy",
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <head>
        <style>{`
html {
  font-family: ${GeistSans.style.fontFamily};
  --font-sans: ${GeistSans.variable};
  --font-mono: ${GeistMono.variable};
}
        `}</style>
      </head>
      <body>{children}</body>
    </html>
  )
}
