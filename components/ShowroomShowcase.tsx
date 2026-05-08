'use client'

import { useState } from 'react'
import { BeforeAfterSlider } from './BeforeAfterSlider'
import { Badge } from './ui/badge'

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
    <section className="py-24 bg-background">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">

        {/* Header */}
        <div className="text-center mb-16">
          <Badge variant="secondary" className="mb-4 text-xs tracking-wider uppercase">
            Transformação real
          </Badge>
          <h2 className="text-3xl md:text-5xl font-bold tracking-tight mb-4">
            Da rua ao showroom
            <br className="hidden sm:block" />
            <span className="text-primary"> em segundos</span>
          </h2>
          <p className="text-muted-foreground text-lg max-w-xl mx-auto">
            Arraste o divisor — o carro é o mesmo, apenas o fundo muda. Escolha o ambiente à direita.
          </p>
        </div>

        <div className="grid lg:grid-cols-[1fr_300px] gap-8 items-start">

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
              <div className="h-2 w-2 rounded-full bg-primary animate-pulse shrink-0" />
              <p className="text-sm text-muted-foreground">
                Ambiente{' '}
                <span className="font-semibold text-foreground">{env.name}</span>
                {' '}— {env.desc}
              </p>
              <Badge variant="secondary" className="ml-auto text-xs shrink-0">
                {env.tier}
              </Badge>
            </div>
          </div>

          {/* Seletor */}
          <div className="space-y-2.5">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-4">
              Escolher ambiente
            </p>

            {ENVIRONMENTS.map(e => (
              <button
                key={e.slug}
                onClick={() => setActive(e.slug)}
                className={`
                  w-full flex items-center gap-3 p-2.5 rounded-xl border-2 transition-all duration-200 text-left
                  ${active === e.slug
                    ? `${e.accent} bg-primary/5 shadow-sm`
                    : 'border-border hover:border-muted-foreground/40 hover:bg-secondary/50'}
                `}
              >
                {/* Thumbnail do fundo de showroom */}
                <div className="relative h-14 w-20 rounded-lg overflow-hidden shrink-0 bg-secondary">
                  <img
                    src={e.thumb}
                    alt={e.name}
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                  {active === e.slug && (
                    <div className="absolute inset-0 ring-2 ring-inset ring-primary/70 rounded-lg" />
                  )}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5 mb-0.5">
                    <span className={`font-semibold text-sm ${active === e.slug ? 'text-foreground' : 'text-muted-foreground'}`}>
                      {e.name}
                    </span>
                    <Badge variant="secondary" className="text-[10px] px-1.5 py-0 shrink-0">
                      {e.tier}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground truncate">{e.desc}</p>
                </div>

                {/* Dot indicador */}
                <div className={`h-2 w-2 rounded-full shrink-0 transition-all ${active === e.slug ? 'bg-primary' : 'bg-transparent'}`} />
              </button>
            ))}

            {/* CTA */}
            <div className="pt-4 mt-2 border-t border-border">
              <a
                href="/auth"
                className="flex items-center justify-center w-full py-3 px-4 rounded-xl bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/90 transition-colors"
              >
                Experimentar grátis →
              </a>
              <p className="text-center text-xs text-muted-foreground mt-2">
                10 fotos grátis · sem cartão de crédito
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
