import sharp from 'sharp'

export interface EnhanceOptions {
  brightness?: number   // 1.0 = normal, >1 mais brilhante
  contrast?: number     // 1.0 = normal
  saturation?: number   // 1.0 = normal
  sharpen?: boolean
  targetWidthPx?: number  // mínimo 2048 para 2K
}

export async function enhanceImage(
  inputBuffer: Buffer,
  options: EnhanceOptions = {}
): Promise<Buffer> {
  const {
    brightness = 1.05,
    contrast = 1.1,
    saturation = 1.1,
    sharpen = true,
    targetWidthPx = 2048,
  } = options

  const metadata = await sharp(inputBuffer).metadata()
  const { width = 0, height = 0 } = metadata

  let pipeline = sharp(inputBuffer)

  // Upscale com sharp se ainda não atingiu 2K (fallback se Replicate não disponível)
  if (width < targetWidthPx) {
    const scale = Math.ceil(targetWidthPx / width)
    pipeline = pipeline.resize(width * scale, height * scale, {
      kernel: sharp.kernel.lanczos3,
      fit: 'fill',
    })
  }

  // Modulate: brilho + saturação
  pipeline = pipeline.modulate({
    brightness,
    saturation,
  })

  // Contraste via linear
  pipeline = pipeline.linear(contrast, -(128 * (contrast - 1)))

  // Sharpen suave
  if (sharpen) {
    pipeline = pipeline.sharpen({ sigma: 0.8, m1: 1.5, m2: 0.7 })
  }

  // Normalizar (auto-levels) — remove cast de cor e melhora imagens com sol
  pipeline = pipeline.normalize()

  return pipeline.png().toBuffer()
}

export async function getImageMetadata(buffer: Buffer) {
  const meta = await sharp(buffer).metadata()
  return {
    width: meta.width ?? 0,
    height: meta.height ?? 0,
    format: meta.format,
    size: buffer.length,
  }
}
