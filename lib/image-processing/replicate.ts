import Replicate from 'replicate'

const replicate = new Replicate({ auth: process.env.REPLICATE_API_TOKEN })

// Prompts optimizados para fundos de showroom por ambiente
const ENVIRONMENT_PROMPTS: Record<string, string> = {
  nova: [
    'professional car dealership showroom interior, pure white infinity cove background,',
    'seamless white floor, soft diffused overhead studio lighting, clean minimalist aesthetic,',
    'automotive photography studio, no car, empty background only, photorealistic, 4k',
  ].join(' '),
  elise: [
    'luxury car showroom interior, dark navy blue studio background,',
    'cold blue rim lighting, glossy dark concrete floor, dramatic shadows,',
    'premium automotive photography studio background, no car, empty, photorealistic, 4k',
  ].join(' '),
  origin: [
    'classic elegant car showroom, warm cream and beige studio background,',
    'warm tungsten lighting, polished travertine floor, sophisticated atmosphere,',
    'automotive photography background, no car, empty, photorealistic, 4k',
  ].join(' '),
  eclipse: [
    'dramatic car studio, pure black background, high contrast lighting,',
    'deep violet and purple accent lights, reflective black marble floor,',
    'cinematic automotive photography background, no car, empty, photorealistic, 4k',
  ].join(' '),
  horizon: [
    'outdoor car photography location, golden hour sunset sky, warm orange light,',
    'clean asphalt surface, distant horizon, cinematic automotive backdrop,',
    'no car, empty location, photorealistic, 4k',
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

// Gera fundo de showroom com FLUX-schnell
export async function generateShowroomBackground(slug: string): Promise<Buffer> {
  const prompt = ENVIRONMENT_PROMPTS[slug] ?? ENVIRONMENT_PROMPTS.nova

  const output = await replicate.run(
    'black-forest-labs/flux-schnell',
    {
      input: {
        prompt,
        num_outputs: 1,
        aspect_ratio: '3:2',
        output_format: 'png',
        output_quality: 95,
        num_inference_steps: 4,
        go_fast: true,
      },
    }
  )

  const url = await resolveUrl(output)
  const res = await fetch(url)
  if (!res.ok) throw new Error(`Falha ao descarregar fundo gerado: ${res.status}`)
  return Buffer.from(await res.arrayBuffer())
}
