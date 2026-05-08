export const dynamic = 'force-dynamic'
import { NextRequest } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'
import { enhanceImage, getImageMetadata } from '@/lib/image-processing/enhance'
import { removeBackground } from '@/lib/image-processing/remove-bg'
import { compositeOnShowroom } from '@/lib/image-processing/composite'
import { upscaleImage } from '@/lib/image-processing/replicate'
import sharp from 'sharp'

const encoder = new TextEncoder()

function sse(data: object): Uint8Array {
  return encoder.encode(`data: ${JSON.stringify(data)}\n\n`)
}

export async function POST(req: NextRequest) {
  const stream = new ReadableStream({
    async start(controller) {
      const emit = (step: string, status: 'running' | 'done' | 'skipped' | 'error', message: string, extra?: object) => {
        controller.enqueue(sse({ step, status, message, ts: Date.now(), ...extra }))
      }

      try {
        const formData = await req.formData()
        const file = formData.get('file') as File | null
        const showroomSlug = (formData.get('showroom') as string) || 'nova'

        if (!file) {
          emit('error', 'error', 'Nenhum ficheiro enviado')
          controller.close()
          return
        }

        const supabase = createAdminClient()
        const testId = `test-${Date.now()}`
        const hasReplicate = !!process.env.REPLICATE_API_TOKEN
        const hasRemoveBg = !!process.env.REMOVE_BG_API_KEY

        // ── 1. Upload original ───────────────────────────────────
        emit('upload', 'running', 'A fazer upload da imagem original...')
        const bytes = await file.arrayBuffer()
        const originalBuffer = Buffer.from(bytes)
        const ext = file.name.split('.').pop() ?? 'jpg'
        const originalPath = `test/${testId}/original.${ext}`

        const { error: origErr } = await supabase.storage
          .from('vehicle-images')
          .upload(originalPath, originalBuffer, { contentType: file.type, upsert: true })
        if (origErr) throw new Error(`Upload original: ${origErr.message}`)

        const { data: { publicUrl: originalUrl } } = supabase.storage
          .from('vehicle-images').getPublicUrl(originalPath)
        emit('upload', 'done', 'Upload concluído', { url: originalUrl })

        // ── 2. Real-ESRGAN upscale ───────────────────────────────
        let enhancedBuffer: Buffer
        if (hasReplicate) {
          // Redimensionar para máx 1280×960 antes de enviar ao Real-ESRGAN (limite GPU)
          emit('upscale', 'running', 'A redimensionar para 1280×960 e enviar ao Real-ESRGAN 4×...')
          const resizedBuffer = await sharp(originalBuffer)
            .resize(1280, 960, { fit: 'inside', withoutEnlargement: true })
            .png()
            .toBuffer()
          const resizePath = `test/${testId}/pre-upscale.png`
          await supabase.storage.from('vehicle-images')
            .upload(resizePath, resizedBuffer, { contentType: 'image/png', upsert: true })
          const { data: { publicUrl: resizeUrl } } = supabase.storage
            .from('vehicle-images').getPublicUrl(resizePath)

          const upscaledUrl = await upscaleImage(resizeUrl)
          const upscaledRes = await fetch(upscaledUrl)
          if (!upscaledRes.ok) throw new Error(`Download upscale: ${upscaledRes.status}`)
          const upscaledBuffer = Buffer.from(await upscaledRes.arrayBuffer())
          emit('upscale', 'done', 'Real-ESRGAN concluído — imagem 4× maior')

          // ── 3. Sharp polish ──────────────────────────────────────
          emit('enhance', 'running', 'A polir com Sharp (nitidez, contraste, saturação)...')
          enhancedBuffer = await enhanceImage(upscaledBuffer, {
            sharpen: true, brightness: 1.03, contrast: 1.05, saturation: 1.08,
          })
          emit('enhance', 'done', 'Polish concluído')
        } else {
          emit('upscale', 'skipped', 'REPLICATE_API_TOKEN não configurado — upscale ignorado')
          emit('enhance', 'running', 'A ampliar e melhorar com Sharp local...')
          enhancedBuffer = await enhanceImage(originalBuffer, { targetWidthPx: 2048 })
          emit('enhance', 'done', 'Melhoria Sharp concluída')
        }

        const enhancedPath = `test/${testId}/enhanced.png`
        await supabase.storage.from('vehicle-images')
          .upload(enhancedPath, enhancedBuffer, { contentType: 'image/png', upsert: true })
        const { data: { publicUrl: enhancedUrl } } = supabase.storage
          .from('vehicle-images').getPublicUrl(enhancedPath)
        emit('enhance', 'done', 'Imagem melhorada guardada', { url: enhancedUrl })

        // ── 4. Remove background ─────────────────────────────────
        let nobgBuffer: Buffer
        if (hasRemoveBg) {
          emit('remove_bg', 'running', 'A remover fundo com remove.bg API...')
          nobgBuffer = await removeBackground(enhancedBuffer)
          emit('remove_bg', 'done', 'Fundo removido com sucesso')
        } else {
          emit('remove_bg', 'skipped', 'REMOVE_BG_API_KEY não configurado — a usar imagem sem remoção')
          nobgBuffer = enhancedBuffer
        }

        const nobgPath = `test/${testId}/nobg.png`
        await supabase.storage.from('vehicle-images')
          .upload(nobgPath, nobgBuffer, { contentType: 'image/png', upsert: true })
        const { data: { publicUrl: nobgUrl } } = supabase.storage
          .from('vehicle-images').getPublicUrl(nobgPath)
        emit('remove_bg', 'done', 'Imagem sem fundo guardada', { url: nobgUrl })

        // ── 5. Composite on showroom ─────────────────────────────
        const bgSource = hasReplicate ? 'FLUX-schnell (Replicate)' : 'gradiente SVG local'
        emit('composite', 'running', `A gerar fundo "${showroomSlug}" com ${bgSource} e compor carro...`)
        const showroomBuffer = await compositeOnShowroom(nobgBuffer, showroomSlug)

        const showroomPath = `test/${testId}/showroom.png`
        await supabase.storage.from('vehicle-images')
          .upload(showroomPath, showroomBuffer, { contentType: 'image/png', upsert: true })
        const { data: { publicUrl: showroomUrl } } = supabase.storage
          .from('vehicle-images').getPublicUrl(showroomPath)
        emit('composite', 'done', 'Composição concluída', { url: showroomUrl })

        // ── 6. Done ──────────────────────────────────────────────
        const meta = await getImageMetadata(showroomBuffer)
        emit('done', 'done', 'Pipeline concluído com sucesso!', {
          originalUrl,
          enhancedUrl,
          nobgUrl,
          showroomUrl,
          finalWidth: meta.width,
          finalHeight: meta.height,
        })
      } catch (err: any) {
        controller.enqueue(sse({
          step: 'error',
          status: 'error',
          message: err?.message ?? 'Erro desconhecido',
          ts: Date.now(),
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
