/**
 * Gera backgrounds de showroom realistas para /public/showrooms/
 * npx tsx scripts/generate-showrooms.ts
 */

import sharp from 'sharp'
import path from 'path'
import fs from 'fs'

const OUT_DIR = path.join(process.cwd(), 'public', 'showrooms')
const W = 2048
const H = 1365
const TW = 600
const TH = 400

interface Config {
  slug: string
  // Parede (infinity cove)
  wallTop: string; wallMid: string; wallBot: string
  // Chão
  floorNear: string; floorFar: string
  // Plataforma
  platLight: string; platMid: string; platDark: string; platRing: string
  // Luzes
  keyLight: string; keyOpacity: number
  rimLight: string; rimOpacity: number
  fillLight: string; fillOpacity: number
  // Reflexo no chão
  floorReflect: string; floorReflectOpacity: number
}

const CONFIGS: Config[] = [
  {
    slug: 'nova',
    wallTop: '#ffffff', wallMid: '#f0f0f4', wallBot: '#e2e2e8',
    floorNear: '#d8d8de', floorFar: '#e8e8ee',
    platLight: '#ffffff', platMid: '#ececf2', platDark: '#d0d0d8', platRing: '#c8c8d2',
    keyLight: '#ffffff', keyOpacity: 0.55,
    rimLight: '#e8f0ff', rimOpacity: 0.3,
    fillLight: '#f0f4ff', fillOpacity: 0.2,
    floorReflect: '#ffffff', floorReflectOpacity: 0.18,
  },
  {
    slug: 'elise',
    wallTop: '#2a2d38', wallMid: '#1e2030', wallBot: '#161828',
    floorNear: '#12141e', floorFar: '#1a1c28',
    platLight: '#3a3d50', platMid: '#2e3044', platDark: '#222438', platRing: '#404460',
    keyLight: '#c8d4ff', keyOpacity: 0.45,
    rimLight: '#8090ff', rimOpacity: 0.25,
    fillLight: '#a0b0ff', fillOpacity: 0.15,
    floorReflect: '#6080ff', floorReflectOpacity: 0.12,
  },
  {
    slug: 'origin',
    wallTop: '#f5f0e8', wallMid: '#ece4d4', wallBot: '#ddd4c0',
    floorNear: '#c8bca8', floorFar: '#d8cebb',
    platLight: '#f0ebe0', platMid: '#e0d8c8', platDark: '#c8bfac', platRing: '#b8b0a0',
    keyLight: '#fff8e8', keyOpacity: 0.5,
    rimLight: '#ffe8c0', rimOpacity: 0.3,
    fillLight: '#fff0d8', fillOpacity: 0.2,
    floorReflect: '#ffd880', floorReflectOpacity: 0.14,
  },
  {
    slug: 'eclipse',
    wallTop: '#080810', wallMid: '#0c0c18', wallBot: '#10101c',
    floorNear: '#060608', floorFar: '#0a0a14',
    platLight: '#1c1c2c', platMid: '#141420', platDark: '#0c0c16', platRing: '#282840',
    keyLight: '#4060ff', keyOpacity: 0.35,
    rimLight: '#ff4080', rimOpacity: 0.2,
    fillLight: '#2040ff', fillOpacity: 0.15,
    floorReflect: '#3050ff', floorReflectOpacity: 0.2,
  },
  {
    slug: 'horizon',
    wallTop: '#0a1428', wallMid: '#1a2848', wallBot: '#2a3c60',
    floorNear: '#101824', floorFar: '#1c2840',
    platLight: '#2a3858', platMid: '#1e2c48', platDark: '#141e34', platRing: '#303e5c',
    keyLight: '#ff8030', keyOpacity: 0.4,
    rimLight: '#ffb060', rimOpacity: 0.3,
    fillLight: '#ff6020', fillOpacity: 0.15,
    floorReflect: '#ff6820', floorReflectOpacity: 0.18,
  },
]

