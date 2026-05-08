import { enhanceImage, getImageMetadata } from './enhance'
import { removeBackground } from './remove-bg'
import { compositeOnShowroom } from './composite'
import { upscaleImage } from './replicate'
import { createAdminClient } from '@/lib/supabase/server'

export interface PipelineOptions {
  vehicleImageId: string
  originalUrl: string
  showroomSlug: string
  standLogoUrl?: string | null
  standName?: string
}

export interface PipelineResult {
  enhancedUrl: string
  nobgUrl: string
  showroomUrl: string
  finalWidth: number
  finalHeight: number
}

export async function runImagePipeline(opts: PipelineOptions): Promise<PipelineResult> {
  const supabase = createAdminClient()
  const { vehicleImageId, originalUrl, showroomSlug, standLogoUrl, standName } = opts
  const hasReplicate = !!process.env.REPLICATE_API_TOKEN

  await supabase
    .from('vehicle_images')
    .update({ processing_status: 'processing' })
    .eq('id', vehicleImageId)

  try {
    // ── 1. Download original ──────────────────────────────
    const originalRes = await fetch(originalUrl)
    if (!originalRes.ok) throw new Error(`Falha ao descarregar imagem: ${originalRes.status}`)
    const originalBuffer = Buffer.from(await originalRes.arrayBuffer())

    // ── 2. Upscale Real-ESRGAN (Replicate) + polish Sharp ─
    let enhancedBuffer: Buffer
    if (hasReplicate) {
      const upscaledUrl = await upscaleImage(originalUrl)
      const upscaledRes = await fetch(upscaledUrl)
      if (!upscaledRes.ok) throw new Error(`Falha ao descarregar upscale: ${upscaledRes.status}`)
      const upscaledBuffer = Buffer.from(await upscaledRes.arrayBuffer())
      enhancedBuffer = await enhanceImage(upscaledBuffer, {
        sharpen: true, brightness: 1.03, contrast: 1.05, saturation: 1.08,
      })
    } else {
      enhancedBuffer = await enhanceImage(originalBuffer, { targetWidthPx: 2048 })
    }

    // ── 3. Upload enhanced ────────────────────────────────
    const enhancedPath = `processed/${vehicleImageId}/enhanced.png`
    const { error: enhErr } = await supabase.storage
      .from('vehicle-images')
      .upload(enhancedPath, enhancedBuffer, { contentType: 'image/png', upsert: true })
    if (enhErr) throw new Error(`Upload enhanced: ${enhErr.message}`)
    const { data: { publicUrl: enhancedUrl } } = supabase.storage
      .from('vehicle-images').getPublicUrl(enhancedPath)

    // ── 4. Remove background ──────────────────────────────
    const nobgBuffer = await removeBackground(enhancedBuffer)
    const nobgPath = `processed/${vehicleImageId}/nobg.png`
    const { error: nobgErr } = await supabase.storage
      .from('vehicle-images')
      .upload(nobgPath, nobgBuffer, { contentType: 'image/png', upsert: true })
    if (nobgErr) throw new Error(`Upload nobg: ${nobgErr.message}`)
    const { data: { publicUrl: nobgUrl } } = supabase.storage
      .from('vehicle-images').getPublicUrl(nobgPath)

    // ── 5. Composite no showroom ──────────────────────────
    // composite.ts usa PNG local → FLUX (Replicate) → gradiente SVG
    const showroomBuffer = await compositeOnShowroom(nobgBuffer, showroomSlug, standLogoUrl, standName)
    const showroomPath = `processed/${vehicleImageId}/showroom.png`
    const { error: showErr } = await supabase.storage
      .from('vehicle-images')
      .upload(showroomPath, showroomBuffer, { contentType: 'image/png', upsert: true })
    if (showErr) throw new Error(`Upload showroom: ${showErr.message}`)
    const { data: { publicUrl: showroomUrl } } = supabase.storage
      .from('vehicle-images').getPublicUrl(showroomPath)

    // ── 6. Metadata + actualizar DB ───────────────────────
    const meta = await getImageMetadata(showroomBuffer)
    await supabase.from('vehicle_images').update({
      enhanced_url: enhancedUrl,
      nobg_url: nobgUrl,
      showroom_url: showroomUrl,
      processing_status: 'done',
      final_width: meta.width,
      final_height: meta.height,
    }).eq('id', vehicleImageId)

    return { enhancedUrl, nobgUrl, showroomUrl, finalWidth: meta.width, finalHeight: meta.height }

  } catch (err: any) {
    await supabase.from('vehicle_images').update({
      processing_status: 'error',
      processing_error: err?.message ?? 'Erro desconhecido',
    }).eq('id', vehicleImageId)
    throw err
  }
}
