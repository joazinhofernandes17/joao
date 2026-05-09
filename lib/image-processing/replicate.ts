import Replicate from 'replicate'

const replicate = new Replicate({ auth: process.env.REPLICATE_API_TOKEN })

// FLUX.1 [dev] — 28 inference steps, muito melhor que schnell (4 steps) em cenas
// arquitectónicas e de estúdio. Mesma API key, sem custo adicional de licença.
// Para qualidade máxima usar flux-1.1-pro (pago ~$0.04/img).
const FLUX_MODEL = 'black-forest-labs/flux-dev'

// Prompts detalhados para fotografia automóvel profissional
// Incluem: tipo de iluminação, material do chão, plataforma circular, perspectiva
const ENVIRONMENT_PROMPTS: Record<string, string> = {
  nova: [
    'professional automotive photography studio, pure white seamless infinity cove backdrop,',
    'circular car turntable platform centred on polished white epoxy floor,',
    'subtle car shadow on floor, large overhead softbox diffused lighting,',
    'secondary fill lights eliminating harsh shadows, slight vignette at edges,',
    'empty studio with no car, commercial product photography, photorealistic, 8k',
  ].join(' '),
  elise: [
    'premium luxury car photography studio, deep navy blue seamless backdrop,',
    'circular platform centred on high-gloss dark concrete floor with specular reflections,',
    'cold blue LED rim lighting from both sides, dramatic low-key studio setup,',
    'single key light from above-left creating sharp shadows, empty studio no car,',
    'cinematic commercial automotive photography, photorealistic, 8k',
  ].join(' '),
  origin: [
    'classic elegant car showroom interior, warm cream and ivory infinity cove backdrop,',
    'circular platform on polished travertine marble floor, warm tungsten key light,',
    'amber fill light on opposite side, soft Renaissance-style dramatic chiaroscuro,',
    'delicate floor reflection beneath platform, empty showroom no car,',
    'high-end commercial automotive photography, photorealistic, 8k',
  ].join(' '),
  eclipse: [
    'cinematic dark automotive studio, pure black background with deep vignette,',
    'circular platform on mirror-polished black marble floor,',
    'deep violet and indigo LED accent rim lights from rear, single hard key light from above,',
    'high-contrast dramatic shadows, subtle floor reflections, empty studio no car,',
    'IMAX-quality cinematic automotive photography, photorealistic, 8k',
  ].join(' '),
  horizon: [
    'outdoor premium automotive photography location, golden hour sunset sky,',
    'warm orange and amber gradient above the horizon, raised circular display platform,',
    'premium dark asphalt surface with tyre marks, warm golden rim light on platform edges,',
    'lens flare from low sun at camera left, blurred distant horizon, empty location no car,',
    'commercial outdoor car photography, photorealistic, 8k',
  ].join(' '),
}

// Resolve o output do Replicate SDK v1.x (pode ser string, FileOutput, ou array)
async function resolveUrl(output: unknown): Promise<string> {
  if (typeof output === 'string') return output
  if (Array.isArray(output)) return resolveUrl(output[0])
  if (output && typeof (output as any).url === 'function') {
    const u = await (output as any).url()
    return u instanceof URL ? u.toString() : String(u)
  }
  throw new Error('Formato de output do Replicate não reconhecido')
}

// Upscale 4× com Real-ESRGAN
export async function upscaleImage(imageUrl: string): Promise<string> {
  const output = await replicate.run(
    'nightmareai/real-esrgan:42fed1c4974146d4d2414e2be2c5277c7fcf05fcc3a73abf41610695738c1d7b',
    {
      input: {
        image: imageUrl,
        scale: 4,
        face_enhance: false,
      },
    }
  )
  return resolveUrl(output)
}

// Gera fundo de showroom com FLUX.1 [dev] — 28 steps, resultado fotorrealista
export async function generateShowroomBackground(slug: string): Promise<Buffer> {
  const prompt = ENVIRONMENT_PROMPTS[slug] ?? ENVIRONMENT_PROMPTS.nova

  const output = await replicate.run(FLUX_MODEL, {
    input: {
      prompt,
      num_outputs: 1,
      aspect_ratio: '3:2',
      output_format: 'png',
      output_quality: 95,
      num_inference_steps: 28,
      guidance: 3.5,
    },
  })

  const url = await resolveUrl(output)
  const res = await fetch(url)
  if (!res.ok) throw new Error(`Falha ao descarregar fundo gerado: ${res.status}`)
  return Buffer.from(await res.arrayBuffer())
}
