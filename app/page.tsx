import type { Metadata } from 'next'
import Link from 'next/link'
import { Car, Zap, Download, ChevronRight, TrendingUp, ImageIcon } from 'lucide-react'
import { ShowroomShowcase } from '@/components/ShowroomShowcase'

export const metadata: Metadata = {
  title: 'AutoShowroom — Fotografia IA para Stands de Automóveis',
}

const MARQUEE_ITEMS = [
  'UPSCALE 2K+', 'REMOÇÃO DE FUNDO IA', 'SHOWROOM VIRTUAL', 'EXPORTAÇÃO AUTOMÁTICA',
  'REAL-ESRGAN', '5 AMBIENTES', 'API + FTP', 'SEM CARTÃO DE CRÉDITO',
]

const PIPELINE = [
  { step: '01', icon: ImageIcon,  title: 'Upload da foto',    desc: 'Qualquer qualidade, tirada com telemóvel ou câmara.' },
  { step: '02', icon: TrendingUp, title: 'Melhoria com IA',   desc: 'Real-ESRGAN faz upscale para 2K+, corrige exposição e nitidez.' },
  { step: '03', icon: Zap,        title: 'Showroom virtual',  desc: 'Remove o fundo e compõe o carro num ambiente profissional.' },
  { step: '04', icon: Download,   title: 'Exportação',        desc: 'Download imediato ou exportação automática via API / FTP.' },
]

const PLANS = [
  {
    name: 'Gratuito', price: '0€', period: '/mês', highlight: false,
    features: ['10 fotos/mês', '2 ambientes showroom', 'Download em 2K', 'Suporte email'],
    cta: 'Começar grátis',
  },
  {
    name: 'Starter', price: '29€', period: '/mês', highlight: true,
    features: ['100 fotos/mês', '3 ambientes showroom', 'Download em 4K', 'API de exportação', 'Branding do stand'],
    cta: 'Começar Starter',
  },
  {
    name: 'Pro', price: '79€', period: '/mês', highlight: false,
    features: ['500 fotos/mês', 'Todos os ambientes', 'Download em 4K+', 'API + FTP automático', 'Branding personalizado', 'Suporte prioritário'],
    cta: 'Começar Pro',
  },
]

