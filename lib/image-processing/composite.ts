import sharp from 'sharp'
import path from 'path'
import fs from 'fs'
import { generateShowroomBackground } from './replicate'

// Configuração de posição do carro em cada showroom
const SHOWROOM_CONFIG: Record<string, {
  carWidthRatio: number
  carTopRatio: number
  shadowOpacity: number
}> = {
  nova:    { carWidthRatio: 0.78, carTopRatio: 0.22, shadowOpacity: 0.25 },
  elise:   { carWidthRatio: 0.75, carTopRatio: 0.25, shadowOpacity: 0.20 },
  origin:  { carWidthRatio: 0.80, carTopRatio: 0.20, shadowOpacity: 0.30 },
  eclipse: { carWidthRatio: 0.82, carTopRatio: 0.18, shadowOpacity: 0.15 },
  horizon: { carWidthRatio: 0.70, carTopRatio: 0.30, shadowOpacity: 0.35 },
}

export async function compositeOnShowroom(
  carNoBgBuffer: Buffer,
  showroomSlug: string,
  standLogoUrl?: string | null,
  standName?: string,
  preGeneratedBg?: Buffer,
): Promise<Buffer> {
  const config = SHOWROOM_CONFIG[showroomSlug] ?? SHOWROOM_CONFIG['nova']

  // Prioridade: buffer pré-gerado → PNG local → FLUX → gradiente SVG
  let bgBuffer: Buffer
  if (preGeneratedBg) {
    bgBuffer = preGeneratedBg
  } else {
    const bgPath = path.join(process.cwd(), 'public', 'showrooms', `${showroomSlug}-bg.png`)
    if (fs.existsSync(bgPath)) {
      bgBuffer = fs.readFileSync(bgPath)
    } else if (process.env.REPLICATE_API_TOKEN) {
      bgBuffer = await generateShowroomBackground(showroomSlug)
    } else {
      bgBuffer = await generateGradientBackground(showroomSlug)
    }
  }

  const bgMeta = await sharp(bgBuffer).metadata()
  const bgWidth = bgMeta.width ?? 2048
  const bgHeight = bgMeta.height ?? 1365

  const carTargetWidth = Math.round(bgWidth * config.carWidthRatio)
  const carResized = await sharp(carNoBgBuffer)
    .resize(carTargetWidth, undefined, { fit: 'inside', kernel: sharp.kernel.lanczos3 })
    .png()
    .toBuffer()

  const carMeta = await sharp(carResized).metadata()
  const carWidth = carMeta.width ?? carTargetWidth
  const carHeight = carMeta.height ?? 0

  const carLeft = Math.round((bgWidth - carWidth) / 2)
  const carTop = Math.round(bgHeight * config.carTopRatio)

  const shadowHeight = Math.round(carHeight * 0.08)
  const shadowWidth = Math.round(carWidth * 0.85)
  const shadowBuffer = await sharp({
    create: {
      width: shadowWidth,
      height: shadowHeight,
      channels: 4,
      background: { r: 0, g: 0, b: 0, alpha: config.shadowOpacity },
    },
  }).blur(12).png().toBuffer()

  const shadowLeft = carLeft + Math.round((carWidth - shadowWidth) / 2)
  const shadowTop = carTop + carHeight - Math.round(shadowHeight / 2)

  return sharp(bgBuffer)
    .composite([
      { input: shadowBuffer, left: shadowLeft, top: Math.min(shadowTop, bgHeight - shadowHeight - 1) },
      { input: carResized, left: carLeft, top: carTop },
    ])
    .png()
    .toBuffer()
}

async function generateGradientBackground(slug: string): Promise<Buffer> {
  const gradients: Record<string, [{ r: number; g: number; b: number }, { r: number; g: number; b: number }]> = {
    nova:    [{ r: 245, g: 245, b: 248 }, { r: 220, g: 220, b: 225 }],
    elise:   [{ r: 210, g: 212, b: 218 }, { r: 180, g: 183, b: 190 }],
    origin:  [{ r: 232, g: 228, b: 220 }, { r: 200, g: 196, b: 188 }],
    eclipse: [{ r: 20,  g: 22,  b: 30  }, { r: 10,  g: 12,  b: 18  }],
    horizon: [{ r: 255, g: 200, b: 140 }, { r: 255, g: 160, b: 80  }],
  }
  const [top, bot] = gradients[slug] ?? gradients['nova']
  const w = 2048
  const h = 1365
  const svg = `<svg width="${w}" height="${h}" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="g" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="rgb(${top.r},${top.g},${top.b})"/>
        <stop offset="100%" stop-color="rgb(${bot.r},${bot.g},${bot.b})"/>
      </linearGradient>
    </defs>
    <rect width="${w}" height="${h}" fill="url(#g)"/>
    <ellipse cx="${w / 2}" cy="${Math.round(h * 0.72)}" rx="${Math.round(w * 0.42)}" ry="${Math.round(h * 0.06)}"
      fill="rgba(0,0,0,0.08)"/>
  </svg>`
  return sharp(Buffer.from(svg)).png().toBuffer()
}
