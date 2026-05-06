'use client'

import { useState } from 'react'

type Template = {
  id: number
  name: string
  style: string
  brand: string
  model: string
  version: string
  year: string
  price: string
  km: string
  power: string
  fuel: string
  extra?: string
  colors: {
    bg: string
    accent: string
    text: string
    price: string
    priceBg: string
    border: string
  }
}

const templates: Template[] = [
  {
    id: 1,
    name: 'Dark Red Clássico',
    style: 'classic',
    brand: 'FORD',
    model: 'TOURNEO',
    version: 'Courier 1.0 EcoBoost',
    year: '2016',
    price: '€8 900',
    km: '145 131 Km',
    power: '100 CV',
    fuel: 'Gasolina',
    colors: { bg: '#111111', accent: '#cc1111', text: '#ffffff', price: '#ffffff', priceBg: '#cc1111', border: '#cc1111' },
  },
  {
    id: 2,
    name: 'Azul Moderno',
    style: 'modern',
    brand: 'BMW',
    model: 'SÉRIE 3',
    version: '320d Sport Line',
    year: '2020',
    price: '€24 900',
    km: '89 000 Km',
    power: '190 CV',
    fuel: 'Diesel',
    extra: 'Automático',
    colors: { bg: '#0d1b2a', accent: '#00a8ff', text: '#ffffff', price: '#ffffff', priceBg: '#00a8ff', border: '#00a8ff' },
  },
  {
    id: 3,
    name: 'Luxo Ouro & Preto',
    style: 'luxury',
    brand: 'MERCEDES',
    model: 'C 200',
    version: 'AMG Line',
    year: '2022',
    price: '€38 500',
    km: '32 000 Km',
    power: '204 CV',
    fuel: 'Gasolina',
    extra: '9G-Tronic',
    colors: { bg: '#0a0a0a', accent: '#c9a227', text: '#ffffff', price: '#c9a227', priceBg: 'transparent', border: '#c9a227' },
  },
  {
    id: 4,
    name: 'Laranja Sport',
    style: 'sport',
    brand: 'HONDA',
    model: 'CIVIC',
    version: 'Type R · Turbo',
    year: '2021',
    price: '€19 900',
    km: '65 000 Km',
    power: '320 CV',
    fuel: 'Gasolina',
    extra: '0-100: 5.7s',
    colors: { bg: '#0f0f0f', accent: '#ff6b00', text: '#ffffff', price: '#ffffff', priceBg: '#ff6b00', border: '#ff6b00' },
  },
  {
    id: 5,
    name: 'Verde Eco',
    style: 'eco',
    brand: 'TOYOTA',
    model: 'YARIS',
    version: '1.5 Hybrid Dynamic Force',
    year: '2023',
    price: '€22 500',
    km: '28 500 Km',
    power: '116 CV',
    fuel: 'Híbrido',
    extra: '95 g/km CO₂',
    colors: { bg: '#ffffff', accent: '#2d8c2d', text: '#111111', price: '#ffffff', priceBg: '#1a5c1a', border: '#2d8c2d' },
  },
  {
    id: 6,
    name: 'Roxo Neon Premium',
    style: 'neon',
    brand: 'AUDI',
    model: 'RS6',
    version: 'Avant · Quattro',
    year: '2023',
    price: '€74 900',
    km: '39 000 Km',
    power: '600 CV',
    fuel: 'Gasolina',
    extra: 'V8 Biturbo · AWD',
    colors: { bg: '#1a0533', accent: '#b432ff', text: '#ffffff', price: '#ffffff', priceBg: 'transparent', border: '#b432ff' },
  },
]

function CarSVG({ accentColor }: { accentColor: string }) {
  return (
    <svg viewBox="0 0 400 180" className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
      <ellipse cx="200" cy="172" rx="150" ry="7" fill={accentColor} opacity="0.2" />
      <path d="M55 125 L62 96 L90 65 L155 50 L265 50 L318 76 L348 112 L348 140 L55 140Z" fill={accentColor} opacity="0.15" stroke={accentColor} strokeWidth="1" />
      <path d="M95 94 Q104 56 155 52 L260 52 Q300 60 314 88 L320 94Z" fill={accentColor} opacity="0.1" />
      <path d="M105 93 L112 60 L153 54 L192 54 L192 93Z" fill={accentColor} opacity="0.3" stroke={accentColor} strokeWidth="0.5" />
      <rect x="197" y="54" width="63" height="39" rx="2" fill={accentColor} opacity="0.3" stroke={accentColor} strokeWidth="0.5" />
      <path d="M265 93 L268 62 L306 74 L316 90Z" fill={accentColor} opacity="0.25" stroke={accentColor} strokeWidth="0.5" />
      <rect x="55" y="138" width="293" height="2" rx="1" fill={accentColor} />
      <circle cx="108" cy="150" r="24" fill="#0d0d0d" />
      <circle cx="108" cy="150" r="16" fill="#1a1a1a" />
      <circle cx="108" cy="150" r="6" fill={accentColor} />
      <circle cx="293" cy="150" r="24" fill="#0d0d0d" />
      <circle cx="293" cy="150" r="16" fill="#1a1a1a" />
      <circle cx="293" cy="150" r="6" fill={accentColor} />
    </svg>
  )
}

