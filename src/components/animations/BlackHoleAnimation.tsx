import React, { useEffect, useRef } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

interface BlackHoleProps {
  onComplete: () => void
  isActive: boolean
}

export function BlackHoleAnimation({ onComplete, isActive }: BlackHoleProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const animationRef = useRef<gsap.core.Timeline | null>(null)

  useEffect(() => {
    if (!isActive || !canvasRef.current) return

    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d', { alpha: true })
    if (!ctx) return

    // Set canvas size
    const resize = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }
    resize()
    window.addEventListener('resize', resize)

    // Particle system
    interface Particle {
      x: number
      y: number
      vx: number
      vy: number
      size: number
      color: string
      life: number
      maxLife: number
      angle: number
      angularVelocity: number
    }

    const particles: Particle[] = []
    const centerX = canvas.width / 2
    const centerY = canvas.height / 2

    const colors = [
      '#6366f1', '#818cf8', '#a5b4fc', // cosmic
      '#d946ef', '#f0abfc', '#f5d0fe', // nebula
      '#06b6d4', '#22d3ee', '#67e8f9', // cyan
      '#ffffff', '#f8fafc', '#e2e8f0', // white
    ]

    // Create initial particles
    for (let i = 0; i < 150; i++) {
      const angle = Math.random() * Math.PI * 2
      const distance = Math.random() * 300 + 50
      const size = Math.random() * 4 + 1
      
      particles.push({
        x: centerX + Math.cos(angle) * distance,
        y: centerY + Math.sin(angle) * distance,
        vx: 0,
        vy: 0,
        size,
        color: colors[Math.floor(Math.random() * colors.length)],
        life: 1,
        maxLife: 1,
        angle: Math.random() * Math.PI * 2,
        angularVelocity: (Math.random() - 0.5) * 0.1,
      })
    }

    // Black hole properties
    let blackHoleRadius = 0
    let targetRadius = Math.max(canvas.width, canvas.height) * 0.8
    let blastPhase = false
    let blastRadius = 0
    let blastMaxRadius = Math.max(canvas.width, canvas.height) * 1.5

    const timeline = gsap.timeline({
      onComplete: () => {
        onComplete()
        cleanup()
      },
    })

    // Phase 1: Black hole formation and absorption
    timeline.to({ radius: 0 }, {
      radius: targetRadius,
      duration: 2.5,
      ease: 'power3.in',
      onUpdate: function() {
        blackHoleRadius = this.targets()[0].radius
      },
    })

    // Phase 2: Cosmos blast
    timeline.to({}, {
      duration: 0.1,
      onStart: () => {
        blastPhase = true
        // Create blast particles
        for (let i = 0; i < 300; i++) {
          const angle = Math.random() * Math.PI * 2
          const speed = Math.random() * 30 + 10
          particles.push({
            x: centerX,
            y: centerY,
            vx: Math.cos(angle) * speed,
            vy: Math.sin(angle) * speed,
            size: Math.random() * 6 + 2,
            color: colors[Math.floor(Math.random() * colors.length)],
            life: 1,
            maxLife: 1,
            angle: Math.random() * Math.PI * 2,
            angularVelocity: (Math.random() - 0.5) * 0.2,
          })
        }
      },
    })

    timeline.to({ blast: 0 }, {
      blast: blastMaxRadius,
      duration: 1.5,
      ease: 'power2.out',
      onUpdate: function() {
        blastRadius = this.targets()[0].blast
      },
      onComplete: () => {
        // Fade out
        gsap.to({}, {
          duration: 0.5,
          onComplete: () => {
            onComplete()
          }
        })
      },
    })

    animationRef.current = timeline

    // Animation loop
    let animationId: number
    const animate = () => {
      if (!ctx) return

      // Clear canvas
      ctx.fillStyle = 'rgba(2, 6, 23, 0.15)'
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      // Draw black hole
      if (blackHoleRadius > 0) {
        const gradient = ctx.createRadialGradient(
          centerX, centerY, 0,
          centerX, centerY, blackHoleRadius
        )
        gradient.addColorStop(0, '#000000')
        gradient.addColorStop(0.3, '#0a0a0f')
        gradient.addColorStop(0.6, '#1a1a2e')
        gradient.addColorStop(1, 'rgba(2, 6, 23, 0)')
        
        ctx.beginPath()
        ctx.arc(centerX, centerY, blackHoleRadius, 0, Math.PI * 2)
        ctx.fillStyle = gradient
        ctx.fill()

        // Event horizon glow
        const glowGradient = ctx.createRadialGradient(
          centerX, centerY, blackHoleRadius * 0.9,
          centerX, centerY, blackHoleRadius * 1.1
        )
        glowGradient.addColorStop(0, 'rgba(99, 102, 241, 0.6)')
        glowGradient.addColorStop(0.5, 'rgba(217, 70, 239, 0.4)')
        glowGradient.addColorStop(1, 'rgba(6, 182, 212, 0)')
        
        ctx.beginPath()
        ctx.arc(centerX, centerY, blackHoleRadius * 1.1, 0, Math.PI * 2)
        ctx.strokeStyle = glowGradient
        ctx.lineWidth = 3
        ctx.stroke()
      }

      // Draw blast wave
      if (blastPhase && blastRadius > 0) {
        const blastGradient = ctx.createRadialGradient(
          centerX, centerY, blastRadius * 0.8,
          centerX, centerY, blastRadius
        )
        blastGradient.addColorStop(0, 'rgba(99, 102, 241, 0)')
        blastGradient.addColorStop(0.5, 'rgba(217, 70, 239, 0.3)')
        blastGradient.addColorStop(1, 'rgba(6, 182, 212, 0.6)')
        
        ctx.beginPath()
        ctx.arc(centerX, centerY, blastRadius, 0, Math.PI * 2)
        ctx.strokeStyle = blastGradient
        ctx.lineWidth = 4
        ctx.stroke()
      }

      // Update and draw particles
      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i]
        
        if (blackHoleRadius > 0 && !blastPhase) {
          // Absorb into black hole
          const dx = centerX - p.x
          const dy = centerY - p.y
          const dist = Math.sqrt(dx * dx + dy * dy)
          
          if (dist > 0) {
            const force = Math.min(blackHoleRadius * 0.5 / (dist * dist), 0.5)
            p.vx += (dx / dist) * force
            p.vy += (dy / dist) * force
          }
          
          p.life -= 0.002
        } else if (blastPhase) {
          // Expand outward
          p.vx *= 0.99
          p.vy *= 0.99
          p.life -= 0.005
        }

        p.x += p.vx
        p.y += p.vy
        p.angle += p.angularVelocity

        // Remove dead particles
        if (p.life <= 0 || 
            p.x < -100 || p.x > canvas.width + 100 ||
            p.y < -100 || p.y > canvas.height + 100) {
          particles.splice(i, 1)
          continue
        }

        // Draw particle
        ctx.save()
        ctx.translate(p.x, p.y)
        ctx.rotate(p.angle)
        ctx.globalAlpha = p.life
        ctx.fillStyle = p.color
        
        // Draw star-like particle
        ctx.beginPath()
        for (let j = 0; j < 5; j++) {
          const radius = j % 2 === 0 ? p.size : p.size * 0.4
          const angle = (j * Math.PI * 2) / 5 - Math.PI / 2
          const x = Math.cos(angle) * radius
          const y = Math.sin(angle) * radius
          if (j === 0) ctx.moveTo(x, y)
          else ctx.lineTo(x, y)
        }
        ctx.closePath()
        ctx.fill()
        ctx.restore()
      }

      animationId = requestAnimationFrame(animate)
    }

    animate()

    const cleanup = () => {
      cancelAnimationFrame(animationId)
      window.removeEventListener('resize', resize)
      if (animationRef.current) {
        animationRef.current.kill()
      }
    }

    return cleanup
  }, [isActive, onComplete])

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 z-[9999] pointer-events-none"
      style={{ width: '100%', height: '100%' }}
    />
  )
}