function buildSVG(c: Config, w: number, h: number): string {
  // Layout key points
  const horizonY  = h * 0.48          // linha parede/chão (visualmente)
  const coveH     = h * 0.14          // altura da curva infinity cove
  const coveY     = horizonY - coveH  // topo da curva
  const platCX    = w * 0.50
  const platCY    = h * 0.735
  const platRX    = w * 0.365
  const platRY    = h * 0.070
  const platDepth = platRY * 0.18     // espessura lateral da plataforma

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}">
  <defs>
    <!-- PAREDE -->
    <linearGradient id="gWall" x1="0" y1="0" x2="0" y2="1" gradientUnits="objectBoundingBox">
      <stop offset="0%"   stop-color="${c.wallTop}"/>
      <stop offset="55%"  stop-color="${c.wallMid}"/>
      <stop offset="100%" stop-color="${c.wallBot}"/>
    </linearGradient>

    <!-- CHÃO -->
    <linearGradient id="gFloor" x1="0" y1="0" x2="0" y2="1" gradientUnits="objectBoundingBox">
      <stop offset="0%"   stop-color="${c.floorFar}"/>
      <stop offset="100%" stop-color="${c.floorNear}"/>
    </linearGradient>

    <!-- COVE (curva suave parede→chão) -->
    <linearGradient id="gCove" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%"   stop-color="${c.wallBot}" stop-opacity="1"/>
      <stop offset="100%" stop-color="${c.floorFar}" stop-opacity="1"/>
    </linearGradient>

    <!-- LUZ PRINCIPAL (overhead key light) -->
    <radialGradient id="gKey" cx="50%" cy="10%" r="70%" gradientUnits="objectBoundingBox">
      <stop offset="0%"   stop-color="${c.keyLight}" stop-opacity="${c.keyOpacity}"/>
      <stop offset="100%" stop-color="${c.keyLight}" stop-opacity="0"/>
    </radialGradient>

    <!-- LUZ DE CONTORNO (rim) — lado direito -->
    <radialGradient id="gRim" cx="90%" cy="35%" r="55%" gradientUnits="objectBoundingBox">
      <stop offset="0%"   stop-color="${c.rimLight}" stop-opacity="${c.rimOpacity}"/>
      <stop offset="100%" stop-color="${c.rimLight}" stop-opacity="0"/>
    </radialGradient>

    <!-- LUZ DE PREENCHIMENTO (fill) — lado esquerdo -->
    <radialGradient id="gFill" cx="10%" cy="40%" r="55%" gradientUnits="objectBoundingBox">
      <stop offset="0%"   stop-color="${c.fillLight}" stop-opacity="${c.fillOpacity}"/>
      <stop offset="100%" stop-color="${c.fillLight}" stop-opacity="0"/>
    </radialGradient>

    <!-- REFLEXO NO CHÃO sob a plataforma -->
    <radialGradient id="gFloorRefl" cx="50%" cy="50%" r="50%">
      <stop offset="0%"   stop-color="${c.floorReflect}" stop-opacity="${c.floorReflectOpacity}"/>
      <stop offset="70%"  stop-color="${c.floorReflect}" stop-opacity="${c.floorReflectOpacity * 0.4}"/>
      <stop offset="100%" stop-color="${c.floorReflect}" stop-opacity="0"/>
    </radialGradient>

    <!-- PLATAFORMA: face superior -->
    <radialGradient id="gPlat" cx="40%" cy="35%" r="65%">
      <stop offset="0%"   stop-color="${c.platLight}"/>
      <stop offset="50%"  stop-color="${c.platMid}"/>
      <stop offset="100%" stop-color="${c.platDark}"/>
    </radialGradient>

    <!-- PLATAFORMA: lateral (profundidade) -->
    <linearGradient id="gPlatSide" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%"   stop-color="${c.platDark}"/>
      <stop offset="100%" stop-color="${c.platDark}" stop-opacity="0.5"/>
    </linearGradient>

    <!-- SOMBRA suave sob a plataforma -->
    <radialGradient id="gShadow" cx="50%" cy="50%" r="50%">
      <stop offset="0%"   stop-color="#000000" stop-opacity="0.40"/>
      <stop offset="60%"  stop-color="#000000" stop-opacity="0.15"/>
      <stop offset="100%" stop-color="#000000" stop-opacity="0"/>
    </radialGradient>

    <!-- SPECULAR highlight na plataforma -->
    <radialGradient id="gSpec" cx="38%" cy="30%" r="40%">
      <stop offset="0%"   stop-color="#ffffff" stop-opacity="0.45"/>
      <stop offset="100%" stop-color="#ffffff" stop-opacity="0"/>
    </radialGradient>

    <filter id="fBlur4">
      <feGaussianBlur stdDeviation="4"/>
    </filter>
    <filter id="fBlur10">
      <feGaussianBlur stdDeviation="10"/>
    </filter>
    <filter id="fBlur20">
      <feGaussianBlur stdDeviation="20"/>
    </filter>
  </defs>

  <!-- ═══════════════════════════════════════════ -->
  <!-- FUNDO: parede                               -->
  <!-- ═══════════════════════════════════════════ -->
  <rect x="0" y="0" width="${w}" height="${h}" fill="url(#gWall)"/>

  <!-- ═══════════════════════════════════════════ -->
  <!-- INFINITY COVE — curva suave parede→chão     -->
  <!-- Bezier path que simula a curva de estúdio   -->
  <!-- ═══════════════════════════════════════════ -->
  <path d="
    M 0 ${coveY}
    Q 0 ${horizonY + coveH * 0.5}, ${w * 0.18} ${horizonY + coveH}
    L ${w * 0.82} ${horizonY + coveH}
    Q ${w} ${horizonY + coveH * 0.5}, ${w} ${coveY}
    L ${w} ${coveY + coveH}
    Q ${w} ${horizonY + coveH}, ${w * 0.82} ${horizonY + coveH * 1.1}
    L ${w * 0.18} ${horizonY + coveH * 1.1}
    Q 0 ${horizonY + coveH}, 0 ${coveY + coveH}
    Z
  " fill="url(#gCove)" opacity="0.85"/>

  <!-- ═══════════════════════════════════════════ -->
  <!-- CHÃO                                        -->
  <!-- ═══════════════════════════════════════════ -->
  <rect x="0" y="${horizonY + coveH * 0.6}" width="${w}" height="${h - horizonY - coveH * 0.6}" fill="url(#gFloor)"/>

  <!-- Linha de junção suave -->
  <ellipse cx="${w / 2}" cy="${horizonY + coveH * 0.9}" rx="${w * 0.55}" ry="${h * 0.025}"
    fill="${c.wallBot}" opacity="0.3" filter="url(#fBlur10)"/>

  <!-- ═══════════════════════════════════════════ -->
  <!-- LUZES DE ESTÚDIO                            -->
  <!-- ═══════════════════════════════════════════ -->
  <rect x="0" y="0" width="${w}" height="${h}" fill="url(#gKey)"/>
  <rect x="0" y="0" width="${w}" height="${h}" fill="url(#gRim)"/>
  <rect x="0" y="0" width="${w}" height="${h}" fill="url(#gFill)"/>

  <!-- ═══════════════════════════════════════════ -->
  <!-- REFLEXO NO CHÃO                             -->
  <!-- ═══════════════════════════════════════════ -->
  <ellipse cx="${platCX}" cy="${platCY + platRY}" rx="${platRX * 1.3}" ry="${platRY * 2.2}"
    fill="url(#gFloorRefl)"/>

  <!-- Linha de reflexo horizontal no chão (gloss) -->
  <ellipse cx="${platCX}" cy="${platCY + platRY * 1.6}" rx="${platRX * 1.5}" ry="${platRY * 0.18}"
    fill="${c.floorReflect}" opacity="${c.floorReflectOpacity * 0.5}" filter="url(#fBlur4)"/>

  <!-- ═══════════════════════════════════════════ -->
  <!-- SOMBRA SOB A PLATAFORMA                     -->
  <!-- ═══════════════════════════════════════════ -->
  <ellipse cx="${platCX}" cy="${platCY + platRY * 0.4}" rx="${platRX * 0.92}" ry="${platRY * 0.55}"
    fill="url(#gShadow)" filter="url(#fBlur10)"/>

  <!-- ═══════════════════════════════════════════ -->
  <!-- PLATAFORMA (turntable)                      -->
  <!-- ═══════════════════════════════════════════ -->

  <!-- Lateral/profundidade da plataforma -->
  <path d="
    M ${platCX - platRX} ${platCY}
    A ${platRX} ${platRY} 0 0 0 ${platCX + platRX} ${platCY}
    L ${platCX + platRX} ${platCY + platDepth}
    A ${platRX} ${platRY} 0 0 1 ${platCX - platRX} ${platCY + platDepth}
    Z
  " fill="url(#gPlatSide)"/>

  <!-- Face superior da plataforma -->
  <ellipse cx="${platCX}" cy="${platCY}" rx="${platRX}" ry="${platRY}" fill="url(#gPlat)"/>

  <!-- Anel exterior decorativo -->
  <ellipse cx="${platCX}" cy="${platCY}" rx="${platRX * 0.97}" ry="${platRY * 0.97}"
    fill="none" stroke="${c.platRing}" stroke-width="${w * 0.003}" opacity="0.6"/>

  <!-- Anel intermédio -->
  <ellipse cx="${platCX}" cy="${platCY}" rx="${platRX * 0.72}" ry="${platRY * 0.72}"
    fill="none" stroke="${c.platRing}" stroke-width="${w * 0.0018}" opacity="0.4"/>

  <!-- Anel interior -->
  <ellipse cx="${platCX}" cy="${platCY}" rx="${platRX * 0.42}" ry="${platRY * 0.42}"
    fill="none" stroke="${c.platRing}" stroke-width="${w * 0.0015}" opacity="0.3"/>

  <!-- Centro da plataforma -->
  <ellipse cx="${platCX}" cy="${platCY}" rx="${platRX * 0.06}" ry="${platRY * 0.06}"
    fill="${c.platRing}" opacity="0.5"/>

  <!-- Highlight especular na plataforma -->
  <ellipse cx="${platCX}" cy="${platCY}" rx="${platRX}" ry="${platRY}" fill="url(#gSpec)"/>

  <!-- Reflexo linear na superfície da plataforma -->
  <path d="
    M ${platCX - platRX * 0.55} ${platCY - platRY * 0.15}
    Q ${platCX} ${platCY - platRY * 0.35}, ${platCX + platRX * 0.55} ${platCY - platRY * 0.15}
  " fill="none" stroke="white" stroke-width="${w * 0.003}" opacity="0.25" stroke-linecap="round"/>
</svg>`
}

async function generate(config: Config) {
  process.stdout.write(`  ${config.slug}... `)

  const svgFull  = buildSVG(config, W, H)
  const svgThumb = buildSVG(config, TW, TH)

  await sharp(Buffer.from(svgFull))
    .png({ compressionLevel: 8 })
    .toFile(path.join(OUT_DIR, `${config.slug}-bg.png`))

  await sharp(Buffer.from(svgThumb))
    .png({ compressionLevel: 9 })
    .toFile(path.join(OUT_DIR, `${config.slug}-thumb.png`))

  console.log(`✓ (${W}×${H} + ${TW}×${TH})`)
}

async function main() {
  fs.mkdirSync(OUT_DIR, { recursive: true })
  console.log('\nGenerating showroom backgrounds...\n')
  for (const c of CONFIGS) await generate(c)
  console.log('\nAll done → public/showrooms/')
}

main().catch(e => { console.error(e); process.exit(1) })
