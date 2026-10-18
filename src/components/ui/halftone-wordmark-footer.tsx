import * as React from 'react'

export interface FooterLink { label: string; href?: string }
export interface FooterColumn { title: string; links: FooterLink[] }

interface HalftoneWordmarkFooterProps {
  wordmark?: string
  label?: string
  meta?: string
  columns?: FooterColumn[]
  height?: string
}

const defaultColumns: FooterColumn[] = [
  { title: 'Navigate', links: [{ label: 'About', href: '#about' }, { label: 'Work', href: '#work' }] },
  { title: 'Elsewhere', links: [{ label: 'LinkedIn', href: 'https://www.linkedin.com/in/dev-vrat-trivedi' }, { label: 'Email', href: 'mailto:subrattrivedi3@gmail.com' }] },
]

/** A semantic, React-only halftone wordmark footer with pointer interaction. */
export default function HalftoneWordmarkFooter({
  wordmark = 'devvrat', label = 'Dev Vrat Trivedi',
  meta = 'Lucknow, India · Available for thoughtful builds', columns = defaultColumns,
  height = 'min(56vw, 540px)',
}: HalftoneWordmarkFooterProps) {
  const rootRef = React.useRef<HTMLElement>(null)
  const canvasRef = React.useRef<HTMLCanvasElement>(null)

  React.useEffect(() => {
    const root = rootRef.current
    const canvas = canvasRef.current
    if (!root || !canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    let animation = 0
    let pointer = { x: -1000, y: -1000 }
    let shock = { x: 0, y: 0, start: -1 }
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches

    const draw = (now = performance.now()) => {
      const rect = root.getBoundingClientRect()
      const dpr = Math.min(window.devicePixelRatio || 1, 2)
      const width = Math.max(1, Math.round(rect.width))
      const heightPx = Math.max(1, Math.round(rect.height))
      if (canvas.width !== width * dpr || canvas.height !== heightPx * dpr) {
        canvas.width = width * dpr
        canvas.height = heightPx * dpr
        canvas.style.width = `${width}px`
        canvas.style.height = `${heightPx}px`
      }
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      ctx.clearRect(0, 0, width, heightPx)
      const mask = document.createElement('canvas')
      mask.width = width
      mask.height = heightPx
      const mctx = mask.getContext('2d', { willReadFrequently: true })
      if (!mctx) return
      const fontSize = Math.max(96, width / Math.max(wordmark.length * 0.52, 1))
      mctx.font = `800 ${fontSize}px Inter, Arial, sans-serif`
      const measured = mctx.measureText(wordmark).width
      const finalSize = fontSize * Math.min(1, (width * 0.94) / measured)
      mctx.font = `800 ${finalSize}px Inter, Arial, sans-serif`
      const textWidth = mctx.measureText(wordmark).width
      mctx.fillStyle = '#fff'
      mctx.fillText(wordmark, (width - textWidth) / 2, heightPx * 1.15)
      const pixels = mctx.getImageData(0, 0, width, heightPx).data
      const gap = width < 560 ? 7 : 8
      for (let y = 0; y < heightPx; y += gap) for (let x = 0; x < width; x += gap) {
        const i = (Math.min(heightPx - 1, Math.round(y)) * width + Math.min(width - 1, Math.round(x))) * 4
        const coverage = pixels[i + 3] / 255
        if (coverage < 0.06) continue
        const dx = x - pointer.x
        const dy = y - pointer.y
        const distance = Math.hypot(dx, dy)
        const force = reducedMotion ? 0 : Math.max(0, 1 - distance / 95)
        const push = force * 18
        const ringAge = shock.start < 0 ? -1 : (now - shock.start) / 850
        const ring = ringAge >= 0 && ringAge < 1 && Math.abs(Math.hypot(x - shock.x, y - shock.y) - ringAge * 165) < 16
        ctx.fillStyle = force > 0.15 || ring ? '#ff7a3d' : '#e9e4da'
        ctx.beginPath()
        ctx.arc(x + (distance ? (dx / distance) * push : 0), y + (distance ? (dy / distance) * push : 0), Math.sqrt(coverage) * gap * 0.52, 0, Math.PI * 2)
        ctx.fill()
      }
      if (!reducedMotion && (pointer.x > -900 || (shock.start >= 0 && now - shock.start < 900))) animation = requestAnimationFrame(draw)
    }
    const redraw = () => { cancelAnimationFrame(animation); draw() }
    const local = (event: PointerEvent) => { const rect = root.getBoundingClientRect(); return { x: event.clientX - rect.left, y: event.clientY - rect.top } }
    const move = (event: PointerEvent) => { pointer = local(event); redraw() }
    const leave = () => { pointer = { x: -1000, y: -1000 }; redraw() }
    const down = (event: PointerEvent) => { if (!(event.target as HTMLElement).closest('a, button')) { shock = { ...local(event), start: performance.now() }; redraw() } }
    const observer = new ResizeObserver(redraw)
    observer.observe(root)
    root.addEventListener('pointermove', move)
    root.addEventListener('pointerleave', leave)
    root.addEventListener('pointerdown', down)
    redraw()
    return () => { cancelAnimationFrame(animation); observer.disconnect(); root.removeEventListener('pointermove', move); root.removeEventListener('pointerleave', leave); root.removeEventListener('pointerdown', down) }
  }, [wordmark])

  return <footer className="hwf-root" ref={rootRef} style={{ height }}>
    <canvas ref={canvasRef} aria-hidden="true" />
    <span className="hwf-sr">{wordmark}</span>
    <div className="hwf-top"><div className="hwf-brand"><strong>{label}</strong><span>{meta}</span></div>{columns.map((column) => <nav className="hwf-col" key={column.title} aria-label={column.title}><h3>{column.title}</h3>{column.links.map((link) => <a key={link.label} href={link.href}>{link.label} ↗</a>)}</nav>)}</div>
    <button className="hwf-up" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>Back to top ↑</button>
  </footer>
}
