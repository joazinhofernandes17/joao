'use client'

import { useState } from 'react'
import { BeforeAfterSlider } from './BeforeAfterSlider'

// UMA ÚNICA imagem de carro — usada nos dois lados do slider
const CAR_URL = 'https://images.unsplash.com/photo-1555215695-3004980ad54e?auto=format&fit=crop&w=1400&h=875&q=90'

// Lado ANTES: mesma imagem com filtro dessaturado + overlay cinzento
// simula foto tirada com telemóvel num parque de estacionamento
const beforeContent = (
  <div className="relative w-full h-full">
    <img
      src={CAR_URL}
      alt="Foto original"
      className="w-full h-full object-cover block"
      style={{ filter: 'grayscale(55%) brightness(0.72) contrast(1.18) saturate(0.35)' }}
      draggable={false}
    />
    {/* Overlay que simula ambiente exterior / dia nublado */}
    <div
      className="absolute inset-0"
      style={{ background: 'linear-gradient(160deg, rgba(80,90,105,0.38) 0%, rgba(50,60,70,0.18) 100%)' }}
    />
    {/* Grão subtil */}
    <div
      className="absolute inset-0 opacity-[0.06]"
      style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 200 200\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'n\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.9\' numOctaves=\'4\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23n)\'/%3E%3C/svg%3E")', backgroundSize: '180px' }}
    />
  </div>
)

const ENVIRONMENTS = [
  {
    slug: 'nova',
    name: 'Nova',
    tier: 'Grátis',
    desc: 'Estúdio branco imaculado',
    thumb: '/showrooms/nova-thumb.png',
    // Fundo branco de estúdio — multiply remove o bg branco da foto e funde o carro
    bgStyle: 'radial-gradient(ellipse 130% 90% at 48% 42%, #ffffff 0%, #ececf2 55%, #d8d8e0 100%)',
    blend: 'multiply' as const,
    carBrightness: 1.05,
  },
  {
    slug: 'elise',
    name: 'Elise',
    tier: 'Grátis',
    desc: 'Escuro premium, luz fria',
    thumb: '/showrooms/elise-thumb.png',
    bgStyle: 'radial-gradient(ellipse 130% 90% at 48% 38%, #2a2d3e 0%, #1a1c2e 45%, #0e101c 100%)',
    blend: 'screen' as const,
    carBrightness: 0.78,
  },
  {
    slug: 'origin',
    name: 'Origin',
    tier: 'Starter',
    desc: 'Clássico, tons aquecidos',
    thumb: '/showrooms/origin-thumb.png',
    bgStyle: 'radial-gradient(ellipse 130% 90% at 48% 42%, #f5efe4 0%, #e8dfc8 50%, #d0c8b0 100%)',
    blend: 'multiply' as const,
    carBrightness: 1.02,
  },
  {
    slug: 'eclipse',
    name: 'Eclipse',
    tier: 'Pro',
    desc: 'Preto dramático, alto contraste',
    thumb: '/showrooms/eclipse-thumb.png',
    bgStyle: 'radial-gradient(ellipse 130% 90% at 48% 35%, #16182a 0%, #0a0c16 50%, #050508 100%)',
    blend: 'screen' as const,
    carBrightness: 0.72,
  },
  {
    slug: 'horizon',
    name: 'Horizon',
    tier: 'Pro',
    desc: 'Exterior, pôr do sol',
    thumb: '/showrooms/horizon-thumb.png',
    bgStyle: 'radial-gradient(ellipse 130% 90% at 48% 38%, #ffe0b0 0%, #ffb060 45%, #e07030 100%)',
    blend: 'multiply' as const,
    carBrightness: 1.08,
  },
]

export function ShowroomShowcase() {
  const [active, setActive] = useState('nova')
  const env = ENVIRONMENTS.find(e => e.slug === active)!

  // Lado DEPOIS: mesma URL de carro mas sobre gradiente de estúdio + blend mode
  // O blend mode remove o fundo branco da foto e funde com o gradiente
  const afterContent = (
    <div className="relative w-full h-full isolate">
      {/* Fundo de estúdio — gradiente por ambiente */}
      <div className="absolute inset-0" style={{ background: env.bgStyle }} />
      {/* Mesma imagem de carro (idêntica URL) com blend mode */}
      <img
        src={CAR_URL}
        alt={`Showroom ${env.name}`}
        className="absolute inset-0 w-full h-full object-cover block"
        style={{
          mixBlendMode: env.blend,
          filter: `brightness(${env.carBrightness})`,
        }}
        draggable={false}
      />
    </div>
  )

  return (
    <section className="py-12 bg-[#050505]">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">

        <div className="mb-10">
          <p className="text-sm text-white/40">
            Mesma foto, fundo substituído por IA. Arraste o divisor.
          </p>
        </div>

        <div className="grid lg:grid-cols-[1fr_280px] gap-6 items-start">

          {/* Slider */}
          <div className="space-y-4">
            <BeforeAfterSlider
              beforeContent={beforeContent}
              afterContent={afterContent}
              beforeLabel="Foto original"
              afterLabel={`Showroom ${env.name}`}
              className="aspect-[16/10] w-full"
            />

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
                <div className="relative h-12 w-[72px] rounded-lg overflow-hidden shrink-0">
                  {/* Thumbnail mostra o gradiente do ambiente */}
                  <div className="absolute inset-0" style={{ background: e.bgStyle }} />
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
