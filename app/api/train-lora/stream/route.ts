export const dynamic = 'force-dynamic'
import { NextRequest } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'
import { fetchUnsplashTrainingImages, buildTrainingZip, LORA_TRIGGER_WORD } from '@/lib/image-processing/lora-trainer'
import Replicate from 'replicate'

const replicate = new Replicate({ auth: process.env.REPLICATE_API_TOKEN })
const TRAINER_MODEL   = 'ostris'
const TRAINER_NAME    = 'flux-dev-lora-trainer'
const TRAINER_VERSION = 'e440909d3512c31646ee2e0c7d6f6f4923224863a6a10c494606e79fb5844497'

const enc = new TextEncoder()
function sse(data: object): Uint8Array {
  return enc.encode(`data: ${JSON.stringify(data)}\n\n`)
}

// POST /api/train-lora/stream
// Body: { standId, standName, primaryColor? }
// Streams SSE progress for setup steps, then returns trainingId
export async function POST(req: NextRequest) {
  const stream = new ReadableStream({
    async start(controller) {
      const emit = (step: string, status: string, message: string, extra?: object) =>
        controller.enqueue(sse({ step, status, message, ts: Date.now(), ...extra }))

      try {
        const { standId, standName, primaryColor } = await req.json()

        if (!standId || !standName) {
          emit('error', 'error', 'standId e standName são obrigatórios')
          controller.close()
          return
        }
        if (!process.env.REPLICATE_API_TOKEN) {
          emit('error', 'error', 'REPLICATE_API_TOKEN não configurado')
          controller.close()
          return
        }
        if (!process.env.REPLICATE_USERNAME) {
          emit('error', 'error', 'REPLICATE_USERNAME não configurado — define esta variável de ambiente com o teu username do Replicate')
          controller.close()
          return
        }

        const supabase = createAdminClient()

        // ── 1. Fetch training images ─────────────────────────────
        emit('fetch_images', 'running', 'A pesquisar imagens de estúdio automóvel no Unsplash...')

        if (!process.env.UNSPLASH_ACCESS_KEY) {
          emit('fetch_images', 'error', 'UNSPLASH_ACCESS_KEY não configurada')
          controller.close()
          return
        }

        const imageUrls = await fetchUnsplashTrainingImages(18)
        emit('fetch_images', 'done', `${imageUrls.length} imagens encontradas no Unsplash`, { count: imageUrls.length })

        // ── 2. Download + build ZIP ──────────────────────────────
        emit('build_zip', 'running', `A descarregar e comprimir ${imageUrls.length} imagens...`)
        const zipBuffer = await buildTrainingZip(imageUrls)
        const sizeMb = (zipBuffer.length / 1024 / 1024).toFixed(1)
        emit('build_zip', 'done', `Dataset comprimido: ${sizeMb} MB`)

        // ── 3. Upload ZIP to Supabase Storage ───────────────────
        emit('upload_zip', 'running', 'A fazer upload do dataset para Supabase Storage...')
        const zipPath = `lora-training/${standId}/dataset.zip`
        const { error: zipErr } = await supabase.storage
          .from('vehicle-images')
          .upload(zipPath, zipBuffer, { contentType: 'application/zip', upsert: true })
        if (zipErr) throw new Error(`Upload ZIP: ${zipErr.message}`)

        const { data: { publicUrl: zipUrl } } = supabase.storage
          .from('vehicle-images').getPublicUrl(zipPath)
        emit('upload_zip', 'done', 'Dataset disponível para o Replicate', { url: zipUrl })

        // ── 4. Start Replicate training ──────────────────────────
        emit('start_training', 'running', 'A iniciar treino LoRA no Replicate (~$2, ~15-20 min)...')

        const standSlug = standId.slice(0, 8).toLowerCase()
        const destination = `${process.env.REPLICATE_USERNAME}/autoshowroom-${standSlug}` as `${string}/${string}`

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

        // ── 5. Persist to DB ─────────────────────────────────────
        await supabase.from('stands').update({
          lora_training_id: training.id,
          lora_training_status: 'processing',
          lora_trigger_word: LORA_TRIGGER_WORD,
          ...(primaryColor ? { primary_color: primaryColor } : {}),
        }).eq('id', standId)

        emit('start_training', 'done',
          'Treino iniciado com sucesso! Aguarda 15-20 minutos.',
          { trainingId: training.id },
        )

      } catch (err: any) {
        controller.enqueue(sse({
          step: 'error', status: 'error',
          message: err?.message ?? 'Erro desconhecido', ts: Date.now(),
        }))
      }

      controller.close()
    },
  })

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
    },
  })
}