export default function HomePage() {
  const marqueeContent = [...MARQUEE_ITEMS, ...MARQUEE_ITEMS]

  return (
    <div className="min-h-screen bg-[#050505] text-white overflow-x-hidden">

      {/* ── HEADER ─────────────────────────────────────────── */}
      <header className="fixed top-0 inset-x-0 z-50 border-b border-white/5 bg-[#050505]/80 backdrop-blur-xl">
        <div className="mx-auto max-w-7xl px-6 flex h-16 items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white">
              <Car className="h-4 w-4 text-black" />
            </div>
            <span className="font-bold text-lg tracking-tight">
              Auto<span className="text-[#1e78ff]">Showroom</span>
            </span>
          </div>
          <nav className="hidden md:flex items-center gap-8 text-sm text-white/50">
            <Link href="#como-funciona" className="hover:text-white transition-colors">Funcionalidades</Link>
            <Link href="#ambientes"     className="hover:text-white transition-colors">Ambientes</Link>
            <Link href="#precos"        className="hover:text-white transition-colors">Preços</Link>
          </nav>
          <div className="flex items-center gap-3">
            <Link href="/auth" className="hidden sm:block text-sm text-white/50 hover:text-white transition-colors">
              Entrar
            </Link>
            <Link
              href="/auth"
              className="flex items-center gap-1.5 rounded-full border border-white/20 bg-white/5 px-5 py-2 text-sm font-medium hover:bg-white/10 hover:border-white/40 transition-all"
            >
              Começar grátis <ChevronRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>
      </header>

      {/* ── HERO ───────────────────────────────────────────── */}
      <section className="relative min-h-screen flex flex-col justify-end pb-0 pt-16 overflow-hidden">
        <div className="absolute inset-0">
          <img
            src="https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?auto=format&fit=crop&w=1800&h=1000&q=90"
            alt="Car"
            className="w-full h-full object-cover object-center"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-[#050505] via-[#050505]/70 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-[#050505]/20 to-transparent" />
        </div>

        <div className="relative mx-auto max-w-7xl px-6 pb-20 pt-32 w-full">
          <p className="text-xs font-semibold tracking-[0.2em] uppercase text-[#1e78ff] mb-6">
            · Powered by Real-ESRGAN + remove.bg
          </p>
          <h1 className="text-5xl md:text-7xl lg:text-8xl font-black leading-[0.92] tracking-tight mb-8 max-w-3xl">
            Fotos de<br />
            <span className="text-[#1e78ff]">Showroom</span><br />
            Profissional
          </h1>
          <p className="text-white/55 text-lg max-w-md mb-10 leading-relaxed">
            A IA melhora para 2K+, remove o fundo e coloca o seu carro num showroom virtual — pronto em segundos.
          </p>
          <div className="flex flex-col sm:flex-row gap-4">
            <Link
              href="/auth"
              className="btn-glow inline-flex items-center justify-center gap-2 rounded-full bg-[#1e78ff] px-8 py-4 text-sm font-bold tracking-wide hover:bg-[#3b8fff] transition-all"
            >
              Experimentar grátis <ChevronRight className="h-4 w-4" />
            </Link>
            <Link
              href="#ambientes"
              className="inline-flex items-center justify-center gap-2 rounded-full border border-white/20 px-8 py-4 text-sm font-medium hover:border-white/40 hover:bg-white/5 transition-all"
            >
              Ver ambientes
            </Link>
          </div>

          <div className="flex flex-wrap gap-10 mt-16 pt-10 border-t border-white/8">
            {[
              { val: '2K+',  label: 'Resolução mínima' },
              { val: '< 5m', label: 'Por viatura' },
              { val: '65%',  label: 'Poupança de tempo' },
              { val: '55%',  label: 'Redução de custos' },
            ].map(s => (
              <div key={s.label}>
                <p className="text-3xl font-black text-[#1e78ff]">{s.val}</p>
                <p className="text-xs text-white/35 mt-0.5 uppercase tracking-wider">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── MARQUEE ────────────────────────────────────────── */}
      <div className="border-y border-white/6 bg-[#080808] py-4 overflow-hidden">
        <div className="marquee-track flex whitespace-nowrap w-max">
          {marqueeContent.map((item, i) => (
            <span key={i} className="flex items-center gap-6 px-6 text-xs font-bold tracking-[0.2em] uppercase text-white/45">
              {item}
              <span className="text-[#1e78ff]">◆</span>
            </span>
          ))}
        </div>
      </div>

      {/* ── PIPELINE ───────────────────────────────────────── */}
      <section id="como-funciona" className="py-28">
        <div className="mx-auto max-w-7xl px-6">
          <p className="text-xs font-semibold tracking-[0.2em] uppercase text-[#1e78ff] mb-4">· 01 — PIPELINE</p>
          <div className="flex flex-col md:flex-row md:items-end gap-4 mb-16">
            <h2 className="text-4xl md:text-5xl font-black tracking-tight leading-tight">
              4 passos.<br />Resultado <span className="text-[#1e78ff]">profissional.</span>
            </h2>
            <p className="md:ml-auto md:max-w-xs text-white/35 text-sm leading-relaxed md:pb-1">
              Da foto tirada com o telemóvel à imagem de catálogo, tudo automático.
            </p>
          </div>

          <div className="grid md:grid-cols-4 gap-4">
            {PIPELINE.map(({ step, icon: Icon, title, desc }) => (
              <div key={step} className="group rounded-2xl border border-white/6 bg-[#0a0a0a] p-6 hover:border-[#1e78ff]/40 hover:bg-[#0d0d14] transition-all duration-300">
                <div className="flex items-start justify-between mb-8">
                  <span className="text-xs font-mono text-[#1e78ff] font-bold">{step}</span>
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#1e78ff]/10 group-hover:bg-[#1e78ff]/20 transition-colors">
                    <Icon className="h-5 w-5 text-[#1e78ff]" />
                  </div>
                </div>
                <h3 className="font-bold text-base mb-2">{title}</h3>
                <p className="text-sm text-white/35 leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── SHOWCASE ───────────────────────────────────────── */}
      <section id="ambientes" className="pb-4">
        <div className="mx-auto max-w-7xl px-6 mb-12">
          <p className="text-xs font-semibold tracking-[0.2em] uppercase text-[#1e78ff] mb-4">· 02 — AMBIENTES</p>
          <h2 className="text-4xl md:text-5xl font-black tracking-tight">
            Da rua ao <span className="text-[#1e78ff]">showroom</span><br className="hidden sm:block" /> em segundos
          </h2>
        </div>
        <ShowroomShowcase />
      </section>

      {/* ── PRICING ────────────────────────────────────────── */}
      <section id="precos" className="py-28">
        <div className="mx-auto max-w-5xl px-6">
          <p className="text-xs font-semibold tracking-[0.2em] uppercase text-[#1e78ff] mb-4 text-center">· 03 — PLANOS</p>
          <h2 className="text-4xl md:text-5xl font-black tracking-tight text-center mb-3">
            Preços simples
          </h2>
          <p className="text-white/35 text-center mb-16 text-sm">Comece grátis. Escale quando precisar.</p>

          <div className="grid md:grid-cols-3 gap-4">
            {PLANS.map(({ name, price, period, features, cta, highlight }) => (
              <div
                key={name}
                className={`relative rounded-2xl border p-8 flex flex-col transition-all ${
                  highlight
                    ? 'border-[#1e78ff]/50 bg-[#090f1e]'
                    : 'border-white/6 bg-[#0a0a0a] hover:border-white/12'
                }`}
              >
                {highlight && (
                  <div className="absolute -top-px inset-x-0 h-px bg-gradient-to-r from-transparent via-[#1e78ff] to-transparent" />
                )}
                {highlight && (
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-[#1e78ff] px-3 py-0.5 text-[10px] font-bold tracking-wider uppercase">
                    Mais popular
                  </span>
                )}
                <div className="mb-8">
                  <p className="text-xs font-semibold uppercase tracking-widest text-white/35 mb-3">{name}</p>
                  <div className="flex items-end gap-1">
                    <span className="text-5xl font-black">{price}</span>
                    <span className="text-white/35 mb-1.5 text-sm">{period}</span>
                  </div>
                </div>
                <ul className="space-y-3 flex-1 mb-8">
                  {features.map(f => (
                    <li key={f} className="flex items-center gap-3 text-sm text-white/55">
                      <div className="h-1.5 w-1.5 rounded-full bg-[#1e78ff] shrink-0" />
                      {f}
                    </li>
                  ))}
                </ul>
                <Link
                  href="/auth"
                  className={`flex items-center justify-center rounded-xl py-3.5 text-sm font-bold tracking-wide transition-all ${
                    highlight
                      ? 'btn-glow bg-[#1e78ff] text-white hover:bg-[#3b8fff]'
                      : 'border border-white/10 text-white/70 hover:bg-white/5 hover:border-white/20'
                  }`}
                >
                  {cta}
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA FINAL ──────────────────────────────────────── */}
      <section className="py-28 border-t border-white/5">
        <div className="mx-auto max-w-3xl px-6 text-center">
          <h2 className="text-4xl md:text-6xl font-black tracking-tight mb-6 leading-tight">
            Pronto para transformar<br />
            as suas <span className="text-[#1e78ff]">fotos</span>?
          </h2>
          <p className="text-white/35 mb-10 leading-relaxed">
            Configure o seu stand em menos de 2 minutos.<br />Sem cartão de crédito.
          </p>
          <Link
            href="/auth"
            className="btn-glow inline-flex items-center gap-2 rounded-full bg-[#1e78ff] px-10 py-4 text-base font-bold hover:bg-[#3b8fff] transition-all"
          >
            Criar conta gratuita <ChevronRight className="h-4 w-4" />
          </Link>
          <p className="text-white/20 text-sm mt-4">10 fotos grátis/mês · sem cartão de crédito</p>
        </div>
      </section>

      {/* ── FOOTER ─────────────────────────────────────────── */}
      <footer className="border-t border-white/5 py-8">
        <div className="mx-auto max-w-7xl px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="flex h-6 w-6 items-center justify-center rounded bg-white">
              <Car className="h-3.5 w-3.5 text-black" />
            </div>
            <span className="text-sm font-bold text-white/35">AutoShowroom</span>
          </div>
          <p className="text-xs text-white/20">© 2026 AutoShowroom · Fotografia IA para stands automóvel</p>
        </div>
      </footer>
    </div>
  )
}
