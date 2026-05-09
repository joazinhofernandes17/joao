// Custom FLUX LoRA training for per-stand photorealistic automotive showrooms
// Uses ostris/flux-dev-lora-trainer on Replicate (~$2, ~15-20 min)
//
// Required env vars:
//   REPLICATE_API_TOKEN   — Replicate account token
//   REPLICATE_USERNAME    — your Replicate username (for model destination)
//   UNSPLASH_ACCESS_KEY   — Unsplash API key for fetching training images
//
// Training dataset: 15-20 professional automotive studio images from Unsplash
// Trigger word: "AUTOSTUDIO" (injected into every generated background prompt)

import Replicate from 'replicate'
import JSZip from 'jszip'
import { createAdminClient } from '@/lib/supabase/server'

const replicate = new Replicate({ auth: process.env.REPLICATE_API_TOKEN })

// ostris/flux-dev-lora-trainer — latest version pinned
const TRAINER_MODEL   = 'ostris'
const TRAINER_NAME    = 'flux-dev-lora-trainer'
const TRAINER_VERSION = 'e440909d3512c31646ee2e0c7d6f6f4923224863a6a10c494606e79fb5844497'

export const LORA_TRIGGER_WORD = 'AUTOSTUDIO'

// ── Unsplash: fetch training image URLs ──────────────────────────────────────
// Searches for empty automotive studio backgrounds (no cars visible)
export async function fetchUnsplashTrainingImages(count = 18): Promise<string[]> {
  const accessKey = process.env.UNSPLASH_ACCESS_KEY
  if (!accessKey) throw new Error('UNSPLASH_ACCESS_KEY não configurada')

  const queries = [
    'automotive photography studio empty background',
    'car showroom interior empty floor',
    'professional studio white seamless background',
  ]

  const urls: string[] = []
  const perQuery = Math.ceil(count / queries.length)

  for (const query of queries) {
    if (urls.length >= count) break

    const res = await fetch(
      `https://api.unsplash.com/search/photos?query=${encodeURIComponent(query)}&per_page=${perQuery}&orientation=landscape`,
      { headers: { Authorization: `Client-ID ${accessKey}` } },
    )
    if (!res.ok) continue

    const data = await res.json()
    for (const photo of data.results ?? []) {
      if (urls.length >= count) break
      // Use regular size (1080px wide) — good balance for training
      const url = photo.urls?.regular
      if (url) urls.push(url)
    }
  }

  if (urls.length < 10) {
    throw new Error(
      `Apenas ${urls.length} imagens encontradas no Unsplash (mínimo 10). ` +
      'Verifica a UNSPLASH_ACCESS_KEY.',
    )
  }

  return urls.slice(0, count)
}

// ── Build training ZIP ───────────────────────────────────────────────────────
// Downloads all images and packages them as a ZIP for the trainer
export async function buildTrainingZip(imageUrls: string[]): Promise<Buffer> {
  const zip = new JSZip()

  await Promise.all(
    imageUrls.map(async (url, i) => {
      const res = await fetch(url)
      if (!res.ok) throw new Error(`Falha ao descarregar imagem ${i + 1}: ${res.status}`)
      const buf = Buffer.from(await res.arrayBuffer())
      zip.file(`training_${String(i + 1).padStart(3, '0')}.jpg`, buf)
    }),
  )

  return zip.generateAsync({ type: 'nodebuffer', compression: 'DEFLATE', compressionOptions: { level: 6 } })
}

// ── Start LoRA training job ──────────────────────────────────────────────────
export interface LoraTrainingOptions {
  standId: string
  standName: string
  primaryColor?: string  // hex, e.g. "#1a3c6e"
  imageUrls?: string[]   // optional: provide URLs directly (skips Unsplash fetch)
}

export interface LoraTrainingJob {
  trainingId: string
  status: 'starting' | 'processing' | 'succeeded' | 'failed' | 'canceled'
  modelVersion?: string
  error?: string
}

export async function startLoraTraining(opts: LoraTrainingOptions): Promise<LoraTrainingJob> {
  const replicateUsername = process.env.REPLICATE_USERNAME
  if (!replicateUsername) throw new Error('REPLICATE_USERNAME não configurado')

  const supabase = createAdminClient()

  // 1. Fetch training images
  const imageUrls = opts.imageUrls ?? await fetchUnsplashTrainingImages(18)

  // 2. Build and upload ZIP to Supabase Storage
  const zipBuffer = await buildTrainingZip(imageUrls)
  const zipPath = `lora-training/${opts.standId}/dataset.zip`

  const { error: zipErr } = await supabase.storage
    .from('vehicle-images')
    .upload(zipPath, zipBuffer, { contentType: 'application/zip', upsert: true })
  if (zipErr) throw new Error(`Upload ZIP treino: ${zipErr.message}`)

  const { data: { publicUrl: zipUrl } } = supabase.storage
    .from('vehicle-images').getPublicUrl(zipPath)

  // 3. Derive model destination: replicate username / stand slug
  const standSlug = opts.standId.slice(0, 8).toLowerCase()
  const destination = `${replicateUsername}/autoshowroom-${standSlug}` as `${string}/${string}`

  // 4. Trigger training
  const training = await replicate.trainings.create(
    TRAINER_MODEL,
    TRAINER_NAME,
    TRAINER_VERSION,
    {
      destination,
      input: {
        steps: 1000,
        lora_rank: 16,
        optimizer: 'adamw8bit',
        batch_size: 1,
        resolution: '512,768,1024',
        autocaption: true,
        input_images: zipUrl,
        trigger_word: LORA_TRIGGER_WORD,
        learning_rate: 0.0004,
      },
    },
  )

  // 5. Persist training ID to DB
  await supabase
    .from('stands')
    .update({
      lora_training_id: training.id,
      lora_training_status: 'processing',
      lora_trigger_word: LORA_TRIGGER_WORD,
    })
    .eq('id', opts.standId)

  return { trainingId: training.id, status: 'starting' }
}

