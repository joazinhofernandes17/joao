import type { Metadata } from 'next'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ShowroomShowcase } from '@/components/ShowroomShowcase'
import { Car, Zap, Download, ChevronRight, Star, Clock, TrendingUp, ImageIcon } from 'lucide-react'

export const metadata: Metadata = {
  title: 'AutoShowroom — Fotografia IA para Stands de Automóveis',
}

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-background/95 backdrop-blur sticky top-0 z-50">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
                <Car className="h-5 w-5 text-white" />
              </div>
              <span className="font-bold text-lg">
                Auto<span className="text-primary">Showroom</span>
              </span>
            </div>
            <div className="flex items-center gap-3">
              <Link href="/auth" className="text-sm text-muted-foreground hover:text-foreground transition-colors hidden sm:block">
                Entrar
              </Link>
              <Button asChild>
                <Link href="/auth">Começar grátis <ChevronRight className="ml-1 h-4 w-4" /></Link>
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden py-24 md:py-36">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/8 via-transparent to-primary/4" />
        <div className="absolute top-32 left-1/2 -translate-x-1/2 h-96 w-96 rounded-full bg-primary/8 blur-3xl pointer-events-none" />

        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
          <Badge variant="secondary" className="mb-6 text-xs gap-1">
            <Star className="h-3 w-3 text-yellow-400 fill-yellow-400" />
            Powered by IA · Real-ESRGAN + remove.bg
          </Badge>

          <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold mb-6 leading-tight tracking-tight">
            Fotos de{' '}
            <span className="text-primary">showroom profissional</span>
            <br />
            em minutos
          </h1>

          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-10 leading-relaxed">
            Tire uma foto simples do seu carro. A nossa IA melhora a qualidade para{' '}
            <strong className="text-foreground">2K+</strong>, remove o fundo e coloca-o num{' '}
            <strong className="text-foreground">showroom virtual profissional</strong> — pronto para o seu site em minutos.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild size="lg" className="text-base px-8">
              <Link href="/auth">
                Experimentar grátis <ChevronRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="text-base">
              <Link href="#como-funciona">Ver como funciona</Link>
            </Button>
          </div>

          <p className="mt-4 text-sm text-muted-foreground">10 fotos grátis/mês · Sem cartão de crédito</p>
        </div>
      </section>

      {/* Métricas */}
      <section className="py-14 border-y border-border bg-secondary/20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {[
              { label: 'Poupança de tempo', value: '65%', color: 'text-primary' },
              { label: 'Resolução mínima', value: '2K+', color: 'text-foreground' },
              { label: 'Redução de custos', value: '55%', color: 'text-primary' },
              { label: 'Minutos por viatura', value: '< 5', color: 'text-foreground' },
            ].map((s, i) => (
              <div key={i}>
                <p className={`text-3xl md:text-4xl font-bold ${s.color}`}>{s.value}</p>
                <p className="text-sm text-muted-foreground mt-1">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pipeline visual */}
      <section id="como-funciona" className="py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <h2 className="text-2xl md:text-3xl font-bold mb-3">Pipeline automático em 4 passos</h2>
            <p className="text-muted-foreground max-w-lg mx-auto">
              Da foto tirada com o telemóvel à imagem de catálogo profissional, tudo automático.
            </p>
          </div>

          <div className="grid md:grid-cols-4 gap-6">
            {[
              {
                step: '01',
                icon: ImageIcon,
                title: 'Upload da foto',
                desc: 'Carregue a foto original tirada com telemóvel ou câmara, em qualquer qualidade.',
              },
              {
                step: '02',
                icon: TrendingUp,
                title: 'Melhoria com IA',
                desc: 'Real-ESRGAN faz upscale para 2K+, corrige exposição, brilho, contraste e nitidez.',
              },
              {
                step: '03',
                icon: Zap,
                title: 'Showroom virtual',
                desc: 'Remove o fundo e coloca o carro num ambiente de showroom profissional à sua escolha.',
              },
              {
                step: '04',
                icon: Download,
                title: 'Exportação',
                desc: 'Descarregue as fotos ou exporte automaticamente para o seu site ou DMS via API.',
              },
            ].map(({ step, icon: Icon, title, desc }, i) => (
              <div key={i} className="relative">
                {i < 3 && (
                  <div className="hidden md:block absolute top-8 left-[calc(100%-0px)] w-full h-px bg-gradient-to-r from-border to-transparent z-0" />
                )}
                <div className="relative z-10 bg-card border border-border rounded-2xl p-6 h-full">
                  <div className="flex items-start gap-3 mb-4">
                    <span className="text-xs font-mono text-primary font-bold">{step}</span>
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
                      <Icon className="h-5 w-5 text-primary" />
                    </div>
                  </div>
                  <h3 className="font-semibold mb-2">{title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Showcase interativo: before/after + seletor de ambiente */}
      <ShowroomShowcase />

      {/* Planos */}
      <section className="py-20">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-2xl md:text-3xl font-bold mb-3">Planos simples</h2>
            <p className="text-muted-foreground">Comece grátis. Escale quando precisar.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                name: 'Gratuito',
                price: '0€',
                period: '/mês',
                features: ['10 fotos/mês', '2 ambientes showroom', 'Download em 2K', 'Suporte email'],
                cta: 'Começar grátis',
                highlight: false,
              },
              {
                name: 'Starter',
                price: '29€',
                period: '/mês',
                features: ['100 fotos/mês', '3 ambientes showroom', 'Download em 4K', 'API de exportação', 'Branding do stand'],
                cta: 'Começar Starter',
                highlight: true,
              },
              {
                name: 'Pro',
                price: '79€',
                period: '/mês',
                features: ['500 fotos/mês', 'Todos os ambientes', 'Download em 4K+', 'API + FTP automático', 'Branding personalizado', 'Suporte prioritário'],
                cta: 'Começar Pro',
                highlight: false,
              },
            ].map(({ name, price, period, features, cta, highlight }, i) => (
              <div key={i} className={`rounded-2xl border p-6 flex flex-col ${highlight ? 'border-primary bg-primary/5 relative' : 'border-border bg-card'}`}>
                {highlight && (
                  <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 text-xs">Mais popular</Badge>
                )}
                <div className="mb-6">
                  <p className="font-semibold text-sm text-muted-foreground mb-2">{name}</p>
                  <div className="flex items-end gap-1">
                    <span className="text-4xl font-bold">{price}</span>
                    <span className="text-muted-foreground mb-1">{period}</span>
                  </div>
                </div>
                <ul className="space-y-2 flex-1 mb-6">
                  {features.map((f, j) => (
                    <li key={j} className="flex items-center gap-2 text-sm text-muted-foreground">
                      <div className="h-1.5 w-1.5 rounded-full bg-primary shrink-0" />
                      {f}
                    </li>
                  ))}
                </ul>
                <Button asChild variant={highlight ? 'default' : 'outline'} className="w-full">
                  <Link href="/auth">{cta}</Link>
                </Button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Final */}
      <section className="py-20 border-t border-border bg-secondary/10">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
          <Clock className="h-12 w-12 text-primary mx-auto mb-4 opacity-80" />
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Pronto para transformar as suas fotos?
          </h2>
          <p className="text-muted-foreground mb-8 max-w-xl mx-auto">
            Configure o seu stand em menos de 2 minutos. Sem cartão de crédito.
          </p>
          <Button asChild size="lg" className="text-base px-10">
            <Link href="/auth">Criar conta gratuita <ChevronRight className="ml-2 h-4 w-4" /></Link>
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-8">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <div className="flex h-6 w-6 items-center justify-center rounded bg-primary">
                <Car className="h-3.5 w-3.5 text-white" />
              </div>
              <span className="text-sm font-semibold text-muted-foreground">AutoShowroom</span>
            </div>
            <p className="text-xs text-muted-foreground">
              © 2026 AutoShowroom · Fotografia IA para stands automóvel
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}
