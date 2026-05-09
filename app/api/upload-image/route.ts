export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'
import { getImageMetadata } from '@/lib/image-processing/enhance'

export async function POST(req: NextRequest) {
  const supabase = createAdminClient()

  const formData = await req.formData()
  const file = formData.get('file') as File | null
  const vehicleId = formData.get('vehicleId') as string | null
  const viewAngle = formData.get('viewAngle') as string | null
  const isPrimary = formData.get('isPrimary') === 'true'

  if (!file || !vehicleId) {
    return NextResponse.json({ error: 'file e vehicleId obrigatórios' }, { status: 400 })
  }

  // Derive stand from vehicle
  const { data: vehicle } = await supabase
    .from('vehicles')
    .select('stand_id, stands(images_used_this_month, images_limit)')
    .eq('id', vehicleId)
    .single()

  if (!vehicle) return NextResponse.json({ error: 'Viatura não encontrada' }, { status: 404 })

  const stand = (vehicle as any).stands
  if (stand?.images_limit !== -1 && stand?.images_used_this_month >= stand?.images_limit) {
    return NextResponse.json({ error: 'Limite mensal atingido. Faça upgrade do plano.' }, { status: 429 })
  }

  const bytes = await file.arrayBuffer()
  const buffer = Buffer.from(bytes)
  const meta = await getImageMetadata(buffer)

  const ext = file.name.split('.').pop() ?? 'jpg'
  const storagePath = `originals/${vehicle.stand_id}/${vehicleId}/${Date.now()}.${ext}`

  const { error: uploadError } = await supabase.storage
    .from('vehicle-images')
    .upload(storagePath, buffer, { contentType: file.type, upsert: false })

  if (uploadError) return NextResponse.json({ error: uploadError.message }, { status: 500 })

  const { data: { publicUrl } } = supabase.storage.from('vehicle-images').getPublicUrl(storagePath)

  if (isPrimary) {
    await supabase.from('vehicle_images').update({ is_primary: false }).eq('vehicle_id', vehicleId)
  }

  const { data: imageRecord, error: dbError } = await supabase
    .from('vehicle_images')
    .insert({
      vehicle_id: vehicleId,
      stand_id: vehicle.stand_id,
      original_url: publicUrl,
      view_angle: viewAngle,
      is_primary: isPrimary,
      original_width: meta.width,
      original_height: meta.height,
      file_size_kb: Math.round(buffer.length / 1024),
      processing_status: 'pending',
    })
    .select()
    .single()

  if (dbError) return NextResponse.json({ error: dbError.message }, { status: 500 })
  return NextResponse.json(imageRecord, { status: 201 })
}
