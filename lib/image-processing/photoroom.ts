// PhotoRoom Image Editing API v2 — remoção de fundo de alta precisão
// Docs: https://docs.photoroom.com/image-editing-api-plus-plan/quickstart-guide
// Configurar: PHOTOROOM_API_KEY no Vercel
//
// Nota de plano:
//   Basic  → removeBackground apenas (esta função)
//   Plus   → removeBackground + background.prompt + shadow.mode
//
// Esta função usa só remoção de fundo (funciona em todos os planos).
// O fundo de showroom é gerado pelo FLUX via compositeOnShowroom.

const ENDPOINT = 'https://image-api.photoroom.com/v2/edit'

export async function removeBackgroundPhotoRoom(imageBuffer: Buffer): Promise<Buffer> {
  const apiKey = process.env.PHOTOROOM_API_KEY
  if (!apiKey) throw new Error('PHOTOROOM_API_KEY não configurada')

  const form = new FormData()
  form.append('imageFile', new Blob([imageBuffer.buffer as ArrayBuffer], { type: 'image/png' }), 'car.png')
  // removeBackground=true por omissão — devolve PNG com fundo transparente

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