function TemplateCard({ t }: { t: Template }) {
  const specs = [
    { icon: '🔢', label: 'Quilómetros', value: t.km },
    { icon: '⚙️', label: 'Potência', value: t.power },
    { icon: '⛽', label: 'Combustível', value: t.fuel },
    ...(t.extra ? [{ icon: '✨', label: 'Extra', value: t.extra }] : []),
  ]

  const isLight = t.style === 'eco'
  const textColor = isLight ? '#111' : '#fff'

  return (
    <div
      className="relative overflow-hidden rounded-xl flex-shrink-0"
      style={{
        width: 480,
        height: 480,
        background: t.style === 'modern'
          ? `linear-gradient(135deg, ${t.colors.bg} 0%, #1b2838 100%)`
          : t.style === 'neon'
          ? `linear-gradient(135deg, #1a0533 0%, #2d0d5c 40%, #1a0533 100%)`
          : t.colors.bg,
        fontFamily: "'Montserrat', sans-serif",
        boxShadow: `0 20px 60px rgba(0,0,0,0.5), 0 0 40px ${t.colors.accent}22`,
      }}
    >
      {/* Glow effect */}
      <div
        className="absolute inset-0 opacity-10 rounded-xl"
        style={{ background: `radial-gradient(ellipse at top right, ${t.colors.accent}, transparent 60%)` }}
      />

      {/* Eco top band */}
      {t.style === 'eco' && (
        <>
          <div className="absolute top-0 left-0 right-0 h-44" style={{ background: 'linear-gradient(135deg, #1a5c1a, #2d8c2d 60%, #3aab3a)' }} />
          <div className="absolute" style={{ top: 140, left: 0, right: 0, height: 60, overflow: 'hidden' }}>
            <svg viewBox="0 0 480 60" preserveAspectRatio="none" className="w-full h-full">
              <path d="M0,30 C80,60 160,0 240,30 C320,60 400,0 480,30 L480,60 L0,60 Z" fill="#fff" />
            </svg>
          </div>
        </>
      )}

      {/* Luxury corners */}
      {t.style === 'luxury' && (
        <>
          <div className="absolute top-0 left-0 right-0 h-px" style={{ background: `linear-gradient(to right, transparent, ${t.colors.accent}, transparent)` }} />
          <div className="absolute bottom-0 left-0 right-0 h-px" style={{ background: `linear-gradient(to right, transparent, ${t.colors.accent}, transparent)` }} />
          {[['top-3 left-3', 'border-t-2 border-l-2'], ['top-3 right-3', 'border-t-2 border-r-2'], ['bottom-3 left-3', 'border-b-2 border-l-2'], ['bottom-3 right-3', 'border-b-2 border-r-2']].map(([pos, border], i) => (
            <div key={i} className={`absolute ${pos} w-8 h-8 ${border}`} style={{ borderColor: t.colors.accent }} />
          ))}
        </>
      )}

      {/* Sport diagonal */}
      {t.style === 'sport' && (
        <div className="absolute top-0 right-0 w-0 h-0" style={{ borderStyle: 'solid', borderWidth: '0 180px 180px 0', borderColor: `transparent ${t.colors.accent} transparent transparent` }} />
      )}

      {/* Header */}
      <div className="absolute top-0 left-0 right-0 flex items-start justify-between p-4 z-10">
        <div>
          {t.style === 'classic' ? (
            <div className="rounded px-4 py-2 border-2" style={{ background: t.colors.bg, borderColor: t.colors.accent }}>
              <h2 className="font-black text-2xl uppercase tracking-widest" style={{ color: textColor, lineHeight: 1.1 }}>
                {t.brand}<br />{t.model}
              </h2>
            </div>
          ) : t.style === 'luxury' ? (
            <div className="text-center w-full absolute left-0 right-0 px-4" style={{ top: 28 }}>
              <p className="text-xs tracking-widest uppercase" style={{ color: t.colors.accent }}>Exclusividade & Performance</p>
              <h2 className="font-black text-3xl uppercase tracking-widest" style={{ color: '#fff', textShadow: `0 0 20px ${t.colors.accent}80` }}>{t.brand}</h2>
              <h3 className="text-base font-semibold tracking-widest uppercase" style={{ color: t.colors.accent }}>{t.model}</h3>
            </div>
          ) : (
            <div>
              {t.style === 'sport' && <div className="text-xs font-bold tracking-widest uppercase text-white px-3 py-1 mb-2 inline-block" style={{ background: t.colors.accent, clipPath: 'polygon(0 0, 100% 0, 95% 100%, 5% 100%)' }}>Sport Edition</div>}
              <h2 className="font-black text-3xl uppercase" style={{ color: textColor, lineHeight: 1, letterSpacing: 2 }}>{t.brand}</h2>
              <h3 className="font-bold text-sm uppercase tracking-widest" style={{ color: t.colors.accent }}>{t.model}</h3>
              <p className="text-xs mt-1" style={{ color: isLight ? '#555' : 'rgba(255,255,255,0.7)' }}>{t.version}</p>
            </div>
          )}
        </div>

        {t.style !== 'luxury' && (
          <div
            className="text-xs font-bold tracking-widest uppercase px-3 py-2 rounded-full border"
            style={{
              background: `${t.colors.accent}22`,
              borderColor: `${t.colors.accent}66`,
              color: t.style === 'eco' ? '#fff' : t.colors.accent
            }}
          >
            {t.year}
          </div>
        )}
      </div>

      {/* Car illustration */}
      <div className="absolute z-5" style={{ bottom: 125, left: 0, right: 0, height: 260 }}>
        {/* Glow under car */}
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-80 h-10 rounded-full opacity-30" style={{ background: t.colors.accent, filter: 'blur(20px)' }} />
        <CarSVG accentColor={t.colors.accent} />
      </div>

      {/* Model tag */}
      {t.style === 'classic' && (
        <div className="absolute z-10 italic text-sm font-light text-white" style={{ bottom: 130, right: 16, textShadow: '0 1px 3px rgba(0,0,0,0.8)' }}>
          {t.version} – {t.year}
        </div>
      )}

      {/* Bottom bar */}
      <div
        className="absolute bottom-0 left-0 right-0 z-10 flex items-stretch"
        style={{
          height: 120,
          background: t.style === 'eco'
            ? '#fff'
            : t.style === 'luxury'
            ? t.colors.bg
            : `rgba(0,0,0,${t.style === 'classic' ? '1' : '0.6'})`,
          borderTop: `1px solid ${t.colors.accent}44`,
          backdropFilter: t.style === 'classic' ? 'none' : 'blur(10px)',
        }}
      >
        {/* Price */}
        {t.style === 'classic' || t.style === 'sport' ? (
          <div
            className="flex flex-col items-center justify-center px-4"
            style={{
              background: t.colors.priceBg,
              minWidth: 130,
              clipPath: 'polygon(0 0, 100% 0, 88% 100%, 0 100%)',
            }}
          >
            <span className="text-xs font-bold tracking-widest uppercase mb-1" style={{ color: 'rgba(255,255,255,0.8)' }}>Preço</span>
            <span className="text-2xl font-black" style={{ color: t.colors.price }}>{t.price}</span>
          </div>
        ) : (
          <div className="flex flex-col justify-center px-5" style={{ minWidth: 140 }}>
            <span className="text-xs tracking-widest uppercase mb-1" style={{ color: t.colors.accent }}>Preço</span>
            <span className="font-black" style={{ fontSize: 28, color: t.colors.price, textShadow: t.style === 'neon' ? `0 0 15px ${t.colors.accent}` : 'none' }}>
              {t.price}
            </span>
          </div>
        )}

        {/* Divider */}
        <div className="w-px my-4" style={{ background: `${t.colors.accent}44` }} />

        {/* Specs */}
        <div className="flex flex-1 items-center justify-around px-2">
          {specs.map((s, i) => (
            <div key={i} className="flex flex-col items-center gap-1 text-center px-2">
              <span className="text-xl">{s.icon}</span>
              <span className="text-xs font-semibold" style={{ color: isLight ? '#111' : '#fff' }}>{s.value}</span>
              <span className="text-xs" style={{ color: isLight ? '#666' : `${t.colors.accent}bb`, letterSpacing: 1 }}>{s.label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default function CriativosPage() {
  const [selected, setSelected] = useState<number | null>(null)

  return (
    <div className="min-h-screen py-12 px-4" style={{ background: '#0f0f1a' }}>
      <div className="max-w-6xl mx-auto">
        <h1 className="text-center text-4xl font-black text-white mb-2 tracking-widest uppercase" style={{ fontFamily: 'Montserrat, sans-serif' }}>
          Criativos Automóveis
        </h1>
        <p className="text-center text-sm text-gray-400 mb-12 tracking-widest uppercase">
          6 Templates Prontos · Diferentes Designs & Estilos
        </p>

        <div className="grid gap-12" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(480px, 1fr))' }}>
          {templates.map((t) => (
            <div key={t.id} className="flex flex-col items-center gap-4">
              <TemplateCard t={t} />
              <div className="flex items-center gap-3">
                <span className="text-xs text-gray-500 tracking-widest uppercase">Template {t.id}</span>
                <span className="text-xs font-semibold" style={{ color: t.colors.accent }}>— {t.name}</span>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-16 p-6 rounded-xl border text-center" style={{ background: 'rgba(255,255,255,0.03)', borderColor: 'rgba(255,255,255,0.08)' }}>
          <p className="text-gray-400 text-sm leading-relaxed">
            <strong className="text-white">Como exportar:</strong> Aceda a{' '}
            <code className="text-purple-400 bg-purple-900/30 px-2 py-0.5 rounded">/criativos-auto.html</code>{' '}
            para a versão HTML standalone. Cada template é 540×540px e pode ser capturado como screenshot ou exportado via puppeteer/html2canvas.
          </p>
        </div>
      </div>
    </div>
  )
}
