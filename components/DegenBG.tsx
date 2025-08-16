"use client"

import { useEffect, useRef } from "react"

export function DegenBG() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    // Set canvas size
    const resizeCanvas = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }
    resizeCanvas()

    // Logo images array
    const logoSources = [
      "/logos/ape.webp",
      "/logos/eth.png",
      "/logos/pepe.png",
      "/logos/shiba.png",
      "/logos/uni.webp",
      "/logos/usdc.webp",
    ]

    const loadedImages: HTMLImageElement[] = []
    let imagesLoaded = 0

    // Load all logo images
    logoSources.forEach((src, index) => {
      const img = new Image()
      img.onload = () => {
        imagesLoaded++
        loadedImages[index] = img
      }
      img.onerror = () => {
        imagesLoaded++
        console.log(`[v0] Failed to load logo: ${src}`)
      }
      img.src = src
    })

    const trails: Trail[] = []

    class Trail {
      x: number
      y: number
      size: number
      alpha: number
      logoId: number
      image: HTMLImageElement | null
      angle: number
      length: number
      speed: number

      constructor(x: number, y: number) {
        this.x = x
        this.y = y
        this.size = Math.random() * 20 + 15
        this.alpha = 1
        this.logoId = Math.floor(Math.random() * loadedImages.length)
        this.image = loadedImages[this.logoId] || null
        this.angle = Math.random() * Math.PI * 2
        this.length = Math.random() * 30 + 10
        this.speed = Math.random() * 1 + 1
      }

      update() {
        this.alpha -= 0.008
        this.x += Math.cos(this.angle) * this.speed
        this.y += Math.sin(this.angle) * this.speed
      }

      draw() {
        ctx.save()
        ctx.globalAlpha = this.alpha
        ctx.translate(this.x, this.y)

        if (this.image) {
          ctx.drawImage(this.image, -this.size / 2, -this.size / 2, this.size, this.size)
        }

        ctx.restore()
      }
    }

    function createTrail(x: number, y: number) {
      trails.push(new Trail(x, y))
    }

    function animate() {
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      // Update and draw trails with smoother removal
      for (let i = trails.length - 1; i >= 0; i--) {
        const trail = trails[i]
        trail.update()
        trail.draw()
        if (trail.alpha <= 0.01) {
          trails.splice(i, 1)
        }
      }

      requestAnimationFrame(animate)
    }

    // Start animation when images are loaded
    const checkImagesLoaded = () => {
      if (imagesLoaded >= logoSources.length) {
        animate()
      } else {
        setTimeout(checkImagesLoaded, 100)
      }
    }
    checkImagesLoaded()

    // Mouse interaction
    const handleMouseMove = (event: MouseEvent) => {
      createTrail(event.clientX, event.clientY)
    }

    const randomTrailInterval = setInterval(() => {
      createTrail(Math.random() * canvas.width, Math.random() * canvas.height)
    }, 600) // reduced interval from 800ms to 300ms for more frequent spawning

    // Event listeners
    window.addEventListener("mousemove", handleMouseMove)
    window.addEventListener("resize", resizeCanvas)

    // Cleanup
    return () => {
      window.removeEventListener("mousemove", handleMouseMove)
      window.removeEventListener("resize", resizeCanvas)
      clearInterval(randomTrailInterval)
    }
  }, [])

  return (
    <canvas ref={canvasRef} className="pointer-events-none fixed inset-0 -z-10" style={{ background: "black" }} />
  )
}

export default DegenBG
