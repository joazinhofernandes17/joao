import Replicate from 'replicate'

// bria-ai/rembg usa BRIA RMBG 2.0 — melhor precisão em carros e objectos complexos
// Alternativa: 'lucataco/remove-bg:95fcc2a26d3899cd6c2691c900465aaeff466285d65bf' (BRIA RMBG 1.4)
const MODEL = 'bria-ai/rembg'

const replicate = new Replicate({ auth: process.env.REPLICATE_API_TOKEN })

async function resolveUrl(output: unknown): Promise<string> {
  if (typeof output === 'string') return output
  if (Array.isArray(output)) return resolveUrl(output[0])
  if (output && typeof (output as any).url === 'function') {
    const u = await (output as any).url()
    return u instanceof URL ? u.toString() : String(u)
  }
  throw new Error('Formato de output do Replicate não reconhecido')
}

export async function removeBackground(imageUrl: string): Promise<Buffer> {
  if (!process.env.REPLICATE_API_TOKEN) throw new Error('REPLICATE_API_TOKEN não configurado')

  const output = await replicate.run(MODEL, {
    input: { image: imageUrl },
  })

  const url = await resolveUrl(output)
  const res = await fetch(url)
  if (!res.ok) throw new Error(`Falha ao descarregar imagem sem fundo: ${res.status}`)
  return Buffer.from(await res.arrayBuffer())
}