// ── Poll training status ─────────────────────────────────────────────────────
export async function getLoraTrainingStatus(trainingId: string): Promise<LoraTrainingJob> {
  const training = await replicate.trainings.get(trainingId)

  const status = training.status as LoraTrainingJob['status']
  const modelVersion = (training.output as any)?.version as string | undefined

  if (status === 'succeeded' && modelVersion) {
    // Persist model version to DB for all stands using this training
    const supabase = createAdminClient()
    await supabase
      .from('stands')
      .update({
        lora_model_version: modelVersion,
        lora_training_status: 'succeeded',
      })
      .eq('lora_training_id', trainingId)
  }

  if (status === 'failed' || status === 'canceled') {
    const supabase = createAdminClient()
    await supabase
      .from('stands')
      .update({ lora_training_status: status })
      .eq('lora_training_id', trainingId)
  }

  return {
    trainingId,
    status,
    modelVersion,
    error: (training as any).error ?? undefined,
  }
}

// ── Generate background with stand's LoRA ────────────────────────────────────
// Base prompts personalised with stand name, primary colour, and trigger word
const BASE_PROMPTS: Record<string, string> = {
  nova: [
    `${LORA_TRIGGER_WORD} professional automotive photography studio,`,
    'pure white seamless infinity cove backdrop, circular car turntable platform,',
    'polished white epoxy floor, overhead softbox diffused lighting,',
    'subtle shadow on floor, commercial product photography, photorealistic, 8k',
  ].join(' '),
  elise: [
    `${LORA_TRIGGER_WORD} premium luxury car photography studio,`,
    'deep navy blue seamless backdrop, circular platform on high-gloss dark concrete,',
    'cold blue LED rim lighting from both sides, dramatic low-key studio setup,',
    'empty studio no car, cinematic automotive photography, photorealistic, 8k',
  ].join(' '),
  origin: [
    `${LORA_TRIGGER_WORD} classic elegant car showroom interior,`,
    'warm cream ivory infinity cove, circular platform on polished travertine marble,',
    'warm tungsten key light, amber fill light, chiaroscuro, empty showroom no car,',
    'high-end commercial automotive photography, photorealistic, 8k',
  ].join(' '),
  eclipse: [
    `${LORA_TRIGGER_WORD} cinematic dark automotive studio,`,
    'pure black background with deep vignette, circular platform on mirror-polished black marble,',
    'deep violet LED accent rim lights, single hard key light, empty studio no car,',
    'IMAX-quality cinematic automotive photography, photorealistic, 8k',
  ].join(' '),
  horizon: [
    `${LORA_TRIGGER_WORD} outdoor premium automotive photography location,`,
    'golden hour sunset sky, raised circular display platform on premium dark asphalt,',
    'warm golden rim light on platform edges, lens flare from low sun, empty location no car,',
    'commercial outdoor car photography, photorealistic, 8k',
  ].join(' '),
}

export async function generateBackgroundWithLora(
  showroomSlug: string,
  loraModelVersion: string,
  standName: string,
  primaryColor?: string,
): Promise<Buffer> {
  const basePrompt = BASE_PROMPTS[showroomSlug] ?? BASE_PROMPTS.nova

  // Inject stand identity into the prompt
  const colorNote = primaryColor ? `, accent color ${primaryColor}` : ''
  const prompt = `${basePrompt}, branded for ${standName}${colorNote}`

  const output = await replicate.run(loraModelVersion as `${string}/${string}:${string}`, {
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

  // Resolve output (string | FileOutput | array)
  let url: string
  if (typeof output === 'string') {
    url = output
  } else if (Array.isArray(output)) {
    const first = output[0]
    url = typeof first === 'string' ? first : await (first as any).url().then((u: URL) => u.toString())
  } else {
    url = await (output as any).url().then((u: URL) => u.toString())
  }

  const res = await fetch(url)
  if (!res.ok) throw new Error(`Falha ao descarregar fundo LoRA: ${res.status}`)
  return Buffer.from(await res.arrayBuffer())
}