// Floating particles background
export function FloatingParticles({ count = 50, className = '' }: { count?: number; className?: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d', { alpha: true })
    if (!ctx) return

    const resize = () => {
      canvas.width = canvas.parentElement?.clientWidth || window.innerWidth
      canvas.height = canvas.parentElement?.clientHeight || window.innerHeight
    }

    resize()
    window.addEventListener('resize', resize)

    interface FloatParticle {
      x: number
      y: number
      size: number
      speedX: number
      speedY: number
      opacity: number
      color: string
      shape: 'circle' | 'square' | 'triangle' | 'star'
    }

    const particles: FloatParticle[] = []
    const colors = ['#6366f1', '#818cf8', '#d946ef', '#f0abfc', '#06b6d4', '#22d3ee']

    for (let i = 0; i < count; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        size: Math.random() * 3 + 1,
        speedX: (Math.random() - 0.5) * 0.5,
        speedY: (Math.random() - 0.5) * 0.5,
        opacity: Math.random() * 0.5 + 0.1,
        color: colors[Math.floor(Math.random() * colors.length)],
        shape: ['circle', 'square', 'triangle', 'star'][Math.floor(Math.random() * 4)] as any,
      })
    }

    let animationId: number
    const animate = () => {
      if (!ctx) return

      ctx.clearRect(0, 0, canvas.width, canvas.height)

      particles.forEach(p => {
        p.x += p.speedX
        p.y += p.speedY

        // Wrap around
        if (p.x < -p.size) p.x = canvas.width + p.size
        if (p.x > canvas.width + p.size) p.x = -p.size
        if (p.y < -p.size) p.y = canvas.height + p.size
        if (p.y > canvas.height + p.size) p.y = -p.size

        ctx.save()
        ctx.globalAlpha = p.opacity
        ctx.fillStyle = p.color
        ctx.translate(p.x, p.y)

        switch (p.shape) {
          case 'circle':
            ctx.beginPath()
            ctx.arc(0, 0, p.size, 0, Math.PI * 2)
            ctx.fill()
            break
          case 'square':
            ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size)
            break
          case 'triangle':
            ctx.beginPath()
            ctx.moveTo(0, -p.size)
            ctx.lineTo(p.size, p.size)
            ctx.lineTo(-p.size, p.size)
            ctx.closePath()
            ctx.fill()
            break
          case 'star':
            ctx.beginPath()
            for (let j = 0; j < 5; j++) {
              const radius = j % 2 === 0 ? p.size : p.size * 0.4
              const angle = (j * Math.PI * 2) / 5 - Math.PI / 2
              const x = Math.cos(angle) * radius
              const y = Math.sin(angle) * radius
              if (j === 0) ctx.moveTo(x, y)
              else ctx.lineTo(x, y)
            }
            ctx.closePath()
            ctx.fill()
            break
        }

        ctx.restore()
      })

      animationId = requestAnimationFrame(animate)
    }

    animate()

    return () => {
      cancelAnimationFrame(animationId)
      window.removeEventListener('resize', resize)
    }
  }, [count])

  return (
    <canvas
      ref={canvasRef}
      className={`fixed inset-0 pointer-events-none ${className}`}
      style={{ width: '100%', height: '100%' }}
    />
  )
}

