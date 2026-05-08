/**
 * Gera os backgrounds de showroom para /public/showrooms/
 * Corre com: npx tsx scripts/generate-showrooms.ts
 */

import sharp from 'sharp'
import path from 'path'
import fs from 'fs'

const OUT_DIR = path.join(process.cwd(), 'public', 'showrooms')
const W = 2048
const H = 1365
const TW = 400  // thumbnail width
const TH = 267  // thumbnail height

interface ShowroomConfig {
  slug: string
  name: string
  floor1: string   // cor topo do chão
  floor2: string   // cor base do chão
  wall1: string    // cor topo da parede
  wall2: string    // cor base da parede
  platform: string // cor da plataforma circular
  platformOpacity: number
  lightColor: string
  lightOpacity: number
}

const SHOWROOMS: ShowroomConfig[] = [
  {
    slug: 'nova',
    name: 'Nova',
    floor1: '#e8e8ec', floor2: '#d0d0d8',
    wall1: '#f5f5f8', wall2: '#e8e8ec',
    platform: '#ffffff', platformOpacity: 0.6,
    lightColor: '#ffffff', lightOpacity: 0.4,
  },
  {
    slug: 'elise',
    name: 'Elise',
    floor1: '#c8cad0', floor2: '#b0b3bc',
    wall1: '#d8dae0', wall2: '#c8cad0',
    platform: '#e0e2e8', platformOpacity: 0.5,
    lightColor: '#d0d8ff', lightOpacity: 0.25,
  },
  {
    slug: 'origin',
    name: 'Origin',
    floor1: '#ddd8cc', floor2: '#c8c0b0',
    wall1: '#eae5dc', wall2: '#ddd8cc',
    platform: '#f0ece4', platformOpacity: 0.5,
    lightColor: '#fff8e8', lightOpacity: 0.3,
  },
  {
    slug: 'eclipse',
    name: 'Eclipse',
    floor1: '#181820', floor2: '#0c0c14',
    wall1: '#1e1e28', wall2: '#181820',
    platform: '#2a2a38', platformOpacity: 0.7,
    lightColor: '#4060ff', lightOpacity: 0.15,
  },
  {
    slug: 'horizon',
    name: 'Horizon',
    floor1: '#c87020', floor2: '#8c4010',
    wall1: '#ff9030', wall2: '#c87020',
    platform: '#e07820', platformOpacity: 0.4,
    lightColor: '#ffe0a0', lightOpacity: 0.35,
  },
]

function hexToRgb(hex: string) {
  const r = parseInt(hex.slice(1, 3), 16)
  const g = parseInt(hex.slice(3, 5), 16)
  const b = parseInt(hex.slice(5, 7), 16)
  return { r, g, b }
}

