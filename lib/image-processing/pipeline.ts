import { enhanceImage, getImageMetadata } from './enhance'
import { removeBackground } from './remove-bg'
import { compositeOnShowroom } from './composite'
import { upscaleImage } from './upscale'
import { createAdminClient } from '@/lib/supabase/server'

export interface PipelineOptions {
  vehicleImageId: string
  originalUrl: string
  showroomSlug: string
  standLogoUrl?: string | null
  standName?: string
  useReplicate?: boolean  // true: usa Real-ESRGAN via Replicate; false: usa sharp
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
  const { vehicleImageId, originalUrl, showroomSlug, standLogoUrl, standName, useReplicate = false } = opts

  await supabase.from('vehicle_images').update({ processing_status: 'processing' }).eq('id', vehicleImageId)

  try {
    // 1. Descarregar imagem original
    const originalRes = await fetch(originalUrl)
    if (!originalRes.ok) throw new Error('Não foi possível descarregar a imagem original')
    const originalBuffer = Buffer.from(await originalRes.arrayBuffer())

    // 2. Upscale via Replicate (Real-ESRGAN) ou Sharp
    let enhancedBuffer: Buffer
    let enhancedUrl: string

    if (useReplicate && process.env.REPLICATE_API_TOKEN) {
      const upscaledUrl = await upscaleImage(originalUrl)
      const upscaledRes = await fetch(upscaledUrl)
      const upscaledBuffer = Buffer.from(await upscaledRes.arrayBuffer())
      enhancedBuffer = await enhanceImage(upscaledBuffer, { sharpen: true, brightness: 1.03, contrast: 1.05, saturation: 1.08 })
    } else {
      enhancedBuffer = await enhanceImage(originalBuffer, { targetWidthPx: 2048 })
    }

    // 3. Upload da imagem melhorada para Supabase Storage
    const enhancedPath = `processed/${vehicleImageId}/enhanced.png`
    await supabase.storage.from('vehicle-images').upload(enhancedPath, enhancedBuffer, {
      contentType: 'image/png', upsert: true,
    })
    const { data: { publicUrl: enhancedPublicUrl } } = supabase.storage.from('vehicle-images').getPublicUrl(enhancedPath)
    enhancedUrl = enhancedPublicUrl

    // 4. Remover fundo
    const nobgBuffer = await removeBackground(enhancedBuffer)
    const nobgPath = `processed/${vehicleImageId}/nobg.png`
    await supabase.storage.from('vehicle-images').upload(nobgPath, nobgBuffer, {
      contentType: 'image/png', upsert: true,
    })
    const { data: { publicUrl: nobgPublicUrl } } = supabase.storage.from('vehicle-images').getPublicUrl(nobgPath)
    const nobgUrl = nobgPublicUrl

    // 5. Compositar no showroom
    const showroomBuffer = await compositeOnShowroom(nobgBuffer, showroomSlug, standLogoUrl, standName)
    const showroomPath = `processed/${vehicleImageId}/showroom.png`
    await supabase.storage.from('vehicle-images').upload(showroomPath, showroomBuffer, {
      contentType: 'image/png', upsert: true,
    })
    const { data: { publicUrl: showroomPublicUrl } } = supabase.storage.from('vehicle-images').getPublicUrl(showroomPath)
    const showroomUrl = showroomPublicUrl

    // 6. Metadata da imagem final
    const meta = await getImageMetadata(showroomBuffer)

    // 7. Atualizar base de dados
    await supabase.from('vehicle_images').update({
      enhanced_url: enhancedUrl,
      nobg_url: nobgUrl,
      showroom_url: showroomUrl,
      processing_status: 'done',
      final_width: meta.width,
      final_height: meta.height,
    }).eq('id', vehicleImageId)

    return {
      enhancedUrl,
      nobgUrl,
      showroomUrl,
      finalWidth: meta.width,
      finalHeight: meta.height,
    }
  } catch (err: any) {
    await supabase.from('vehicle_images').update({
      processing_status: 'error',
      processing_error: err?.message ?? 'Erro desconhecido',
    }).eq('id', vehicleImageId)
    throw err
  }
}