// Morphing blob background
export function MorphingBlobs({ className = '' }: { className?: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d', { alpha: true })
    if (!ctx) return

    const resize = () => {
      canvas.width = canvas.parentElement?.clientWidth || window.innerWidth
      canvas.height = canvas.parentElement?.clientHeight || window.innerHeight
    }

    resize()
    window.addEventListener('resize', resize)

    interface Blob {
      x: number
      y: number
      baseRadius: number
      radius: number
      speed: number
      angle: number
      color: string
      points: number
      phase: number
    }

    const blobs: Blob[] = []
    const colors = [
      'rgba(99, 102, 241, 0.15)',
      'rgba(217, 70, 239, 0.12)',
      'rgba(6, 182, 212, 0.1)',
      'rgba(139, 92, 246, 0.1)',
    ]

    for (let i = 0; i < 6; i++) {
      blobs.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        baseRadius: Math.random() * 200 + 100,
        radius: 0,
        speed: Math.random() * 0.0005 + 0.0002,
        angle: Math.random() * Math.PI * 2,
        color: colors[i % colors.length],
        points: Math.floor(Math.random() * 4) + 5,
        phase: Math.random() * Math.PI * 2,
      })
    }

    let animationId: number
    const animate = () => {
      if (!ctx) return

      ctx.clearRect(0, 0, canvas.width, canvas.height)

      blobs.forEach(blob => {
        // Morph radius
        blob.radius = blob.baseRadius + Math.sin(Date.now() * blob.speed + blob.phase) * blob.baseRadius * 0.3
        
        // Slow drift
        blob.x += Math.cos(blob.angle) * 0.1
        blob.y += Math.sin(blob.angle) * 0.1

        // Wrap
        if (blob.x < -blob.radius) blob.x = canvas.width + blob.radius
        if (blob.x > canvas.width + blob.radius) blob.x = -blob.radius
        if (blob.y < -blob.radius) blob.y = canvas.height + blob.radius
        if (blob.y > canvas.height + blob.radius) blob.y = -blob.radius

        // Draw morphing blob
        ctx.beginPath()
        for (let i = 0; i < blob.points; i++) {
          const angle = (i / blob.points) * Math.PI * 2
          const variance = Math.sin(Date.now() * 0.001 + i + blob.phase) * 0.3 + 0.7
          const r = blob.radius * variance
          const x = blob.x + Math.cos(angle) * r
          const y = blob.y + Math.sin(angle) * r
          
          if (i === 0) ctx.moveTo(x, y)
          else ctx.lineTo(x, y)
        }
        ctx.closePath()
        
        const gradient = ctx.createRadialGradient(
          blob.x, blob.y, 0,
          blob.x, blob.y, blob.radius
        )
        gradient.addColorStop(0, blob.color.replace('0.15', '0.3').replace('0.12', '0.25').replace('0.1', '0.2'))
        gradient.addColorStop(1, 'transparent')
        
        ctx.fillStyle = gradient
        ctx.fill()
      })

      animationId = requestAnimationFrame(animate)
    }

    animate()

    return () => {
      cancelAnimationFrame(animationId)
      window.removeEventListener('resize', resize)
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      className={`fixed inset-0 pointer-events-none ${className}`}
      style={{ width: '100%', height: '100%' }}
    />
  )
}

