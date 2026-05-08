'use client'

import { useState } from 'react'
import { BeforeAfterSlider } from './BeforeAfterSlider'

// Mesmo carro (BMW M3) — foto tirada na rua com fundo original
const BEFORE_URL = 'https://images.unsplash.com/photo-1494976388531-d1058494cdd8?auto=format&fit=crop&w=1400&h=875&q=85'

// Mesmo carro em estúdio branco — será composto sobre cada fundo de showroom via CSS
const CAR_STUDIO_URL = 'https://images.unsplash.com/photo-1555215695-3004980ad54e?auto=format&fit=crop&w=1400&h=875&q=90'

const ENVIRONMENTS = [
  {
    slug: 'nova',
    name: 'Nova',
    tier: 'Grátis',
    desc: 'Estúdio branco imaculado',
    accent: 'border-slate-400',
    bg: '/showrooms/nova-bg.png',
    thumb: '/showrooms/nova-thumb.png',
    // blend multiply funciona bem em fundos claros
    blend: 'multiply' as const,
    carOpacity: 1,
  },
  {
    slug: 'elise',
    name: 'Elise',
    tier: 'Grátis',
    desc: 'Escuro premium, luz fria',
    accent: 'border-blue-500',
    bg: '/showrooms/elise-bg.png',
    thumb: '/showrooms/elise-thumb.png',
    blend: 'screen' as const,
    carOpacity: 0.88,
  },
  {
    slug: 'origin',
    name: 'Origin',
    tier: 'Starter',
    desc: 'Clássico, tons aquecidos',
    accent: 'border-amber-500',
    bg: '/showrooms/origin-bg.png',
    thumb: '/showrooms/origin-thumb.png',
    blend: 'multiply' as const,
    carOpacity: 0.95,
  },
  {
    slug: 'eclipse',
    name: 'Eclipse',
    tier: 'Pro',
    desc: 'Preto dramático, alto contraste',
    accent: 'border-violet-500',
    bg: '/showrooms/eclipse-bg.png',
    thumb: '/showrooms/eclipse-thumb.png',
    blend: 'screen' as const,
    carOpacity: 0.82,
  },
  {
    slug: 'horizon',
    name: 'Horizon',
    tier: 'Pro',
    desc: 'Exterior, pôr do sol',
    accent: 'border-orange-500',
    bg: '/showrooms/horizon-bg.png',
    thumb: '/showrooms/horizon-thumb.png',
    blend: 'screen' as const,
    carOpacity: 0.85,
  },
]

export function ShowroomShowcase() {
  const [active, setActive] = useState('nova')
  const env = ENVIRONMENTS.find(e => e.slug === active)!

  // Composite: fundo de showroom + carro estúdio com blend mode CSS
  const afterContent = (
    <div className="relative w-full h-full isolate">
      {/* Fundo de showroom gerado */}
      <img
        src={env.bg}
        alt={`Showroom ${env.name}`}
        className="absolute inset-0 w-full h-full object-cover"
        draggable={false}
      />
      {/* Mesmo carro (estúdio branco) sobreposto com blend mode */}
      <img
        src={CAR_STUDIO_URL}
        alt="Carro"
        className="absolute inset-0 w-full h-full object-cover"
        style={{
          mixBlendMode: env.blend,
          opacity: env.carOpacity,
        }}
        draggable={false}
      />
    </div>
  )

  return (
    <section className="py-12 bg-[#050505]">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">

        {/* Header removido — já vem da page.tsx */}
        <div className="mb-10">
          <p className="text-sm text-white/40">
            Arraste o divisor — o carro é o mesmo, apenas o fundo muda.
          </p>
        </div>

        <div className="grid lg:grid-cols-[1fr_280px] gap-6 items-start">

          {/* Slider */}
          <div className="space-y-4">
            <BeforeAfterSlider
              before={BEFORE_URL}
              afterContent={afterContent}
              beforeLabel="Foto original"
              afterLabel={`Showroom ${env.name}`}
              className="aspect-[16/10] w-full"
            />

            {/* Info ambiente activo */}
            <div className="flex items-center gap-3 px-1">
              <div className="h-2 w-2 rounded-full bg-[#1e78ff] animate-pulse shrink-0" />
              <p className="text-sm text-white/50">
                Ambiente{' '}
                <span className="font-semibold text-white">{env.name}</span>
                {' '}— {env.desc}
              </p>
              <span className="ml-auto text-[10px] font-bold uppercase tracking-wider text-[#1e78ff] shrink-0 border border-[#1e78ff]/30 rounded-full px-2 py-0.5">
                {env.tier}
              </span>
            </div>
          </div>

          {/* Seletor */}
          <div className="space-y-2">
            <p className="text-[10px] font-bold text-white/30 uppercase tracking-[0.2em] mb-4">
              Escolher ambiente
            </p>

            {ENVIRONMENTS.map(e => (
              <button
                key={e.slug}
                onClick={() => setActive(e.slug)}
                className={`
                  w-full flex items-center gap-3 p-2.5 rounded-xl border transition-all duration-200 text-left
                  ${active === e.slug
                    ? 'border-[#1e78ff]/50 bg-[#0d0d1e]'
                    : 'border-white/6 bg-[#0a0a0a] hover:border-white/14 hover:bg-[#0d0d0d]'}
                `}
              >
                <div className="relative h-12 w-18 rounded-lg overflow-hidden shrink-0 bg-black">
                  <img src={e.thumb} alt={e.name} className="w-full h-full object-cover" loading="lazy" />
                  {active === e.slug && (
                    <div className="absolute inset-0 ring-2 ring-inset ring-[#1e78ff]/70 rounded-lg" />
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5 mb-0.5">
                    <span className={`font-bold text-sm ${active === e.slug ? 'text-white' : 'text-white/50'}`}>
                      {e.name}
                    </span>
                    <span className="text-[9px] font-bold uppercase tracking-wider text-[#1e78ff]/70 border border-[#1e78ff]/25 rounded-full px-1.5 shrink-0">
                      {e.tier}
                    </span>
                  </div>
                  <p className="text-xs text-white/30 truncate">{e.desc}</p>
                </div>

                <div className={`h-1.5 w-1.5 rounded-full shrink-0 transition-all ${active === e.slug ? 'bg-[#1e78ff]' : 'bg-transparent'}`} />
              </button>
            ))}

            <div className="pt-4 mt-2 border-t border-white/6">
              <a
                href="/auth"
                className="btn-glow flex items-center justify-center w-full py-3 px-4 rounded-xl bg-[#1e78ff] text-white text-sm font-bold hover:bg-[#3b8fff] transition-all"
              >
                Experimentar grátis →
              </a>
              <p className="text-center text-xs text-white/25 mt-2">
                10 fotos grátis · sem cartão de crédito
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