function buildSvg(c: ShowroomConfig, w: number, h: number): string {
  const floorY = Math.round(h * 0.55)          // linha do horizonte
  const platformCX = Math.round(w / 2)
  const platformCY = Math.round(h * 0.72)
  const platformRX = Math.round(w * 0.38)
  const platformRY = Math.round(h * 0.065)
  const lightR = Math.round(w * 0.55)

  const wall1 = hexToRgb(c.wall1)
  const wall2 = hexToRgb(c.wall2)
  const floor1 = hexToRgb(c.floor1)
  const floor2 = hexToRgb(c.floor2)
  const plat = hexToRgb(c.platform)
  const light = hexToRgb(c.lightColor)

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">
  <defs>
    <!-- Parede: gradiente vertical -->
    <linearGradient id="wall" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="rgb(${wall1.r},${wall1.g},${wall1.b})"/>
      <stop offset="100%" stop-color="rgb(${wall2.r},${wall2.g},${wall2.b})"/>
    </linearGradient>
    <!-- Chão: gradiente vertical -->
    <linearGradient id="floor" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="rgb(${floor1.r},${floor1.g},${floor1.b})"/>
      <stop offset="100%" stop-color="rgb(${floor2.r},${floor2.g},${floor2.b})"/>
    </linearGradient>
    <!-- Luz de estúdio no tecto -->
    <radialGradient id="toplight" cx="50%" cy="0%" r="60%">
      <stop offset="0%" stop-color="rgb(${light.r},${light.g},${light.b})" stop-opacity="${c.lightOpacity}"/>
      <stop offset="100%" stop-color="rgb(${light.r},${light.g},${light.b})" stop-opacity="0"/>
    </radialGradient>
    <!-- Plataforma circular -->
    <radialGradient id="platform" cx="50%" cy="35%" r="55%">
      <stop offset="0%" stop-color="rgb(${Math.min(plat.r + 30, 255)},${Math.min(plat.g + 30, 255)},${Math.min(plat.b + 30, 255)})" stop-opacity="${c.platformOpacity}"/>
      <stop offset="100%" stop-color="rgb(${plat.r},${plat.g},${plat.b})" stop-opacity="${c.platformOpacity * 0.6}"/>
    </radialGradient>
    <!-- Reflexo do chão sob a plataforma -->
    <radialGradient id="reflection" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="rgb(${light.r},${light.g},${light.b})" stop-opacity="0.18"/>
      <stop offset="100%" stop-color="rgb(${light.r},${light.g},${light.b})" stop-opacity="0"/>
    </radialGradient>
  </defs>

  <!-- Parede de fundo -->
  <rect x="0" y="0" width="${w}" height="${floorY}" fill="url(#wall)"/>
  <!-- Chão -->
  <rect x="0" y="${floorY}" width="${w}" height="${h - floorY}" fill="url(#floor)"/>

  <!-- Curva suave parede/chão (rodapé) -->
  <ellipse cx="${w / 2}" cy="${floorY}" rx="${w * 0.65}" ry="${h * 0.04}"
    fill="url(#floor)" opacity="0.6"/>

  <!-- Luz de estúdio no tecto -->
  <rect x="0" y="0" width="${w}" height="${h}" fill="url(#toplight)"/>

  <!-- Reflexo no chão sob a plataforma -->
  <ellipse cx="${platformCX}" cy="${platformCY}" rx="${platformRX * 1.1}" ry="${platformRY * 1.8}"
    fill="url(#reflection)"/>

  <!-- Plataforma circular (turntable) -->
  <ellipse cx="${platformCX}" cy="${platformCY}" rx="${platformRX}" ry="${platformRY}"
    fill="url(#platform)" stroke="rgba(255,255,255,0.12)" stroke-width="1"/>

  <!-- Anel interior da plataforma -->
  <ellipse cx="${platformCX}" cy="${platformCY}" rx="${platformRX * 0.72}" ry="${platformRY * 0.72}"
    fill="none" stroke="rgba(255,255,255,0.08)" stroke-width="1.5"/>

  <!-- Sombra suave na base da plataforma -->
  <ellipse cx="${platformCX}" cy="${platformCY + platformRY * 0.4}" rx="${platformRX * 0.9}" ry="${platformRY * 0.35}"
    fill="rgba(0,0,0,0.12)" filter="url(#blur)"/>
</svg>`
}

async function generateShowroom(config: ShowroomConfig) {
  console.log(`Generating ${config.name}...`)

  // Background principal (2048x1365)
  const svgFull = buildSvg(config, W, H)
  const bgPath = path.join(OUT_DIR, `${config.slug}-bg.png`)
  await sharp(Buffer.from(svgFull))
    .resize(W, H)
    .png({ compressionLevel: 8 })
    .toFile(bgPath)

  // Thumbnail (400x267)
  const svgThumb = buildSvg(config, TW, TH)
  const thumbPath = path.join(OUT_DIR, `${config.slug}-thumb.png`)
  await sharp(Buffer.from(svgThumb))
    .resize(TW, TH)
    .png({ compressionLevel: 9 })
    .toFile(thumbPath)

  console.log(`  ✓ ${config.slug}-bg.png (${W}x${H})`)
  console.log(`  ✓ ${config.slug}-thumb.png (${TW}x${TH})`)
}

async function main() {
  fs.mkdirSync(OUT_DIR, { recursive: true })
  console.log(`\nGenerating showroom backgrounds → ${OUT_DIR}\n`)

  for (const config of SHOWROOMS) {
    await generateShowroom(config)
  }

  console.log('\nDone! All showroom backgrounds generated.')
}

main().catch(err => {
  console.error(err)
  process.exit(1)
})
