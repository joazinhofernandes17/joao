/**
 * Gera imagens de demonstração: carro SVG composto sobre cada showroom
 * npx tsx scripts/generate-demo.ts
 */

import sharp from 'sharp'
import path from 'path'
import fs from 'fs'

const OUT  = path.join(process.cwd(), 'public', 'demo')
const W    = 1400
const H    = 900
const SHOWROOMS = ['nova', 'elise', 'origin', 'eclipse', 'horizon']

/* ── Car SVG (sedan moderno visto de lado) ─────────────────────────────── */
function carSVG(w: number, h: number, color = '#1a1a2e', accent = '#2a2a4e'): string {
  // Escalar o carro para 85% da largura, centrado
  const cw = w * 0.85
  const ch = h * 0.55
  const cx = (w - cw) / 2
  const cy = h * 0.32          // topo do carro

  // pontos normalizados (0-1) → pixel
  const px = (v: number) => cx + v * cw
  const py = (v: number) => cy + v * ch

  const wheelR  = cw * 0.093   // raio da roda
  const w1x     = px(0.198)    // centro roda dianteira X
  const w2x     = px(0.802)    // centro roda traseira X
  const wheelY  = py(0.98)     // centro das rodas Y

  const bodyColor  = color
  const glassColor = '#7ab8d4'
  const glassOp    = 0.65
  const rimColor   = '#c8ccd4'
  const tireColor  = '#1a1a1a'

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">
  <defs>
    <!-- Carroçaria -->
    <linearGradient id="body" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%"   stop-color="${accent}"/>
      <stop offset="40%"  stop-color="${bodyColor}"/>
      <stop offset="100%" stop-color="#0a0a16"/>
    </linearGradient>
    <!-- Highlight lateral -->
    <linearGradient id="shine" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%"   stop-color="white" stop-opacity="0.18"/>
      <stop offset="30%"  stop-color="white" stop-opacity="0.06"/>
      <stop offset="100%" stop-color="white" stop-opacity="0"/>
    </linearGradient>
    <!-- Vidros -->
    <linearGradient id="glass" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%"   stop-color="#a8d8f0" stop-opacity="${glassOp + 0.1}"/>
      <stop offset="100%" stop-color="${glassColor}" stop-opacity="${glassOp - 0.1}"/>
    </linearGradient>
    <!-- Roda -->
    <radialGradient id="rim" cx="40%" cy="35%" r="60%">
      <stop offset="0%"   stop-color="#e8ecf2"/>
      <stop offset="60%"  stop-color="${rimColor}"/>
      <stop offset="100%" stop-color="#8890a0"/>
    </radialGradient>
    <!-- Sombra no chão -->
    <radialGradient id="shadow" cx="50%" cy="0%" r="100%">
      <stop offset="0%"   stop-color="#000000" stop-opacity="0.45"/>
      <stop offset="100%" stop-color="#000000" stop-opacity="0"/>
    </radialGradient>
    <filter id="blur6"><feGaussianBlur stdDeviation="6"/></filter>
    <filter id="blur3"><feGaussianBlur stdDeviation="3"/></filter>
    <filter id="blur2"><feGaussianBlur stdDeviation="2"/></filter>
  </defs>

  <!-- SOMBRA NO CHÃO -->
  <ellipse cx="${w / 2}" cy="${wheelY + wheelR * 0.6}" rx="${cw * 0.46}" ry="${wheelR * 0.28}"
    fill="url(#shadow)" filter="url(#blur6)"/>

  <!-- ── CARROÇARIA PRINCIPAL ───────────────────────────── -->
  <!-- Parte baixa (saia lateral + proteções) -->
  <path d="
    M ${px(0.02)} ${py(0.74)}
    L ${px(0.06)} ${py(0.68)}
    L ${px(0.93)} ${py(0.68)}
    L ${px(0.98)} ${py(0.74)}
    Q ${px(1.00)} ${py(0.78)}, ${px(0.97)} ${py(0.82)}
    L ${px(0.03)} ${py(0.82)}
    Q ${px(0.00)} ${py(0.78)}, ${px(0.02)} ${py(0.74)}
    Z
  " fill="#0d0d1a"/>

  <!-- Carroçaria principal com tecto -->
  <path d="
    M ${px(0.05)} ${py(0.82)}
    L ${px(0.03)} ${py(0.68)}
    L ${px(0.06)} ${py(0.55)}
    Q ${px(0.09)} ${py(0.44)}, ${px(0.14)} ${py(0.36)}
    Q ${px(0.20)} ${py(0.28)}, ${px(0.28)} ${py(0.22)}
    Q ${px(0.36)} ${py(0.16)}, ${px(0.46)} ${py(0.12)}
    Q ${px(0.56)} ${py(0.10)}, ${px(0.64)} ${py(0.10)}
    Q ${px(0.72)} ${py(0.10)}, ${px(0.78)} ${py(0.14)}
    Q ${px(0.84)} ${py(0.18)}, ${px(0.88)} ${py(0.26)}
    Q ${px(0.92)} ${py(0.34)}, ${px(0.94)} ${py(0.44)}
    L ${px(0.97)} ${py(0.55)}
    L ${px(0.97)} ${py(0.68)}
    L ${px(0.95)} ${py(0.82)}
    Z
  " fill="url(#body)"/>

  <!-- Linha de highlight superior da carroçaria -->
  <path d="
    M ${px(0.06)} ${py(0.52)}
    Q ${px(0.12)} ${py(0.41)}, ${px(0.20)} ${py(0.33)}
    Q ${px(0.30)} ${py(0.24)}, ${px(0.46)} ${py(0.19)}
    Q ${px(0.60)} ${py(0.15)}, ${px(0.72)} ${py(0.16)}
    Q ${px(0.82)} ${py(0.19)}, ${px(0.89)} ${py(0.28)}
    Q ${px(0.94)} ${py(0.36)}, ${px(0.96)} ${py(0.46)}
  " fill="none" stroke="white" stroke-width="${cw * 0.003}" opacity="0.25" stroke-linecap="round"/>

  <!-- Shine overlay (reflexo top) -->
  <path d="
    M ${px(0.05)} ${py(0.82)}
    L ${px(0.03)} ${py(0.68)}
    L ${px(0.06)} ${py(0.55)}
    Q ${px(0.10)} ${py(0.44)}, ${px(0.16)} ${py(0.36)}
    Q ${px(0.50)} ${py(0.28)}, ${px(0.95)} ${py(0.50)}
    L ${px(0.97)} ${py(0.68)}
    L ${px(0.95)} ${py(0.82)}
    Z
  " fill="url(#shine)"/>

  <!-- ── VIDROS ──────────────────────────────────────────── -->
  <!-- Para-brisas dianteiro -->
  <path d="
    M ${px(0.155)} ${py(0.545)}
    Q ${px(0.165)} ${py(0.44)}, ${px(0.20)} ${py(0.36)}
    Q ${px(0.26)} ${py(0.27)}, ${px(0.335)} ${py(0.215)}
    L ${px(0.415)} ${py(0.21)}
    L ${px(0.41)} ${py(0.545)}
    Z
  " fill="url(#glass)" opacity="0.9"/>

  <!-- Janela central -->
  <path d="
    M ${px(0.425)} ${py(0.21)}
    L ${px(0.425)} ${py(0.545)}
    L ${px(0.615)} ${py(0.545)}
    L ${px(0.615)} ${py(0.20)}
    Z
  " fill="url(#glass)" opacity="0.85"/>

  <!-- Janela traseira -->
  <path d="
    M ${px(0.625)} ${py(0.20)}
    L ${px(0.625)} ${py(0.545)}
    L ${px(0.795)} ${py(0.545)}
    Q ${px(0.84)} ${py(0.44)}, ${px(0.87)} ${py(0.34)}
    Q ${px(0.83)} ${py(0.26)}, ${px(0.77)} ${py(0.19)}
    Q ${px(0.71)} ${py(0.155)}, ${px(0.64)} ${py(0.145)}
    Z
  " fill="url(#glass)" opacity="0.85"/>

  <!-- Colunas dos vidros -->
  <rect x="${px(0.415)}" y="${py(0.21)}" width="${cw * 0.012}" height="${ch * 0.335}" fill="${bodyColor}" opacity="0.9"/>
  <rect x="${px(0.612)}" y="${py(0.20)}" width="${cw * 0.015}" height="${ch * 0.345}" fill="${bodyColor}" opacity="0.9"/>

  <!-- ── DETALHES DIANTEIROS ─────────────────────────────── -->
  <!-- Farol dianteiro -->
  <path d="
    M ${px(0.04)} ${py(0.565)}
    Q ${px(0.06)} ${py(0.53)}, ${px(0.10)} ${py(0.525)}
    L ${px(0.155)} ${py(0.545)}
    L ${px(0.09)} ${py(0.58)}
    Z
  " fill="#d0e8ff" opacity="0.9"/>
  <path d="
    M ${px(0.04)} ${py(0.565)}
    Q ${px(0.06)} ${py(0.53)}, ${px(0.10)} ${py(0.525)}
    L ${px(0.155)} ${py(0.545)}
    L ${px(0.09)} ${py(0.58)}
    Z
  " fill="#ffffff" opacity="0.4"/>

  <!-- Grelha dianteira -->
  <path d="
    M ${px(0.03)} ${py(0.63)}
    Q ${px(0.04)} ${py(0.60)}, ${px(0.075)} ${py(0.595)}
    L ${px(0.14)} ${py(0.60)}
    L ${px(0.13)} ${py(0.645)}
    Q ${px(0.06)} ${py(0.65)}, ${px(0.03)} ${py(0.63)}
    Z
  " fill="#0a0a14"/>

  <!-- ── DETALHES TRASEIROS ──────────────────────────────── -->
  <!-- Farol traseiro -->
  <path d="
    M ${px(0.96)} ${py(0.555)}
    Q ${px(0.97)} ${py(0.53)}, ${px(0.955)} ${py(0.515)}
    L ${px(0.87)} ${py(0.535)}
    L ${px(0.92)} ${py(0.575)}
    Z
  " fill="#ff3030" opacity="0.85"/>

  <!-- ── RODAS ───────────────────────────────────────────── -->
  <!-- Roda dianteira — pneu -->
  <circle cx="${w1x}" cy="${wheelY}" r="${wheelR}" fill="${tireColor}"/>
  <!-- Roda dianteira — jante -->
  <circle cx="${w1x}" cy="${wheelY}" r="${wheelR * 0.70}" fill="url(#rim)"/>
  <!-- Raios da jante dianteira -->
  ${[0,1,2,3,4].map(i => {
    const a = (i / 5) * Math.PI * 2
    const x1 = w1x + Math.cos(a) * wheelR * 0.18
    const y1 = wheelY + Math.sin(a) * wheelR * 0.18
    const x2 = w1x + Math.cos(a) * wheelR * 0.64
    const y2 = wheelY + Math.sin(a) * wheelR * 0.64
    return `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="#7080a0" stroke-width="${wheelR * 0.14}" stroke-linecap="round"/>`
  }).join('\n  ')}
  <circle cx="${w1x}" cy="${wheelY}" r="${wheelR * 0.16}" fill="#d0d4dc"/>
  <!-- Anel interior do pneu -->
  <circle cx="${w1x}" cy="${wheelY}" r="${wheelR * 0.70}" fill="none" stroke="#3a3a3a" stroke-width="${wheelR * 0.06}"/>

  <!-- Roda traseira — pneu -->
  <circle cx="${w2x}" cy="${wheelY}" r="${wheelR}" fill="${tireColor}"/>
  <!-- Roda traseira — jante -->
  <circle cx="${w2x}" cy="${wheelY}" r="${wheelR * 0.70}" fill="url(#rim)"/>
  ${[0,1,2,3,4].map(i => {
    const a = (i / 5) * Math.PI * 2 + 0.3
    const x1 = w2x + Math.cos(a) * wheelR * 0.18
    const y1 = wheelY + Math.sin(a) * wheelR * 0.18
    const x2 = w2x + Math.cos(a) * wheelR * 0.64
    const y2 = wheelY + Math.sin(a) * wheelR * 0.64
    return `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="#7080a0" stroke-width="${wheelR * 0.14}" stroke-linecap="round"/>`
  }).join('\n  ')}
  <circle cx="${w2x}" cy="${wheelY}" r="${wheelR * 0.16}" fill="#d0d4dc"/>
  <circle cx="${w2x}" cy="${wheelY}" r="${wheelR * 0.70}" fill="none" stroke="#3a3a3a" stroke-width="${wheelR * 0.06}"/>

  <!-- Calha lateral inferior -->
  <rect x="${px(0.06)}" y="${py(0.72)}" width="${cw * 0.875}" height="${ch * 0.04}"
    fill="#0a0a18" rx="2"/>

  <!-- Espelho lateral -->
  <path d="
    M ${px(0.155)} ${py(0.445)}
    Q ${px(0.14)} ${py(0.44)}, ${px(0.12)} ${py(0.455)}
    L ${px(0.118)} ${py(0.495)}
    L ${px(0.155)} ${py(0.495)}
    Z
  " fill="${accent}"/>
</svg>`
}

/* ── Background "before" (outdoor / estacionamento) ───────────────────── */
function beforeBgSVG(w: number, h: number): string {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}">
  <defs>
    <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%"   stop-color="#b0c8e0"/>
      <stop offset="100%" stop-color="#d8e8f0"/>
    </linearGradient>
    <linearGradient id="asphalt" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%"   stop-color="#606468"/>
      <stop offset="100%" stop-color="#484c50"/>
    </linearGradient>
    <filter id="grain">
      <feTurbulence type="fractalNoise" baseFrequency="0.65" numOctaves="3" stitchTiles="stitch"/>
      <feColorMatrix type="saturate" values="0"/>
      <feBlend in="SourceGraphic" mode="multiply" result="blend"/>
      <feComposite in="blend" in2="SourceGraphic"/>
    </filter>
  </defs>
  <!-- Céu nublado -->
  <rect width="${w}" height="${h * 0.45}" fill="url(#sky)"/>
  <!-- Nuvens irregulares -->
  <ellipse cx="${w * 0.25}" cy="${h * 0.18}" rx="${w * 0.18}" ry="${h * 0.08}" fill="white" opacity="0.6"/>
  <ellipse cx="${w * 0.32}" cy="${h * 0.14}" rx="${w * 0.12}" ry="${h * 0.06}" fill="white" opacity="0.5"/>
  <ellipse cx="${w * 0.65}" cy="${h * 0.22}" rx="${w * 0.15}" ry="${h * 0.07}" fill="white" opacity="0.55"/>
  <ellipse cx="${w * 0.75}" cy="${h * 0.16}" rx="${w * 0.10}" ry="${h * 0.05}" fill="white" opacity="0.45"/>
  <!-- Linha de horizon / muros -->
  <rect x="0" y="${h * 0.42}" width="${w}" height="${h * 0.06}" fill="#5a5e62"/>
  <!-- Asfalto -->
  <rect x="0" y="${h * 0.48}" width="${w}" height="${h * 0.52}" fill="url(#asphalt)"/>
  <!-- Linhas de estacionamento -->
  <rect x="${w * 0.12}" y="${h * 0.5}" width="${w * 0.004}" height="${h * 0.48}" fill="white" opacity="0.25"/>
  <rect x="${w * 0.30}" y="${h * 0.5}" width="${w * 0.004}" height="${h * 0.48}" fill="white" opacity="0.25"/>
  <rect x="${w * 0.50}" y="${h * 0.5}" width="${w * 0.004}" height="${h * 0.48}" fill="white" opacity="0.25"/>
  <rect x="${w * 0.70}" y="${h * 0.5}" width="${w * 0.004}" height="${h * 0.48}" fill="white" opacity="0.25"/>
  <rect x="${w * 0.88}" y="${h * 0.5}" width="${w * 0.004}" height="${h * 0.48}" fill="white" opacity="0.25"/>
  <!-- Manchas e desgaste no asfalto -->
  <ellipse cx="${w * 0.3}" cy="${h * 0.75}" rx="${w * 0.08}" ry="${h * 0.03}" fill="black" opacity="0.12"/>
  <ellipse cx="${w * 0.65}" cy="${h * 0.85}" rx="${w * 0.06}" ry="${h * 0.025}" fill="black" opacity="0.10"/>
  <!-- Grain texture -->
  <rect width="${w}" height="${h}" fill="url(#asphalt)" filter="url(#grain)" opacity="0.15"/>
  <!-- Luz flat / overcast (simula dia nublado sem sombras) -->
  <rect width="${w}" height="${h}" fill="#d0e4f0" opacity="0.06"/>
</svg>`
}

/* ── Gerar uma imagem demo: carro + fundo ─────────────────────────────── */
async function generateComposite(
  bgPath: string,
  outputPath: string,
  carColor: string,
  carAccent: string
) {
  const bg = await sharp(bgPath).resize(W, H).png().toBuffer()
  const carSvgBuf = Buffer.from(carSVG(W, H, carColor, carAccent))
  const carPng = await sharp(carSvgBuf).png().toBuffer()

  await sharp(bg)
    .composite([{ input: carPng, blend: 'over' }])
    .jpeg({ quality: 90 })
    .toFile(outputPath)
}

async function main() {
  fs.mkdirSync(OUT, { recursive: true })
  console.log('\nGenerating demo images...\n')

  // 1. "Before" — carro em estacionamento
  process.stdout.write('  before (outdoor)... ')
  const beforeBg = await sharp(Buffer.from(beforeBgSVG(W, H))).png().toBuffer()
  const carForBefore = Buffer.from(carSVG(W, H, '#1a2436', '#253348'))
  const carBeforePng = await sharp(carForBefore).png().toBuffer()
  await sharp(beforeBg)
    .composite([{ input: carBeforePng, blend: 'over' }])
    .jpeg({ quality: 88 })
    .toFile(path.join(OUT, 'before.jpg'))
  console.log('✓')

  // 2. "After" — carro em cada showroom
  const carColors: Record<string, [string, string]> = {
    nova:    ['#1a1a2e', '#252540'],
    elise:   ['#0a1628', '#142038'],
    origin:  ['#2a1a10', '#3a2818'],
    eclipse: ['#0a0a1a', '#141428'],
    horizon: ['#0a1428', '#14223a'],
  }

  for (const slug of SHOWROOMS) {
    process.stdout.write(`  after-${slug}... `)
    const bgPath = path.join(process.cwd(), 'public', 'showrooms', `${slug}-bg.png`)
    if (!fs.existsSync(bgPath)) { console.log('SKIP (bg not found)'); continue }
    const [color, accent] = carColors[slug]
    await generateComposite(bgPath, path.join(OUT, `after-${slug}.jpg`), color, accent)
    console.log('✓')
  }

  console.log('\nDone → public/demo/')
}

main().catch(e => { console.error(e); process.exit(1) })
