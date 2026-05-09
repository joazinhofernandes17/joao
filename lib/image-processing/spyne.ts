// Spyne.ai Automotive Background API
// Especializado em fotografia automóvel — treinado em 100M+ fotos de carros
// Docs:     https://docs.spyne.ai/reference/autotransformation
// Registo:  https://app.spyne.ai  (plano gratuito disponível)
//
// ── Configuração necessária ──────────────────────────────────────────────────
// 1. Cria conta em app.spyne.ai → Developer Hub → API Keys → gera chave
// 2. No dashboard Spyne vai a "Backgrounds" e obtém os IDs dos ambientes
// 3. Adiciona no Vercel:
//      SPYNE_API_KEY     = sk_live_xxxxxxxxxxxxxxxx
//      SPYNE_BG_NOVA     = <id do fundo branco de estúdio>
//      SPYNE_BG_ELISE    = <id do fundo escuro premium>
//      SPYNE_BG_ORIGIN   = <id do fundo creme/quente>
//      SPYNE_BG_ECLIPSE  = <id do fundo preto dramático>
//      SPYNE_BG_HORIZON  = <id do fundo exterior pôr do sol>
// ────────────────────────────────────────────────────────────────────────────

const API_BASE = 'https://api.spyne.ai/api/pv1'

// IDs de fundo por ambiente — configurar via env vars após obter do dashboard Spyne
// Os valores por omissão são placeholders; substituir com IDs reais
const BACKGROUND_IDS: Record<string, string> = {
  nova:    process.env.SPYNE_BG_NOVA    ?? '',
  elise:   process.env.SPYNE_BG_ELISE   ?? '',
  origin:  process.env.SPYNE_BG_ORIGIN  ?? '',
  eclipse: process.env.SPYNE_BG_ECLIPSE ?? '',
  horizon: process.env.SPYNE_BG_HORIZON ?? '',
}

// Gera fundo de showroom automóvel com Spyne
// Input:  URL público da foto original do carro (com fundo)
// Output: Buffer PNG com carro sobre fundo de estúdio profissional
export async function generateShowroomSpyne(
  imageUrl: string,
  showroomSlug: string,
): Promise<Buffer> {
  const apiKey = process.env.SPYNE_API_KEY
  if (!apiKey) throw new Error('SPYNE_API_KEY não configurada')

  const backgroundId = BACKGROUND_IDS[showroomSlug] ?? BACKGROUND_IDS.nova
  if (!backgroundId) {
    throw new Error(
      `SPYNE_BG_${showroomSlug.toUpperCase()} não configurado. ` +
      'Obtém o ID do fundo no dashboard Spyne e adiciona como variável de ambiente.',
    )
  }

  // ── Submeter job ──────────────────────────────────────────
  const res = await fetch(`${API_BASE}/image/replace-bg`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ image_url: imageUrl, background_id: backgroundId }),
  })

  if (!res.ok) {
    const msg = await res.text()
    throw new Error(`Spyne erro ${res.status}: ${msg}`)
  }

  const json = await res.json()

  // ── Resposta síncrona: URL directa ────────────────────────
  const directUrl = json.imageUrl ?? json.image_url ?? json.output_url ?? json.url
  if (directUrl) return downloadBuffer(directUrl)

  // ── Resposta assíncrona: polling por job ID ───────────────
  const jobId = json.imageId ?? json.image_id ?? json.job_id ?? json.id
  if (!jobId) throw new Error(`Spyne: resposta inesperada — ${JSON.stringify(json)}`)

  return pollForResult(apiKey, jobId)
}

// Polling com backoff exponencial — máx ~60 s (10 tentativas)
async function pollForResult(apiKey: string, jobId: string): Promise<Buffer> {
  let delay = 2000
  for (let attempt = 0; attempt < 10; attempt++) {
    await new Promise(r => setTimeout(r, delay))
    delay = Math.min(delay * 1.5, 10_000)

    const res = await fetch(`${API_BASE}/images/${jobId}`, {
      headers: { Authorization: `Bearer ${apiKey}` },
    })
    if (!res.ok) continue

    const json = await res.json()
    const outputUrl = json.imageUrl ?? json.image_url ?? json.output_url ?? json.url

    if (outputUrl) return downloadBuffer(outputUrl)

    const status = (json.status ?? '').toLowerCase()
    if (status === 'error' || status === 'failed') {
      throw new Error(`Spyne: job falhou — ${json.message ?? 'sem detalhes'}`)
    }
  }
  throw new Error('Spyne: timeout — resultado não disponível após 60 s')
}

async function downloadBuffer(url: string): Promise<Buffer> {
  const res = await fetch(url)
  if (!res.ok) throw new Error(`Spyne: falha ao descarregar resultado ${res.status}`)
  return Buffer.from(await res.arrayBuffer())
}
