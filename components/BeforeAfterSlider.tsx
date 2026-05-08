'use client'

import { useRef, useState, useCallback, useEffect } from 'react'

interface Props {
  before: string
  after: string
  beforeLabel?: string
  afterLabel?: string
  className?: string
}

export function BeforeAfterSlider({
  before, after,
  beforeLabel = 'Antes',
  afterLabel = 'Depois',
  className = '',
}: Props) {
  const [pos, setPos] = useState(42)      // % de largura da metade "antes"
  const [dragging, setDragging] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  const clamp = (v: number) => Math.max(4, Math.min(96, v))

  const updatePos = useCallback((clientX: number) => {
    const rect = containerRef.current?.getBoundingClientRect()
    if (!rect) return
    setPos(clamp(((clientX - rect.left) / rect.width) * 100))
  }, [])

  const onMouseDown = (e: React.MouseEvent) => { e.preventDefault(); setDragging(true); updatePos(e.clientX) }
  const onTouchStart = (e: React.TouchEvent) => { setDragging(true); updatePos(e.touches[0].clientX) }

  useEffect(() => {
    if (!dragging) return
    const onMove = (e: MouseEvent | TouchEvent) => {
      const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX
      updatePos(clientX)
    }
    const onUp = () => setDragging(false)
    window.addEventListener('mousemove', onMove)
    window.addEventListener('mouseup', onUp)
    window.addEventListener('touchmove', onMove, { passive: true })
    window.addEventListener('touchend', onUp)
    return () => {
      window.removeEventListener('mousemove', onMove)
      window.removeEventListener('mouseup', onUp)
      window.removeEventListener('touchmove', onMove)
      window.removeEventListener('touchend', onUp)
    }
  }, [dragging, updatePos])

  return (
    <div
      ref={containerRef}
      className={`relative overflow-hidden rounded-2xl select-none ${className}`}
      style={{ cursor: dragging ? 'grabbing' : 'grab' }}
    >
      {/* Imagem DEPOIS (base, largura total) */}
      <img src={after} alt={afterLabel} className="w-full h-full object-cover block" draggable={false} />

      {/* Imagem ANTES (clipped à esquerda) */}
      <div
        className="absolute inset-0 overflow-hidden"
        style={{ clipPath: `inset(0 ${100 - pos}% 0 0)` }}
      >
        <img src={before} alt={beforeLabel} className="w-full h-full object-cover block" draggable={false} />
      </div>

      {/* Handle (linha + círculo central) */}
      <div
        className="absolute inset-y-0 z-20 flex items-center justify-center"
        style={{ left: `${pos}%`, transform: 'translateX(-50%)' }}
        onMouseDown={onMouseDown}
        onTouchStart={onTouchStart}
      >
        {/* Linha vertical */}
        <div className="absolute inset-y-0 w-0.5 bg-white/90 shadow-lg" />

        {/* Botão circular */}
        <div className={`
          relative z-10 flex items-center justify-center
          h-12 w-12 rounded-full bg-white shadow-2xl border-2 border-white/80
          transition-transform duration-150
          ${dragging ? 'scale-110' : 'scale-100 hover:scale-105'}
        `}>
          {/* Setas esquerda/direita */}
          <svg viewBox="0 0 24 24" className="w-6 h-6 text-gray-700" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
            <polyline points="15 18 9 12 15 6" />
          </svg>
          <svg viewBox="0 0 24 24" className="w-6 h-6 text-gray-700 -ml-1" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
            <polyline points="9 18 15 12 9 6" />
          </svg>
        </div>
      </div>

      {/* Labels */}
      <div className="absolute top-3 left-4 z-10 pointer-events-none">
        <span className="bg-black/55 text-white text-xs font-semibold px-3 py-1.5 rounded-full backdrop-blur-sm tracking-wide">
          {beforeLabel}
        </span>
      </div>
      <div className="absolute top-3 right-4 z-10 pointer-events-none">
        <span className="bg-primary/80 text-white text-xs font-semibold px-3 py-1.5 rounded-full backdrop-blur-sm tracking-wide">
          {afterLabel}
        </span>
      </div>
    </div>
  )
}
