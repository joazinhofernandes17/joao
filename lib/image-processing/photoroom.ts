// PhotoRoom API — remoção de fundo + fundo IA + sombra numa só chamada
// Documentação: https://www.photoroom.com/api/docs
// Configurar: PHOTOROOM_API_KEY no Vercel

const ENDPOINT = 'https://sdk.photoroom.com/v1/segment'

// Prompts por ambiente — PhotoRoom usa bg_prompt para gerar o fundo IA
const BG_PROMPTS: Record<string, string> = {
  nova: [
    'professional car showroom, pure white infinity cove studio background,',
    'seamless white floor, circular turntable platform, soft overhead studio lighting,',
    'clean minimalist automotive photography, photorealistic',
  ].join(' '),
  elise: [
    'luxury car showroom, dark navy blue studio background,',
    'circular platform on glossy dark concrete floor, cold blue rim lighting,',
    'dramatic premium automotive photography, photorealistic',
  ].join(' '),
  origin: [
    'classic elegant car showroom, warm cream and beige studio background,',
    'circular platform on polished travertine floor, warm tungsten lighting,',
    'sophisticated automotive photography, photorealistic',
  ].join(' '),
  eclipse: [
    'dramatic car studio, pure black background, high contrast studio lighting,',
    'circular platform on reflective black marble floor, deep violet accent lights,',
    'cinematic automotive photography, photorealistic',
  ].join(' '),
  horizon: [
    'outdoor golden hour automotive backdrop, warm orange sunset sky,',
    'circular platform on clean asphalt surface, distant horizon,',
    'cinematic car photography location, photorealistic',
  ].join(' '),
}

export async function processWithPhotoRoom(
  imageBuffer: Buffer,
  showroomSlug: string,
): Promise<Buffer> {
  const apiKey = process.env.PHOTOROOM_API_KEY
  if (!apiKey) throw new Error('PHOTOROOM_API_KEY não configurada')

  const bgPrompt = BG_PROMPTS[showroomSlug] ?? BG_PROMPTS.nova

  const form = new FormData()
  form.append('image_file', new Blob([imageBuffer.buffer as ArrayBuffer], { type: 'image/png' }), 'car.png')
  form.append('bg_prompt', bgPrompt)
  form.append('shadow_mode', 'ai.soft')   // sombra IA suave no chão
  form.append('format', 'png')
  form.append('size', 'full')              // resolução máxima

  const res = await fetch(ENDPOINT, {
    method: 'POST',
    headers: { 'x-api-key': apiKey },
    body: form,
  })

  if (!res.ok) {
    const msg = await res.text()
    throw new Error(`PhotoRoom erro ${res.status}: ${msg}`)
  }

  return Buffer.from(await res.arrayBuffer())
}
