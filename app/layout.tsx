import type React from "react"
import type { Metadata } from "next"
import { Space_Mono } from "next/font/google"
import { Orbitron } from "next/font/google"
import "./globals.css"

const spaceMono = Space_Mono({
  subsets: ["latin"],
  weight: ["400", "700"],
  variable: "--font-mono",
  display: "swap",
})

const orbitron = Orbitron({
  subsets: ["latin"],
  weight: ["400", "700", "900"],
  variable: "--font-sans",
  display: "swap",
})

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
    <html lang="en" className={`${orbitron.variable} ${spaceMono.variable} antialiased`}>
      <body>{children}</body>
    </html>
  )
}
