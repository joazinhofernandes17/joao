export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { runImagePipeline } from '@/lib/image-processing/pipeline'

export async function POST(req: NextRequest) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })

  const { vehicleImageId, showroomSlug = 'nova' } = await req.json()
  if (!vehicleImageId) return NextResponse.json({ error: 'vehicleImageId obrigatório' }, { status: 400 })

  // Verificar que a imagem pertence ao utilizador
  const { data: image } = await supabase
    .from('vehicle_images')
    .select('id, original_url, stand_id, stands(logo_url, name, images_used_this_month, images_limit)')
    .eq('id', vehicleImageId)
    .single()

  if (!image) return NextResponse.json({ error: 'Imagem não encontrada' }, { status: 404 })

  const stand = (image as any).stands
  if (!stand) return NextResponse.json({ error: 'Stand não encontrado' }, { status: 404 })

  // Verificar limite do plano
  if (stand.images_limit !== -1 && stand.images_used_this_month >= stand.images_limit) {
    return NextResponse.json({ error: 'Limite mensal de imagens atingido. Faça upgrade do plano.' }, { status: 429 })
  }

  try {
    const result = await runImagePipeline({
      vehicleImageId,
      originalUrl: image.original_url,
      showroomSlug,
      standLogoUrl: stand.logo_url,
      standName: stand.name,
    })

    // Incrementar contador de uso
    await supabase
      .from('stands')
      .update({ images_used_this_month: stand.images_used_this_month + 1 })
      .eq('id', image.stand_id)

    return NextResponse.json({ success: true, ...result })
  } catch (err: any) {
    return NextResponse.json({ error: err?.message ?? 'Erro no processamento' }, { status: 500 })
  }
}
