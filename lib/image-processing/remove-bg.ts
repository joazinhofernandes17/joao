import FormData from 'form-data'

export async function removeBackground(imageBuffer: Buffer): Promise<Buffer> {
  const apiKey = process.env.REMOVE_BG_API_KEY
  if (!apiKey) throw new Error('REMOVE_BG_API_KEY não configurada')

  const form = new FormData()
  form.append('image_file', imageBuffer, {
    filename: 'vehicle.png',
    contentType: 'image/png',
  })
  form.append('size', 'auto')
  form.append('type', 'auto')

  const response = await fetch('https://api.remove.bg/v1.0/removebg', {
    method: 'POST',
    headers: {
      'X-Api-Key': apiKey,
      ...form.getHeaders(),
    },
    body: form as any,
  })

  if (!response.ok) {
    const err = await response.text()
    throw new Error(`remove.bg erro ${response.status}: ${err}`)
  }

  const arrayBuffer = await response.arrayBuffer()
  return Buffer.from(arrayBuffer)
}
