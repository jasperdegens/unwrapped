import { ImageResponse } from "next/og"

export const size = { width: 1200, height: 630 }
export const contentType = "image/png"

export async function GET() {
  // Minimal OG—customize later
  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        background: "linear-gradient(135deg,#0ea5e9,#a78bfa,#f97316)",
        color: "#0b0b0b",
        fontSize: 48,
        padding: 64,
      }}
    >
      <div>
        <div style={{ fontSize: 24, opacity: 0.8 }}>wallet wrapped</div>
        <div style={{ fontWeight: 800 }}>gm, degen — flex those bags</div>
      </div>
    </div>,
    size,
  )
}
