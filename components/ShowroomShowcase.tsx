'use client'

import { useState } from 'react'
import { BeforeAfterSlider } from './BeforeAfterSlider'
import { Badge } from './ui/badge'

const ENVIRONMENTS = [
  {
    slug: 'nova',
    name: 'Nova',
    tier: 'Grátis',
    desc: 'Estúdio branco imaculado',
    accent: 'border-slate-300',
  },
  {
    slug: 'elise',
    name: 'Elise',
    tier: 'Grátis',
    desc: 'Escuro premium, luz fria',
    accent: 'border-blue-500',
  },
  {
    slug: 'origin',
    name: 'Origin',
    tier: 'Starter',
    desc: 'Clássico, tons aquecidos',
    accent: 'border-amber-500',
  },
  {
    slug: 'eclipse',
    name: 'Eclipse',
    tier: 'Pro',
    desc: 'Preto dramático, néon',
    accent: 'border-violet-500',
  },
  {
    slug: 'horizon',
    name: 'Horizon',
    tier: 'Pro',
    desc: 'Azul profundo, pôr do sol',
    accent: 'border-orange-500',
  },
]

export function ShowroomShowcase() {
  const [active, setActive] = useState('nova')
  const env = ENVIRONMENTS.find(e => e.slug === active)!

  return (
    <section className="py-24 bg-background">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">

        {/* Header */}
        <div className="text-center mb-16">
          <Badge variant="secondary" className="mb-4 text-xs tracking-wider uppercase">
            Transformação real
          </Badge>
          <h2 className="text-3xl md:text-5xl font-bold tracking-tight mb-4">
            Da rua ao showroom<br className="hidden sm:block" />
            <span className="text-primary"> em segundos</span>
          </h2>
          <p className="text-muted-foreground text-lg max-w-xl mx-auto">
            Arraste o divisor para ver a diferença. Escolha o ambiente à direita.
          </p>
        </div>

        <div className="grid lg:grid-cols-[1fr_300px] gap-8 items-start">

          {/* Slider */}
          <div className="space-y-4">
            <BeforeAfterSlider
              before="/demo/before.jpg"
              after={`/demo/after-${active}.jpg`}
              beforeLabel="Foto original"
              afterLabel={`Showroom ${env.name}`}
              className="aspect-[16/10] w-full"
            />

            {/* Info do ambiente activo */}
            <div className="flex items-center gap-3 px-1">
              <div className="flex h-2 w-2 rounded-full bg-primary animate-pulse" />
              <p className="text-sm text-muted-foreground">
                Ambiente <span className="font-semibold text-foreground">{env.name}</span> —{' '}
                {env.desc}
              </p>
              <Badge variant="secondary" className="ml-auto text-xs">{env.tier}</Badge>
            </div>
          </div>

          {/* Seletor de ambientes */}
          <div className="space-y-3">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-4">
              Escolher ambiente
            </p>

            {ENVIRONMENTS.map(env => (
              <button
                key={env.slug}
                onClick={() => setActive(env.slug)}
                className={`
                  w-full group flex items-center gap-3 p-2.5 rounded-xl border-2 transition-all duration-200
                  ${active === env.slug
                    ? `${env.accent} bg-primary/5 shadow-sm`
                    : 'border-border hover:border-border/80 hover:bg-secondary/50'}
                `}
              >
                {/* Thumbnail do showroom */}
                <div className="relative h-14 w-20 rounded-lg overflow-hidden shrink-0 bg-secondary">
                  <img
                    src={`/demo/after-${env.slug}.jpg`}
                    alt={env.name}
                    className="w-full h-full object-cover"
                  />
                  {active === env.slug && (
                    <div className="absolute inset-0 ring-2 ring-primary/60 rounded-lg" />
                  )}
                </div>

                {/* Info */}
                <div className="text-left flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className={`font-semibold text-sm ${active === env.slug ? 'text-foreground' : 'text-muted-foreground'}`}>
                      {env.name}
                    </span>
                    <Badge variant="secondary" className="text-[10px] px-1.5 py-0">{env.tier}</Badge>
                  </div>
                  <p className="text-xs text-muted-foreground truncate">{env.desc}</p>
                </div>

                {/* Indicador activo */}
                <div className={`h-2 w-2 rounded-full shrink-0 transition-all ${active === env.slug ? 'bg-primary' : 'bg-transparent'}`} />
              </button>
            ))}

            {/* CTA */}
            <div className="pt-4 border-t border-border">
              <a
                href="/auth"
                className="flex items-center justify-center w-full py-3 px-4 rounded-xl bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/90 transition-colors"
              >
                Experimentar grátis →
              </a>
              <p className="text-center text-xs text-muted-foreground mt-2">
                10 fotos grátis · sem cartão
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