// Page transition wrapper
interface PageTransitionProps {
  children: React.ReactNode
  className?: string
}

export function PageTransition({ children, className = '' }: PageTransitionProps) {
  const elementRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const element = elementRef.current
    if (!element) return

    gsap.fromTo(element, 
      { opacity: 0, y: 20 },
      { opacity: 1, y: 0, duration: 0.5, ease: 'power3.out' }
    )

    return () => {
      gsap.to(element, { opacity: 0, y: -20, duration: 0.3, ease: 'power3.in' })
    }
  }, [])

  return (
    <div ref={elementRef} className={className}>
      {children}
    </div>
  )
}

// Staggered children animation
interface StaggerContainerProps {
  children: React.ReactNode
  className?: string
  delay?: number
  stagger?: number
  direction?: 'up' | 'down' | 'left' | 'right'
}

export function StaggerContainer({ 
  children, 
  className = '', 
  delay = 0, 
  stagger = 0.1,
  direction = 'up'
}: StaggerContainerProps) {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    const childElements = Array.from(container.children) as HTMLElement[]
    
    const initialProps: Record<string, number> = {
      up: 30,
      down: -30,
      left: 30,
      right: -30,
    }

    gsap.fromTo(childElements,
      { opacity: 0, [direction === 'up' || direction === 'down' ? 'y' : 'x']: initialProps[direction] },
      { 
        opacity: 1, 
        y: 0, 
        x: 0, 
        duration: 0.5, 
        ease: 'power3.out', 
        stagger, 
        delay 
      }
    )
  }, [delay, stagger, direction])

  return (
    <div ref={containerRef} className={className}>
      {children}
    </div>
  )
}